# Tasks

## 1. Robustness tests

- [x] 1.1 Add `tests/integration/openspec-timeout.test.ts` with a real `openspec` shim that sleeps, a 100 ms timeout and an `unavailable` assertion.
- [x] 1.2 Add a loader test for a `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` failure.
- [x] 1.3 Add a loader test for a signal abort.
- [x] 1.4 Run `npm test` and confirm the new cases pass.

## 2. Panel coverage

- [x] 2.1 Strengthen the breakdown test to assert every change, including the complete one, and the spec, requirement and archive totals.
- [x] 2.2 Confirm the panel command test covers the id, the `<leader>o` bind and opening the panel.

## 3. Packaging

- [x] 3.1 Add `tests/unit/packaging.test.ts` for the derivation, the flake output, the npm `files` and the exports.
- [x] 3.2 Add `scripts/verify-package.mjs` to build with nix and assert the seven runtime files.
- [x] 3.3 Add the `test:package` script to `package.json`.
- [x] 3.4 Run `npm run test:package` and confirm the output contains all seven files.

## 4. Documentation

- [x] 4.1 Rewrite `README.md` for the completed PoC: prerequisites, install, development, tests, packaging, exact sidebar content and the panel.
- [x] 4.2 Add `tests/unit/docs.test.ts` pinning the sections, commands and rendered labels.
- [x] 4.3 Update `AGENTS.md`, `BRIEFING.md` and `openspec/config.yaml` where they describe the pre-PoC state.

## 5. Deferred work

- [x] 5.1 Create milestone `02 Backlog` as `todo`.
- [x] 5.2 Create beans for OpenSpec stores, a configurable refresh interval and a per-change detail view under the backlog milestone.

## 6. Verification

- [x] 6.1 Run `npm test`, `npm run typecheck`, `npm run test:e2e` and `nix flake check`.
- [x] 6.2 Run `npm run test:package` and `nix build`.
- [x] 6.3 Run `openspec validate robustness-packaging-and-docs --strict`.

## 7. Archive and handoff

- [ ] 7.1 Archive the change and sync the specs.
- [ ] 7.2 Add the epic summary, mark the epic and milestone complete and commit as Pim Snel.
