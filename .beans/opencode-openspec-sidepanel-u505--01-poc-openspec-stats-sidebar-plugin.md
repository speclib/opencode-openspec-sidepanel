---
# opencode-openspec-sidepanel-u505
title: '01 PoC: OpenSpec stats sidebar plugin'
status: in-progress
type: milestone
priority: high
created_at: 2026-10-26T17:04:35Z
updated_at: 2026-10-26T17:44:26Z
---

Milestone 01 tracks the proof of concept for the OpenSpec stats sidebar plugin for OpenCode v2. It proves the plugin works end to end with nix, beans and OpenSpec from the start, and becomes the alpha base for later development.

Definition of done:
- The OPENSPEC section renders in the OpenCode sidebar with stats that match the openspec CLI.
- It refreshes after each assistant turn and degrades gracefully when openspec or the OpenSpec root is missing.
- nix flake check is green for every supported system.
- Unit, integration and e2e suites prove the acceptance criteria; the e2e suite runs against the real OpenCode process.
- Every epic is archived in OpenSpec and committed with jj as Pim Snel.

Product goal: BRIEFING.md. Operating manual: AGENTS.md.
