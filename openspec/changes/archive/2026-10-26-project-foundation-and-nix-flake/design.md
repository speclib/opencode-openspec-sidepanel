## Context

The repository is a fresh OpenCode v2 plugin project. Only documentation,
beans tickets and the OpenSpec workspace exist. The development host runs
Node 24, nix 2.34 and OpenCode 2.0.29. The proven sibling project
`/home/pim/gh.mipmip/opencode-beans` uses the same flake shape and has a
working package and test check, so its structure is the baseline.

See `proposal.md` for the motivation and `specs/project-foundation/spec.md`
for the required behavior.

## Goals / Non-Goals

**Goals:**

- A flake that evaluates for the four supported systems and builds the plugin
  on the current system.
- A development shell that contains every tool the later epics need,
  including python3 for the pseudo terminal in the e2e harness.
- A check that runs the pure test suite without network access or installed
  npm dependencies.
- A package output that a user can copy into a project.

**Non-Goals:**

- Implementing the sidebar, the data source or the e2e suite in this change.
- Building or testing on macOS from this Linux host.
- A binary distribution or a registry publication.

## Decisions

### Plain flake with an explicit system list

The flake lists the four systems in a `systems` attribute and uses
`nixpkgs.lib.genAttrs` to build every output. This avoids flake-utils and keeps
the supported set visible in one place. A helper `each` applies a function to
`nixpkgs.legacyPackages.${system}` for each system.

Alternative: `flake-utils.lib.eachDefaultSystem`. Rejected because the project
standard forbids the dependency and because the explicit list documents the
supported set.

### Source filtering in the flake

`cleanSourceWith` removes `.jj`, `.git`, `node_modules` and `result` before the
source reaches the package and check derivations. This keeps the store path
stable and prevents the package from shipping local build state.

### Package copies the plugin directory

`nix/package.nix` uses `stdenv.mkDerivation` with `dontBuild = true` and copies
`.opencode/plugins/openspec-stats` into `$out/plugins/`. The plugin is source
that OpenCode loads, not a compiled artifact, so there is nothing to build. The
output layout matches the documented install path.

### Check runs the tests without npm dependencies

`nix/checks.nix` runs `node --test "tests/**/*.test.ts"` with Node 24 in the
sandbox. Pure modules must not import `@opencode/plugin` or OpenTUI, so the
check needs no `node_modules`. Integration tests skip cleanly when the
`openspec` binary is absent from the sandbox.

Alternative: a `buildNpmPackage` derivation with a dependency hash. Rejected
for now because it adds a fixed-output derivation and network access to the
check, while the pure tests do not need it.

### Placeholder entrypoint

This change adds minimal `index.ts` and `tui.tsx` files so `nix build` and
`tsc` are green before the sidebar exists. The next epic replaces the
placeholder TUI with the real sidebar registration. The placeholder must load
without errors and must not register a visible section yet.

### TypeScript settings

`tsconfig.json` follows the sibling project: ES2023, ESNext modules, bundler
resolution, `jsx: preserve` with `@opentui/solid`, strict mode and
`noEmit`. Tests and e2e files are included so `tsc --noEmit` covers them.
Type stripping means the tests run directly with Node and no build step.

### Dependency versions

`package.json` pins `@opencode/plugin` to exactly 2.0.31, the version proven
against OpenCode 2.0.29 in the sibling project. The 2.1.x line requires
OpenCode 2.1 and a newer OpenTUI, so a caret range would pull in an incompatible
runtime. OpenTUI and Solid are pinned to the proven versions as well. The lock
file records the full tree.

## Risks / Trade-offs

- [The placeholder TUI could be mistaken for the finished plugin] -> The next
  epic replaces it and the e2e suite proves the real section renders.
- [macOS outputs cannot be built on this Linux host] -> The flake evaluates all
  four systems and the current system is fully checked; macOS builds run on a
  macOS host later.
- [The first `nix flake lock` needs network access] -> The lock is committed and
  all later checks run offline.
- [The check may drift from the npm suite] -> The same `node --test` command is
  used in both, and the flake invariant test guards the flake shape.
