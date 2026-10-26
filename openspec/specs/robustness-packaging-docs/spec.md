# robustness-packaging-docs Specification

## Purpose
Defines the operational contract of the OpenSpec sidebar plugin: bounded reads
of the OpenSpec CLI, the session panel breakdown, the packaged plugin artifact
and the operator documentation.

## Requirements

### Requirement: Bounded OpenSpec command execution

The plugin SHALL read OpenSpec data with a timeout, a bounded output buffer and
an abort signal. A command that hangs, overflows the buffer, is aborted or fails
to start SHALL surface as unavailable instead of blocking or crashing the TUI.

#### Scenario: Command exceeds the timeout

- **WHEN** the `openspec` command does not finish within the configured timeout
- **THEN** the load fails as unavailable and the sidebar shows the muted
  `unavailable` line

#### Scenario: Output exceeds the buffer

- **WHEN** the `openspec` command writes more than the configured buffer
- **THEN** the load fails as unavailable and the TUI keeps running

#### Scenario: Newer load supersedes a running load

- **WHEN** a refresh starts while an earlier refresh is still running
- **THEN** the earlier load is aborted and its result is discarded, and only the
  newer load updates the sidebar

#### Scenario: Command cannot start

- **WHEN** the `openspec` binary is missing or the spawn fails
- **THEN** the load fails as unavailable and the sidebar shows the muted
  `unavailable` line

### Requirement: Session panel breakdown

The plugin SHALL provide a session panel, bound to `<leader>o`, that lists every
active change with its completed and total task counts and a completion bar,
sorted by last modified descending. The panel SHALL also show the spec and
archived totals.

#### Scenario: Panel opens from the keybind

- **WHEN** the user presses `<leader>o`
- **THEN** the OpenSpec breakdown panel opens

#### Scenario: Panel lists every active change

- **WHEN** the project has three active changes
- **THEN** the panel lists all three with `completed/total` and a bar for each

#### Scenario: Panel shows the totals

- **WHEN** the project has specs, requirements and archived changes
- **THEN** the panel shows the spec, requirement and archived totals

#### Scenario: Panel degrades gracefully

- **WHEN** OpenSpec is unavailable
- **THEN** the panel shows the muted `unavailable` line and does not crash

### Requirement: Packaged plugin artifact

The nix package SHALL contain the complete plugin directory, including both
entrypoints and every runtime module, at `plugins/openspec-stats/` in the build
output.

#### Scenario: Build output contains every plugin file

- **WHEN** `nix build` succeeds
- **THEN** `result/plugins/openspec-stats/` contains `index.ts`, `layout.ts`,
  `setup.ts`, `tui.tsx`, `openspec.ts`, `cache.ts` and `refresh.ts`

#### Scenario: Package derivation ships the plugin directory

- **WHEN** the package derivation is evaluated
- **THEN** its install phase copies `.opencode/plugins/openspec-stats` into the
  output

### Requirement: Operator documentation

The README SHALL document prerequisites, installation, development, testing,
packaging and the exact sidebar and panel content. The documented commands
SHALL match the scripts and nix outputs that ship.

#### Scenario: Operator can install from the README

- **WHEN** an operator follows the install section
- **THEN** the plugin directory is copied into a project that has an OpenSpec
  root and OpenCode discovers it

#### Scenario: Operator can verify the build

- **WHEN** an operator follows the development and packaging sections
- **THEN** the documented test, type check, e2e and build commands work from a
  clean checkout

#### Scenario: Documentation matches the shipped content

- **WHEN** the README describes the sidebar and panel
- **THEN** the headers, totals, status rows and summary lines match what the
  plugin renders
