## Purpose

Define how the plugin reads, aggregates, caches and refreshes OpenSpec
statistics for the current project.

## ADDED Requirements

### Requirement: Read active changes

The plugin SHALL read active changes from `openspec list --json`. Each change
SHALL contribute its name, status, completed task count, total task count and
last modified timestamp.

#### Scenario: Active changes exist

- **WHEN** the CLI returns two in-progress changes and one complete change
- **THEN** the plugin records all three with their task counts
- **AND** the completed task total is the sum of the per-change values
- **AND** the total task count is the sum of the per-change values

#### Scenario: No active changes

- **WHEN** the CLI returns an empty change list with a valid root
- **THEN** the plugin reports zero active changes and zero tasks

### Requirement: Read specs and archived changes

The plugin SHALL read main specs from `openspec list --specs --json` and count
archived changes from the directories under
`<root>/openspec/changes/archive`.

#### Scenario: Specs and archive entries exist

- **WHEN** the CLI returns two specs with two and three requirements
- **AND** the archive directory contains nine change directories
- **THEN** the plugin reports two specs, five requirements and nine archived
  changes

#### Scenario: No archive directory

- **WHEN** the project has no `openspec/changes/archive` directory
- **THEN** the archived count is zero
- **AND** this is not treated as a failure

### Requirement: Resolve the project root

The plugin SHALL use `root.path` from the CLI response as the project root. A
null root SHALL be treated as unavailable, not as zero statistics.

#### Scenario: OpenSpec root is missing

- **WHEN** the CLI returns `"root": null`
- **THEN** the plugin reports unavailable
- **AND** it does not run the specs query

### Requirement: Refresh

The plugin SHALL refresh after every `session.execution.succeeded` event and on
a 30 second fallback timer. A newer refresh SHALL abort the previous one and
only the newest result SHALL be applied.

#### Scenario: Assistant turn completes

- **WHEN** a session execution succeeds
- **THEN** the plugin starts a new load
- **AND** the rendered stats update when the load settles

#### Scenario: Overlapping loads

- **WHEN** a second refresh starts before the first one settles
- **THEN** the first request is aborted
- **AND** a stale first result is not applied

### Requirement: Graceful degradation

The plugin SHALL show a muted `unavailable` line when OpenSpec cannot be read.
It SHALL NOT crash the TUI. This covers a missing binary, a non-zero exit, a
timeout, invalid JSON and invalid payload fields.

#### Scenario: openspec is not installed

- **WHEN** the binary cannot be spawned
- **THEN** the section shows `unavailable`
- **AND** the TUI keeps running

#### Scenario: The command times out

- **WHEN** the CLI does not finish within 5 seconds
- **THEN** the command is stopped
- **AND** the section shows `unavailable`

#### Scenario: Invalid JSON

- **WHEN** the CLI returns output that is not valid JSON
- **THEN** the section shows `unavailable`

### Requirement: Cache per project

The plugin SHALL cache the last statistics per project directory under
`openspec.stats.cache` and SHALL paint the cached values on startup before the
first load settles.

#### Scenario: Reopening a project

- **WHEN** the plugin starts in a directory with a cached snapshot
- **THEN** the section shows the cached counts immediately
- **AND** a fresh load replaces them when it settles

#### Scenario: Corrupt cache

- **WHEN** the stored value does not match the stats shape
- **THEN** the plugin ignores it
- **AND** it waits for a fresh load
