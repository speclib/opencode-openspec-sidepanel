---
# opencode-openspec-sidepanel-8m4e
title: OpenSpec data integration
status: completed
type: epic
priority: high
created_at: 2026-10-26T17:04:51Z
updated_at: 2026-10-26T17:58:33Z
parent: opencode-openspec-sidepanel-u505
blocked_by:
    - opencode-openspec-sidepanel-aepi
---

Goal: load real OpenSpec statistics from the openspec CLI and keep them current.

Deliverables:
- openspec.ts shelling out with node:child_process to `openspec list --json` and `openspec list --specs --json`, with a 5 second timeout, an 8 MB buffer and abort support.
- Parse changes (name, status, completedTasks, totalTasks, lastModified) and specs (id, requirementCount).
- Resolve root.path and treat a null root as unavailable.
- Count archived changes under <root.path>/openspec/changes/archive using the filesystem.
- Aggregate active changes, per-status counts, task progress, spec count, requirement total and archived count.
- Refresh on session.execution.succeeded and on a 30 second fallback timer, aborting overlapping loads.
- Cache the last stats per project under openspec.stats.cache and paint them on startup.
- Degrade to a muted "unavailable" line when the root is missing, openspec exits non-zero, times out or returns invalid JSON.
- Unit tests for parsing, aggregation, truncation and failure mapping; integration tests against a temporary project made with openspec init and real changes.

Definition of done:
- Rendered counts match openspec list --json and openspec list --specs --json.
- The section refreshes after a real assistant turn.
- The plugin never crashes the TUI when openspec is missing or fails.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: openspec-stats.

## Summary of Changes

Implemented the real OpenSpec data path for the sidebar.

- Added `.opencode/plugins/openspec-stats/openspec.ts`: invokes `openspec list --json` and `openspec list --specs --json` with a 5 second timeout, an 8 MB buffer and abort support; validates every field; resolves `root.path`; rejects a null or mismatched root; counts archive directories; aggregates statuses, tasks, specs and requirements; maps every failure to `OpenspecUnavailableError`.
- Added `refresh.ts` with abort-on-new-refresh, stale-result rejection and disposal.
- Added `cache.ts` with per-project storage under `openspec.stats.cache`, validated decoding and snapshot copies.
- Wired `tui.tsx` to the loader, the cache seed, `session.execution.succeeded`, a 30 second timer and the muted `unavailable` fallback.
- Added unit tests for parsing, aggregation, loading, failure mapping, cache and refresh, plus a real-CLI integration test against a temporary OpenSpec project.
- `npm test`: 44 tests, 44 pass, 0 fail, 0 skipped. `npm run typecheck` clean. `nix flake check` passed. `nix build` produced all seven plugin modules.
- OpenSpec change archived as `openspec/changes/archive/2026-10-26-openspec-data-integration`; `openspec-stats` main spec has 6 requirements.
