import assert from "node:assert/strict"
import test from "node:test"
import {
  bar,
  bars,
  changeRows,
  completionBar,
  layoutBreakdown,
  layoutSection,
  statusRows,
  summaryRows,
  truncate,
  type Stats,
} from "../../.opencode/plugins/openspec-stats/layout.ts"

const stats: Stats = {
  changes: [
    {
      name: "add-widget",
      status: "in-progress",
      completedTasks: 2,
      totalTasks: 3,
      lastModified: "2026-10-26T17:02:44.308Z",
    },
    {
      name: "fix-thing",
      status: "in-progress",
      completedTasks: 2,
      totalTasks: 2,
      lastModified: "2026-10-26T17:02:46.356Z",
    },
    {
      name: "old-work",
      status: "complete",
      completedTasks: 1,
      totalTasks: 1,
      lastModified: "2026-10-25T09:00:00.000Z",
    },
  ],
  statuses: [
    { status: "complete", count: 1 },
    { status: "in-progress", count: 2 },
  ],
  completedTasks: 52,
  totalTasks: 228,
  specs: 24,
  requirements: 214,
  archived: 9,
}

const emptyStats: Stats = {
  changes: [],
  statuses: [],
  completedTasks: 0,
  totalTasks: 0,
  specs: 0,
  requirements: 0,
  archived: 0,
}

test("status rows sort by count descending then name", () => {
  assert.deepEqual(
    statusRows(stats).map((row) => row.status),
    ["in-progress", "complete"],
  )
  assert.deepEqual(
    statusRows({
      ...stats,
      statuses: [
        { status: "beta", count: 1 },
        { status: "alpha", count: 1 },
      ],
    }).map((row) => row.status),
    ["alpha", "beta"],
  )
})

test("bars scale status counts to four cells", () => {
  assert.equal(bar(2, 2), "████")
  assert.equal(bar(1, 2), "██")
  assert.equal(bar(1, 3), "█▌")
  assert.equal(bar(0, 5), "")
  assert.equal(bar(1, 0), "")
  assert.deepEqual(
    bars([{ status: "two", count: 2 }, { status: "one", count: 1 }]).map((row) => row.bar),
    ["████", "██"],
  )
})

test("completion bars scale to the change total", () => {
  assert.equal(completionBar(1, 1), "████")
  assert.equal(completionBar(2, 4), "██")
  assert.equal(completionBar(0, 4), "")
  assert.equal(completionBar(0, 0), "")
})

test("change rows sort by last modified descending", () => {
  assert.deepEqual(
    changeRows(stats).map((change) => change.name),
    ["fix-thing", "add-widget", "old-work"],
  )
})

test("truncate keeps names up to the limit and adds three dots", () => {
  assert.equal(truncate("short"), "short")
  assert.equal(truncate("a".repeat(24)), "a".repeat(24))
  const truncated = truncate("a".repeat(30))
  assert.equal(truncated.length, 24)
  assert.equal(truncated, "a".repeat(21) + "...")
})

test("summary rows carry the task fraction and totals", () => {
  assert.deepEqual(summaryRows(stats), [
    { label: "tasks", value: "52/228" },
    { label: "specs", value: "24" },
    { label: "requirements", value: "214" },
    { label: "archived", value: "9" },
  ])
  assert.deepEqual(summaryRows(emptyStats)[0], { label: "tasks", value: "0/0" })
})

test("section layout renders the header total, status bars and aligned summary", () => {
  const layout = layoutSection(stats)
  assert.equal(layout.total, "3 active changes")
  assert.ok(layout.body.some((line) => /^in-progress\s+2\s+████$/.test(line)))
  assert.ok(layout.body.some((line) => /^complete\s+1\s+██$/.test(line)))
  assert.ok(layout.body.some((line) => /^tasks\s+52\/228$/.test(line)))
  assert.ok(layout.body.some((line) => /^specs\s+24$/.test(line)))
  assert.ok(layout.body.some((line) => /^requirements\s+214$/.test(line)))
  assert.ok(layout.body.some((line) => /^archived\s+9$/.test(line)))
  const summary = layout.body.filter((line) =>
    /^(tasks|specs|requirements|archived)\s/.test(line),
  )
  assert.equal(new Set(summary.map((line) => line.length)).size, 1)
})

test("section layout handles zero changes and zero tasks", () => {
  const layout = layoutSection(emptyStats)
  assert.equal(layout.total, "0 active changes")
  assert.ok(layout.body.some((line) => /^tasks\s+0\/0$/.test(line)))
  assert.ok(layout.body.some((line) => /^specs\s+0$/.test(line)))
  assert.equal(layout.body.some((line) => /^(in-progress|complete)\s/.test(line)), false)
})

test("breakdown layout lists changes with task progress and truncates long names", () => {
  const layout = layoutBreakdown(stats)
  assert.equal(layout.total, "3 active changes")
  assert.ok(layout.body.some((line) => /^fix-thing\s+2\/2\s+████$/.test(line)))
  assert.ok(layout.body.some((line) => /^add-widget\s+2\/3\s+██▌$/.test(line)))
  assert.ok(layout.body.some((line) => /^tasks\s+52\/228$/.test(line)))

  const longName = "a".repeat(30)
  const longLayout = layoutBreakdown({
    ...stats,
    changes: [
      {
        name: longName,
        status: "in-progress",
        completedTasks: 0,
        totalTasks: 5,
        lastModified: "2026-10-26T17:02:44.308Z",
      },
    ],
  })
  assert.ok(longLayout.body.some((line) => line.startsWith("a".repeat(21) + "...  ")))
  assert.ok(longLayout.body.some((line) => line.includes("0/5")))
})
