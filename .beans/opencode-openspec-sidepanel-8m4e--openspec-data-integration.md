---
# opencode-openspec-sidepanel-8m4e
title: OpenSpec data integration
status: todo
type: epic
priority: high
created_at: 2026-10-26T17:04:51Z
updated_at: 2026-10-26T17:05:14Z
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
