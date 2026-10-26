import type { ChangeStats, Stats, StatusCount } from "./layout.ts"

export const CACHE_KEY = "openspec.stats.cache"

export interface CacheState {
  [directory: string]: Stats
}

export interface CachePort {
  read(directory: string): Stats | undefined
  write(directory: string, stats: Stats): void
}

export interface Cache {
  seed(): Stats | null
  save(stats: Stats): void
}

export function createCache(port: CachePort, directory: string): Cache {
  return {
    seed: () => decodeStats(port.read(directory)),
    save: (stats) => port.write(directory, toSnapshot(stats)),
  }
}

export function decodeStats(value: unknown): Stats | null {
  if (!isRecord(value)) {
    return null
  }
  if (!Array.isArray(value.changes) || !Array.isArray(value.statuses)) {
    return null
  }
  const changes: ChangeStats[] = []
  for (const entry of value.changes) {
    const change = decodeChange(entry)
    if (change === null) {
      return null
    }
    changes.push(change)
  }
  const statuses: StatusCount[] = []
  for (const entry of value.statuses) {
    const status = decodeStatus(entry)
    if (status === null) {
      return null
    }
    statuses.push(status)
  }
  if (
    !isCount(value.completedTasks) ||
    !isCount(value.totalTasks) ||
    !isCount(value.specs) ||
    !isCount(value.requirements) ||
    !isCount(value.archived)
  ) {
    return null
  }
  return {
    changes,
    statuses,
    completedTasks: value.completedTasks,
    totalTasks: value.totalTasks,
    specs: value.specs,
    requirements: value.requirements,
    archived: value.archived,
  }
}

export function toSnapshot(stats: Stats): Stats {
  return {
    changes: stats.changes.map((change) => ({ ...change })),
    statuses: stats.statuses.map((status) => ({ ...status })),
    completedTasks: stats.completedTasks,
    totalTasks: stats.totalTasks,
    specs: stats.specs,
    requirements: stats.requirements,
    archived: stats.archived,
  }
}

function decodeChange(value: unknown): ChangeStats | null {
  if (!isRecord(value)) {
    return null
  }
  if (
    typeof value.name !== "string" ||
    typeof value.status !== "string" ||
    typeof value.lastModified !== "string" ||
    !isCount(value.completedTasks) ||
    !isCount(value.totalTasks)
  ) {
    return null
  }
  return {
    name: value.name,
    status: value.status,
    completedTasks: value.completedTasks,
    totalTasks: value.totalTasks,
    lastModified: value.lastModified,
  }
}

function decodeStatus(value: unknown): StatusCount | null {
  if (!isRecord(value) || typeof value.status !== "string" || !isCount(value.count)) {
    return null
  }
  return { status: value.status, count: value.count }
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
