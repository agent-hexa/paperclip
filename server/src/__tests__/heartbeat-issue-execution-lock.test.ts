import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  agents,
  agentRuntimeState,
  agentWakeupRequests,
  companies,
  createDb,
  environmentLeases,
  heartbeatRuns,
  issueRelations,
  issues,
} from "@paperclipai/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { heartbeatService } from "../services/heartbeat.ts";
import { runningProcesses } from "../adapters/index.ts";

const mockAdapterExecute = vi.hoisted(() =>
  vi.fn(async () => ({
    exitCode: 0,
    signal: null,
    timedOut: false,
    errorMessage: null,
    summary: "Issue execution lock invariant test run.",
    provider: "test",
    model: "test-model",
  })),
);

vi.mock("../adapters/index.ts", async () => {
  const actual = await vi.importActual<typeof import("../adapters/index.ts")>("../adapters/index.ts");
  return {
    ...actual,
    getServerAdapter: vi.fn(() => ({
      supportsLocalAgentJwt: false,
      execute: mockAdapterExecute,
    })),
  };
});

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres issue execution lock tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

async function ensureIssueRelationsTable(db: ReturnType<typeof createDb>) {
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "issue_relations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "company_id" uuid NOT NULL,
      "issue_id" uuid NOT NULL,
      "related_issue_id" uuid NOT NULL,
      "type" text NOT NULL,
      "created_by_agent_id" uuid,
      "created_by_user_id" text,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now()
    );
  `));
}

/**
 * The core per-issue execution lock invariant.
 *
 * `issues.executionRunId` is the mutual-exclusion primitive that stops two heartbeat
 * runs from working the same issue at once. It is acquired in `claimQueuedRun` via
 * `lockIssueExecutionClaim` / `bindClaimedIssueExecution`, both of which run inside a
 * single `SELECT ... FOR UPDATE` transaction on the issue row. The enforcement at
 * enqueue time lives in `enqueueWakeup`, which defers or coalesces a wake when it finds
 * an active execution run on the issue.
 *
 * Those three functions had no test coverage at all: this file is the only thing that
 * pins the invariant. Every assertion below deliberately keeps `maxConcurrentRuns` high
 * so that the per-AGENT concurrency cap cannot be what serializes the two wakes. If the
 * issue lock regressed, a high agent cap would let both runs through and these
 * assertions would fail.
 */
describeEmbeddedPostgres("issue execution lock mutual exclusion", () => {
  let db!: ReturnType<typeof createDb>;
  let heartbeat!: ReturnType<typeof heartbeatService>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclip-issue-execution-lock-");
    db = createDb(tempDb.connectionString);
    heartbeat = heartbeatService(db);
    await ensureIssueRelationsTable(db);
  }, 20_000);

  afterEach(async () => {
    let idlePolls = 0;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const runs = await db.select({ status: heartbeatRuns.status }).from(heartbeatRuns);
      const hasActiveRun = runs.some(
        (run) => run.status === "queued" || run.status === "running",
      );
      if (!hasActiveRun) {
        idlePolls += 1;
        if (idlePolls >= 3) break;
      } else {
        idlePolls = 0;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const runIds = await db
      .select({ id: heartbeatRuns.id })
      .from(heartbeatRuns)
      .then((runs) => runs.map((run) => run.id));
    await Promise.all(runIds.map((runId) => heartbeat.waitForRunExecutionDrain(runId)));
    runningProcesses.clear();
    await db.delete(environmentLeases);
    await db.delete(agentWakeupRequests);
    await db.delete(agentRuntimeState);
    await db.delete(issueRelations);
    await db.delete(heartbeatRuns);
    await db.delete(issues);
    await db.delete(agents);
    await db.delete(companies);
    mockAdapterExecute.mockClear();
  }, 20_000);

  afterAll(async () => {
    await tempDb?.stop?.();
  });

  async function seedAgentAndIssue(options?: {
    maxConcurrentRuns?: number;
    issueStatus?: "todo" | "in_progress";
  }) {
    const companyId = randomUUID();
    const agentId = randomUUID();
    const issueId = randomUUID();

    await db.insert(companies).values({
      id: companyId,
      name: "Paperclip",
      issuePrefix: `L${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    await db.insert(agents).values({
      id: agentId,
      companyId,
      name: "LockProbe",
      role: "engineer",
      status: "active",
      adapterType: "codex_local",
      adapterConfig: {},
      runtimeConfig: {
        heartbeat: {
          wakeOnDemand: true,
          // Deliberately high: the per-agent cap must not be what serializes these
          // wakes, otherwise this test would pass even if the issue lock were gone.
          maxConcurrentRuns: options?.maxConcurrentRuns ?? 8,
        },
      },
      permissions: {},
    });
    await db.insert(issues).values({
      id: issueId,
      companyId,
      title: "Contended issue",
      status: options?.issueStatus ?? "todo",
      priority: "high",
      assigneeAgentId: agentId,
    });

    return { companyId, agentId, issueId };
  }

  it("never lets two concurrent wakes put two live runs on one issue", async () => {
    const { agentId, issueId } = await seedAgentAndIssue();

    const wakes = await Promise.all([
      heartbeat.wakeup(agentId, {
        source: "automation",
        triggerDetail: "system",
        reason: "issue_commented",
        payload: { issueId },
        idempotencyKey: `lock-race-a:${issueId}`,
        contextSnapshot: { issueId, wakeReason: "issue_commented" },
      }),
      heartbeat.wakeup(agentId, {
        source: "automation",
        triggerDetail: "system",
        reason: "issue_commented",
        payload: { issueId },
        idempotencyKey: `lock-race-b:${issueId}`,
        contextSnapshot: { issueId, wakeReason: "issue_commented" },
      }),
    ]);

    // Whatever the admission policy decides (proceed / coalesce / defer), the
    // invariant is that no more than one of them may be admitted as a live run.
    const admitted = wakes.filter((wake) => wake !== null);
    expect(admitted.length).toBeLessThanOrEqual(1);

    // And at most one heartbeat run row may hold a live status for this issue.
    const liveRuns = await db
      .select({ id: heartbeatRuns.id, status: heartbeatRuns.status })
      .from(heartbeatRuns)
      .where(
        and(
          inArray(heartbeatRuns.status, ["queued", "running", "scheduled_retry"]),
          sql`${heartbeatRuns.contextSnapshot} ->> 'issueId' = ${issueId}`,
        ),
      );
    expect(liveRuns.length).toBeLessThanOrEqual(1);

    // If a run does hold the lock, the issue must point at exactly that run.
    const [locked] = await db
      .select({ executionRunId: issues.executionRunId })
      .from(issues)
      .where(eq(issues.id, issueId));
    if (locked?.executionRunId) {
      expect(liveRuns.map((run) => run.id)).toContain(locked.executionRunId);
    }
  }, 30_000);

  it("preserves the incumbent execution lock when a competing wake is refused", async () => {
    const { agentId, issueId } = await seedAgentAndIssue();
    const incumbentRunId = randomUUID();

    // An incumbent run already owns the issue execution lock and is genuinely live.
    await db.insert(heartbeatRuns).values({
      id: incumbentRunId,
      agentId,
      companyId: (await db
        .select({ companyId: issues.companyId })
        .from(issues)
        .where(eq(issues.id, issueId)))[0]!.companyId,
      status: "running",
      invocationSource: "on_demand",
      contextSnapshot: { issueId, wakeReason: "manual_incumbent" },
    });
    await db
      .update(issues)
      .set({ executionRunId: incumbentRunId, executionLockedAt: new Date() })
      .where(eq(issues.id, issueId));
    runningProcesses.set(incumbentRunId, {
      child: {} as import("node:child_process").ChildProcess,
      graceSec: 1,
      processGroupId: null,
    });

    const wake = await heartbeat.wakeup(agentId, {
      source: "automation",
      triggerDetail: "system",
      reason: "issue_commented",
      payload: { issueId },
      idempotencyKey: `lock-loser:${issueId}`,
      contextSnapshot: { issueId, wakeReason: "issue_commented" },
    });

    expect(wake).toBeNull();

    const [after] = await db
      .select({ executionRunId: issues.executionRunId })
      .from(issues)
      .where(eq(issues.id, issueId));
    expect(after?.executionRunId).toBe(incumbentRunId);

    const deferred = await db
      .select({ status: agentWakeupRequests.status, runId: agentWakeupRequests.runId })
      .from(agentWakeupRequests)
      .where(eq(agentWakeupRequests.idempotencyKey, `lock-loser:${issueId}`));
    expect(deferred).toEqual([
      { status: "deferred_issue_execution", runId: null },
    ]);
  }, 30_000);

  it("releases the lock when the holder finishes, so the next wake can take it", async () => {
    const { agentId, issueId } = await seedAgentAndIssue();
    const incumbentRunId = randomUUID();
    const companyId = (
      await db.select({ companyId: issues.companyId }).from(issues).where(eq(issues.id, issueId))
    )[0]!.companyId;

    await db.insert(heartbeatRuns).values({
      id: incumbentRunId,
      agentId,
      companyId,
      status: "running",
      invocationSource: "on_demand",
      contextSnapshot: { issueId, wakeReason: "manual_incumbent" },
    });
    await db
      .update(issues)
      .set({ executionRunId: incumbentRunId, executionLockedAt: new Date() })
      .where(eq(issues.id, issueId));
    runningProcesses.set(incumbentRunId, {
      child: {} as import("node:child_process").ChildProcess,
      graceSec: 1,
      processGroupId: null,
    });

    const blocked = await heartbeat.wakeup(agentId, {
      source: "automation",
      triggerDetail: "system",
      reason: "issue_commented",
      payload: { issueId },
      idempotencyKey: `lock-gated:${issueId}`,
      contextSnapshot: { issueId, wakeReason: "issue_commented" },
    });
    expect(blocked).toBeNull();

    // The holder reaches a terminal status, which is what makes its lock stale.
    await db
      .update(heartbeatRuns)
      .set({ status: "succeeded", finishedAt: new Date() })
      .where(eq(heartbeatRuns.id, incumbentRunId));
    runningProcesses.delete(incumbentRunId);

    const admitted = await heartbeat.wakeup(agentId, {
      source: "automation",
      triggerDetail: "system",
      reason: "issue_commented",
      payload: { issueId },
      idempotencyKey: `lock-after-release:${issueId}`,
      contextSnapshot: { issueId, wakeReason: "issue_commented" },
    });

    // The lock is not a permanent barrier: a terminal holder must not wedge the issue.
    expect(admitted).not.toBeNull();
  }, 30_000);
});
