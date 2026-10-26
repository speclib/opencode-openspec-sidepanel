import assert from "node:assert/strict"
import { test } from "node:test"
import { checkPrerequisites, skipReason } from "./helpers/env.ts"
import {
  FIXTURE_ARCHIVED,
  FIXTURE_COMPLETED_TASKS,
  FIXTURE_REQUIREMENTS,
  FIXTURE_SPECS,
  FIXTURE_STATUSES,
  FIXTURE_TOTAL_CHANGES,
  FIXTURE_TOTAL_TASKS,
  countArchived,
  createE2eProject,
  listChanges,
  listSpecs,
} from "./helpers/project.ts"
import { capturePty } from "./helpers/pty.ts"
import { isColumnAligned, renderScreen, sidebarRegion } from "./helpers/screen.ts"
import { importSession, newSessionId } from "./helpers/session.ts"

const skip = skipReason(await checkPrerequisites())

const columns = 160
const rows = 45

test("the sidebar shows the OpenSpec counts from the fixture", { skip }, async () => {
  const project = await createE2eProject()
  try {
    const sessionId = newSessionId()
    await importSession(project, sessionId)

    const capture = await capturePty({
      cwd: project.dir,
      env: project.env,
      command: ["opencode", "--standalone", "--session", sessionId],
      cols: columns,
      rows,
    })

    const screen = renderScreen(capture, columns, rows)
    const sidebar = sidebarRegion(screen, "OPENSPEC")
    assert.ok(sidebar.length > 0, `the OPENSPEC header was not rendered:\n${screen.join("\n")}`)
    const text = sidebar.join("\n")

    const cliChanges = await listChanges(project.dir)
    const cliSpecs = await listSpecs(project.dir)
    const cliArchived = await countArchived(project.dir)

    assert.equal(cliChanges.length, FIXTURE_TOTAL_CHANGES)
    assert.equal(cliSpecs.length, FIXTURE_SPECS)
    assert.equal(cliSpecs.reduce((sum, spec) => sum + spec.requirementCount, 0), FIXTURE_REQUIREMENTS)
    assert.equal(cliArchived, FIXTURE_ARCHIVED)

    assert.match(text, new RegExp(`\\b${cliChanges.length} active changes\\b`), text)
    for (const status of FIXTURE_STATUSES) {
      const count = cliChanges.filter((change) => change.status === status.status).length
      assert.equal(count, status.count)
      assert.match(text, new RegExp(`^${status.status}\\s+${count}\\s+[█▌]+$`, "m"), text)
    }

    const completedTasks = cliChanges.reduce((sum, change) => sum + change.completedTasks, 0)
    const totalTasks = cliChanges.reduce((sum, change) => sum + change.totalTasks, 0)
    assert.equal(completedTasks, FIXTURE_COMPLETED_TASKS)
    assert.equal(totalTasks, FIXTURE_TOTAL_TASKS)

    assert.match(text, new RegExp(`^tasks\\s+${completedTasks}/${totalTasks}$`, "m"), text)
    assert.match(text, new RegExp(`^specs\\s+${cliSpecs.length}$`, "m"), text)
    assert.match(
      text,
      new RegExp(`^requirements\\s+${cliSpecs.reduce((sum, spec) => sum + spec.requirementCount, 0)}$`, "m"),
      text,
    )
    assert.match(text, new RegExp(`^archived\\s+${cliArchived}$`, "m"), text)

    assert.ok(isColumnAligned(sidebar), `expected the sidebar rows to be aligned:\n${text}`)
    const totalIndex = sidebar.findIndex((line) => /^\d+ active changes\b/.test(line))
    assert.ok(totalIndex >= 0, `expected the total line in:\n${text}`)
    assert.equal(sidebar[totalIndex + 1]?.trim(), "", `expected a blank line after the total in:\n${text}`)
  } finally {
    await project.dispose()
  }
})
