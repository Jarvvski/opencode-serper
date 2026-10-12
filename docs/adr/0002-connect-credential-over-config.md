# Store the Serper key in the OpenCode credential store, not the config

The plugin needs a Serper API key. The obvious place is a `plugins[].options`
value in `opencode.jsonc`, but that config is a candidate for the owner's
chezmoi-tracked dotfiles, and OpenCode's own search providers do not store
credentials in config at all.

We chose the `/connect` integration. The plugin registers a `serper` integration
with a `key` method (paste the key in the TUI) and an `env` method named
`SERPER_API_KEY`, and resolves the key from the active connection first. The key
lives in OpenCode's credential store, outside any tracked file, and the flow
matches how OpenCode's built-in providers handle credentials.

Two fallbacks remain, for CI and non-interactive use where `/connect` is not
available: the `apiKey` plugin option, then the raw `SERPER_API_KEY` environment
variable. Resolution order is credential, then option, then env.

The trade-off: the credential store is per-OpenCode-install, so a second machine
needs its own `/connect` (or the env var). That is the same behaviour as every
other OpenCode integration.

Status: accepted
