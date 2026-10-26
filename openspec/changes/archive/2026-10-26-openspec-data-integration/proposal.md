## Why

The sidebar renders a layout, but it still shows an empty fixture. The PoC is
only useful when it reports the real OpenSpec state for the current project and
keeps that state current without crashing when OpenSpec is missing or broken.

Epic: `opencode-openspec-sidepanel-8m4e`.

## What Changes

- Add `openspec.ts` to invoke `openspec list --json` and
  `openspec list --specs --json` with a 5 second timeout, an 8 MB buffer and
  abort support.
- Parse and validate the CLI payloads, resolve `root.path`, and treat a null
  root as unavailable.
- Count archived changes from `<root>/openspec/changes/archive`.
- Aggregate active changes, per-status counts, task progress, specs,
  requirements and archived changes into the existing `Stats` model.
- Add `refresh.ts` to abort overlapping loads and only settle the newest one.
- Add `cache.ts` to persist the last stats per project under
  `openspec.stats.cache` and paint them on startup.
- Wire the TUI to the loader, the cache, the `session.execution.succeeded`
  event and a 30 second fallback timer.
- Map every failure to the muted `unavailable` line.
- Add unit tests for parsing, aggregation, loading, failure mapping, refresh and
  cache, plus an integration test against a real temporary OpenSpec project.

## Capabilities

### New Capabilities

- `openspec-stats`: loading, aggregating, caching and refreshing OpenSpec
  statistics for the current project.

### Modified Capabilities

None.

## Impact

- New `.opencode/plugins/openspec-stats/openspec.ts`, `refresh.ts` and `cache.ts`.
- `tui.tsx` now performs real loads and refreshes.
- New unit and integration tests.
- No new runtime dependency.

## Acceptance Criteria

- The rendered counts match the `openspec` CLI and the archive directory.
- The section refreshes after an assistant turn and on a 30 second timer.
- A missing root, missing binary, non-zero exit, timeout or invalid JSON shows
  `unavailable` and leaves the TUI running.
- A project seen before paints its cached stats before the first load settles.
- Overlapping refreshes do not apply stale results.

## Non-Goals

- End to end tests in a pseudo terminal.
- Packaging and README updates beyond what the data layer needs.
