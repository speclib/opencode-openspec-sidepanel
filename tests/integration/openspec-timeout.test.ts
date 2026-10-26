import assert from "node:assert/strict"
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
  OpenspecUnavailableError,
  loadStats,
} from "../../.opencode/plugins/openspec-stats/openspec.ts"

test("loadStats rejects a hanging openspec command as unavailable", async () => {
  const bin = await mkdtemp(join(tmpdir(), "openspec-timeout-bin-"))
  const project = await mkdtemp(join(tmpdir(), "openspec-timeout-project-"))
  const previousPath = process.env.PATH ?? ""

  try {
    const script = join(bin, "openspec")
    await writeFile(script, "#!/bin/sh\nexec sleep 10\n")
    await chmod(script, 0o755)
    process.env.PATH = `${bin}:${previousPath}`

    await assert.rejects(
      loadStats(project, { timeoutMs: 100, readArchive: async () => 0 }),
      (error: unknown) =>
        error instanceof OpenspecUnavailableError &&
        /openspec list --json failed/.test(error.message),
    )
  } finally {
    process.env.PATH = previousPath
    await rm(bin, { recursive: true, force: true })
    await rm(project, { recursive: true, force: true })
  }
})
