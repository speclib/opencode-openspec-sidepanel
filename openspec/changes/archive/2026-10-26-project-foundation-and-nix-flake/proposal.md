## Why

The plugin needs a reproducible build, development shell and test runner before
any behavior is written. Without this foundation, the later epics cannot prove
that the plugin builds for the supported systems, that tests run offline, or
that the packaged output is complete.

Epic: `opencode-openspec-sidepanel-6hka`.

## What Changes

- Add a plain nix flake that lists `x86_64-linux`, `aarch64-linux`,
  `x86_64-darwin` and `aarch64-darwin` explicitly and merges them with
  `nixpkgs.lib.genAttrs`. nixpkgs is the only input. flake-utils is forbidden.
- Add `nix/package.nix`, `nix/checks.nix` and `nix/devshell.nix` as
  single-argument modules for `callPackage`.
- Add a development shell with Node 24, python3, jujutsu, git and nixfmt.
- Add a package output that assembles the plugin directory.
- Add a check output that runs the unit and integration suite in a pure
  sandbox, without network access.
- Add `package.json` and `tsconfig.json` wired to `node:test` and `tsc`.
- Add a minimal placeholder entrypoint under
  `.opencode/plugins/openspec-stats/` so the package and the type check are
  green before the real plugin exists.
- Add a unit test that guards the plain-flake invariants.
- Extend `.gitignore` for build output, dependencies and logs.

## Capabilities

### New Capabilities

- `project-foundation`: reproducible build, development shell, test checks and
  package layout for the plugin.

### Modified Capabilities

None.

## Impact

- New root files: `flake.nix`, `flake.lock`, `package.json`, `tsconfig.json`.
- New nix modules under `nix/`.
- New placeholder plugin files under `.opencode/plugins/openspec-stats/`.
- New unit test under `tests/unit/`.
- No runtime sidebar behavior is added in this change.

## Acceptance Criteria

- `nix develop` enters a shell with Node 24, python3, jujutsu, git and nixfmt.
- `nix flake check` passes on the current system and runs the unit suite in a
  pure sandbox.
- `nix build` produces `result/plugins/openspec-stats/`.
- `npm test` and `npm run typecheck` pass after `npm install`.
- The flake lists exactly the four supported systems and has no flake-utils
  input.

## Non-Goals

- The sidebar, the OpenSpec data source and the e2e harness.
- Publishing to a registry.
- Supporting systems outside the four listed.
