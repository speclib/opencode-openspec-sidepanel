export interface Refresher<T> {
  refresh(): Promise<void>
  dispose(): void
}

export interface RefresherHandlers<T> {
  readonly load: (signal: AbortSignal) => Promise<T>
  readonly onValue: (value: T) => void
  readonly onError: (error: unknown) => void
}

export function createRefresher<T>(handlers: RefresherHandlers<T>): Refresher<T> {
  let current: AbortController | null = null
  let disposed = false

  return {
    async refresh() {
      if (disposed) {
        return
      }
      current?.abort()
      const controller = new AbortController()
      current = controller

      try {
        const value = await handlers.load(controller.signal)
        if (disposed || controller.signal.aborted || current !== controller) {
          return
        }
        handlers.onValue(value)
      } catch (error) {
        if (disposed || controller.signal.aborted || current !== controller) {
          return
        }
        handlers.onError(error)
      }
    },
    dispose() {
      disposed = true
      current?.abort()
      current = null
    },
  }
}
