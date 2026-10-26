# opencode-openspec-sidepanel

OpenCode v2 plugin that shows OpenSpec statistics in the sidebar of the current
repository.

Status: the foundation is in place. The sidebar and the OpenSpec data source
are the next epics. `AGENTS.md` is the operating manual and `BRIEFING.md` is
the product brief.

Target look:

```
OPENSPEC
3 active changes

in-progress      2  ████
complete         1  ██

tasks        52/228
specs            24
requirements    214
archived          9
```

The section refreshes after every assistant turn and on a fallback timer. When
the project has no OpenSpec root or the CLI fails, it shows a muted
`unavailable` line instead of crashing. The last counts are cached per project,
so a project that has been read before paints its counts immediately on startup.
A full breakdown opens in a session panel bound to `<leader>o`.

## Prerequisites

- OpenCode v2
- The `openspec` CLI on `PATH`
- Node 24 for development
- Nix with flakes for the build and the development shell

## Development

From a clean checkout:

```bash
nix develop          # Node 24, python3, jujutsu, nixfmt
npm install          # dependencies for the tests and the type check
npm test             # unit and integration tests
npm run test:e2e     # end to end tests, once the e2e suite lands
npm run typecheck    # TypeScript
nix flake check      # unit and integration tests in a pure sandbox
nix build            # assembled plugin in result/plugins/openspec-stats/
```

## Install

The plugin is discovered automatically from a project's
`.opencode/plugins/<name>/` directory. To use it in a project:

1. Make sure the project has been initialized with `openspec init`, so
   `openspec/config.yaml` exists at its root.
2. Copy the plugin directory into the project:

   ```bash
   mkdir -p .opencode/plugins
   cp -r /path/to/opencode-openspec-sidepanel/.opencode/plugins/openspec-stats \
     .opencode/plugins/
   ```

3. Start OpenCode in that project. Confirm the plugin loaded:

   ```bash
   opencode plugin list
   ```

The assembled plugin is also available from `nix build`.

## How work is organised

- Milestones and epics: beans. Milestone titles start with `01`, `02`, ...
- Epic internals: OpenSpec. One change per epic.
- Version control: jj, committed as Pim Snel.

See `AGENTS.md` for the full operating manual and `BRIEFING.md` for the product
goal.
