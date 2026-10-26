## Why

The PoC now renders live OpenSpec statistics and passes its e2e suite, but its
operational edges are not proven and its documentation still describes an
unbuilt plugin. This is the last epic before the alpha handoff, so the failure
paths, the packaged artifact and the README must match what actually ships.

Epic bean: `opencode-openspec-sidepanel-b3vc`.

## What Changes

- Add loader tests for a hanging command, a buffer overflow, an aborted load and
  a failed spawn, all of which must surface as `unavailable`.
- Add a package verification check that runs `nix build` and asserts that the
  output contains the complete plugin directory.
- Strengthen the session panel coverage so every active change, its task
  progress and the spec and archive totals are proven.
- Rewrite the README for the completed PoC: prerequisites, install, development,
  tests, packaging, exact sidebar content and the panel.
- Align `AGENTS.md`, `BRIEFING.md` and `openspec/config.yaml` with the shipped
  behavior.
- Record deferred work as beans under a new backlog milestone instead of
  dropping it.
- No runtime behavior changes. This change proves and documents what exists.

## Capabilities

### New Capabilities

- `robustness-packaging-docs`: bounded OpenSpec command execution, the session
  panel breakdown, the packaged plugin artifact and the operator
  documentation.

### Modified Capabilities

None. The sidebar and data behavior are already specified by `plugin-sidebar`
and `openspec-stats`.

## Impact

- `tests/unit/openspec-loader.test.ts`, `tests/unit/layout.test.ts` and a new
  package test.
- `tests/integration/` gains a real hanging-command case.
- `scripts/verify-package.mjs` and `package.json` gain the package check.
- `README.md`, `AGENTS.md`, `BRIEFING.md` and `openspec/config.yaml` are
  updated.
- Beans gains milestone `02 Backlog` with the deferred work.
- No changes to the plugin runtime, the OpenSpec data format or the nix
  outputs.
