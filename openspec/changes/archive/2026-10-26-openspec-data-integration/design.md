## Context

`layout.ts` already renders a pure `Stats` object and the TUI still seeds an
empty fixture. This change fills that object from the `openspec` CLI and keeps it
current. See `proposal.md` and `specs/openspec-stats/spec.md`.

The sibling project `/home/pim/gh.mipmip/opencode-beans` proves the process,
refresh and cache pattern. Its beans parser is replaced by the OpenSpec payload
shape.

## Goals / Non-Goals

**Goals:**

- One data layer that turns the CLI output into `Stats`.
- One failure path: any problem becomes `unavailable`.
- A refresh loop that never applies an older result over a newer one.
- A cache that survives restarts and is validated on read.

**Non-Goals:**

- End to end terminal tests.
- Writing to `openspec/`.
- Supporting registered stores or a remote server.

## Decisions

### Two commands, one root

`openspec list --json` supplies both the changes and `root.path`. The loader runs
it first, stops when the root is null, and only then runs
`openspec list --specs --json`. The second command must report the same root, or
the load fails. This avoids mixing data from two projects during a directory
change.

### Validate every field at the boundary

The CLI is an external process. Each payload is checked for the expected object,
array and field types before it reaches the layout. Invalid data becomes
`OpenspecUnavailableError`, not a partial `Stats` with `NaN` or `undefined`.

### Injection for tests

`loadStats` accepts an `exec` function, a `readArchive` function, a timeout and a
buffer size. Production uses `execFile` from `node:child_process` with a 5 second
timeout and an 8 MB buffer. Tests use a fake exec, so parsing and failure mapping
need no process. One integration test uses the real CLI.

### Archive count from the filesystem

Archived changes are not in `openspec list`. `countArchived` reads
`<root>/openspec/changes/archive` with `readdir` and counts directories. A
missing archive directory means zero. Any other read error means unavailable.

### Refresher with abort

`createRefresher` keeps the current `AbortController`. A new refresh aborts the
previous one. A result or error is only applied when it belongs to the current
controller and the refresher has not been disposed. Disposal aborts the pending
load and clears the reference.

### Cache behind a small port

`createCache` takes a read/write port and a directory. `decodeStats` validates
unknown stored data before it is painted. `toSnapshot` copies the object so the
storage layer cannot mutate the live signals. The TUI binds the port to
`context.storage.store<CacheState>(CACHE_KEY, { initial: {} })`.

### TUI wiring

The TUI seeds the cache, starts one refresh immediately, subscribes to
`session.execution.succeeded`, sets a 30 second interval, and disposes both the
timer and the refresher. On success it clears the error, sets the stats and saves
the cache. On failure it clears the stats and sets `unavailable`.

## Risks / Trade-offs

- [A slow CLI blocks a refresh] -> The 5 second timeout kills it and the section
  shows `unavailable`; the next turn or timer retries.
- [The cache shows stale data briefly] -> It is replaced by the first successful
  load, and failures show `unavailable` rather than the stale snapshot.
- [The CLI schema changes] -> Validation fails closed to `unavailable`, and the
  integration test catches the change.
- [Archive counting drifts from the CLI] -> The count is defined as archive
  directories, which matches what `openspec archive` creates.
