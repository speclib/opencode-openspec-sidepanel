## 1. Layout model

- [x] 1.1 Add `layout.ts` with the `Stats`, `ChangeStats`, `StatusCount`, `SectionLayout` and `Cell` types and a `statusRows` function sorted by count descending then name; verify a unit test covers both sort keys.
- [x] 1.2 Add `bar` and `completionBar` with 4-cell scaling, half blocks and a zero-maximum guard; verify a unit test covers 0, half, full and zero-maximum cases.
- [x] 1.3 Add `summaryRows`, `columnWidths` and the section and breakdown layout builders; verify a unit test checks aligned columns and the `tasks 52/228` value.
- [x] 1.4 Add `truncate` with a 24-character limit and `...`; verify a unit test covers an exact-length name and a longer one.

## 2. Setup and panel

- [x] 2.1 Add `setup.ts` with `createDisposables`, `registerSidebar`, the panel name, the command id and the `<leader>o` bind; verify unit tests cover disposal order, registration and the command payload.

## 3. TUI

- [x] 3.1 Replace the placeholder `tui.tsx` with the `OPENSPEC` section, the total line, the status rows, the summary lines and the empty stats fixture; verify the layout unit tests pass.
- [x] 3.2 Add the `session.panel` registration and the keymap layer opening the panel; verify a unit test asserts both slots and the command are registered.
- [x] 3.3 Use theme tokens for every text color; verify a unit test finds no hard-coded colors and no V1 imports.

## 4. Verification and archive

- [x] 4.1 Run `npm test`, `npm run typecheck`, `nix flake check` and `nix build`; verify all pass.
- [ ] 4.2 Archive the change, sync the specs, update the epic bean with a summary and commit as Pim Snel.
