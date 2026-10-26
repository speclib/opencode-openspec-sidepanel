## 1. Parsing and aggregation

- [x] 1.1 Add `openspec.ts` with `parseChanges`, `parseSpecs` and field validation for the two CLI payloads; verify unit tests cover valid, null-root and invalid payloads.
- [x] 1.2 Add `aggregate` to sum status counts, task progress, spec count and requirement count; verify a unit test covers multiple statuses and multiple specs.

## 2. Loader and archive count

- [x] 2.1 Run `openspec list --json` and `openspec list --specs --json` through an injectable exec with a 5 second timeout, an 8 MB buffer and abort support; verify a unit test checks the command, arguments and options.
- [x] 2.2 Stop on a null root and reject a root that changes between the two queries; verify unit tests cover both cases.
- [x] 2.3 Add `countArchived` reading `<root>/openspec/changes/archive` and treating a missing directory as zero; verify unit and integration tests cover the count.
- [x] 2.4 Map spawn failures, non-zero exits, timeouts, invalid JSON and invalid fields to `OpenspecUnavailableError`; verify unit tests cover each path.

## 3. Refresh

- [x] 3.1 Add `refresh.ts` with abort-on-new-refresh, stale-result rejection and dispose; verify unit tests cover overlap, disposal and errors.

## 4. Cache

- [x] 4.1 Add `cache.ts` with `decodeStats`, `toSnapshot`, `CACHE_KEY` and a read/write port; verify unit tests cover valid, corrupt and missing entries.
- [x] 4.2 Bind the cache to `context.storage.store` per project directory; verify the wiring test finds the storage key and the seed call.

## 5. TUI wiring

- [x] 5.1 Replace the empty fixture with `loadStats`, the cache seed and the refresher; verify the wiring test finds the loader and cache.
- [x] 5.2 Refresh on `session.execution.succeeded` and on a 30 second timer, and dispose both; verify the wiring test finds the event and the interval.
- [x] 5.3 Show a muted `unavailable` line on any failure and clear it on success; verify a unit test covers the error mapping.

## 6. Tests and verification

- [x] 6.1 Add unit tests for parsing, aggregation, the loader and the archive count; verify they pass without a process.
- [x] 6.2 Add unit tests for refresh and cache; verify they pass without timers left running.
- [x] 6.3 Add an integration test that runs the real CLI against a temporary project; verify it reads changes, tasks, specs, requirements and archived changes.
- [x] 6.4 Run `npm test`, `npm run typecheck`, `nix flake check` and `nix build`; verify all pass.

## 7. Archive

- [ ] 7.1 Validate the change, archive it and sync the specs.
- [ ] 7.2 Update the epic bean with a summary and commit as Pim Snel.
