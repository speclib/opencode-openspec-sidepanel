# End to end tests

These tests prove the plugin works inside the real OpenCode process, not only in
isolation. They are the acceptance proof for the PoC.

```bash
npm run test:e2e
```

They are not part of `nix flake check`, because they need a real OpenCode
install and a terminal.

## What is proven

1. The `OPENSPEC` section appears in the sidebar when OpenCode runs in a project
   that has an OpenSpec root (`e2e/openspec-sidebar.test.ts`).
2. The rendered total, per-status counts, task progress, spec count, requirement
   count and archived count match the fixture and the `openspec` CLI.
3. The plugin refreshes after a real assistant turn. The case holds the assistant
   response open, creates a change during the turn, releases the response and
   asserts the rendered counts change (`e2e/openspec-live-refresh.test.ts`). The
   wiring tests in `tests/unit/plugin-wiring.test.ts` still cover the event
   subscription and the 30 second timer.
4. When the project has no OpenSpec root, the section shows the muted
   `unavailable` line and the TUI keeps rendering
   (`e2e/openspec-degraded.test.ts`).

## How the harness works

Each test creates a temporary fixture project and runs OpenCode against it.

- `helpers/project.ts` makes the fixture with
  `openspec init --tools none --no-animation`, three real changes with
  deterministic task counts, two main specs with five requirements, and nine
  archive directories. It copies `.opencode/plugins/openspec-stats` into the
  project and symlinks the repository `node_modules` so the plugin resolves
  `@opencode/plugin`, `@opentui/*` and `solid-js`.
- `helpers/env.ts` isolates the run with a temporary `HOME` and temporary
  `XDG_DATA_HOME`, `XDG_CONFIG_HOME` and `XDG_CACHE_HOME`, so the developer's
  OpenCode and OpenSpec data are untouched and no global plugins load.
- `helpers/session.ts` writes a canned session with one user and one assistant
  message and imports it with `opencode session import --standalone`. This puts
  the TUI in the session view, where the sidebar lives, without needing a model
  or network access.
- `helpers/mock-provider.ts` serves a local OpenAI compatible provider for the
  live refresh case. It needs no package install and no network, and it holds
  the assistant message until the case releases it so the order of the turn and
  the OpenSpec change is deterministic. The fixture writes the matching provider
  config into `opencode.jsonc`.
- `helpers/pty.py` runs `opencode --standalone` inside a pseudo terminal of a
  fixed size. Node has no built in pseudo terminal, so the helper uses the
  Python standard library. It is available on the host and in `nix develop`.
- `helpers/screen.ts` reconstructs the final screen from the captured terminal
  output, because OpenCode redraws with cursor positioning. Assertions run
  against the screen and are limited to the sidebar region, located by the
  `OPENSPEC` header column.

The tests skip cleanly when `opencode`, `python3` or the plugin dependencies are
missing, so a checkout without an OpenCode install still passes. The live
refresh case also skips when its local provider cannot start. On the development
host every prerequisite is present, so a skipped case is not proof.

## Why this is separate from nix flake check

`nix flake check` runs the unit and integration suites in a pure sandbox with no
network. The end to end suite needs a real OpenCode binary, a terminal and a
local HTTP provider. Keeping it separate keeps the sandbox check fast and
reproducible while still proving the real process on the development host.
