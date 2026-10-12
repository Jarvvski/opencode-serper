# Configuration

`opencode-serper` needs one thing: a Serper API key. Everything else has a
sensible default.

## API key resolution

The plugin resolves the key in this order, first match wins:

1. **Integration credential** - the `serper` connection created by `/connect`
   (or sourced from the `SERPER_API_KEY` env method the plugin registers).
2. **Plugin option** - `options.apiKey` in the `plugins` entry.
3. **Environment variable** - `SERPER_API_KEY` in OpenCode's environment.

If none is set, any Serper call fails with an actionable error naming all three.

### Via `/connect` (recommended)

Run `/connect` in the TUI, choose **Serper**, and paste your key. The key is
stored in OpenCode's credential store, outside `opencode.jsonc`. This keeps it
out of dotfiles and matches how OpenCode's own providers handle credentials.

The same flow is available from the CLI:

```sh
opencode auth login serper
```

### Via the environment

```sh
export SERPER_API_KEY=your-key
opencode
```

The plugin registers an `env` method for the `serper` integration, so a set
`SERPER_API_KEY` also satisfies `/connect`.

### Via a plugin option

```jsonc
{
  "plugins": [
    {
      "package": "github:Jarvvski/opencode-serper",
      "options": { "apiKey": "your-key" },
    },
  ],
}
```

This puts the secret in `opencode.jsonc`, so prefer `/connect` or the
environment unless the config is not tracked or you are running in CI.

## Web search provider

Installing the plugin selects `serper` as the default `websearch` provider. To
set it explicitly, or to switch back to another provider:

```jsonc
{
  "websearch": { "provider": "serper" },
}
```

See OpenCode's [websearch docs](https://opencode.ai/v2/docs/websearch) for the
provider list and selection behaviour.

## Permissions

The built-in `websearch` tool uses OpenCode's `websearch` permission action with
the query as the resource; the `serper.*` tools use `serper_*` actions. The
default policy allows both. To require approval before searches:

```jsonc
{
  "permissions": [
    { "action": "websearch", "resource": "*", "effect": "ask" },
  ],
}
```

See OpenCode's [permissions docs](https://opencode.ai/v2/docs/permissions).
