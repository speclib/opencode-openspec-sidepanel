import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const plugin = join(root, ".opencode", "plugins", "openspec-stats")

test("server and TUI entrypoints use the OpenCode v2 plugin API", async () => {
  const index = await readFile(join(plugin, "index.ts"), "utf8")
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.match(index, /from "@opencode\/plugin"/)
  assert.match(tui, /from "@opencode\/plugin\/tui"/)
  assert.match(index, /Plugin\.define/)
  assert.match(tui, /Plugin\.define/)
  assert.match(index, /openspec\.stats/)
  assert.match(tui, /openspec\.stats/)
})

test("TUI registers the sidebar and panel slots", async () => {
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.match(tui, /sidebar\.content/)
  assert.match(tui, /session\.panel/)
  assert.match(tui, /registerSidebar/)
  assert.match(tui, /PANEL_NAME/)
  assert.match(tui, /OPENSPEC/)
})

test("TUI uses theme tokens and no hard-coded colors", async () => {
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.match(tui, /context\.theme\.text\.base/)
  assert.match(tui, /context\.theme\.text\.muted/)
  assert.doesNotMatch(tui, /fg="/)
  assert.doesNotMatch(tui, /#[0-9a-fA-F]{3,8}\b/)
})

test("plugin avoids OpenCode V1 syntax", async () => {
  const index = await readFile(join(plugin, "index.ts"), "utf8")
  const tui = await readFile(join(plugin, "tui.tsx"), "utf8")
  assert.doesNotMatch(index, /@opencode-ai\/plugin/)
  assert.doesNotMatch(tui, /@opencode-ai\/plugin/)
})

test("panel command is bound to leader o", async () => {
  const setup = await readFile(join(plugin, "setup.ts"), "utf8")
  assert.match(setup, /PANEL_BIND = "<leader>o"/)
  assert.match(setup, /openspec\.stats\.panel/)
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
