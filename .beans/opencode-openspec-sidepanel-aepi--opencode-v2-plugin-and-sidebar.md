---
# opencode-openspec-sidepanel-aepi
title: OpenCode v2 plugin and sidebar
status: todo
type: epic
priority: high
created_at: 2026-10-26T17:04:45Z
updated_at: 2026-10-26T17:05:14Z
parent: opencode-openspec-sidepanel-u505
blocked_by:
    - opencode-openspec-sidepanel-6hka
---

Goal: render a stable, theme-aware OPENSPEC section in the OpenCode sidebar with fixture data and no data source yet.

Deliverables:
- .opencode/plugins/openspec-stats/index.ts as the server entrypoint.
- .opencode/plugins/openspec-stats/tui.tsx registering the sidebar.content slot with the OPENSPEC header, total line and body rows.
- layout.ts with pure functions for status rows, summary rows, column widths, bars, and change-name truncation for the panel.
- A session panel slot that renders the full per-change breakdown.
- Theme tokens from context.theme, never hard-coded colors.
- Registration and layout unit tests, including zero data and long names.

Definition of done:
- OPENSPEC appears in the sidebar of a fixture project.
- Layout functions are unit tested.
- The section shows a muted placeholder before the first load settles.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: plugin-sidebar.
