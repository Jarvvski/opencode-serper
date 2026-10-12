# opencode-serper

An OpenCode plugin that routes web search through [Serper](https://serper.dev)
and exposes Serper's search and scraping endpoints as agent tools.

## Language

### Core

**Provider**:
The Serper-backed implementation of OpenCode's `websearch` provider interface.
Selecting it makes the built-in `websearch` tool search via Serper.
_Avoid_: search backend, engine

**Integration**:
The OpenCode credential record named `serper`, connected with `/connect` or from
`SERPER_API_KEY`. It stores the API key outside `opencode.jsonc`.
_Avoid_: account, auth

**Credential**:
The stored API key behind an integration connection.
_Avoid_: token, secret

**Tool namespace**:
The `serper` group under which the plugin's tools appear in Code Mode
(`tools.serper.search`, `tools.serper.scrape`, ...).
_Avoid_: toolset, toolkit

**API key resolution**:
The ordered lookup for the Serper key - integration credential, then the
`apiKey` plugin option, then `SERPER_API_KEY`.
_Avoid_: key lookup
