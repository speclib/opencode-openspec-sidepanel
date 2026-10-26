---
# opencode-openspec-sidepanel-b3vc
title: Robustness, packaging and docs
status: todo
type: epic
priority: normal
created_at: 2026-10-26T17:05:01Z
updated_at: 2026-10-26T17:05:14Z
parent: opencode-openspec-sidepanel-u505
blocked_by:
    - opencode-openspec-sidepanel-g73f
---

Goal: make the plugin safe to install, easy to read and ready to publish as the alpha base.

Deliverables:
- Timeout, abort and buffer handling for every openspec invocation, with tests for hanging and failing commands.
- A session panel bound to <leader>o that shows every active change with its task progress and the spec and archive totals.
- nix build output containing the complete plugin directory, verified by a test.
- README covering prerequisites, install, development, testing, build and the exact sidebar content.
- A final pass over AGENTS.md, BRIEFING.md and openspec/config.yaml so they match what shipped.
- Deferred work recorded as new beans under a backlog milestone instead of being dropped silently.

Definition of done:
- nix build succeeds and the output loads as a plugin.
- The session panel opens from the keybind.
- README commands work from a clean checkout.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: robustness-packaging-docs.
