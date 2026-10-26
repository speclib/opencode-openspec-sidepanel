## Context

The runtime already bounds every `openspec` call with a 5 second timeout, an
8 MB buffer and an abort signal, and the session panel already exists. This
change adds the proof and the packaging story around those behaviors. It does
not change the data format, the sidebar layout or the refresh wiring.

## Goals

- Prove that a hanging, overflowing, aborted or unstartable command degrades to
  `unavailable` without blocking the TUI.
- Prove the packaged artifact contains the complete plugin.
- Prove the panel lists every change and the totals.
- Make the README and the operating documents describe the shipped PoC.

## Non-goals

- New runtime behavior, new sidebar rows or new data sources.
- Publishing to npm.
- Running e2e on operating systems other than the development host.

## Timeout and buffer proof

`loadStats` accepts `timeoutMs` and `maxBuffer` and forwards them to the
injected `exec`. The production exec is `runOpenspec`, which passes both to
`execFile` together with the abort signal.

Three tests cover the edges:

1. A real hanging command in `tests/integration/openspec-timeout.test.ts`. The
   test creates a temporary directory with an executable `openspec` script that
   runs `exec sleep 10`. It prepends that directory to `PATH`, calls `loadStats`
   with `timeoutMs: 100`, and expects `OpenspecUnavailableError`. `PATH` is
   restored in a `finally` block. The script uses `exec` so the timeout kills
   the sleeping process rather than leaving an orphan.
2. A unit test in `tests/unit/openspec-loader.test.ts` where the fake exec
   rejects with `code: "ERR_CHILD_PROCESS_STDIO_MAXBUFFER"` and the loader maps
   it to `OpenspecUnavailableError`.
3. A unit test where the fake exec rejects after the signal aborts, proving the
   loader forwards the abort signal and does not convert a cancelled load into
   a value.

The existing `tests/unit/refresh.test.ts` already proves that a newer refresh
aborts the older one and that a disposed refresher drops late results.

## Panel proof

`layoutBreakdown` already renders changes from `Stats.changes`. The tests add
explicit assertions that:

- All three fixture changes appear, including the complete one.
- Each row carries `completed/total` and a completion bar.
- The spec, requirement and archived totals appear.

`tests/unit/setup.test.ts` already asserts the command id, the `<leader>o` bind
and that `run` opens `PANEL_NAME`. No runtime change is needed.

## Packaging proof

Two layers:

1. `tests/unit/packaging.test.ts` reads `nix/package.nix`, `flake.nix` and
   `package.json` and asserts that the derivation copies
   `.opencode/plugins/openspec-stats`, that `packages.default` calls the
   derivation, and that the npm `files` and `exports` point at the plugin.
2. `scripts/verify-package.mjs` runs `nix build`, then checks that
   `result/plugins/openspec-stats/` contains all seven runtime files. It is
   exposed as `npm run test:package`. It is not part of `nix flake check`
   because the sandbox has no nix binary.

## Documentation proof

`tests/unit/docs.test.ts` reads `README.md` and asserts the required sections
and commands: prerequisites, install, development, test, e2e, typecheck, nix
flake check, nix build, the `OPENSPEC` header, the `active changes` total, the
four summary labels and the `<leader>o` panel bind. This prevents the README
from drifting back to the pre-PoC description.

## Deferred work

Deferred items go to milestone `02 Backlog` as beans:

- Support OpenSpec stores and non-local roots.
- Make the refresh interval configurable.
- Add a per-change detail view with requirement-level progress.

These are outside the PoC acceptance criteria. Milestone `02` stays `todo` and
is not started by this change.

## Risks

- A real timeout test can be flaky on a loaded host. The script sleeps 10
  seconds and the timeout is 100 ms, so the margin is large. The test restores
  `PATH` and removes its temporary directory even on failure.
- `nix build` can take minutes on a cold store. It is a separate command, not
  part of the unit suite.
- Documentation can drift again. The docs test pins the exact headings and
  commands that matter.
