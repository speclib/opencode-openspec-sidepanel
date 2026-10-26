## 1. Flake skeleton

- [x] 1.1 Add `flake.nix` with nixpkgs as the only input, the four supported systems listed explicitly and `nixpkgs.lib.genAttrs` producing `devShells.default`, `packages.default`, `checks.default` and `formatter`; verify `nix flake show` lists all four systems.
- [x] 1.2 Add `tests/unit/flake.test.ts` asserting the system list, the absence of a flake-utils input and the four output names; verify `node --test tests/unit/flake.test.ts` passes.
- [x] 1.3 Run `nix flake lock` and commit `flake.lock`; verify a second `nix flake check` runs without changing the lock.

## 2. Nix modules

- [x] 2.1 Add `nix/package.nix` that copies `.opencode/plugins/openspec-stats` into `$out/plugins/`; verify `nix build` produces `result/plugins/openspec-stats/`.
- [x] 2.2 Add `nix/checks.nix` that runs the unit and integration suites with Node 24 in a pure sandbox; verify `nix flake check` passes and the log shows the tests running.
- [x] 2.3 Add `nix/devshell.nix` with Node 24, python3, jujutsu, git and nixfmt; verify `nix develop --command sh -c 'node --version && command -v python3 jj git nixfmt'` succeeds.

## 3. Plugin placeholder

- [x] 3.1 Add a minimal `.opencode/plugins/openspec-stats/index.ts` and `tui.tsx` that load without errors and register no visible section; verify `nix build` contains both files.
- [x] 3.2 Add a unit test asserting the packaged entrypoints exist and the TUI does not yet register a sidebar section; verify the test fails when either file is removed.

## 4. Node tooling

- [x] 4.1 Add `package.json` with the package metadata, exports, `test`, `test:e2e` and `typecheck` scripts and the proven dependency versions; verify `npm install` succeeds.
- [x] 4.2 Add `tsconfig.json` matching the sibling project, including the plugin, tests and e2e directories; verify `npm run typecheck` passes with the placeholder.
- [x] 4.3 Add `.gitignore` entries for `node_modules/`, `result`, `result-*`, direnv files and logs; verify `git status` does not show `node_modules` or `result`.

## 5. Verification and archive

- [x] 5.1 Run `npm test` and `npm run typecheck`; verify both pass.
- [x] 5.2 Run `nix flake check` and `nix build`; verify both pass and the output layout matches the spec.
- [x] 5.3 Update `README.md` to reflect the working foundation commands; verify the commands in the README match `package.json` and the flake.
- [ ] 5.4 Archive the change, sync the specs, update the epic bean with a summary and commit as Pim Snel.
