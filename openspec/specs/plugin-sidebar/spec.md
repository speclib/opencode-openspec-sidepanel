# plugin-sidebar Specification

## Purpose
Define the visible OpenCode sidebar section and session panel for OpenSpec
statistics, independent of where those statistics are loaded from.

## Requirements

### Requirement: Sidebar section

The plugin SHALL render an `OPENSPEC` section in the OpenCode sidebar. The
section SHALL show a total line with the number of active changes.

#### Scenario: Active changes exist

- **WHEN** the plugin has statistics with three active changes
- **THEN** the section header reads `OPENSPEC`
- **AND** the total line reads `3 active changes`

#### Scenario: No active changes exist

- **WHEN** the plugin has statistics with no active changes
- **THEN** the total line reads `0 active changes`
- **AND** the section still renders its summary

### Requirement: Status breakdown

The section SHALL show one row per change status with the status name, the count
and a 4-cell bar scaled to the largest status count. Rows SHALL be sorted by
count descending and then by name ascending.

#### Scenario: Multiple statuses

- **WHEN** the statistics contain two changes in progress and one complete
- **THEN** the `in-progress` row appears before the `complete` row
- **AND** the `in-progress` bar is four cells wide
- **AND** the `complete` bar is two cells wide

#### Scenario: Equal counts

- **WHEN** two statuses have the same count
- **THEN** the status names are ordered alphabetically

### Requirement: Summary lines

The section SHALL show aligned summary lines for task progress, the number of
specs, the number of requirements and the number of archived changes.

#### Scenario: Summary values

- **WHEN** the statistics contain 52 completed tasks out of 228, 24 specs,
  214 requirements and 9 archived changes
- **THEN** the summary shows `tasks 52/228`, `specs 24`, `requirements 214` and
  `archived 9`
- **AND** the values share a right-aligned column

#### Scenario: Zero tasks

- **WHEN** the active changes have no tasks
- **THEN** the task summary shows `0/0` without an error

### Requirement: Session panel

The plugin SHALL register a session panel that lists every active change with
its task progress. The panel SHALL be opened by a command bound to `<leader>o`.

#### Scenario: Opening the panel

- **WHEN** the user presses `<leader>o`
- **THEN** the OpenSpec breakdown panel opens
- **AND** it lists every active change with `completed/total` tasks

#### Scenario: Long change names

- **WHEN** a change name is longer than the panel allows
- **THEN** the name is truncated with `...`
- **AND** the task column stays aligned

### Requirement: Theme usage

Every text color in the sidebar and the panel SHALL come from the plugin theme.

#### Scenario: Rendering with a theme

- **WHEN** the section is rendered
- **THEN** the header and total use the theme text color
- **AND** the rows use the theme muted text color
- **AND** no hard-coded color value is used

### Requirement: OpenCode v2 integration

The plugin SHALL use the OpenCode v2 TUI entrypoint and slot API. It SHALL NOT
use the V1 plugin package or the V1 singular plugin field.

#### Scenario: Loading the plugin

- **WHEN** the TUI entrypoint is inspected
- **THEN** it imports from `@opencode/plugin/tui`
- **AND** it registers `sidebar.content` and `session.panel` through the slot API
- **AND** it does not reference `@opencode-ai/plugin`
