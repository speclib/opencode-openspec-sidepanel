import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

test("package derivation copies the complete plugin directory", async () => {
  const derivation = await readFile(join(root, "nix", "package.nix"), "utf8")
  assert.match(derivation, /mkdir -p \$out\/plugins/)
  assert.match(derivation, /cp -r \.opencode\/plugins\/openspec-stats \$out\/plugins\//)
})

test("flake exposes the package through packages.default", async () => {
  const flake = await readFile(join(root, "flake.nix"), "utf8")
  assert.match(flake, /packages = each/)
  assert.match(flake, /callPackage \.\/nix\/package\.nix \{ inherit src; \}/)
})

test("npm package publishes the plugin directory and both entrypoints", async () => {
  const raw = await readFile(join(root, "package.json"), "utf8")
  const pkg = JSON.parse(raw) as {
    files: string[]
    exports: Record<string, string>
    scripts: Record<string, string>
  }
  assert.deepEqual(pkg.files, [".opencode/plugins/openspec-stats"])
  assert.equal(pkg.exports["."], "./.opencode/plugins/openspec-stats/index.ts")
  assert.equal(pkg.exports["./tui"], "./.opencode/plugins/openspec-stats/tui.tsx")
  assert.equal(pkg.scripts["test:package"], "node scripts/verify-package.mjs")
})
