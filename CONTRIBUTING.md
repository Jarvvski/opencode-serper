# Contributing

Thanks for helping improve `opencode-serper`. This is a small OpenCode V2 plugin;
keep changes focused and tested.

## Toolchain

Runtime and tasks are owned by [mise](https://mise.jdx.dev) (`mise.toml`). Use the
tasks rather than hand-rolling commands:

```sh
mise run check   # typecheck + tests (the pre-land gate)
```

Bun and TypeScript only; there is no build step. `package.json` `exports` ships
`./src/index.ts`, which OpenCode loads with its own bun runtime.

## Guidelines

- One focused change per commit.
- Keep `src/serper.ts` (HTTP transport and pure mappers) free of plugin-API
  coupling so it stays unit-testable; add tests for behaviour changes.
- For user-visible changes, bump `version` in `package.json` and add a dated
  `CHANGELOG.md` entry in the same commit.
- Never commit a Serper API key or any other secret. Examples use `/connect`,
  `SERPER_API_KEY`, or `options.apiKey` placeholders.

## Version control

The owner works in a colocated [Jujutsu](https://jj-vcs.dev) repo and does not use
`git` directly. Contributors using Git can open a pull request against `main`;
the maintainer will handle landing. See [`AGENTS.md`](AGENTS.md) for the full
workflow notes.
