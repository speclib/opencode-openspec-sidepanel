import assert from "node:assert/strict"
import test from "node:test"
import {
  OpenspecUnavailableError,
  aggregate,
  parseChanges,
  parseSpecs,
} from "../../.opencode/plugins/openspec-stats/openspec.ts"

test("parseChanges reads the root and every change field", () => {
  const result = parseChanges(
    JSON.stringify({
      changes: [
        {
          name: "add-widget",
          completedTasks: 2,
          totalTasks: 3,
          lastModified: "2026-10-26T17:02:44.308Z",
          status: "in-progress",
        },
      ],
      root: { path: "/repo", source: "nearest" },
    }),
  )
  assert.equal(result.root, "/repo")
  assert.deepEqual(result.changes, [
    {
      name: "add-widget",
      status: "in-progress",
      completedTasks: 2,
      totalTasks: 3,
      lastModified: "2026-10-26T17:02:44.308Z",
    },
  ])
})

test("parseChanges accepts a null root as no project", () => {
  const result = parseChanges(JSON.stringify({ changes: [], root: null }))
  assert.equal(result.root, null)
  assert.deepEqual(result.changes, [])
})

test("parseChanges rejects invalid JSON and invalid fields", () => {
  assert.throws(() => parseChanges("not json"), OpenspecUnavailableError)
  assert.throws(() => parseChanges("[]"), OpenspecUnavailableError)
  assert.throws(() => parseChanges(JSON.stringify({ root: { path: "/repo" } })), OpenspecUnavailableError)
  assert.throws(
    () =>
      parseChanges(
        JSON.stringify({
          changes: [
            {
              name: "broken",
              status: "in-progress",
              completedTasks: -1,
              totalTasks: 2,
              lastModified: "2026-10-26T17:02:44.308Z",
            },
          ],
          root: { path: "/repo" },
        }),
      ),
    OpenspecUnavailableError,
  )
  assert.throws(
    () =>
      parseChanges(
        JSON.stringify({
          changes: [
            {
              name: 4,
              status: "in-progress",
              completedTasks: 0,
              totalTasks: 2,
              lastModified: "2026-10-26T17:02:44.308Z",
            },
          ],
          root: { path: "/repo" },
        }),
      ),
    OpenspecUnavailableError,
  )
})

test("parseSpecs reads spec ids and requirement counts", () => {
  const result = parseSpecs(
    JSON.stringify({
      specs: [
        { id: "widget", requirementCount: 2 },
        { id: "gadget", requirementCount: 1 },
      ],
      root: { path: "/repo", source: "nearest" },
    }),
  )
  assert.equal(result.root, "/repo")
  assert.deepEqual(result.specs, [
    { id: "widget", requirementCount: 2 },
    { id: "gadget", requirementCount: 1 },
  ])
})

test("parseSpecs rejects an invalid requirement count", () => {
  assert.throws(
    () =>
      parseSpecs(
        JSON.stringify({
          specs: [{ id: "widget", requirementCount: "two" }],
          root: { path: "/repo" },
        }),
      ),
    OpenspecUnavailableError,
  )
})

test("aggregate counts statuses, tasks, specs and requirements", () => {
  const stats = aggregate(
    [
      {
        name: "first",
        status: "in-progress",
        completedTasks: 2,
        totalTasks: 3,
        lastModified: "2026-10-26T17:02:44.308Z",
      },
      {
        name: "second",
        status: "complete",
        completedTasks: 4,
        totalTasks: 4,
        lastModified: "2026-10-26T17:02:46.356Z",
      },
      {
        name: "third",
        status: "in-progress",
        completedTasks: 0,
        totalTasks: 2,
        lastModified: "2026-10-26T17:02:45.000Z",
      },
    ],
    [
      { id: "widget", requirementCount: 2 },
      { id: "gadget", requirementCount: 3 },
    ],
    9,
  )
  assert.deepEqual(stats.statuses, [
    { status: "in-progress", count: 2 },
    { status: "complete", count: 1 },
  ])
  assert.equal(stats.completedTasks, 6)
  assert.equal(stats.totalTasks, 9)
  assert.equal(stats.specs, 2)
  assert.equal(stats.requirements, 5)
  assert.equal(stats.archived, 9)
  assert.equal(stats.changes.length, 3)
})
