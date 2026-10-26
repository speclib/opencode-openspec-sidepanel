---
# opencode-openspec-sidepanel-18du
title: Make the sidebar refresh interval configurable
status: todo
type: feature
priority: deferred
created_at: 2026-10-26T18:07:30Z
updated_at: 2026-10-26T18:07:30Z
parent: opencode-openspec-sidepanel-dczo
---

The sidebar refreshes after each assistant turn and every 30 seconds. Later work should expose the fallback interval as configuration, with a sensible default and a way to disable the timer.

Current location: the interval in `.opencode/plugins/openspec-stats/tui.tsx`.

OpenSpec capability: to be named when this is planned.
