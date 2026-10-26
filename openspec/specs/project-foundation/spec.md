# project-foundation Specification

## Purpose
Provide a reproducible build, development shell, packaging output and offline
test check for the plugin, so every later change can be verified on the
supported systems.

## Requirements

### Requirement: Supported systems

The flake SHALL define its development shell, package, check and formatter
outputs for `x86_64-linux`, `aarch64-linux`, `x86_64-darwin` and
`aarch64-darwin`.

#### Scenario: All four systems are exposed

- **WHEN** the flake outputs are evaluated
- **THEN** each of the four supported systems has `devShells.default`,
  `packages.default`, `checks.default` and `formatter`

#### Scenario: An unsupported system is requested

- **WHEN** a caller requests an output for a system outside the supported set
- **THEN** the flake does not provide that output

### Requirement: Plain nix inputs

The flake SHALL depend on nixpkgs only and SHALL NOT depend on flake-utils or
another system abstraction library.

#### Scenario: Flake inputs are inspected

- **WHEN** the flake metadata is read
- **THEN** nixpkgs is the only input and no flake-utils input exists

### Requirement: Development shell

The development shell SHALL provide Node 24, python3, jujutsu, git and nixfmt.

#### Scenario: Entering the development shell

- **WHEN** a developer runs `nix develop` in the repository
- **THEN** `node --version` reports version 24
- **AND** `python3`, `jj`, `git` and `nixfmt` are on `PATH`

### Requirement: Package output

The package output SHALL contain the complete plugin directory at
`plugins/openspec-stats/`, including the server entrypoint, the TUI entrypoint
and any supporting modules.

#### Scenario: Building the package

- **WHEN** a developer runs `nix build`
- **THEN** `result/plugins/openspec-stats/` exists
- **AND** it contains `index.ts` and `tui.tsx`

### Requirement: Offline check

The check output SHALL run the unit and integration suite in a pure sandbox
without network access and SHALL fail when any test fails.

#### Scenario: Running the check

- **WHEN** a developer runs `nix flake check` on a supported system
- **THEN** the unit and integration tests run
- **AND** the check fails if a test fails
- **AND** the check does not need network access

### Requirement: Test and type check commands

The project SHALL expose commands for the unit and integration tests, the end
to end tests and the TypeScript type check, using the built in Node test runner
and TypeScript.

#### Scenario: Running the local commands

- **WHEN** a developer runs `npm test`, `npm run test:e2e` or
  `npm run typecheck`
- **THEN** each command runs the corresponding suite or check
- **AND** a failing suite or type error exits non-zero
