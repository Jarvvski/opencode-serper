# Changelog

All notable changes to this project are documented here (newest first). The
version of record lives in `package.json`.

## [Unreleased]

### Added

- 2026-10-12 - Initial release. Registers Serper as an OpenCode `websearch`
  provider, adds a `serper` integration connectable with `/connect` (key) or
  `SERPER_API_KEY` (env), and exposes `serper.*` search and scraping tools
  (`search`, `news`, `scholar`, `places`, `images`, `autocomplete`, `scrape`)
  (0.1.0).
