import assert from "node:assert/strict"
import test from "node:test"
import {
  PANEL_BIND,
  PANEL_COMMAND_ID,
  PANEL_NAME,
  createDisposables,
  panelCommand,
  registerSidebar,
} from "../../.opencode/plugins/openspec-stats/setup.ts"

test("disposables run in reverse order and only once", () => {
  const order: string[] = []
  const bag = createDisposables()
  bag.add(() => order.push("first"))
  bag.add(() => order.push("second"))
  bag.dispose()
  bag.dispose()
  bag.add(() => order.push("late"))
  assert.deepEqual(order, ["second", "first", "late"])
})

test("registerSidebar forwards the claim and returns an unregister function", () => {
  const claims: unknown[] = []
  let unregistered = 0
  const host = {
    ui: {
      slot: (claim: unknown) => {
        claims.push(claim)
        return () => {
          unregistered += 1
        }
      },
    },
  }
  const claim = { append: "sidebar.content" }
  const unregister = registerSidebar(host, claim)
  unregister()
  assert.deepEqual(claims, [claim])
  assert.equal(unregistered, 1)
})

test("panel command opens the OpenSpec panel from the leader bind", () => {
  const opened: string[] = []
  const command = panelCommand((name) => opened.push(name))
  assert.equal(command.id, PANEL_COMMAND_ID)
  assert.equal(command.bind, PANEL_BIND)
  assert.equal(command.bind, "<leader>o")
  assert.equal(command.group, "OpenSpec")
  assert.ok(command.title.length > 0)
  assert.ok(command.description.length > 0)
  command.run()
  assert.deepEqual(opened, [PANEL_NAME])
  assert.equal(PANEL_NAME, "openspec-stats")
})
