import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { promisify } from "node:util"
import { checkPrerequisites, skipReason } from "./helpers/env.ts"
import { MOCK_ASSISTANT_TEXT, startMockProvider } from "./helpers/mock-provider.ts"
import { FIXTURE_TOTAL_CHANGES, createE2eProject, listChanges } from "./helpers/project.ts"
import { capturePty } from "./helpers/pty.ts"
import { isColumnAligned, renderScreen, sidebarRegion } from "./helpers/screen.ts"

const run = promisify(execFile)

const skip = skipReason(await checkPrerequisites())

const columns = 160
const rows = 45

test("the sidebar refreshes after a real assistant turn", { skip }, async (t) => {
  const provider = await startMockProvider().catch(() => null)
  if (provider === null) {
    t.skip("the local end to end provider could not start")
    return
  }

  const project = await createE2eProject({ provider: { baseURL: provider.baseURL, model: provider.model } })
  try {
    const before = await listChanges(project.dir)
    assert.equal(before.length, FIXTURE_TOTAL_CHANGES)

    const capture = capturePty({
      cwd: project.dir,
      env: project.env,
      command: ["opencode", "--standalone", "--prompt", "say hello to the openspec sidebar"],
      cols: columns,
      rows,
      timeout: 24,
    })

    await provider.agentRequested()
    await run("openspec", ["new", "change", "added-during-the-turn"], { cwd: project.dir })
    await writeFile(
      join(project.dir, "openspec", "changes", "added-during-the-turn", "tasks.md"),
      "# Tasks\n\n## 1. Work\n\n- [ ] 1.1 New task\n",
    )
    provider.release()

    const output = await capture
    const screen = renderScreen(output, columns, rows)
    const full = screen.join("\n")
    assert.match(full, new RegExp(MOCK_ASSISTANT_TEXT), `expected the assistant message in:\n${full}`)

    const sidebar = sidebarRegion(screen, "OPENSPEC")
    assert.ok(sidebar.length > 0, `the OPENSPEC header was not rendered:\n${full}`)
    const text = sidebar.join("\n")

    const after = await listChanges(project.dir)
    assert.equal(after.length, before.length + 1)
    assert.match(
      text,
      new RegExp(`\\b${after.length} active changes\\b`),
      `expected the refreshed total ${after.length} in:\n${text}`,
    )
    assert.match(text, /^in-progress\s+3\s+[█▌]+$/m, `expected the refreshed in-progress count in:\n${text}`)
    assert.match(text, /^tasks\s+3\/8$/m, `expected the refreshed task total in:\n${text}`)
    assert.ok(isColumnAligned(sidebar), `expected the refreshed rows to stay aligned:\n${text}`)
  } finally {
    await provider.close()
    await project.dispose()
  }
})
