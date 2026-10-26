import { execFile } from "node:child_process"
import { cp, mkdir, mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { createIsolatedDirs, isolatedEnv, repoRoot, type IsolatedDirs } from "./env.ts"
import { MOCK_API_KEY_ENV, MOCK_PROVIDER_ID } from "./mock-provider.ts"

const run = promisify(execFile)

export const FIXTURE_TOTAL_CHANGES = 3
export const FIXTURE_COMPLETED_TASKS = 3
export const FIXTURE_TOTAL_TASKS = 7
export const FIXTURE_SPECS = 2
export const FIXTURE_REQUIREMENTS = 5
export const FIXTURE_ARCHIVED = 9

export const FIXTURE_STATUSES: ReadonlyArray<{ status: string; count: number }> = [
  { status: "in-progress", count: 2 },
  { status: "complete", count: 1 },
]

type ChangeFixture = {
  name: string
  checked: number
  total: number
}

const changes: readonly ChangeFixture[] = [
  { name: "alpha-change", checked: 1, total: 3 },
  { name: "beta-change", checked: 0, total: 2 },
  { name: "gamma-change", checked: 2, total: 2 },
]

const specs: ReadonlyArray<{ id: string; requirements: number }> = [
  { id: "demo", requirements: 2 },
  { id: "other", requirements: 3 },
]

export type E2eProject = {
  dir: string
  dirs: IsolatedDirs
  env: NodeJS.ProcessEnv
  dispose: () => Promise<void>
}

export type E2eProjectOptions = {
  tracker?: boolean
  provider?: { baseURL: string; model: string }
}

export async function createE2eProject(options: E2eProjectOptions = {}): Promise<E2eProject> {
  const dir = await mkdtemp(join(tmpdir(), "opencode-openspec-e2e-"))
  const dirs = await createIsolatedDirs(dir)

  if (options.tracker !== false) {
    await seedOpenSpec(dir)
  }

  await mkdir(join(dir, ".opencode", "plugins"), { recursive: true })
  await cp(
    join(repoRoot, ".opencode", "plugins", "openspec-stats"),
    join(dir, ".opencode", "plugins", "openspec-stats"),
    { recursive: true },
  )
  await symlink(join(repoRoot, "node_modules"), join(dir, "node_modules"), "dir")

  const env = isolatedEnv(dirs)
  if (options.provider) {
    env[MOCK_API_KEY_ENV] = "e2e"
    await writeFile(
      join(dir, "opencode.jsonc"),
      JSON.stringify(providerConfig(options.provider.baseURL, options.provider.model), null, 2),
    )
  }

  return {
    dir,
    dirs,
    env,
    dispose: () => rm(dir, { recursive: true, force: true }),
  }
}

async function seedOpenSpec(dir: string): Promise<void> {
  await run("openspec", ["init", "--tools", "none", "--no-animation"], { cwd: dir })

  for (const change of changes) {
    await run("openspec", ["new", "change", change.name], { cwd: dir })
    await writeFile(
      join(dir, "openspec", "changes", change.name, "tasks.md"),
      tasksDocument(change.checked, change.total),
    )
  }

  for (const spec of specs) {
    const specDir = join(dir, "openspec", "specs", spec.id)
    await mkdir(specDir, { recursive: true })
    await writeFile(join(specDir, "spec.md"), specDocument(spec.id, spec.requirements))
  }

  for (let index = 1; index <= FIXTURE_ARCHIVED; index += 1) {
    await mkdir(
      join(dir, "openspec", "changes", "archive", `2026-01-${String(index).padStart(2, "0")}-archived-${index}`),
      { recursive: true },
    )
  }
}

function tasksDocument(checked: number, total: number): string {
  const lines = ["# Tasks", "", "## 1. Work", ""]
  for (let index = 1; index <= total; index += 1) {
    const mark = index <= checked ? "x" : " "
    lines.push(`- [${mark}] 1.${index} Task ${index}`)
  }
  lines.push("")
  return lines.join("\n")
}

function specDocument(id: string, requirements: number): string {
  const lines = [`# ${id} Specification`, "", "## Purpose", "", `The ${id} capability.`, ""]
  lines.push("## Requirements", "")
  for (let index = 1; index <= requirements; index += 1) {
    lines.push(`### Requirement: ${id} requirement ${index}`, "")
    lines.push(`The system SHALL satisfy ${id} requirement ${index}.`, "")
    lines.push(`#### Scenario: ${id} scenario ${index}`, "")
    lines.push("- **WHEN** the requirement applies")
    lines.push("- **THEN** it holds")
    lines.push("")
  }
  return lines.join("\n")
}

function providerConfig(baseURL: string, model: string): Record<string, unknown> {
  const modelID = model.split("/")[1] ?? model
  return {
    $schema: "https://opencode.ai/config.json",
    model,
    providers: {
      [MOCK_PROVIDER_ID]: {
        name: "End to end provider",
        env: [MOCK_API_KEY_ENV],
        package: "@opencode/ai/providers/openai-compatible",
        settings: { baseURL },
        models: { [modelID]: { name: "End to end model", capabilities: { tools: false } } },
      },
    },
  }
}

export async function listChanges(dir: string): Promise<Array<{ name: string; status: string; completedTasks: number; totalTasks: number }>> {
  const { stdout } = await run("openspec", ["list", "--json"], { cwd: dir })
  return JSON.parse(stdout).changes
}

export async function listSpecs(dir: string): Promise<Array<{ id: string; requirementCount: number }>> {
  const { stdout } = await run("openspec", ["list", "--specs", "--json"], { cwd: dir })
  return JSON.parse(stdout).specs
}

export async function countArchived(dir: string): Promise<number> {
  const entries = await readdir(join(dir, "openspec", "changes", "archive"), { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).length
}
