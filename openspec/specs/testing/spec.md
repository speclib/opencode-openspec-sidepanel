# testing Specification

## Purpose
Define the end to end proof that the plugin works inside the real OpenCode
process, and the coverage rule for the PoC acceptance criteria.

## Requirements

### Requirement: Isolated fixture project

The e2e harness SHALL create each fixture in a temporary directory with its own
HOME, XDG data, XDG config and XDG cache directories. It SHALL initialize the
fixture with `openspec init` and SHALL never write into the repository or read
the developer's own OpenSpec data.

#### Scenario: A test starts

- **WHEN** an e2e case creates a project
- **THEN** the project lives under a fresh temporary directory
- **AND** OpenCode runs with the isolated HOME and XDG variables
- **AND** the developer's OpenCode and OpenSpec data are untouched

#### Scenario: A test finishes

- **WHEN** the case completes or fails
- **THEN** the temporary project and its isolated directories are removed

### Requirement: Sidebar render proof

The e2e suite SHALL prove that the `OPENSPEC` section renders in the sidebar and
that its numbers match the fixture. It SHALL assert the total, the per-status
counts, the task progress, the spec count, the requirement count and the
archived count.

#### Scenario: The fixture has active changes

- **WHEN** OpenCode opens the fixture session
- **THEN** the sidebar contains the `OPENSPEC` header
- **AND** it contains `<n> active changes` for the fixture count
- **AND** every status row shows the count from the OpenSpec CLI
- **AND** the task, spec, requirement and archived totals match the fixture

#### Scenario: The sidebar rows are aligned

- **WHEN** status rows are rendered
- **THEN** their counts and bars line up in fixed columns

### Requirement: Live refresh proof

The e2e suite SHALL prove that the section refreshes after a real assistant turn.
The case SHALL hold the assistant response open, create a change during the turn,
release the response and assert that the rendered counts changed.

#### Scenario: A change is created during a turn

- **WHEN** the mock provider has received the assistant request
- **AND** a new OpenSpec change is created
- **AND** the provider releases the response
- **THEN** the turn succeeds
- **AND** the sidebar total and status counts reflect the new change

### Requirement: Degraded proof

The e2e suite SHALL prove that a project without an OpenSpec root shows the
muted `unavailable` line and that the TUI keeps running.

#### Scenario: The project has no OpenSpec root

- **WHEN** OpenCode opens a project that was not initialized with `openspec init`
- **THEN** the sidebar contains `unavailable`
- **AND** it does not contain an active change total
- **AND** the process remains alive until the capture ends

### Requirement: Prerequisite handling

The e2e suite SHALL run on the development host. It MAY skip only when
`opencode`, `python3` or the plugin dependencies are missing, and the skip reason
SHALL name the missing prerequisite.

#### Scenario: The development host is complete

- **WHEN** `opencode`, `python3` and `node_modules/@opencode/plugin` are present
- **THEN** every e2e case runs
- **AND** none is reported as skipped

#### Scenario: A prerequisite is missing

- **WHEN** `opencode` is not on `PATH`
- **THEN** the e2e cases skip with a reason that names `opencode`

### Requirement: Acceptance coverage

Every acceptance criterion in `AGENTS.md` section 1 SHALL have at least one
automated test that fails when the criterion regresses. Unit tests SHALL cover
pure logic, integration tests SHALL cover the real CLI, and e2e tests SHALL cover
the real OpenCode process.

#### Scenario: A criterion regresses

- **WHEN** a behavior named in the acceptance criteria is broken
- **THEN** at least one test fails
- **AND** the failing test identifies the criterion
