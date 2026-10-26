# Briefing - OpenSpec stats sidebar plugin for OpenCode v2

> Hand this file to a new session together with `AGENTS.md`.

## Goal

Build a project-local OpenCode v2 CLI/TUI plugin that renders a sidebar section
with OpenSpec statistics for the current project directory. This is the target
look:

```
┌─ OpenCode ───────────────────────────────────────┬───────────────────────────┐
│                                                  │  OPENSPEC                 │
│  ╭─ Build ─────────────────────────────────────╮ │  3 active changes         │
│  │ You: what is left in this milestone?       │ │                           │
│  │                                            │ │  in-progress      2  ████ │
│  │ Build: reading openspec...                 │ │  complete         1  ██   │
│  │                                            │ │                           │
│  │  ▸ openspec_list                           │ │  tasks        52/228      │
│  │    ✓ 2 changes                             │ │  specs            24      │
│  │                                            │ │  requirements    214      │
│  │  (working…)                                │ │  archived          9      │
│  ╰────────────────────────────────────────────╯ │                           │
│  ╭────────────────────────────────────────────╮ │                           │
│  │ > _                                        │ │                           │
│  ╰────────────────────────────────────────────╯ │                           │
└──────────────────────────────────────────────────┴───────────────────────────┘
```

The section is read-only. It reports what OpenSpec already knows and never
writes to `openspec/`.

## Environment and prerequisites

- OpenCode v2. The development host runs v2.0.29.
- The `openspec` CLI on `PATH`. The development host runs 1.10.0.
- The target project has been initialized with `openspec init`, so
  `openspec/config.yaml` exists at its root.
- Node 24 for development and tests.
- Nix with flakes for the build and the development shell.

## What OpenSpec exposes

`openspec list --json` returns the active changes and the resolved root:

```json
{
  "changes": [
    {
      "name": "add-widget",
      "completedTasks": 2,
      "totalTasks": 3,
      "lastModified": "2026-10-26T17:02:44.308Z",
      "status": "in-progress"
    }
  ],
  "root": { "path": "/repo", "source": "nearest" }
}
```

`openspec list --specs --json` returns the main specs:

```json
{
  "specs": [{ "id": "widget", "requirementCount": 2 }],
  "root": { "path": "/repo", "source": "nearest" }
}
```

Facts that shape the implementation:

- The commands exit 0 when no OpenSpec root exists. They return `"root": null`
  and empty arrays. Treat a null root as unavailable, not as zero stats.
- Archived changes are not listed by the CLI. They live as directories under
  `<root>/openspec/changes/archive/` and are counted from the filesystem.
- Schema warnings are written to stderr. Parse stdout only and never treat
  stderr output as a failure when the exit code is 0.
- Status is currently `in-progress` or `complete`, but the plugin groups by
  whatever string the CLI returns and does not hard-code the set.
- A change can have `totalTasks: 0`. That is valid and must not divide by zero.

## Sidebar semantics

- Header: `OPENSPEC`.
- Total line: `<n> active changes`.
- One row per change status, sorted by count descending and then by name, with
  a 4-cell bar scaled to the largest status count. This mirrors the beans
  plugin.
- Summary lines without bars:
  - `tasks <completed>/<total>` across all active changes.
  - `specs <n>`.
  - `requirements <n>`.
  - `archived <n>`.
- When no changes exist, show `0 active changes` and the spec and archive
  totals. Do not render an empty box.
- While the first load is in flight show a muted `loading` line.
- When OpenSpec cannot be read show a muted `unavailable` line instead of the
  body. The TUI must keep running.
- Cache the last stats per project in `context.storage.store` and paint them
  before the first network or process call completes.

## Session panel

A full breakdown opens from a command bound to `<leader>o`:

- Every active change with `completed/total` and a bar for its completion
  ratio, sorted by `lastModified` descending.
- The spec and archive totals.
- The same muted fallback when OpenSpec is unavailable.

The sidebar itself never lists individual changes. The panel does.

## Acceptance criteria

1. An `OPENSPEC` section appears in the OpenCode sidebar for a project.
2. The active change count, per-status counts and task totals match
   `openspec list --json`. The spec and requirement totals match
   `openspec list --specs --json`. The archived count matches the archive
   directory.
3. The section refreshes after every assistant turn and on a 30 second
   fallback timer.
4. A missing OpenSpec root, a missing `openspec` binary, a non-zero exit, a
   timeout and invalid JSON all degrade to the muted `unavailable` line without
   crashing the TUI.
5. Cached stats paint immediately on startup for a project seen before.
6. The session panel opens from `<leader>o` and lists every active change.
7. `nix flake check` passes and `nix build` produces the plugin for every
   supported system.
8. The unit, integration and e2e suites pass. The e2e suite proves criteria 1
   to 4 in the real OpenCode process.

## Non-goals

- Writing, archiving or validating OpenSpec data. The plugin is a reader.
- Supporting registered OpenSpec stores. Only the nearest local root counts.
- Remote registries, network access or telemetry at runtime.
- A general purpose dashboard beyond the sidebar section and the breakdown
  panel.

## Reference implementation

`/home/pim/gh.mipmip/opencode-beans` is the proven sibling plugin. Reuse its
architecture, its layout module and its e2e harness, and replace beans with
OpenSpec. It already uses OpenCode v2 syntax. Do not copy V1 syntax from older
examples or from stale documentation.
