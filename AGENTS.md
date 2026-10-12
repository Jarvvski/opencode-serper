# AGENTS.md - opencode-serper project memory

A small [OpenCode](https://opencode.ai) V2 plugin that routes web search through
[Serper](https://serper.dev). It registers a `serper` websearch provider, a
`serper` `/connect` integration, and a namespace of `serper.*` search and
scraping tools. TypeScript, loaded directly by OpenCode's bun runtime - there is
no build step.

## Landing a change (jj, NOT git)

The owner uses **Jujutsu exclusively** in a colocated repo. **Never invoke
`git`** - it can corrupt jj's operation log. jj has no staging area; the working
copy is always a commit.

1. Make **one focused change** per commit.
2. Run `mise run check` (typecheck + tests); land only when it passes.
3. For user-visible changes, bump `version` in `package.json` + add a dated
   `CHANGELOG.md` entry in the *same* commit.
4. `jj describe -m "<imperative one-liner>"` then `jj bookmark set main --to @`
   then `jj new`.
5. Invariant: every time `main` moves, the next command is `jj new`, so `@` is
   always an empty commit one above main.

**Landing is strictly local. Agents must NEVER push from this repository.** Do
not run `jj git push`, create a PR as part of landing, or otherwise publish a
landed change. The owner handles all pushes.

Remote: `origin` = `Jarvvski/opencode-serper` (SSH:
`git@github.com:Jarvvski/opencode-serper.git`). `gh` auto-detection fails in jj
workspaces - always pass `-R Jarvvski/opencode-serper`.

## Toolchain

**mise** owns the runtime and the tasks (`mise.toml`). Use the tasks, don't
hand-roll commands:

- `mise run check` - the pre-land gate: typecheck + tests.
- `mise run typecheck` / `mise run test` - individual steps.

Bun, TypeScript, `bun.lock` committed. No build step: `package.json` `exports`
ships `./src/index.ts`, which OpenCode loads with its own bun runtime. Keep
`src/serper.ts` (transport + pure mappers) free of plugin-API coupling so it
stays unit-testable.

## Versioning & changelog

Keep a single **version of record**: `version` in `package.json`. Semver: PATCH
for fixes, MINOR otherwise; **never bump to 1.0.0 (or any MAJOR) without the
owner's explicit approval - do not auto-bump.** A user-visible change adds a
dated `CHANGELOG.md` entry (newest first) in the same commit; skip pure internal
refactors.

## Plugin API notes (OpenCode 2.0.27)

- Target `@opencode/plugin` `^2.0.27`, the V2 SDK. The V1 `@opencode-ai/plugin`
  package is unrelated.
- A plugin is `Plugin.define({ id, setup })`; `setup(ctx)` registers
  `ctx.integration`, `ctx.websearch`, and `ctx.tool` transforms.
- `IntegrationEditor` has no `add`; `update(id, ...)` **upserts**, which is how
  the `serper` integration is registered.
- Websearch results are `{ url, title?, content?, time: { published? } }`; `url`
  and `time` are required. `execute(input, { signal })` receives an
  `AbortSignal` - pass it to `fetch`.
- **Install specs.** `opencode plugin add` accepts npm names (with versions,
  tags, ranges) and npm-compatible Git specs (`github:Jarvvski/opencode-serper`,
  what this repo uses) but rejects local paths. The `plugins` config array does
  accept local paths (`./plugins/local`, `/absolute/path/plugin.ts`), and a
  `.ts`/`.js` file dropped in `~/.config/opencode/plugins/` is loaded directly.
- **Runtime SDK comes from our own `dependencies`.** OpenCode installs the
  plugin with npm and fetches `@opencode/plugin` from our `package.json`; the
  server does not provide it. So the pinned version in `package.json` (currently
  exact `2.0.27`) is what runs, and CI typechecks against it - keep them aligned
  when bumping.
- Plugin changes need a server restart to load; `opencode reload` does not
  reconcile plugins.

## Secrets

Never log or echo the API key. Resolve it only in `src/key.ts`, and keep
`opencode.jsonc` examples free of secrets - use `/connect`, `SERPER_API_KEY`, or
`options.apiKey`.
