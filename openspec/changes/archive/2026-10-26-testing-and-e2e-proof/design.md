## Context

The unit suite covers parsing, aggregation, layout, cache and refresh. The
integration suite runs the real `openspec` CLI. Neither proves that the plugin is
loaded by OpenCode, that the sidebar renders or that a real turn refreshes it.

The sibling project `/home/pim/gh.mipmip/opencode-beans/e2e/` already proves this
pattern on this host for the beans plugin. Its harness is reused with the tracker
replaced by OpenSpec.

## Goals / Non-Goals

**Goals:**

- One real OpenCode process per case, rendered in a pseudo terminal.
- Counts asserted against the fixture, not against the plugin's own parser.
- A deterministic live refresh case.
- A degraded case that proves the TUI survives a missing OpenSpec root.

**Non-Goals:**

- Testing every supported operating system.
- Running the e2e suite inside `nix flake check`.
- Replacing the unit or integration suites.

## Decisions

### Temporary project with isolated state

Each case gets a `mkdtemp` project. `HOME`, `XDG_DATA_HOME`, `XDG_CONFIG_HOME`
and `XDG_CACHE_HOME` point inside it. `OPENCODE_SERVER` and
`OPENCODE_CLI_CONFIG_CONTENT` are removed so a developer server cannot leak in.
The plugin directory is copied into `.opencode/plugins/openspec-stats`, and the
repository `node_modules` is symlinked so `@opencode/plugin`, `@opentui/*` and
`solid-js` resolve without a second install.

### Fixture from the real CLI

The fixture runs `openspec init --tools none --no-animation`, then
`openspec new change` for three changes. Task files are written with checked and
unchecked items so the statuses and task totals are deterministic. Two main
specs are written with two and three requirements. Nine archive directories are
created. The fixture is the source of truth for the assertions.

The plugin itself only sees `openspec list --json`, `openspec list --specs
--json` and the archive directory, so this exercises the same path as a real
project.

### Canned session for the static cases

`opencode session import` loads a session document with one user message and one
assistant message, then OpenCode opens that session with `--session`. This puts
the TUI in the session view without a model or network.

### Local provider for the live case

The live case starts a small HTTP server that speaks the OpenAI compatible
chat completions API. It holds the assistant response until the test releases
it. The fixture writes the provider config, so OpenCode makes no external call.
The test waits for the assistant request, creates a change, then releases the
response and waits for the turn to settle.

The refresh assertion depends on the `session.execution.succeeded` event. If the
event wiring regresses, the live case fails instead of silently falling back to
the 30 second timer.

### Pseudo terminal and screen reconstruction

Node has no built in pseudo terminal. `pty.py` uses the Python standard library
to run `opencode --standalone` at a fixed 160 by 45 size and prints the raw
output. `screen.ts` replays CSI cursor movement, line clears and writes into a
fixed grid, then `sidebarRegion` finds the `OPENSPEC` header column and slices
the region. Assertions only look at that region.

### Prerequisites and placement

The suite checks `opencode --version`, `python3 --version` and the presence of
`node_modules/@opencode/plugin`. It skips with a named reason when one is
missing. It is not part of `nix flake check`, because it needs a real OpenCode
install and a terminal. On the development host all prerequisites are present,
so a skipped case is a failure of the proof.

## Risks / Trade-offs

- [Startup slower than the capture window] -> The capture timeout is 25 seconds,
  and the live case waits for the provider request before mutating the fixture.
- [OpenCode redraws and the screen parser drifts] -> The parser only implements
  the CSI sequences OpenCode actually emits, and assertions are scoped to the
  sidebar region.
- [The live case races the turn] -> The provider holds the response, so the
  change is created before the turn can succeed.
- [The e2e suite is flaky on a loaded machine] -> One process per case, no
  parallel cases, and a fixed terminal size.
