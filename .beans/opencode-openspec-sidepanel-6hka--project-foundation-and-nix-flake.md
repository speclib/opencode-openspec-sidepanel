---
# opencode-openspec-sidepanel-6hka
title: Project foundation and nix flake
status: completed
type: epic
priority: high
created_at: 2026-10-26T17:04:41Z
updated_at: 2026-10-26T17:48:56Z
parent: opencode-openspec-sidepanel-u505
---

Goal: make the repository buildable, testable and reproducible with plain nix flakes before any plugin behavior is written.

Deliverables:
- flake.nix listing x86_64-linux, aarch64-linux, x86_64-darwin and aarch64-darwin explicitly and merging them with nixpkgs.lib.genAttrs. nixpkgs is the only input; flake-utils is forbidden.
- nix/package.nix, nix/checks.nix and nix/devshell.nix as single-argument modules for callPackage.
- devShells.default with Node 24, python3, jujutsu, git and nixfmt.
- packages.default assembling the plugin directory, with a minimal placeholder entrypoint in .opencode/plugins/openspec-stats/ so nix build and tsc are green before the real plugin exists.
- checks.default running the unit and integration suite in a pure sandbox.
- package.json and tsconfig.json wired to node:test and tsc.
- .gitignore covering node_modules, result, direnv files and logs.
- tests/unit/flake.test.ts guarding the plain-flake invariants.

Definition of done:
- nix develop drops into a working shell.
- nix flake check passes.
- nix build produces the plugin output.
- The OpenSpec change is archived and committed as Pim Snel.

OpenSpec capability: project-foundation.


## Summary of Changes
- Added a plain nix flake with the four supported systems listed explicitly and merged with nixpkgs.lib.genAttrs. nixpkgs is the only input.
- Added nix/package.nix, nix/checks.nix and nix/devshell.nix. The dev shell ships Node 24, python3, jujutsu, git and nixfmt.
- Added package.json, tsconfig.json, package-lock.json and flake.lock with @opencode/plugin pinned to 2.0.31.
- Added placeholder server and TUI entrypoints so the package and the type check are green before the sidebar exists.
- Added flake and plugin placeholder unit tests.
- Verified npm test, npm run typecheck, nix flake check --offline, nix build and nix develop.
