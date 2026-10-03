# Provenance

This directory is a **vendored copy of a third-party Paperclip plugin**. This file records
where it came from, what was taken, and what was changed, so the next maintainer can diff
against upstream instead of guessing.

## Upstream

| | |
|---|---|
| Project | **paperclip-office** |
| Original repository | <https://github.com/Kshitijm7/paperclip-office> |
| Author | **Kshitijm7** (Kshitij Mittal) — <https://github.com/Kshitijm7> |
| Upstream default branch | `main` |
| Upstream commit vendored | `0cd29c7` ("PA rounds run from a worker timer every 5 minutes for all companies") |
| Licence | Apache-2.0 — `LICENSE` and `NOTICE` are the upstream files, kept verbatim |
| Language | TypeScript |

Apache-2.0 §4 requires that recipients receive a copy of the Licence and that notices are
preserved. Both upstream files are kept unmodified in this directory. `NOTICE` also records the
third-party attribution this plugin inherits:

- **munder-difflin** — <https://github.com/chaitanyagiri/munder-difflin>, (c) 2026 Chaitanya
  Giri, MIT. Vendored at `vendor/munder-difflin/` (pinned to commit
  `e9793df310195e4516f66367cd02e691082a860a`), with its own `LICENSE`, `LICENSE-ASSETS`, and
  `src/renderer/src/assets/ATTRIBUTION.md`. Upstream's per-file SHA-256 lock is preserved at
  `upstream/upstream.lock.json`; all 22 vendored files still match it.
- **Scandi wood art** — generated for this project by the upstream author and distributed with
  the repository. The committed pieces used at build time are `src/layout/styles/scandi.png`
  and `src/layout/styles/scandi.atlas.ts`.
- **LimeZu Modern Interiors tilesets** — *not* redistributable, and therefore *not* vendored.
  `scripts/fetch-art.mjs` can fetch them into the gitignored `assets/local/` for local use only.

## What was vendored

Taken from upstream byte-for-byte:

- `LICENSE`, `NOTICE`
- `src/**` — the entire plugin source tree, including `src/layout/styles/scandi.png`
- `vendor/munder-difflin/**` — the vendored office engine, licences, and attribution
- `migrations/.gitkeep`
- `upstream/upstream.json`, `upstream/upstream.lock.json`, `upstream/overrides.md`
- `scripts/esbuild-aliases.mjs`, `scripts/fetch-art.mjs`
- `esbuild.config.mjs`

Deliberately **not** vendored (upstream repo-development material, not plugin runtime):

| Skipped | Why |
|---|---|
| `assets/free/styles/scandi-wood/v2/**` (~4.5 MB of PNG sheets, prompts, `objects.json`) | Authoring source for the tileset. The build only needs the committed `src/layout/styles/scandi.png` plus the generated `scandi.atlas.ts`. |
| `assets/catalogue.json`, `assets/local/**` | `assets/local/` holds non-redistributable LimeZu art and is gitignored upstream too. |
| `docs/**` (incl. ~1 MB of screenshots) | Upstream design docs. The feature summary was folded into this directory's `README.md`. |
| `demo/**` | Standalone browser demo with its own build and SDK mock; needs `demo/fixtures.ts` and is not part of the plugin bundle. |
| `tests/**` and `vitest.config.ts` | Upstream vitest suite. Not carried over; see "Known gaps". |
| `.github/**`, `.claude/**`, `CLAUDE.md`, `CONTRIBUTING.md`, `upstream/sync-upstream.ps1` | Upstream repo automation and agent instructions. |
| `package-lock.json` | npm lockfile. This monorepo uses pnpm. |
| `scripts/build-style-v2.py`, `scripts/normalize-style-tiles.py` | Regenerate the skipped art source above. |

## What was changed, and why

Only these files differ from upstream.

### `package.json` — rewritten

| Change | Why |
|---|---|
| `name` → `@paperclipai/plugin-paperclip-office` | Every package under `packages/plugins/*` uses the `@paperclipai/plugin-*` scope. `pnpm-workspace.yaml` already globs `packages/plugins/*`, so no workspace edit was needed. |
| `"@paperclipai/plugin-sdk": "workspace:*"` moved to `dependencies` | Upstream pinned the published SDK (`2026.831.1`) in `devDependencies`. Inside this monorepo the plugin must resolve the in-repo SDK. `dependencies` (not `devDependencies`) matches `plugin-workspace-diff` and keeps the standalone-bundled-plugin runtime-dependency check satisfied. |
| `react` / `react-dom` → `^19.2.8`, `@types/react` → `^19.2.18`, `@types/react-dom` → `^19.2.5` | Upstream asked for `react-dom@^18.3.1`, but `pnpm.overrides` in `pnpm-workspace.yaml` forces `react`/`react-dom` to `^19.2.8` repo-wide. The declared range now matches what actually resolves. |
| `zustand` → `^5.0.15` (was `4.5.5`) | zustand 5 is the version resolvable in this repo. The plugin only uses `createStore` from `zustand/vanilla` plus `getState`/`setState`/`subscribe`, which are unchanged between 4 and 5. |
| `esbuild` → `^0.28.2`, `typescript` → `^7.0.2`, `@types/node` → `^24.0.0` | Match the other in-repo plugins. |
| `private: true` | This is a repo-bundled plugin, not a separately published npm package. It is installed by local path from the Plugins page. |
| `prebuild` no longer runs `scripts/fetch-art.mjs` | Upstream downloaded LimeZu art over the network on every build. That must not happen in a repo build. `fetch-art` is kept as an explicit `pnpm fetch-art` script instead. |
| `clean: "rm -rf dist"` dropped | The sibling plugin scripts that use `rm -rf`/`cp` do not work on Windows. Nothing in this package's build needs them. |
| Added `build:tsc` | Exposes the plain `tsc -p tsconfig.json` path (typecheck-grade emit) alongside the canonical esbuild `build`. |
| `test` script dropped | No vendored tests. See "Known gaps". |
| `demo` script dropped | `demo/` was not vendored. |
| Added `repository`, `bugs`, `homepage`, `files` | Attribution pointers to the original repository, and an explicit file list so a future publish cannot accidentally ship skipped material. |

### `tsconfig.json` — adapted from the upstream file

| Change | Why |
|---|---|
| `baseUrl` removed; `paths` values made relative (`./src/...`, `./vendor/...`) | TypeScript 7 (the version this repo uses) removed `baseUrl` and rejects non-relative `paths` targets. |
| `noEmit: true` | Upstream was typecheck-only. Keeping it means `typecheck` and `build:tsc` never fight the esbuild output in `dist/`. |
| Added `types: ["node"]` | The worker uses `node:fs`, `node:async_hooks`, etc. |
| `include` narrowed to `["src"]` | `tests` and `demo` were not vendored. |
| `@/` and `react-i18next` path aliases kept | Required to redirect the vendored `munder-difflin` engine at this plugin's `src/adapters/` shims. |

### `src/manifest.ts` — minimally edited

The manifest body is upstream's. Only the identity block changed, plus comments:

| Change | Why |
|---|---|
| `const PLUGIN_ID = "paperclip-office"` / `const PLUGIN_VERSION = "0.1.0"` extracted as literals | `discoverBundledPlugins` in `server/src/routes/plugins.ts` regex-scrapes `src/manifest.ts` for the Plugins page row. It looks for a `PLUGIN_ID` literal first and falls back to the first `id:` string literal. Computed values would make the row fall back to the package name. |
| `displayName`: `"Office"` → `"Pixel Office"` | `"Office"` is ambiguous next to the other bundled plugins on the Plugins page. |
| `description` expanded | Upstream's description omitted the Decision box, which is the plugin's most distinctive feature. Still under the 500-char schema limit. |
| `author`: `"Kshitij Mittal"` → `"Kshitijm7"` | Credit by the upstream GitHub handle, matching the package `author`. The full name and repository URL are in `README.md` and this file. |

Unchanged on purpose, and verified against
`packages/shared/src/validators/plugin.ts`: `categories: ["ui"]` (the only UI-shaped category
this plugin is), all 21 capabilities (every one is in `PLUGIN_CAPABILITIES`; none invented),
`database.coreReadTables` (all in `PLUGIN_DATABASE_CORE_READ_TABLES`), both `tools` entries with
`agent.tools.register`, and the three `ui.slots` with `entrypoints.ui`.

### `.gitignore` — added

`dist`, `node_modules`, `assets/local` (where LimeZu art would land), `.paperclip-sdk`.

### `README.md`, `PROVENANCE.md` — added

`README.md` documents what the plugin does and how to install, build, and configure it in this
repo, and credits the original author and repository. This file is the vendoring record.

## Known gaps

These are deliberate, and each is a follow-up for whoever owns the lockfile and CI:

1. **`pnpm-lock.yaml` has no importer for this package.** The lockfile update is centralised and
   was intentionally not done here. Until it lands, a clean `pnpm install` will not create
   `packages/plugins/paperclip-office/node_modules`, so the build cannot run.
2. **No vendored tests.** Upstream's 24 `tests/*.spec.ts` files were not carried over, so this
   package has no `test` script. Re-adding them means adding `vitest` and a `vitest.config.ts`.
3. **No demo.** `demo/` was not vendored, so the `?open=decisions` / `?agent=` / `?widget=1`
   preview path from the upstream README is unavailable here.
4. **LimeZu themes are unavailable without `pnpm fetch-art`.** That is correct behaviour (the art
   is not redistributable), but it means `office` and `brooklyn99` themes resolve to the free
   Scandi wood theme in a plain repo build.
5. **`fileBrowser` example parity is not verified here.** The UI bundle builds and the Plugins
   page metadata scrapes correctly, but the Pixi scene was not exercised in a live Paperclip
   browser session as part of vendoring.

## How to re-sync

```sh
git clone --depth 1 https://github.com/Kshitijm7/paperclip-office.git /tmp/paperclip-office
git -C /tmp/paperclip-office log -1 --format=%H   # record the new upstream commit
# then re-copy src/, vendor/, LICENSE, NOTICE, upstream/ and re-apply the
# package.json / tsconfig.json / manifest.ts changes listed above.
```

Never edit `vendor/munder-difflin/` directly. Change behaviour through `src/adapters/` or through
one of the two files listed in `upstream/overrides.md`.