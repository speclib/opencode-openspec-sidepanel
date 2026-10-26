---
# opencode-openspec-sidepanel-g73f
title: Testing and e2e proof
status: completed
type: epic
priority: high
created_at: 2026-10-26T17:04:56Z
updated_at: 2026-10-26T18:03:18Z
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

## Summary of Changes

Added the end to end proof and completed the acceptance coverage.

- Added `e2e/helpers/`: isolated HOME and XDG directories, temporary OpenSpec fixtures with three real changes, two specs and nine archive directories, a canned session import, a local OpenAI compatible mock provider, a Python pseudo terminal and an ANSI screen reconstructor scoped to the `OPENSPEC` sidebar region.
- Added `e2e/openspec-sidebar.test.ts`: asserts the header, `<n> active changes`, every status count with its bar, `tasks 3/7`, `specs 2`, `requirements 5`, `archived 9`, alignment and a blank line after the total.
- Added `e2e/openspec-live-refresh.test.ts`: holds the assistant response, creates a change with an unchecked task during the turn, releases the response and asserts `4 active changes`, `in-progress 3` and `tasks 3/8`.
- Added `e2e/openspec-degraded.test.ts`: proves the `unavailable` line and a live TUI when the project has no OpenSpec root.
- Added `e2e/README.md` and unit tests for the screen helpers and the prerequisite reasons.
- `npm test`: 55 tests, 55 pass, 0 fail, 0 skipped. `npm run test:e2e`: 3 tests, 3 pass, 0 fail, 0 skipped. `npm run typecheck` clean. `nix flake check` passed. `nix build` produced all seven plugin modules.
- OpenSpec change archived as `openspec/changes/archive/2026-10-26-testing-and-e2e-proof`; `testing` main spec has 6 requirements.
