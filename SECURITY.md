# Security Policy

## Supported versions

This project is pre-1.0 and ships from `main`; only the latest commit is
supported. Pin a specific commit if you need stability.

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting on this repository
(**Security → Report a vulnerability**), or email the maintainer at the address
on the [GitHub profile](https://github.com/Jarvvski).

Include what you can: affected version or commit, a description, reproduction
steps, and impact. You will get an acknowledgement as soon as possible.

## Handling of secrets

This plugin never logs or echoes your Serper API key. The key is resolved in
`src/key.ts` only, and configuration examples in `docs/` contain no secrets.
Prefer `/connect` (OpenCode's credential store) over putting a key in
`opencode.jsonc`. If you believe a key has leaked, rotate it in the Serper
dashboard.
