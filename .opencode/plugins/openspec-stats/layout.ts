export interface ChangeStats {
  readonly name: string
  readonly status: string
  readonly completedTasks: number
  readonly totalTasks: number
  readonly lastModified: string
}

export interface StatusCount {
  readonly status: string
  readonly count: number
}

export interface Stats {
  readonly changes: readonly ChangeStats[]
  readonly statuses: readonly StatusCount[]
  readonly completedTasks: number
  readonly totalTasks: number
  readonly specs: number
  readonly requirements: number
  readonly archived: number
}

export interface SectionLayout {
  readonly total: string
  readonly body: readonly string[]
}

export interface SummaryLine {
  readonly label: string
  readonly value: string
}

interface Cell {
  readonly label: string
  readonly value: string
  readonly bar?: string
}

interface ColumnWidths {
  readonly label: number
  readonly value: number
}

const BAR_WIDTH = 4
const FULL_BLOCK = "█"
const HALF_BLOCK = "▌"
const LABEL_GUTTER = 2
const VALUE_GUTTER = 2
const BAR_GAP = "  "
const NAME_LIMIT = 24

export function statusRows(stats: Stats): StatusCount[] {
  return [...stats.statuses].sort(
    (left, right) => right.count - left.count || left.status.localeCompare(right.status),
  )
}

export function changeRows(stats: Stats): ChangeStats[] {
  return [...stats.changes].sort(
    (left, right) =>
      right.lastModified.localeCompare(left.lastModified) || left.name.localeCompare(right.name),
  )
}

export function bars<T extends { readonly count: number }>(
  entries: readonly T[],
  width: number = BAR_WIDTH,
): Array<T & { readonly bar: string }> {
  const max = entries.reduce((largest, entry) => Math.max(largest, entry.count), 0)
  return entries.map((entry) => ({ ...entry, bar: bar(entry.count, max, width) }))
}

export function bar(count: number, max: number, width: number = BAR_WIDTH): string {
  if (max <= 0 || count <= 0) {
    return ""
  }
  const steps = Math.min(width * 2, Math.round((count / max) * width * 2))
  const full = Math.floor(steps / 2)
  const half = steps % 2 === 1
  return FULL_BLOCK.repeat(full) + (half ? HALF_BLOCK : "")
}

export function completionBar(completed: number, total: number, width: number = BAR_WIDTH): string {
  if (total <= 0) {
    return ""
  }
  return bar(completed, total, width)
}

export function truncate(name: string, limit: number = NAME_LIMIT): string {
  if (name.length <= limit) {
    return name
  }
  return name.slice(0, Math.max(0, limit - 3)) + "..."
}

export function totalLabel(stats: Stats): string {
  return `${stats.changes.length} active changes`
}

export function summaryRows(stats: Stats): SummaryLine[] {
  return [
    { label: "tasks", value: `${stats.completedTasks}/${stats.totalTasks}` },
    { label: "specs", value: String(stats.specs) },
    { label: "requirements", value: String(stats.requirements) },
    { label: "archived", value: String(stats.archived) },
  ]
}

export function layoutSection(stats: Stats): SectionLayout {
  const statuses = bars(statusRows(stats)).map((row) => ({
    label: row.status,
    value: String(row.count),
    bar: row.bar,
  }))
  const summary = summaryRows(stats).map((line) => ({ label: line.label, value: line.value }))
  return buildLayout(stats, statuses, summary)
}

export function layoutBreakdown(stats: Stats): SectionLayout {
  const changes = changeRows(stats).map((change) => ({
    label: truncate(change.name),
    value: `${change.completedTasks}/${change.totalTasks}`,
    bar: completionBar(change.completedTasks, change.totalTasks),
  }))
  const summary = summaryRows(stats).map((line) => ({ label: line.label, value: line.value }))
  return buildLayout(stats, changes, summary)
}

function buildLayout(
  stats: Stats,
  first: readonly Cell[],
  second: readonly Cell[],
): SectionLayout {
  const widths = columnWidths([...first, ...second])
  const body: string[] = []
  appendBlock(body, first, widths)
  appendBlock(body, second, widths)
  return { total: totalLabel(stats), body }
}

function appendBlock(body: string[], cells: readonly Cell[], widths: ColumnWidths): void {
  if (cells.length === 0) {
    return
  }
  body.push("", ...cells.map((cell) => renderCell(cell, widths)))
}

function columnWidths(cells: readonly Cell[]): ColumnWidths {
  const label = cells.reduce((width, cell) => Math.max(width, cell.label.length), 0) + LABEL_GUTTER
  const value =
    cells.reduce((width, cell) => Math.max(width, cell.value.length), 0) + VALUE_GUTTER
  return { label, value }
}

function renderCell(cell: Cell, widths: ColumnWidths): string {
  const label = cell.label.padEnd(widths.label)
  const value = cell.value.padStart(widths.value)
  return cell.bar ? label + value + BAR_GAP + cell.bar : label + value
}
