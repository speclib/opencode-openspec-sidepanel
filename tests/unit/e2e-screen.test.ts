import assert from "node:assert/strict"
import test from "node:test"
import { isColumnAligned, renderScreen, sidebarRegion } from "../../e2e/helpers/screen.ts"

test("renderScreen writes plain text", () => {
  const lines = renderScreen("hello", 10, 2)
  assert.equal(lines[0], "hello")
  assert.equal(lines[1], "")
})

test("renderScreen applies cursor positioning", () => {
  const lines = renderScreen("a\u001b[2;3Hb", 10, 2)
  assert.equal(lines[0], "a")
  assert.equal(lines[1], "  b")
})

test("renderScreen clears to the end of the line", () => {
  const lines = renderScreen("abc\r\u001b[K", 10, 1)
  assert.equal(lines[0], "")
})

test("sidebarRegion slices from the header column", () => {
  const region = sidebarRegion(["x OPENSPEC", "x 3 active changes"], "OPENSPEC")
  assert.deepEqual(region, ["OPENSPEC", "3 active changes"])
})

test("sidebarRegion returns nothing without a header", () => {
  assert.deepEqual(sidebarRegion(["no header here"], "OPENSPEC"), [])
})

test("isColumnAligned accepts fixed count and bar columns", () => {
  const lines = ["in-progress  2  ████", "complete     1  ██"]
  assert.equal(isColumnAligned(lines), true)
})

test("isColumnAligned rejects ragged rows", () => {
  const lines = ["in-progress 2 ████", "complete 1 ██"]
  assert.equal(isColumnAligned(lines), false)
})
