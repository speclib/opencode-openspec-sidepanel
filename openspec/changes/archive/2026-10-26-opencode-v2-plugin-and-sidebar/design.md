## Context

The foundation added a placeholder server and TUI entrypoint. This change turns
the TUI into the real section while keeping the data source out of scope. See
`proposal.md` for motivation and `specs/plugin-sidebar/spec.md` for the required
behavior.

The sibling project `/home/pim/gh.mipmip/opencode-beans` proves the slot API and
the visual style. Its layout module is the baseline, with beans-specific fields
replaced by OpenSpec fields.

## Goals / Non-Goals

**Goals:**

- A section that renders a complete, aligned layout from a pure `Stats` object.
- A panel that can be opened with a keybind and reuses the same layout rules.
- A rendering layer with no knowledge of the `openspec` CLI.

**Non-Goals:**

- Loading, refreshing or caching real data.
- Failure strings from the data layer. The TUI keeps the muted fallback path,
  but this change only exercises the empty fixture.
- End to end tests.

## Decisions

### A single pure `Stats` model

`layout.ts` owns a `Stats` type with the active changes, the per-status counts,
the task totals, the spec count, the requirement count and the archived count.
The TUI only renders this model. The next change builds it from the CLI.

Alternative: let the TUI read CLI output directly. Rejected because it would
couple rendering to process handling and make layout tests need a fake CLI.

### Text values instead of numeric counts in cells

Status rows need a count, while the task summary needs `completed/total`.
Cells therefore carry a string value. Column widths are computed from the
longest label and the longest value, so both kinds of row share one alignment.

### Four-cell bars

The bar width is four cells. A full cell is `█` and a half cell is `▌`. Status
bars scale to the largest status count. Change bars in the panel scale to the
change's own total, so a completed change is full and an empty change has no bar.
A zero maximum produces an empty bar and never divides by zero.

### Truncation with three dots

Change names longer than 24 characters are cut to 21 characters plus `...`.
Three ASCII dots are used instead of an ellipsis character so the width is
predictable and the prose rules stay simple.

### Empty fixture in the TUI

The TUI seeds `Stats` with an empty object: zero changes, zero tasks, zero specs,
zero requirements and zero archived changes. This proves the real layout without
showing invented numbers. The next change replaces the seed with the cache and
the first load.

### Slots and the panel command

`setup.ts` wraps `context.ui.slot` in `registerSidebar`, keeps a disposable bag,
and defines the panel command with id `openspec.stats.panel`, group `OpenSpec`
and bind `<leader>o`. The TUI registers `sidebar.content` and `session.panel`
and opens the panel through `context.ui.panel.open`.

### Theme only

Every `<text>` element takes its color from `context.theme.text.base` or
`context.theme.text.muted`. A unit test scans the TUI for color literals.

## Risks / Trade-offs

- [The empty fixture could look like real data] -> It shows only zeros and is
  replaced by the data layer in the next change.
- [The panel and the sidebar could drift visually] -> Both call the same layout
  module and share the cell renderer.
- [Long names could push the task column] -> Truncation happens before column
  widths are computed.
