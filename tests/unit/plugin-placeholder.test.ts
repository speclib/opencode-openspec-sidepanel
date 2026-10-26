import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const plugin = join(root, ".opencode", "plugins", "openspec-stats")

test("server and TUI entrypoints exist", async () => {
  const index = await readFile(join(plugin, "index.ts"), "utf8")
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.match(index, /Plugin\.define/)
  assert.match(tui, /Plugin\.define/)
  assert.match(index, /openspec\.stats/)
  assert.match(tui, /openspec\.stats/)
})

test("placeholder TUI does not register a sidebar section", async () => {
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.doesNotMatch(tui, /sidebar\.content/)
  assert.doesNotMatch(tui, /session\.panel/)
})

test("package exports point at the plugin entrypoints", async () => {
  const raw = await readFile(join(root, "package.json"), "utf8")
  const pkg = JSON.parse(raw) as {
    exports: Record<string, string>
    files: string[]
  }
  assert.equal(pkg.exports["."], "./.opencode/plugins/openspec-stats/index.ts")
  assert.equal(pkg.exports["./tui"], "./.opencode/plugins/openspec-stats/tui.tsx")
  assert.deepEqual(pkg.files, [".opencode/plugins/openspec-stats"])
})
