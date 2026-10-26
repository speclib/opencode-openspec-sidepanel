---
# opencode-openspec-sidepanel-65zk
title: Support OpenSpec stores and non-local roots
status: todo
type: feature
priority: deferred
created_at: 2026-10-26T18:07:30Z
updated_at: 2026-10-26T18:07:30Z
parent: opencode-openspec-sidepanel-dczo
---

The PoC resolves the nearest OpenSpec root and treats a null root as unavailable. Later work should use the store-aware planning home from the OpenSpec CLI so registered stores and non-local roots are supported.

Current constraint: `openspec list --json` returns `root.path` and the plugin requires both list queries to agree on that path.

OpenSpec capability: to be named when this is planned.
