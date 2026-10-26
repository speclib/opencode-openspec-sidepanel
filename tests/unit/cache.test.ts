import assert from "node:assert/strict"
import test from "node:test"
import {
  CACHE_KEY,
  createCache,
  decodeStats,
  toSnapshot,
} from "../../.opencode/plugins/openspec-stats/cache.ts"
import type { Stats } from "../../.opencode/plugins/openspec-stats/layout.ts"

const stats: Stats = {
  changes: [
    {
      name: "add-widget",
      status: "in-progress",
      completedTasks: 2,
      totalTasks: 3,
      lastModified: "2026-10-26T17:02:44.308Z",
    },
  ],
  statuses: [{ status: "in-progress", count: 1 }],
  completedTasks: 2,
  totalTasks: 3,
  specs: 1,
  requirements: 2,
  archived: 9,
}

test("cache key is stable", () => {
  assert.equal(CACHE_KEY, "openspec.stats.cache")
})

test("decodeStats accepts a complete snapshot", () => {
  assert.deepEqual(decodeStats(stats), stats)
  assert.deepEqual(decodeStats(toSnapshot(stats)), stats)
})

test("decodeStats rejects malformed snapshots", () => {
  assert.equal(decodeStats(null), null)
  assert.equal(decodeStats({}), null)
  assert.equal(decodeStats("stats"), null)
  assert.equal(decodeStats({ ...stats, changes: [{ name: "broken" }] }), null)
  assert.equal(decodeStats({ ...stats, statuses: [{ status: "x", count: -1 }] }), null)
  assert.equal(decodeStats({ ...stats, completedTasks: Number.NaN }), null)
})

test("createCache seeds the current directory and writes snapshots", () => {
  const writes: Array<{ directory: string; value: Stats }> = []
  const cache = createCache(
    {
      read: (directory) => (directory === "/repo" ? stats : undefined),
      write: (directory, value) => writes.push({ directory, value }),
    },
    "/repo",
  )
  assert.deepEqual(cache.seed(), stats)
  cache.save(stats)
  assert.equal(writes.length, 1)
  assert.equal(writes[0]?.directory, "/repo")
  assert.deepEqual(writes[0]?.value, stats)
  assert.notEqual(writes[0]?.value, stats)
})

test("createCache returns null when the cached value is invalid", () => {
  const cache = createCache(
    {
      read: () => ({ ...stats, archived: -1 }) as Stats,
      write: () => {},
    },
    "/repo",
  )
  assert.equal(cache.seed(), null)
})
