# Pixel Office (`@paperclipai/plugin-paperclip-office`)

**Your Paperclip agent company as a live pixel office.**
Every agent sits at a desk and shows what it is doing right now. Work flies between desks as envelopes. The decisions waiting on you sit in one box with Accept and Reject buttons.

> **This is a vendored third-party plugin.** It was written by
> **Kshitijm7 (Kshitij Mittal)** and is redistributed here under Apache-2.0.
> Original project: **<https://github.com/Kshitijm7/paperclip-office>**
> See [`PROVENANCE.md`](./PROVENANCE.md) for exactly what was vendored and what changed.

## Install

The plugin is bundled with Paperclip, so it shows up on the **Plugins** page under
**Available Plugins**. Build it once, then install it from the UI:

```sh
pnpm --filter @paperclipai/plugin-paperclip-office build
```

Then open **Plugins → Available Plugins → Pixel Office → Install**, open a company,
and click **Office** in the sidebar.

To install from the CLI against a running instance instead:

```sh
pnpm paperclipai plugin install ./packages/plugins/paperclip-office --api-base http://127.0.0.1:3100
```

If you change `src/manifest.ts`, run `paperclipai plugin uninstall paperclip-office --force`
and install again.

## What it does

A Paperclip company with fifteen agents is hard to read from lists. This plugin draws the
whole company as one floor. It is the same data as the Paperclip lists, laid out so one
glance answers "who is busy, who is stuck, where does work pile up, and what is waiting on me".

It uses no tokens, needs no other plugin, and works for any company at any size.

### The office

- **Live agent states** taken from live runs and issues. Stuck agents (a run with no output for
  N minutes, or an in-progress issue with no run) get a red desk.
- **Floor plan generated from your org chart.** Departments become rooms, the Chief gets the
  corner office, Leads sit at the head of their team. It is a pure function of the org chart, so
  the same company always gets the same office.
- **Visible handoffs.** A reassignment, an @mention, or a new child issue flies an envelope
  from one desk to another.
- **Tool and thought bubbles**, name plates, issue tags, and state rings.
- **Agent-designed layouts** via the `office_set_layout` agent tool, plus a layout picker.

### Making decisions

- **Decision box** — pending approvals and decision cards that agents posted in issues, in one
  list, oldest first. Each card shows who asked, the issue with status and priority, the full
  request, and what Accept and Reject will each do.
- **One-click answers** using the agent's own wording. Only a signed-in human can answer.
- **ASK ME board** — the whiteboard in the office counts what is waiting on you.

### Seeing the company

- Agent monitor (current issue, run, queue, cost, chain of command), bottleneck heatmap, state
  board, collapsible activity feed, chain-of-command org panel, cost and budget alerts, search
  (`/`), and a Wall of Fame plaque.
- A **dashboard widget** with state counts, decisions waiting, and stuck agents.

### Around Paperclip

- `office_status` agent tool — "who is idle, stuck, or overloaded?" before assigning work.
- `office_set_layout` agent tool — let an agent design the floor plan.
- Settings for every optional feature, in **Settings → Plugins → Office**.
- English, Arabic, and Simplified Chinese on-screen text.

## Settings

Every setting is in **Settings → Plugins → Office**. The main ones:

| Setting | What it does | Default |
|---|---|---|
| Theme | Art style | Free (Scandi wood); `office`/`brooklyn99` need LimeZu art |
| Stuck after (minutes) | When a quiet run counts as stuck | 10 |
| Refresh interval (seconds) | How often the office polls | 4 |
| Decision box / Decision issue scan | Turn the box on, and how many open issues to scan for decision cards | on / 40 |
| Bottleneck heatmap + thresholds | Rugs under busy desks | on |
| Show cost / Spend shown as | Dollars, tokens, or auto (tokens on subscription plans) | on / auto |
| Idle roaming, Chatter, Thought bubbles | How lively the floor is | on |
| Org panel, State board, Scoreboard, Activity feed, Roster sidebar, Search, Layout picker | Turn each panel on or off | on |
| Role attire, Name plates, Issue tags, State rings | What each character shows on the floor | on |
| Scoring, Score window, Wall of Fame ranking | How productivity and efficiency are scored and ranked | on, 7 days, productivity |
| PA, PA reports, PA check interval | The PA's rounds and its reports to the Chief | on, on, 30 min |
| Language | `en`, `ar`, `zh-CN` | `en` |

### The Personal Assistant

A PA walks the floor desk by desk and checks each agent against real data. Agents it catches
idle with work waiting, stuck, or blocked get a red flag. Each round posts one supervisor report
to the Chief as a plugin comment on a single "PA productivity reports" issue. Plugin comments do
not wake agents, so it costs no tokens. PA rounds run from a worker timer (first tick ~20s after
worker start, then every 5 minutes); `paIntervalMinutes` gates how often a real check happens.

## Art

- **Scandi wood (default, shipped)** — original art generated for this project, cut into tiles.
  `src/layout/styles/scandi.png` is the committed atlas and `src/layout/styles/scandi.atlas.ts`
  its tile map. The build inlines the atlas as a data URL.
- **LimeZu Modern Interiors (optional)** — its licence forbids redistribution, so it is never
  committed. `pnpm fetch-art` downloads it into the gitignored `assets/local/`, or drop your own
  copy there. Without it, `__LIMEZU__` compiles to `false` and the free theme is the only one
  offered. **A build must never be published with that art in it.**

## Development

```sh
pnpm --filter @paperclipai/plugin-paperclip-office typecheck   # tsc --noEmit
pnpm --filter @paperclipai/plugin-paperclip-office build       # esbuild: dist/manifest.js, dist/worker.js, dist/ui/
pnpm --filter @paperclipai/plugin-paperclip-office dev         # esbuild watch
```

`build` is esbuild, not `tsc`. The plugin has to be *bundled*: it imports `pixi.js`, JSX, a PNG
through a `?url` loader, and a vendored TypeScript tree outside `src/`, none of which `tsc` can
emit into a host-loadable bundle. `typecheck` runs `tsc -p tsconfig.json` over the whole program
(79 files: `src/` plus `vendor/`).

## How it works

```
Paperclip host --SDK--> worker (src/worker.ts)
   agents, issues, runs,              |  one snapshot per poll:
   approvals, interactions,           v  states, handoffs, queues, cost, decisions
   costs, budgets                 UI (src/ui) --> Pixi office scene (vendor/munder-difflin)
```

The office engine is [munder-difflin](https://github.com/chaitanyagiri/munder-difflin) by
Chaitanya Giri (MIT), vendored at a pinned commit with a SHA-256 per file. The build swaps its
store, design tokens, and i18n for adapters in `src/adapters/`, so upstream code runs unchanged
against Paperclip data. The two files the port overrides are listed in
[`upstream/overrides.md`](./upstream/overrides.md).

## Credits and licence

- Code: [Apache License 2.0](./LICENSE), (c) 2026 Kshitij Mittal. See [`NOTICE`](./NOTICE).
- Office engine: [munder-difflin](https://github.com/chaitanyagiri/munder-difflin) by Chaitanya
  Giri, MIT. See [`vendor/munder-difflin/LICENSE`](./vendor/munder-difflin/LICENSE) and
  `vendor/munder-difflin/LICENSE-ASSETS`.
- Built on the [Paperclip](https://github.com/paperclipai/paperclip) plugin SDK.
- A sibling of [paperclip-git-graph](https://github.com/Kshitijm7/paperclip-git-graph).