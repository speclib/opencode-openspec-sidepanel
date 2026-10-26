import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_TIMEOUT_MS,
  MAX_BUFFER,
  OpenspecUnavailableError,
  loadStats,
  type Exec,
  type ExecOptions,
} from "../../.opencode/plugins/openspec-stats/openspec.ts"

interface Call {
  readonly command: string
  readonly args: readonly string[]
  readonly options: ExecOptions
}

function fakeExec(handler: (args: readonly string[]) => string): {
  readonly exec: Exec
  readonly calls: Call[]
} {
  const calls: Call[] = []
  const exec: Exec = async (command, args, options) => {
    calls.push({ command, args, options })
    return handler(args)
  }
  return { exec, calls }
}

const changesPayload = JSON.stringify({
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
})

const specsPayload = JSON.stringify({
  specs: [{ id: "widget", requirementCount: 2 }],
  root: { path: "/repo", source: "nearest" },
})

test("loadStats runs both list commands with a timeout and a buffer", async () => {
  const { exec, calls } = fakeExec((args) => (args.includes("--specs") ? specsPayload : changesPayload))
  const stats = await loadStats("/repo", {
    exec,
    readArchive: async () => 9,
  })

  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0]?.args, ["list", "--json"])
  assert.deepEqual(calls[1]?.args, ["list", "--specs", "--json"])
  assert.equal(calls[0]?.command, "openspec")
  assert.equal(calls[0]?.options.cwd, "/repo")
  assert.equal(calls[0]?.options.timeout, DEFAULT_TIMEOUT_MS)
  assert.equal(calls[0]?.options.maxBuffer, MAX_BUFFER)
  assert.equal(DEFAULT_TIMEOUT_MS, 5_000)
  assert.equal(MAX_BUFFER, 8 * 1024 * 1024)

  assert.equal(stats.changes.length, 1)
  assert.equal(stats.completedTasks, 2)
  assert.equal(stats.totalTasks, 3)
  assert.equal(stats.specs, 1)
  assert.equal(stats.requirements, 2)
  assert.equal(stats.archived, 9)
})

test("loadStats stops when the CLI reports no root", async () => {
  const { exec, calls } = fakeExec(() => JSON.stringify({ changes: [], root: null }))
  await assert.rejects(
    loadStats("/empty", { exec, readArchive: async () => 0 }),
    (error: unknown) => error instanceof OpenspecUnavailableError && /no OpenSpec root/.test(error.message),
  )
  assert.equal(calls.length, 1)
})

test("loadStats rejects invalid JSON, invalid fields and command failures", async () => {
  const invalidJson = fakeExec(() => "not json")
  await assert.rejects(
    loadStats("/repo", { exec: invalidJson.exec, readArchive: async () => 0 }),
    OpenspecUnavailableError,
  )

  const invalidFields = fakeExec(() => JSON.stringify({ changes: [{}], root: { path: "/repo" } }))
  await assert.rejects(
    loadStats("/repo", { exec: invalidFields.exec, readArchive: async () => 0 }),
    OpenspecUnavailableError,
  )

  const failing: Exec = async () => {
    throw new Error("spawn openspec ENOENT")
  }
  await assert.rejects(
    loadStats("/repo", { exec: failing, readArchive: async () => 0 }),
    (error: unknown) =>
      error instanceof OpenspecUnavailableError && /openspec list --json failed/.test(error.message),
  )

  const failingArchive = fakeExec((args) => (args.includes("--specs") ? specsPayload : changesPayload))
  await assert.rejects(
    loadStats("/repo", {
      exec: failingArchive.exec,
      readArchive: async () => {
        throw new Error("permission denied")
      },
    }),
    (error: unknown) =>
      error instanceof OpenspecUnavailableError && /cannot count archived/.test(error.message),
  )
})

test("loadStats rejects when the root changes between queries", async () => {
  const { exec } = fakeExec((args) =>
    args.includes("--specs")
      ? JSON.stringify({ specs: [], root: { path: "/other" } })
      : changesPayload,
  )
  await assert.rejects(
    loadStats("/repo", { exec, readArchive: async () => 0 }),
    (error: unknown) =>
      error instanceof OpenspecUnavailableError && /root changed/.test(error.message),
  )
})
