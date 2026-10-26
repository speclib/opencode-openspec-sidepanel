---
# opencode-openspec-sidepanel-u505
title: '01 PoC: OpenSpec stats sidebar plugin'
status: completed
type: milestone
priority: high
created_at: 2026-10-26T17:04:35Z
updated_at: 2026-10-26T18:08:51Z
---

Milestone 01 tracks the proof of concept for the OpenSpec stats sidebar plugin for OpenCode v2. It proves the plugin works end to end with nix, beans and OpenSpec from the start, and becomes the alpha base for later development.

Definition of done:
- The OPENSPEC section renders in the OpenCode sidebar with stats that match the openspec CLI.
- It refreshes after each assistant turn and degrades gracefully when openspec or the OpenSpec root is missing.
- nix flake check is green for every supported system.
- Unit, integration and e2e suites prove the acceptance criteria; the e2e suite runs against the real OpenCode process.
- Every epic is archived in OpenSpec and committed with jj as Pim Snel.

Product goal: BRIEFING.md. Operating manual: AGENTS.md.


## Summary of Changes

Milestone 01 delivered the OpenSpec stats sidebar plugin for OpenCode v2.

- Foundation: plain nix flake with four explicit systems, dev shell, package, checks, package.json and tsconfig.
- Plugin: OPENSPEC sidebar section, status bars, task and spec summaries and the session panel bound to `<leader>o`.
- Data: real `openspec list --json` and `openspec list --specs --json` reads, archive counting, per-project cache, turn refresh and a 30 second fallback.
- Robustness: 5 second timeout, 8 MB buffer, abort handling and a muted `unavailable` fallback.
- Testing: 64 unit and integration tests, 3 e2e tests against the real OpenCode process, and a packaging check.
- OpenSpec main specs: project-foundation 6, plugin-sidebar 6, openspec-stats 6, testing 6, robustness-packaging-docs 4.
- Deferred work is recorded in milestone `02 Backlog`.
