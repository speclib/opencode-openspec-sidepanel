import assert from "node:assert/strict"
import test from "node:test"
import { createRefresher } from "../../.opencode/plugins/openspec-stats/refresh.ts"

interface Deferred<T> {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
  readonly reject: (reason?: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test("only the newest load settles after overlapping refreshes", async () => {
  const first = deferred<string>()
  const second = deferred<string>()
  const values: string[] = []
  let loads = 0
  const refresher = createRefresher<string>({
    load: () => {
      loads += 1
      return loads === 1 ? first.promise : second.promise
    },
    onValue: (value) => values.push(value),
    onError: () => {},
  })

  const firstRun = refresher.refresh()
  const secondRun = refresher.refresh()
  first.resolve("old")
  await firstRun
  assert.deepEqual(values, [])
  second.resolve("new")
  await secondRun
  assert.deepEqual(values, ["new"])
})

test("dispose aborts the pending load and drops its value", async () => {
  const pending = deferred<string>()
  const values: string[] = []
  let signal: AbortSignal | undefined
  const refresher = createRefresher<string>({
    load: (nextSignal) => {
      signal = nextSignal
      return pending.promise
    },
    onValue: (value) => values.push(value),
    onError: () => {},
  })

  const run = refresher.refresh()
  refresher.dispose()
  assert.equal(signal?.aborted, true)
  pending.resolve("late")
  await run
  assert.deepEqual(values, [])
})

test("a load error reaches onError", async () => {
  const failure = deferred<string>()
  const errors: unknown[] = []
  const refresher = createRefresher<string>({
    load: () => failure.promise,
    onValue: () => {},
    onError: (error) => errors.push(error),
  })

  const run = refresher.refresh()
  failure.reject(new Error("boom"))
  await run
  assert.equal(errors.length, 1)
  assert.equal((errors[0] as Error).message, "boom")
})

test("refresh does nothing after dispose", async () => {
  let loads = 0
  const refresher = createRefresher<string>({
    load: async () => {
      loads += 1
      return "value"
    },
    onValue: () => {},
    onError: () => {},
  })
  refresher.dispose()
  await refresher.refresh()
  assert.equal(loads, 0)
})
