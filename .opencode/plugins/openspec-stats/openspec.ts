import { execFile } from "node:child_process"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { type ChangeStats, type Stats, type StatusCount } from "./layout.ts"

export const OPENS_SPEC_BIN = "openspec"
export const DEFAULT_TIMEOUT_MS = 5_000
export const MAX_BUFFER = 8 * 1024 * 1024

export interface SpecStats {
  readonly id: string
  readonly requirementCount: number
}

export interface ExecOptions {
  readonly cwd: string
  readonly signal: AbortSignal | undefined
  readonly timeout: number
  readonly maxBuffer: number
}

export type Exec = (
  command: string,
  args: readonly string[],
  options: ExecOptions,
) => Promise<string>

export interface LoadOptions {
  readonly signal?: AbortSignal
  readonly exec?: Exec
  readonly readArchive?: (root: string) => Promise<number>
  readonly timeoutMs?: number
  readonly maxBuffer?: number
}

export class OpenspecUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "OpenspecUnavailableError"
  }
}

export function parseChanges(raw: string): {
  readonly root: string | null
  readonly changes: readonly ChangeStats[]
} {
  const parsed = parseObject(raw)
  const root = parseRoot(parsed.root)
  if (!Array.isArray(parsed.changes)) {
    throw new OpenspecUnavailableError("invalid changes payload")
  }
  return {
    root,
    changes: parsed.changes.map((entry, index) => parseChange(entry, index)),
  }
}

export function parseSpecs(raw: string): {
  readonly root: string | null
  readonly specs: readonly SpecStats[]
} {
  const parsed = parseObject(raw)
  const root = parseRoot(parsed.root)
  if (!Array.isArray(parsed.specs)) {
    throw new OpenspecUnavailableError("invalid specs payload")
  }
  return {
    root,
    specs: parsed.specs.map((entry, index) => parseSpec(entry, index)),
  }
}

export async function loadStats(directory: string, options: LoadOptions = {}): Promise<Stats> {
  const exec = options.exec ?? runOpenspec
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxBuffer = options.maxBuffer ?? MAX_BUFFER
  const readArchive = options.readArchive ?? countArchived
  const run = async (args: readonly string[]) => {
    try {
      return await exec(OPENS_SPEC_BIN, args, {
        cwd: directory,
        signal: options.signal,
        timeout,
        maxBuffer,
      })
    } catch (error) {
      if (error instanceof OpenspecUnavailableError) {
        throw error
      }
      throw new OpenspecUnavailableError(`openspec ${args.join(" ")} failed`, {
        cause: error,
      })
    }
  }

  const changeResult = parseChanges(await run(["list", "--json"]))
  if (changeResult.root === null) {
    throw new OpenspecUnavailableError("no OpenSpec root")
  }

  const specResult = parseSpecs(await run(["list", "--specs", "--json"]))
  if (specResult.root !== changeResult.root) {
    throw new OpenspecUnavailableError("OpenSpec root changed between queries")
  }

  let archived: number
  try {
    archived = await readArchive(changeResult.root)
  } catch (error) {
    if (error instanceof OpenspecUnavailableError) {
      throw error
    }
    throw new OpenspecUnavailableError("cannot count archived changes", { cause: error })
  }
  return aggregate(changeResult.changes, specResult.specs, archived)
}

export function aggregate(
  changes: readonly ChangeStats[],
  specs: readonly SpecStats[],
  archived: number,
): Stats {
  const counts = new Map<string, number>()
  let completedTasks = 0
  let totalTasks = 0

  for (const change of changes) {
    counts.set(change.status, (counts.get(change.status) ?? 0) + 1)
    completedTasks += change.completedTasks
    totalTasks += change.totalTasks
  }

  const statuses: StatusCount[] = [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status))

  return {
    changes,
    statuses,
    completedTasks,
    totalTasks,
    specs: specs.length,
    requirements: specs.reduce((total, spec) => total + spec.requirementCount, 0),
    archived,
  }
}

export async function countArchived(root: string): Promise<number> {
  const archive = join(root, "openspec", "changes", "archive")
  try {
    const entries = await readdir(archive, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory()).length
  } catch (error) {
    if (hasCode(error, "ENOENT")) {
      return 0
    }
    throw new OpenspecUnavailableError("cannot read the archive directory", { cause: error })
  }
}

function runOpenspec(
  command: string,
  args: readonly string[],
  options: ExecOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      [...args],
      {
        cwd: options.cwd,
        timeout: options.timeout,
        maxBuffer: options.maxBuffer,
        encoding: "utf8",
        ...(options.signal ? { signal: options.signal } : {}),
      },
      (error, stdout) => {
        if (error) {
          reject(
            new OpenspecUnavailableError(`openspec ${args.join(" ")} failed`, {
              cause: error,
            }),
          )
          return
        }
        resolve(stdout)
      },
    )
  })
}

function parseObject(raw: string): Record<string, unknown> {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    throw new OpenspecUnavailableError("invalid JSON from openspec", { cause: error })
  }
  if (!isRecord(value)) {
    throw new OpenspecUnavailableError("openspec returned a non-object payload")
  }
  return value
}

function parseRoot(value: unknown): string | null {
  if (value === null) {
    return null
  }
  if (!isRecord(value)) {
    throw new OpenspecUnavailableError("invalid root in openspec payload")
  }
  return requireString(value.path, "root.path")
}

function parseChange(value: unknown, index: number): ChangeStats {
  if (!isRecord(value)) {
    throw new OpenspecUnavailableError(`invalid change at index ${index}`)
  }
  return {
    name: requireString(value.name, `changes[${index}].name`),
    status: requireString(value.status, `changes[${index}].status`),
    completedTasks: requireCount(value.completedTasks, `changes[${index}].completedTasks`),
    totalTasks: requireCount(value.totalTasks, `changes[${index}].totalTasks`),
    lastModified: requireString(value.lastModified, `changes[${index}].lastModified`),
  }
}

function parseSpec(value: unknown, index: number): SpecStats {
  if (!isRecord(value)) {
    throw new OpenspecUnavailableError(`invalid spec at index ${index}`)
  }
  return {
    id: requireString(value.id, `specs[${index}].id`),
    requirementCount: requireCount(value.requirementCount, `specs[${index}].requirementCount`),
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new OpenspecUnavailableError(`invalid ${field}`)
  }
  return value
}

function requireCount(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new OpenspecUnavailableError(`invalid ${field}`)
  }
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasCode(error: unknown, code: string): boolean {
  return isRecord(error) && error.code === code
}
