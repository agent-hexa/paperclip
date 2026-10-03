# Upstream sync log — paperclipai/paperclip → agent-hexa/paperclip

Living record of upstream pulls into our fork. Our fork is `origin` =
[`agent-hexa/paperclip`](https://github.com/agent-hexa/paperclip); upstream is
`upstream` = [`paperclipai/paperclip`](https://github.com/paperclipai/paperclip).
On 2026-10-03 we pulled 23 upstream pull requests forward onto our `master` so
the fork does not drift far behind. This document exists for two reasons: to
audit what we took and what we deliberately left behind, and to keep an explicit,
clickable record of who deserves credit — the outside contributor who wrote the
code (PR author) and the outside contributor who reported the problem (issue
author). Every upstream PR here is still **open** upstream at the time of
writing; we ship them ahead of upstream, so credit is ours to give early.

## How to update this log next time

1. Add one new dated section per sync round, newest first, and keep the older
   sections intact — this is an append-only log, not a rewrite.
2. Re-derive the PR → issue mapping from the PR body (`closes`/`fixes` keywords
   first, then any `#NNNNN` reference, then the title suffix). Record every
   issue you find, not just the first one.
3. Record the merge SHA from `git log --merges` on our `master`. If a PR was not
   merged with `--no-ff`, say so and give the plain commit SHA instead.
4. Record whether the merge was clean, needed manual conflict resolution, or
   needed a follow-up fix commit from us. The follow-up-fix case is the one that
   matters most: if we changed the meaning of what a contributor wrote, that is
   a local divergence and must be disclosed here.
5. Move anything we chose not to take into "Skipped / not taken" with a reason,
   so the next person does not re-litigate it.
6. Re-verify every issue number with `gh` before writing it down. Do not trust
   a number supplied from memory or from a previous round of this log.

## How to reproduce/extend this sync

Exact command sequence used, per PR:

```sh
git fetch upstream --prune
git fetch upstream pull/<PR>/head:pr-<PR>
git merge --no-ff pr-<PR>
```

`--no-ff` is what keeps the upstream PR boundary visible in `git log`, which is
the only reason this log can be reconstructed later. Without it, a fast-forward
erases the attribution. Where a merge conflicts, resolve it, keep **both**
sides' added test cases unless one side is provably obsolete, and record the
resolution here. Where a PR cannot be merged as a merge commit at all, apply it
as a plain commit whose message names the upstream PR and the issue it fixes,
for example:

```
fix(runtime): stamp issueId into timer-wake run context on checkout

Pull upstream PR #14229 (fixes #13822).
```

### Pre-existing Windows gotchas

These are all still true on this branch. They are not caused by the sync; they
will bite the next person doing this on Windows.

- **`pnpm test:run` does not work on Windows.** `scripts/run-vitest-stable.mjs`
  calls `spawnSync("pnpm", ["exec", "vitest", ...])` at
  `scripts/run-vitest-stable.mjs:329` and `:345` with no `shell: true`. On
  Windows `pnpm` is a `.ps1`/`.cmd` shim rather than an executable, so the spawn
  fails and the script exits 1 via
  `Failed to start Vitest: <error>`. Run targeted suites directly instead:
  `npx vitest run <paths>`.
- **`packages/shared`'s build script is POSIX-only.**
  `packages/shared/package.json` build is
  `tsc && mkdir -p dist/cliplab && cp src/cliplab/LICENSE src/cliplab/PROVENANCE.md dist/cliplab/`,
  and its `clean` is `rm -rf dist`. Neither `mkdir -p` nor `cp` exists on
  Windows.
- **Anything gated on `@paperclipai/shared`'s build is therefore blocked too.**
  `packages/plugins/sdk`'s `typecheck` is
  `pnpm --filter @paperclipai/shared build && tsc --noEmit`, so it cannot run on
  Windows even though its own TypeScript is fine. Work around it by invoking
  `tsc` directly for that package.
- **The root `build` script is POSIX-only by delegation.** Root `build` is
  `pnpm run preflight:workspace-links && pnpm -r build`, which fans out into the
  package scripts above. Note there is **no root `clean` script** in
  `package.json`; the `rm -rf` usages live in individual package scripts. Root
  `build` was not run for this sync.

## Pulled on 2026-10-03 — 23 PRs

Merge order below is the true chronological order of our `master`, oldest first,
as read from `git log --merges`. It is not the order the sync was originally
planned in.

| # | Upstream PR | PR author | Fixes | Issue author | Our merge SHA | Local work |
|---|---|---|---|---|---|---|
| 1 | [#13914](https://github.com/paperclipai/paperclip/pull/13914) | [@MindSyncHub](https://github.com/MindSyncHub) | [#13858](https://github.com/paperclipai/paperclip/issues/13858) | [@ukaya0](https://github.com/ukaya0) | `8e56ff97d` | clean |
| 2 | [#14212](https://github.com/paperclipai/paperclip/pull/14212) | [@Sealdot](https://github.com/Sealdot) | [#13615](https://github.com/paperclipai/paperclip/issues/13615) | [@AlexGogin](https://github.com/AlexGogin) | `a45adf4f7` | clean |
| 3 | [#14240](https://github.com/paperclipai/paperclip/pull/14240) | [@vikpurice](https://github.com/vikpurice) | [#13627](https://github.com/paperclipai/paperclip/issues/13627) | [@electro56435](https://github.com/electro56435) | `0d1c8043c` | clean |
| 4 | [#14019](https://github.com/paperclipai/paperclip/pull/14019) | [@HoneyTyagii](https://github.com/HoneyTyagii) | [#13943](https://github.com/paperclipai/paperclip/issues/13943) | [@dave-parsons](https://github.com/dave-parsons) | `37f041373` | follow-up fix `8b6044605` |
| 5 | [#13833](https://github.com/paperclipai/paperclip/pull/13833) | [@Pdesengrini](https://github.com/Pdesengrini) | [#13708](https://github.com/paperclipai/paperclip/issues/13708) | [@zemyalpha](https://github.com/zemyalpha) | `dec4c3072` | clean |
| 6 | [#14087](https://github.com/paperclipai/paperclip/pull/14087) | [@PetrouilFan](https://github.com/PetrouilFan) | [#13806](https://github.com/paperclipai/paperclip/issues/13806) | [@AutomatonHub](https://github.com/AutomatonHub) | `cae4afff8` | clean |
| 7 | [#14257](https://github.com/paperclipai/paperclip/pull/14257) | [@BluePhi09](https://github.com/BluePhi09) | [#14196](https://github.com/paperclipai/paperclip/issues/14196) | [@danielbaldwin47](https://github.com/danielbaldwin47) | `819f4c39d` | clean |
| 8 | [#14700](https://github.com/paperclipai/paperclip/pull/14700) | [@pierre-baptiste](https://github.com/pierre-baptiste) | [#14537](https://github.com/paperclipai/paperclip/issues/14537) | [@lucasantoro97](https://github.com/lucasantoro97) | `50987538e` | clean |
| 9 | [#13782](https://github.com/paperclipai/paperclip/pull/13782) | [@Waseemilyas](https://github.com/Waseemilyas) | [#13730](https://github.com/paperclipai/paperclip/issues/13730) | [@miraclebg](https://github.com/miraclebg) | `478e1c231` | clean |
| 10 | [#13707](https://github.com/paperclipai/paperclip/pull/13707) | [@lorenzozanee](https://github.com/lorenzozanee) | [#13703](https://github.com/paperclipai/paperclip/issues/13703) | [@jmmgreg](https://github.com/jmmgreg) | `447809ccd` | clean |
| 11 | [#13898](https://github.com/paperclipai/paperclip/pull/13898) | [@lorenzozanee](https://github.com/lorenzozanee) | [#13731](https://github.com/paperclipai/paperclip/issues/13731) | [@cometinnovations](https://github.com/cometinnovations) | `a7aa5adf1` | clean |
| 12 | [#14119](https://github.com/paperclipai/paperclip/pull/14119) | [@aashish254](https://github.com/aashish254) | [#13870](https://github.com/paperclipai/paperclip/issues/13870) | [@0ldPaul](https://github.com/0ldPaul) | `bf84086b9` | clean |
| 13 | [#14124](https://github.com/paperclipai/paperclip/pull/14124) | [@aashish254](https://github.com/aashish254) | [#13874](https://github.com/paperclipai/paperclip/issues/13874) | [@0ldPaul](https://github.com/0ldPaul) | `2042ffcac` | **conflict resolved** |
| 14 | [#14983](https://github.com/paperclipai/paperclip/pull/14983) | [@vayners](https://github.com/vayners) | [#14982](https://github.com/paperclipai/paperclip/issues/14982) | [@vayners](https://github.com/vayners) | `060b603d9` | clean |
| 15 | [#13726](https://github.com/paperclipai/paperclip/pull/13726) | [@vobornik](https://github.com/vobornik) | [#13725](https://github.com/paperclipai/paperclip/issues/13725) | [@vobornik](https://github.com/vobornik) | `b955b1503` | follow-up fix `8b6044605` |
| 16 | [#14039](https://github.com/paperclipai/paperclip/pull/14039) | [@nctiggy](https://github.com/nctiggy) | [#14038](https://github.com/paperclipai/paperclip/issues/14038) | [@nctiggy](https://github.com/nctiggy) | `d7f3c37c0` | clean |
| 17 | [#14036](https://github.com/paperclipai/paperclip/pull/14036) | [@sergio-magnify](https://github.com/sergio-magnify) | [#14029](https://github.com/paperclipai/paperclip/issues/14029) | [@sergio-magnify](https://github.com/sergio-magnify) | `87610ad74` | clean |
| 18 | [#14804](https://github.com/paperclipai/paperclip/pull/14804) | [@abhayKashyap03](https://github.com/abhayKashyap03) | [#14071](https://github.com/paperclipai/paperclip/issues/14071) | [@OldGoat1893](https://github.com/OldGoat1893) | `d55a86e91` | follow-up fix `8b6044605` |
| 19 | [#14048](https://github.com/paperclipai/paperclip/pull/14048) | [@Yi-111-a](https://github.com/Yi-111-a) | [#14002](https://github.com/paperclipai/paperclip/issues/14002) | [@imin911](https://github.com/imin911) | `f9a020bff` | **security fix `8b6044605`** |
| 20 | [#14015](https://github.com/paperclipai/paperclip/pull/14015) | [@Yi-111-a](https://github.com/Yi-111-a) | [#13960](https://github.com/paperclipai/paperclip/issues/13960) | [@sophinvest](https://github.com/sophinvest) | `683da7661` | clean |
| 21 | [#14475](https://github.com/paperclipai/paperclip/pull/14475) | [@stefanriegel](https://github.com/stefanriegel) | [#13697](https://github.com/paperclipai/paperclip/issues/13697) | [@hedche](https://github.com/hedche) | `354575f6a` | clean |
| 22 | [#14356](https://github.com/paperclipai/paperclip/pull/14356) | [@Yi-111-a](https://github.com/Yi-111-a) | [#14345](https://github.com/paperclipai/paperclip/issues/14345) | [@herman925](https://github.com/herman925) | `8ee0c2dbd` | clean |
| 23 | [#14229](https://github.com/paperclipai/paperclip/pull/14229) | [@patilswapnilv](https://github.com/patilswapnilv) | [#13822](https://github.com/paperclipai/paperclip/issues/13822) | [@pareshpatil8](https://github.com/pareshpatil8) | `3e107ff46` (plain commit) | **conflict resolved** |

Four contributors appear more than once and deserve repeated credit:
[@lorenzozanee](https://github.com/lorenzozanee) (2 PRs),
[@aashish254](https://github.com/aashish254) (2 PRs),
[@Yi-111-a](https://github.com/Yi-111-a) (3 PRs). Four PRs are
self-reported — the PR author and the issue author are the same person
([@vayners](https://github.com/vayners), [@vobornik](https://github.com/vobornik),
[@nctiggy](https://github.com/nctiggy),
[@sergio-magnify](https://github.com/sergio-magnify)).

### Secondary issues and root causes

The primary mapping above is one issue per PR, taken from the PR's closing
link. These additional issues are referenced by the same PRs and are part of the
same fix:

| PR | Also relates to | Issue author | Relationship |
|---|---|---|---|
| [#13833](https://github.com/paperclipai/paperclip/pull/13833) | [#13078](https://github.com/paperclipai/paperclip/issues/13078) | [@cometinnovations](https://github.com/cometinnovations) | Same guard, reported independently: a run with no `sourceIssueId` in `contextSnapshot` cannot write to **any** issue, including its own. |
| [#14257](https://github.com/paperclipai/paperclip/pull/14257) | [#14197](https://github.com/paperclipai/paperclip/issues/14197) | [@danielbaldwin47](https://github.com/danielbaldwin47) | Explicitly closed by the same PR; the wake-queue Postgres adapter calling host callbacks that query the global pool from inside its release transaction. |
| [#14356](https://github.com/paperclipai/paperclip/pull/14356) | [#13464](https://github.com/paperclipai/paperclip/issues/13464) | [@PetroOS-org](https://github.com/PetroOS-org) | Same `ghFetch` root cause (no `Authorization` header, exhausting the anonymous 60/hour rate limit). The PR body does **not** reference #13464 — this link is our own root-cause note, verified by reading both issues. |
| [#13726](https://github.com/paperclipai/paperclip/pull/13726) | #13805, #14182 | unverified | Reported to us as the same root cause (Claude subscription credentials not refreshing). The PR body references #13725, #13671 and #14236 but **not** #13805 or #14182, and we did not open those two issues to confirm the titles. Treat the "same root cause" claim as unverified. |
| [#14039](https://github.com/paperclipai/paperclip/pull/14039) | [#3936](https://github.com/paperclipai/paperclip/issues/3936) | unverified | Also explicitly closed by the PR, but it is a much older tracking issue. Not fetched, so its author and title are unverified. |

### What each fix does, in one sentence

| PR | User-visible problem and fix |
|---|---|
| [#13914](https://github.com/paperclipai/paperclip/pull/13914) | The comment composer was a silent no-op on any non-HTTPS deployment because it called `crypto.randomUUID()` unguarded; this guards the call and surfaces submit errors instead of swallowing them. |
| [#14212](https://github.com/paperclipai/paperclip/pull/14212) | The browser tab title never showed which task you were looking at; it now includes the issue identifier from the breadcrumb context. |
| [#14240](https://github.com/paperclipai/paperclip/pull/14240) | Four routes rendered two `h1` elements each and two routes shared one `document.title`; Skills, Search, Routines and Audit now render one `h1` per route with distinct titles. |
| [#14019](https://github.com/paperclipai/paperclip/pull/14019) | Choosing "Default" in the model picker for `*_local` adapters did not persist, because `JSON.stringify` drops the `undefined` sentinel; a cleared value is now serialized as `""`. |
| [#13833](https://github.com/paperclipai/paperclip/pull/13833) | Scoped-less heartbeat runs failed every issue write with `cross_issue_influence_run_context_required` even after a successful checkout; run context is now bound to the checked-out issue so taskless runs can write. |
| [#14087](https://github.com/paperclipai/paperclip/pull/14087) | An agent could not comment on or close an issue it was assigned, because `assigneeAgentId` set at creation did not satisfy the cross-issue-influence guard; assignment now counts as ownership. |
| [#14257](https://github.com/paperclipai/paperclip/pull/14257) | The wakeup read in `heartbeat.ts` queried the global pool from inside `db.transaction`, so concurrent wakeups exhausted the pool and froze the server; those reads now use their own transaction connection. |
| [#14700](https://github.com/paperclipai/paperclip/pull/14700) | A handoff wake parked as `deferred_issue_execution` with a null `recoveryActionId` was never re-admitted, stranding the task after a reassign plus comment; the new assignee is now woken after the reassigning run's process exits. |
| [#13782](https://github.com/paperclipai/paperclip/pull/13782) | `PATCH /api/issues/{id}` cancelled the caller's own run when an agent reassigned its own issue; the requesting run now stays alive through a self-handoff. |
| [#13707](https://github.com/paperclipai/paperclip/pull/13707) | Continuation recovery let a parent wait block on its own active delivery child, deadlocking the tree; active delivery children are now kept out of parent waits. |
| [#13898](https://github.com/paperclipai/paperclip/pull/13898) | `PATCH /api/issues/:id` returned 500 when re-sending an unchanged description that cited the same `COM-####` reference twice; concurrent issue reference syncs are now serialized. |
| [#14119](https://github.com/paperclipai/paperclip/pull/14119) | A self-referencing or cyclic `parentId` sent issue-tree walks into an unbounded recursive CTE that hung workspace queries and filled disk; cycle guards were added at the reparent write boundary and in every tree walk. |
| [#14124](https://github.com/paperclipai/paperclip/pull/14124) | The terminal workspace reaper never archived `local_fs` workspaces whose `cwd` was not a git repository, pinning `skippedUndelivered` at page size; those workspaces are now reaped, while runtime-created checkouts that lost `.git` are still skipped. |
| [#14983](https://github.com/paperclipai/paperclip/pull/14983) | `DELETE` on any company that had activity (cost events, inbox dismissals) returned 500; the foreign-key deletion order in the company delete cascade is now correct. |
| [#13726](https://github.com/paperclipai/paperclip/pull/13726) | Claude subscription connections stopped working roughly eight hours after sign-in and could not refresh; credentials are now rotated from the credential file on demand. |
| [#14039](https://github.com/paperclipai/paperclip/pull/14039) | `claude_local` per-issue thinking effort ignored the selected model, so Haiku runs failed and Opus lost `xhigh`/`max`; effort is now mapped to the selected model in the adapter, UI and issue properties. |
| [#14036](https://github.com/paperclipai/paperclip/pull/14036) | The OpenAI subscription connection forced `codex login --device-auth` with no alternative, so it could not connect where the ChatGPT workspace blocks device code; browser sign-in is now offered when device code is blocked. |
| [#14804](https://github.com/paperclipai/paperclip/pull/14804) | `timeoutSec` was missing from `getConfigSchema()` for `claude_local` and `codex_local` and the create-agent form hard-coded it to `0`, making execution timeouts unreachable from the dashboard; the field is now exposed and preserved. |
| [#14048](https://github.com/paperclipai/paperclip/pull/14048) | Agent hire approval wrote the literal string `***REDACTED***` into the new agent's config (e.g. `maxRawInputTokens`), permanently corrupting it; approved hires now store the real values. |
| [#14015](https://github.com/paperclipai/paperclip/pull/14015) | `ensureManagedProjectWorkspace` compared repository URLs without normalizing `.git`, so it cloned a phantom checkout and failed every `git_worktree` run; managed repository URLs are now normalized before comparison. |
| [#14475](https://github.com/paperclipai/paperclip/pull/14475) | `paperclipai update` always rolled back on an authenticated-mode instance because the health probe could not see `serverVersion`; the CLI now confirms a restart from the hot-restart report when health redacts the version. |
| [#14356](https://github.com/paperclipai/paperclip/pull/14356) | Skill import from GitHub sent no `Authorization` header and 403'd once the anonymous 60/hour rate limit was exhausted; `ghFetch` now accepts `GITHUB_TOKEN` and `GH_TOKEN`. |
| [#14229](https://github.com/paperclipai/paperclip/pull/14229) | `contextSnapshot.issueId` was never updated after a wake, so `POST /issues/:id/checkout` could not grant an agent write access to the issue it had just checked out; checkout now stamps the issue onto the run context. |

### Merges that needed local work

Only one merge in this round was recorded by git as a conflict. Three others
were textually clean but wrong on our tree and were corrected by the follow-up
commit `8b6044605`
("fix: reconcile merged upstream PRs and harden token-limit redaction"). Each is
disclosed here because we changed the meaning of what a contributor wrote.

- **[#14229](https://github.com/paperclipai/paperclip/pull/14229) — conflict
  resolved manually, import list.** Resolved in
  `server/src/__tests__/issues-service.test.ts`. The new tests import
  `stampMissingIssueIdsOntoRunContext` into an existing named-import block from
  `../services/issues.ts` and add a separate
  `import { observeCrossIssueInfluence } from "../services/cross-issue-influence-limit.ts"`
  line. That import block had already moved on our side, so the hunk did not
  apply. This PR was also **not** merged with `--no-ff`: it is
  `CONFLICTING` upstream and was applied as the single commit
  `3e107ff46`, so `git log --merges` will not find it. Search
  `git log --all --grep="14229"` instead.

- **[#14124](https://github.com/paperclipai/paperclip/pull/14124) — conflict
  resolved manually, both sides kept.** Resolved in
  `server/src/__tests__/execution-workspaces-service.test.ts`. This is the only
  merge in the round whose commit message carries a `# Conflicts:` block. Our
  side already had three `it()` blocks from
  [#14119](https://github.com/paperclipai/paperclip/pull/14119)'s cycle-guard
  work (`sweeps a terminal workspace whose issue tree contains a corrupted parent cycle`,
  `runs the cooldown tree walk to completion on a corrupted parent cycle`,
  `counts large untracked worktrees without allowing destructive cleanup`);
  #14124 added four more (`archives a terminal local_fs workspace whose directory is not a git repository`,
  `archives a plain local_fs workspace that inherited git metadata`,
  `keeps skipping a runtime-created local_fs checkout that lost its .git`,
  `archives a local_fs workspace whose path is gone before the reaper reaches it`).
  The resolution is a **union**: all seven are present in the merge result and
  nothing was dropped from either parent. Verified by diffing `it()` titles
  across both parents and the merge commit.

- **[#14048](https://github.com/paperclipai/paperclip/pull/14048) — real
  security gap closed by us.** The PR is correct upstream but left a hole in its
  own redaction change, and we fixed it in `server/src/redaction.ts` before
  shipping. Upstream added `maxOutputTokens` and `maxRawInputTokens` to a new
  `NUMERIC_TOKEN_LIMIT_KEYS` set
  (`server/src/redaction.ts:41`) so their numeric values would not be redacted,
  and added a matching `isNumericTokenLimitField()` predicate
  (`server/src/redaction.ts:54`) as an **exemption** in the `sanitizeRecord`
  guard. But the guard's left-hand side was only
  `SECRET_PAYLOAD_KEY_RE.test(key) || AUDIT_COUNT_PAYLOAD_KEYS.has(key)`, and
  neither `maxOutputTokens` nor `maxRawInputTokens` matches
  `SECRET_PAYLOAD_KEY_RE` (`server/src/redaction.ts:6`) nor appears in
  `AUDIT_COUNT_PAYLOAD_KEYS`. The exemption was therefore dead code: a secret
  **string** sitting on either key was never redacted at all. We added
  `NUMERIC_TOKEN_LIMIT_KEYS.has(key)` to the left-hand side of that condition
  (`server/src/redaction.ts:914`), which makes the numeric exemption live and
  routes non-numeric values on those keys through redaction, while finite
  numbers still pass through as budgets. `server/src/__tests__/redaction.test.ts`
  covers both directions (`maxRawInputTokens: "sk-live-token"` and
  `maxOutputTokens: { value: "sk-live-token" }` redact; the numeric values do
  not).

- **[#14804](https://github.com/paperclipai/paperclip/pull/14804) +
  [#14019](https://github.com/paperclipai/paperclip/pull/14019) — semantic
  conflict, tests realigned.** Not a textual conflict: both merges applied
  cleanly. #14019 changed a cleared model value to serialize as `""` instead of
  `undefined` (because `JSON.stringify` drops `undefined`), and #14804's new
  tests in `ui/src/components/AgentConfigForm.render.test.tsx` encoded the old
  `undefined` expectation. We updated #14804's tests to match #14019's
  convention in `8b6044605`: the save assertion now expects
  `{ model: "gpt-6-astra", modelReasoningEffort: "", reasoningEffort: "" }`
  instead of `{ model: "gpt-6-astra" }`, and the clear assertion now expects
  `adapterConfig.model` to be `""` rather than `not.toHaveProperty("model")`.
  #14804's production behaviour is untouched.

- **[#13726](https://github.com/paperclipai/paperclip/pull/13726) — three tests
  made platform-agnostic.** Three cases in
  `server/src/__tests__/local-ai-credentials.test.ts` hardcoded POSIX path
  literals (`"/isolated/claude/.credentials.json"`,
  `"/isolated/claude/credentials.json"`, `"/isolated/grok/auth.json"`), so they
  failed on Windows where the service builds the path with `path.join`. We
  changed the three expectations to `path.join(...)` and added
  `import path from "node:path"`. Assertions only; no behaviour change.

## Connector PRs pulled on 2026-10-03 — 7 merged

A second, targeted pass pulled connector/Apps-catalog work — small, low-risk, and each one
fixes a linked upstream issue. Triaged from all 3,611 open PRs via
`closingIssuesReferences` + timeline cross-reference.

| PR | Author | Fixes | Issue author | Why it matters |
|---|---|---|---|---|
| [#14101](https://github.com/paperclipai/paperclip/pull/14101) | [@shravansumanthanan](https://github.com/shravansumanthanan) | [#14084](https://github.com/paperclipai/paperclip/issues/14084) | [@PAT-Main](https://github.com/PAT-Main) | Self-hosted Docker behind a remapped port built the GitHub connector callback with the internal port, so enrollment silently failed. Also fixes cross-origin OAuth popup navigation. |
| [#14067](https://github.com/paperclipai/paperclip/pull/14067) | [@aashish254](https://github.com/aashish254) | [#14040](https://github.com/paperclipai/paperclip/issues/14040) | [@nctiggy](https://github.com/nctiggy) | A connection request dying from an AI-account failure now says so, instead of the misleading "The task assignment changed". |
| [#11366](https://github.com/paperclipai/paperclip/pull/11366) | [@wakqasahmed](https://github.com/wakqasahmed) | [#11119](https://github.com/paperclipai/paperclip/issues/11119) | [@Oldrich333](https://github.com/Oldrich333) | Deleting a tool profile still referenced by an archived named Gateway returned 500 instead of succeeding. |
| [#14526](https://github.com/paperclipai/paperclip/pull/14526) | [@glatinone](https://github.com/glatinone) | [#14426](https://github.com/paperclipai/paperclip/issues/14426) | [@Intuicja](https://github.com/Intuicja) | Hermes Gateway agents can be saved and run; `hermes_gateway` was missing from the AI-connection compatibility table. |
| [#14166](https://github.com/paperclipai/paperclip/pull/14166) | [@ravinani02](https://github.com/ravinani02) | [#14140](https://github.com/paperclipai/paperclip/issues/14140) — self-reported | self | Custom/remote MCP servers answering 401 without a `WWW-Authenticate` header now get OAuth discovery instead of failing to connect. |
| [#14224](https://github.com/paperclipai/paperclip/pull/14224) | [@gentslava](https://github.com/gentslava) | [#14223](https://github.com/paperclipai/paperclip/issues/14223) — self-reported | self | A new AI connection no longer stays hidden on the Connectors page after the provider's last connection was removed. |

`#14166` and `#14224` were both reported and fixed by the same person, so only the fixer is
credited there. The other four are cross-author — reporter and fixer are different people.

### Connector PRs deliberately not taken

| Upstream PR | Author | Why not taken |
|---|---|---|
| [#12630](https://github.com/paperclipai/paperclip/pull/12630), [#12632](https://github.com/paperclipai/paperclip/pull/12632), [#12634](https://github.com/paperclipai/paperclip/pull/12634) | [@BastitsaB](https://github.com/BastitsaB) | **Dead code.** All three fix the legacy Composio broker, which upstream **retired** in [b82661b56 / #13758](https://github.com/paperclipai/paperclip/pull/13758) (2026-09-21, "refactor(connections): retire the legacy Composio broker"). Git surfaced them as `modify/delete` conflicts — `server/src/services/composio.ts` and `composio-session-manager.ts` no longer exist, and `COMPOSIO_GALLERY_KEY` has no remaining references in `tool-access.ts`. Merging would resurrect retired integration code. |
| [#13954](https://github.com/paperclipai/paperclip/pull/13954) | [@nctiggy](https://github.com/nctiggy) | **Already superseded upstream.** Its two substantive changes — `authorizationEndpoint` → `https://slack.com/oauth/v2_user/authorize`, `tokenEndpoint` → `https://slack.com/api/oauth.v2.user.access`, and the "User Token Scopes (not Bot Token Scopes)" guidance — are all already in our `master` via a later upstream commit. The only thing it adds is *shrinking* `scopesHint` from 28 scopes to 4, which would remove canvases/files/groups/im/mpim/lists/reactions/search access. That is a capability regression, so we took neither its changes nor its scope cut. |
| [#14037](https://github.com/paperclipai/paperclip/pull/14037) | [@nctiggy](https://github.com/nctiggy) | Same issue as #13935 as #13954 and mutually exclusive with it; a superset that also adds `ConnectionSetupFlow.tsx` changes. Superseded for the same reason. |
| [#14339](https://github.com/paperclipai/paperclip/pull/14339) | [@EduardoVasconceloss](https://github.com/EduardoVasconceloss) | Duplicate: closes the **same** issue (#13464) as already-merged [#14356](https://github.com/paperclipai/paperclip/pull/14356). Both add the missing `Authorization` header to `github-fetch.ts`. |
| [#14291](https://github.com/paperclipai/paperclip/pull/14291), [#13713](https://github.com/paperclipai/paperclip/pull/13713) | [@BluePhi09](https://github.com/BluePhi09), [@zannis](https://github.com/zannis) | Too large for a sync pass (63 and 33 files, new packages and DB migrations, both `CONFLICTING`). Worth dedicated review. |

## Skipped / not taken

| Upstream PR | Author | Why not taken |
|---|---|---|
| [#13978](https://github.com/paperclipai/paperclip/pull/13978) | [@itsjeremyjohnson](https://github.com/itsjeremyjohnson) | `CONFLICTING` upstream. Touches `docker/daytona-runner/Dockerfile`, root `package.json`, `packages/adapters/claude-local/package.json`, `pnpm-workspace.yaml`, the `packages/paperclip-runner` provider pack and a vendored `patches/@agentclientprotocol__claude-agent-acp@0.81.2.patch`. Merging it means carrying the Rust runner toolchain and reconciling the provider-pack build, which is a much larger change than a bug-fix sync should absorb. |
| [#13705](https://github.com/paperclipai/paperclip/pull/13705) | [@miraclebg](https://github.com/miraclebg) | Conflicts in `server/src/services/execution-continuation.ts` (and its test). Re-attempt when we next touch continuation accounting. |
| [#14911](https://github.com/paperclipai/paperclip/pull/14911) | [@Oigreat-bot](https://github.com/Oigreat-bot) | Skipped as an **overlapping alternative**, not a rejection on merit. It is `MERGEABLE` and addresses the same problem as [#13833](https://github.com/paperclipai/paperclip/pull/13833) (letting an unscoped run write to issues it owns), but does so by adding a DB migration, `packages/shared/src/issue-write-denial.ts` and changes to `server/src/routes/issues.ts`. We took #13833, which fixes the same root cause without a schema migration. Revisit only if #13833 proves insufficient. |
| ~3580 remaining open PRs | various | **Out of scope by decision.** Upstream had 3,611 open PRs at the time of this sync (verified via `gh api search/issues`). We sync a named, reviewed set of bug fixes; we do not attempt to track upstream's full open queue. The exact count will drift — re-query before quoting it. |

## Third-party plugins added

Two community plugins were vendored into `packages/plugins/` on 2026-10-03 so they appear
in the Plugins sidebar (`GET /api/plugins/examples`) and install with one click. They are
third-party work — credit belongs to the upstream authors below, not to this fork.

| Plugin (in-repo path) | Upstream repo | Author / maintainer | License | Vendored at |
|---|---|---|---|---|
| `packages/plugins/paperclip-office` | https://github.com/Kshitijm7/paperclip-office | **[Kshitijm7](https://github.com/Kshitijm7)** (Kshitij Mittal) | Apache-2.0 | `0cd29c7` |
| `packages/plugins/agent-pixels` | https://github.com/gcampton/Agent-Pixels | **[gcampton](https://github.com/gcampton)** (Garratt Campton) | **none declared** — see below | `42de7c5` |

### Nested third-party code

`packages/plugins/paperclip-office` itself vendors another project:

| Vendored at | Upstream repo | Author | License | Pinned commit |
|---|---|---|---|---|
| `packages/plugins/paperclip-office/vendor/munder-difflin` | https://github.com/chaitanyagiri/munder-difflin | **[chaitanyagiri](https://github.com/chaitanyagiri)** / Giri | MIT (code only) | `e9793df310195e4516f66367cd02e691082a860a` |

Per-file SHA-256 pins for all 22 vendored files live in
`packages/plugins/paperclip-office/upstream/upstream.lock.json`.

`packages/plugins/agent-pixels` is in turn a Paperclip port of
[Pixel-Agents](https://github.com/pixel-agents-hq/pixel-agents) by
**[Pablo De Lucca](https://github.com/pixel-agents-hq)** (MIT,
`Copyright (c) 2026 Pablo De Lucca`). That attribution is preserved in
`packages/plugins/agent-pixels/NOTICE.md`.

### Licensing caveat — Agent-Pixels

`gcampton/Agent-Pixels` publishes **no LICENSE file** and GitHub reports `license: null`.
We did not invent one and deliberately omitted `license` from its `package.json`. The
chain is MIT (Pixel-Agents) → unlicensed derivative (Agent-Pixels) → vendored here.
**Resolve this with gcampton before redistributing the plugin outside this fork.**

### Local modifications made during vendoring

Both plugins had to be adapted to build inside this monorepo:

- SDK dependency repointed to `"@paperclipai/plugin-sdk": "workspace:*"`.
- Dev dependencies pinned to concrete semver matching this repo; non-workspace version
  specifiers rewritten.
- `tsconfig.json` replaced in both (upstream `paths`/`baseUrl` pointed at the original
  authors' local checkouts; one dropped `noEmit` to emit `dist/`).
- POSIX-only build steps (`rm -rf`, `cp`) replaced with cross-platform Node scripts.
- `src/manifest.ts` rewritten to export a schema-valid `PaperclipPluginManifestV1` with
  literal `PLUGIN_ID` / `displayName` / `description`, which is what the catalog scrapes.
- `displayName` for paperclip-office changed from `"Office"` to `"Pixel Office"` for
  clarity in the catalog list.

### Known gap — these render as "First-party"

`discoverBundledPlugins` in `server/src/routes/plugins.ts` derives `tag` purely from the
directory path: anything not under `packages/plugins/examples/` is tagged `"first-party"`,
and `ui/src/api/plugins.ts` only types `"example" | "first-party"`. Both community plugins
therefore render with a **"First-party"** badge in the Plugins page today. Fixing this
needs a new `tag`/provenance value on both the server and UI contracts — tracked as
follow-up work, not done in this sync.

## Verification

What was actually run for the 2026-10-03 sync, and what was not:

- `pnpm -r typecheck` passed for 35 of the 36 workspace projects. The 36th,
  `packages/plugins/sdk`, could not complete on Windows because its `typecheck`
  script shells out to `pnpm --filter @paperclipai/shared build`, and
  `packages/shared`'s build uses POSIX `mkdir -p` and `cp`. Its TypeScript was
  instead verified clean by invoking `tsc` directly for that package. This is a
  platform limitation of the build scripts, not a type error in the synced code.
- Targeted Vitest batches were run with `npx vitest run <paths>`, because
  `pnpm test:run` cannot start on Windows (see the gotchas above).
- Root `pnpm build` was **not** run. It fans out into the same POSIX-only
  package build scripts. The `pnpm build` line in AGENTS.md section 7 is
  therefore satisfied only up to the POSIX boundary on this platform.
- The redaction test suite was **not** re-run inside the `docs/upstream-sync-log`
  worktree used to write this log: that worktree's `@paperclipai/adapter-utils`
  package is not built, so `server/src/__tests__/redaction.test.ts` fails at
  import with `Cannot find package '@paperclipai/adapter-utils'`. The
  redaction behaviour described above was verified by reading the code and the
  committed diff, not by a fresh test run.

## Upstream refresh after the sync

A second `git fetch upstream --prune` at the end of the session found `master` had moved
3 commits past our merge base. Merged `upstream/master` directly (clean, no conflicts),
so we are **0 behind upstream**. At that point we were **109 commits ahead**, because
this fork ships ~30 upstream PRs before upstream merges them.

| Upstream commit | PR | Summary |
|---|---|---|
| `569c7203a` | [#14863](https://github.com/paperclipai/paperclip/pull/14863) | `fix(ui): use latest issue runtime callbacks` |
| `78e003449` | [#15007](https://github.com/paperclipai/paperclip/pull/15007) | `fix(evals): account for hiring completion notifications` |
| `dd868ed12` | [#14961](https://github.com/paperclipai/paperclip/pull/14961) | `fix(runner): share native completion tool guidance` |

## Where this leaves the fork

- **0 commits behind `upstream/master`.**
- **~109 commits ahead** — we ship fixes before upstream merges them. That is the point of
  the sync, but it means our `master` is not a fast-forward of upstream and will conflict
  more over time. Periodically re-run the fetch/merge described above.
- All 30 upstream PRs referenced in this log were still **open upstream** at the time of
  writing (none had `mergedAt`). Several were reported `CONFLICTING` against upstream
  `master`, which is expected — our `master` carries merges they do not have.
- Outstanding follow-ups: the `"first-party"` catalog tag for community plugins (see
  Third-party plugins added), the Windows sandbox-sync path guard reported by the
  `fix/probe-cluster` pass (same class as upstream
  [#14091](https://github.com/paperclipai/paperclip/issues/14091)), and the remaining
  `fix/acp-core`, `fix/remote-probe` and `fix/heartbeat-recovery` test clusters.
- **Agent-Pixels has no license from its own author.** Resolve with
  [@gcampton](https://github.com/gcampton) before redistributing outside this fork.
