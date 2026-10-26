---
# opencode-openspec-sidepanel-g73f
title: Testing and e2e proof
status: todo
type: epic
priority: high
created_at: 2026-10-26T17:04:56Z
updated_at: 2026-10-26T17:05:14Z
parent: opencode-openspec-sidepanel-u505
blocked_by:
    - opencode-openspec-sidepanel-8m4e
---

Goal: prove the PoC behaves as specified in the real OpenCode process.

Deliverables:
- Unit suite in tests/unit for every pure function and every acceptance criterion that can be checked in isolation.
- Integration suite in tests/integration that creates a throwaway project with openspec init and real changes, then asserts the stats the plugin computes.
- E2E harness in e2e/ adapted from the proven harness in /home/pim/gh.mipmip/opencode-beans/e2e: temporary project, isolated HOME and XDG directories, pty capture, session import, a local mock provider for a live turn, and screen reconstruction.
- E2E cases: the OPENSPEC section renders with counts matching the CLI; it refreshes after a real assistant turn; it shows the muted unavailable line when the OpenSpec root is missing or the CLI is broken; the TUI stays alive in every case.
- e2e/README.md explaining prerequisites, what is proven, and why the suite is separate from nix flake check.
- The suite runs on the development host and is not skipped.

Definition of done:
- npm test and npm run test:e2e are green on this host.
- Every acceptance criterion in AGENTS.md section 1 has a test that fails if it regresses.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: testing.
