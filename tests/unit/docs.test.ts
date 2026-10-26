import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const readme = await readFile(join(root, "README.md"), "utf8")

test("README documents the operator workflow", () => {
  for (const heading of [
    "## Prerequisites",
    "## Install",
    "## Development",
    "## Testing",
    "## Packaging",
  ]) {
    assert.ok(readme.includes(heading), `missing ${heading}`)
  }
  for (const command of [
    "npm test",
    "npm run test:e2e",
    "npm run typecheck",
    "npm run test:package",
    "nix flake check",
    "nix build",
  ]) {
    assert.ok(readme.includes(command), `missing command ${command}`)
  }
})

test("README describes the shipped sidebar and panel", () => {
  for (const token of [
    "OPENSPEC",
    "3 active changes",
    "in-progress",
    "complete",
    "tasks",
    "specs",
    "requirements",
    "archived",
    "<leader>o",
    "unavailable",
  ]) {
    assert.ok(readme.includes(token), `missing ${token}`)
  }
})

test("README no longer describes the pre-PoC state", () => {
  assert.doesNotMatch(readme, /foundation is in place/)
  assert.doesNotMatch(readme, /once the e2e suite lands/)
  assert.doesNotMatch(readme, /are the next epics/)
})
