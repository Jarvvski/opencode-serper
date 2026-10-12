# Changelog

All notable changes to this project are documented here (newest first). The
version of record lives in `package.json`.

## [0.1.0] - 2026-10-12

### Added

- Initial release. Registers Serper as an OpenCode `websearch` provider, adds a
  `serper` integration connectable with `/connect` (key) or `SERPER_API_KEY`
  (env), and exposes `serper.*` search and scraping tools (`search`, `news`,
  `scholar`, `places`, `images`, `autocomplete`, `scrape`).
- `options.setDefault: false` to keep another `websearch` provider as the default
  instead of selecting Serper on install.

### Changed

- `serper.*` tool results are capped at 20,000 characters (`MAX_TOOL_CONTENT`) so
  a large scrape or image response cannot exhaust the model's context window.
- Key resolution falls through to the plugin option or `SERPER_API_KEY` when the
  credential store cannot be read, instead of failing the whole request.
