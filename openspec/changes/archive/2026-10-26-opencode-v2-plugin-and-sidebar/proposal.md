## Why

The foundation proves the repository builds, but the plugin does not render
anything yet. This change adds the visible sidebar section, the layout logic and
the session panel, using a fixed empty stats object until the data source lands.

Epic: `opencode-openspec-sidepanel-aepi`.

## What Changes

- Add `layout.ts` with pure functions for status rows, summary rows, column
  widths, bars, completion bars and change-name truncation.
- Add `setup.ts` with a disposable bag, sidebar registration and the panel
  command bound to `<leader>o`.
- Replace the placeholder TUI with a Solid component that registers the
  `sidebar.content` and `session.panel` slots.
- Render the `OPENSPEC` header, the active change total, per-status rows with
  4-cell bars and the tasks, specs, requirements and archived summary.
- Seed the section with an empty stats fixture so it renders before the data
  source exists.
- Use theme tokens for every text color.
- Add unit tests for layout, registration, the panel command and the absence of
  V1 syntax.

## Capabilities

### New Capabilities

- `plugin-sidebar`: the visible OpenCode sidebar section and the session panel,
  independent of where the statistics come from.

### Modified Capabilities

None.

## Impact

- `.opencode/plugins/openspec-stats/tui.tsx` becomes the real TUI entrypoint.
- New `.opencode/plugins/openspec-stats/layout.ts` and `setup.ts`.
- New unit tests under `tests/unit/`.
- No `openspec` invocation and no refresh yet.

## Acceptance Criteria

- The sidebar shows `OPENSPEC`, `<n> active changes`, one row per status with a
  4-cell bar and the four summary lines.
- Status rows are sorted by count descending and then by name.
- Summary values are aligned in a column.
- The session panel opens from `<leader>o` and lists each active change with its
  task progress.
- Long change names are truncated without breaking the column layout.
- Zero changes and zero tasks render without errors.
- Every text color comes from the plugin theme.
- The TUI entrypoint uses the OpenCode v2 slot API, not V1 syntax.

## Non-Goals

- Reading real OpenSpec data.
- Refresh timers, caching and failure handling.
- End to end tests.
