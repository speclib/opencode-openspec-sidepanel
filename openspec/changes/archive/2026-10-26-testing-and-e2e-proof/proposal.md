## Why

The PoC is only proven when the plugin works inside the real OpenCode process.
The unit and integration suites cover the data layer and the layout, but they do
not prove that the sidebar renders, that it refreshes after a turn, or that it
degrades without taking the TUI down.

Epic: `opencode-openspec-sidepanel-g73f`.

## What Changes

- Add an end to end harness under `e2e/` with an isolated temporary project,
  isolated HOME and XDG directories, a pseudo terminal, a canned session and a
  local mock provider.
- Build the fixture with `openspec init --tools none --no-animation` and real
  changes, specs and archive directories.
- Reconstruct the final terminal screen and locate the `OPENSPEC` sidebar
  region.
- Add three cases: the sidebar renders counts that match the CLI, it refreshes
  after a real assistant turn, and it shows `unavailable` when the project has no
  OpenSpec root.
- Document the harness in `e2e/README.md`.
- Fill the remaining unit coverage for acceptance criteria that are not yet
  pinned.

## Capabilities

### New Capabilities

- `testing`: end to end proof of the sidebar in the real OpenCode process, plus
  the coverage contract for the acceptance criteria.

### Modified Capabilities

None.

## Impact

- New `e2e/` tests and helpers.
- New `e2e/README.md`.
- Possibly a few extra unit tests.
- `npm test` and `npm run test:e2e` must be green on this host.
- No runtime dependency and no production code change unless a test finds a bug.

## Acceptance Criteria

- The `OPENSPEC` section renders with the total, status counts, task progress,
  spec count, requirement count and archived count that the fixture contains.
- The section updates after a real assistant turn that runs while a change is
  created.
- A project without an OpenSpec root shows the muted `unavailable` line and the
  TUI stays alive.
- The e2e suite runs on this host and is not skipped.
- `nix flake check` remains green.

## Non-Goals

- Packaging and README work beyond `e2e/README.md`.
- Testing multiple operating systems in the e2e suite.
