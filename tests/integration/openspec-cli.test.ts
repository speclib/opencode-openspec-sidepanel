import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
  OpenspecUnavailableError,
  loadStats,
} from "../../.opencode/plugins/openspec-stats/openspec.ts"

function run(command: string, args: readonly string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      [...args],
      { cwd, encoding: "utf8" },
      (error, stdout) => {
        if (error) {
          reject(error)
          return
        }
        resolve(stdout)
      },
    )
  })
}

async function available(): Promise<boolean> {
  try {
    await run("openspec", ["--version"], process.cwd())
    return true
  } catch {
    return false
  }
}

test("loadStats reads a real OpenSpec project", async (t) => {
  if (!(await available())) {
    t.skip("openspec is not installed")
    return
  }

  const root = await mkdtemp(join(tmpdir(), "openspec-sidepanel-integration-"))
  t.after(async () => {
    await rm(root, { recursive: true, force: true })
  })

  await run("openspec", ["init", "--tools", "none", "--no-animation"], root)
  await run("openspec", ["new", "change", "first-change"], root)
  await writeFile(
    join(root, "openspec", "changes", "first-change", "tasks.md"),
    "# Tasks\n\n## 1. Work\n\n- [x] 1.1 First\n- [ ] 1.2 Second\n",
  )
  await mkdir(join(root, "openspec", "changes", "archive", "2026-01-01-old-change"), {
    recursive: true,
  })
  await mkdir(join(root, "openspec", "specs", "demo"), { recursive: true })
  await writeFile(
    join(root, "openspec", "specs", "demo", "spec.md"),
    [
      "# demo Specification",
      "",
      "## Purpose",
      "",
      "Demo.",
      "",
      "## Requirements",
      "",
      "### Requirement: Demo",
      "",
      "The system SHALL demo.",
      "",
      "#### Scenario: Demo",
      "",
      "- **WHEN** demo",
      "- **THEN** demo",
      "",
    ].join("\n"),
  )

  const stats = await loadStats(root)
  assert.equal(stats.changes.length, 1)
  assert.equal(stats.changes[0]?.name, "first-change")
  assert.equal(stats.changes[0]?.status, "in-progress")
  assert.equal(stats.completedTasks, 1)
  assert.equal(stats.totalTasks, 2)
  assert.deepEqual(stats.statuses, [{ status: "in-progress", count: 1 }])
  assert.equal(stats.specs, 1)
  assert.equal(stats.requirements, 1)
  assert.equal(stats.archived, 1)
})

test("loadStats treats a directory without OpenSpec as unavailable", async (t) => {
  if (!(await available())) {
    t.skip("openspec is not installed")
    return
  }

  const root = await mkdtemp(join(tmpdir(), "openspec-sidepanel-empty-"))
  t.after(async () => {
    await rm(root, { recursive: true, force: true })
  })

  await assert.rejects(loadStats(root), OpenspecUnavailableError)
})
