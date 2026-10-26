---
# opencode-openspec-sidepanel-b3vc
title: Robustness, packaging and docs
status: completed
type: epic
priority: normal
created_at: 2026-10-26T17:05:01Z
updated_at: 2026-10-26T18:08:46Z
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


## Summary of Changes

- Added a real hanging-command timeout test, buffer overflow mapping and abort signal coverage in the loader tests.
- Strengthened the session panel layout test to cover every active change and the spec, requirement and archive totals.
- Added packaging tests for the nix derivation, the flake package output and the npm files/exports.
- Added `scripts/verify-package.mjs` and `npm run test:package`, which builds with nix and checks all seven runtime files.
- Rewrote the README for the completed PoC with the exact sidebar and panel content, install steps, development, testing and packaging.
- Added `tests/unit/docs.test.ts` to pin the README contract.
- Updated AGENTS.md, BRIEFING.md and openspec/config.yaml for the shipped behavior.
- Created milestone `02 Backlog` with three deferred beans: OpenSpec stores, a configurable refresh interval and a per-change detail view.
- Verification: 64 unit and integration tests, 3 e2e tests, typecheck clean, `nix flake check` passed, `nix build` assembled seven files, `npm run test:package` verified them.
- Archived as `openspec/changes/archive/2026-10-26-robustness-packaging-and-docs`.
