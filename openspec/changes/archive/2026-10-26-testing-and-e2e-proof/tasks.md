## 1. Harness helpers

- [x] 1.1 Add `e2e/helpers/env.ts` with repository root detection, prerequisite checks and isolated HOME/XDG directories; verify a unit test covers the skip reason.
- [x] 1.2 Add `e2e/helpers/pty.ts` and `e2e/helpers/pty.py` to run a command in a fixed size pseudo terminal; verify the helper runs `opencode --version` in a pty.
- [x] 1.3 Add `e2e/helpers/screen.ts` to reconstruct the screen and locate the `OPENSPEC` sidebar region; verify unit tests cover CSI moves, clears, alignment and region lookup.

## 2. Fixture project

- [x] 2.1 Add `e2e/helpers/project.ts` to create a temporary project with `openspec init`, three changes, two specs and nine archive directories; verify the fixture exposes the expected counts.
- [x] 2.2 Copy the plugin into the fixture and symlink `node_modules`; verify OpenCode discovers it without an `opencode.jsonc` plugin entry.

## 3. Session and provider

- [x] 3.1 Add `e2e/helpers/session.ts` to import a canned session; verify the session opens in the TUI.
- [x] 3.2 Add `e2e/helpers/mock-provider.ts` for the live turn; verify it holds the response, detects the agent request and needs no network.

## 4. Sidebar render proof

- [x] 4.1 Add `e2e/openspec-sidebar.test.ts` asserting the header, total, status counts, task progress, spec count, requirement count and archived count from the fixture; verify the case passes against the real OpenCode process.

## 5. Live refresh proof

- [x] 5.1 Add `e2e/openspec-live-refresh.test.ts` that creates a change while the provider holds the turn; verify the rendered counts change after the turn succeeds.

## 6. Degraded proof

- [x] 6.1 Add `e2e/openspec-degraded.test.ts` asserting `unavailable` and no total when the project has no OpenSpec root; verify the TUI stays alive.

## 7. Coverage and verification

- [x] 7.1 Add any missing unit tests for acceptance criteria not yet pinned; verify each criterion names its test.
- [x] 7.2 Run `npm test`, `npm run test:e2e`, `npm run typecheck`, `nix flake check` and `nix build`; verify all pass and the e2e cases are not skipped.
- [x] 7.3 Document the harness, prerequisites and what is proven in `e2e/README.md`.

## 8. Archive

- [ ] 8.1 Validate the change, archive it and sync the specs.
- [ ] 8.2 Update the epic bean with a summary and commit as Pim Snel.
