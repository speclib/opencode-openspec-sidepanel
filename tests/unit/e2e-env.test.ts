import assert from "node:assert/strict"
import test from "node:test"
import { skipReason, type Prerequisites } from "../../e2e/helpers/env.ts"

const complete: Prerequisites = { opencode: true, python: true, dependencies: true }

test("skipReason returns false when every prerequisite is present", () => {
  assert.equal(skipReason(complete), false)
})

test("skipReason names a missing opencode", () => {
  assert.equal(skipReason({ ...complete, opencode: false }), "opencode is not available")
})

test("skipReason names a missing python3", () => {
  assert.equal(skipReason({ ...complete, python: false }), "python3 is not available")
})

test("skipReason names missing plugin dependencies", () => {
  assert.equal(
    skipReason({ ...complete, dependencies: false }),
    "plugin dependencies are not installed (run npm install)",
  )
})
