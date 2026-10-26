import { execFile } from "node:child_process"
import { access } from "node:fs/promises"
import { join } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)
const root = process.cwd()
const plugin = join(root, "result", "plugins", "openspec-stats")
const expected = [
  "index.ts",
  "layout.ts",
  "setup.ts",
  "tui.tsx",
  "openspec.ts",
  "cache.ts",
  "refresh.ts",
]

await run("nix", ["build"], { cwd: root, maxBuffer: 64 * 1024 * 1024 })

const missing = []
for (const file of expected) {
  try {
    await access(join(plugin, file))
  } catch {
    missing.push(file)
  }
}

if (missing.length > 0) {
  console.error(`missing plugin files in ${plugin}: ${missing.join(", ")}`)
  process.exit(1)
}

console.log(`verified ${expected.length} plugin files in ${plugin}`)
