# Ship as an OpenCode plugin, not a wrapper or an MCP server

OpenCode's built-in `websearch` tool ships five providers - Exa, Firecrawl,
Parallel, Tavily, and TinyFish - and Serper is not one. We wanted the built-in
`websearch` tool, and every agent that already uses it, to search via Serper
without teaching each agent a separate tool.

An OpenCode V2 plugin can register a websearch provider
(`ctx.websearch.transform`), so we ship one: a `serper` provider, plus a
namespace of `serper.*` tools for the endpoints the provider interface does not
cover (news, scholar, places, images, autocomplete, scrape). The provider makes
search work everywhere the built-in tool is used; the tools cover the rest.

The alternatives were a standalone MCP server - the route we started with, and
what the Serper ecosystem offers - or a thin wrapper. Both leave `websearch`
pointed at another provider and require per-agent wiring to prefer Serper, so the
built-in search path never routes through it.

Status: accepted
