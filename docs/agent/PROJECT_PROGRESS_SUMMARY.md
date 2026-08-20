# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/showcase-ui-entry-overlay`
- Current PR: pending draft PR creation
- PR #8 status: merged into `main` with squash commit `ca51454`.
- PR #10 status: merged into `main` with squash commit `8be060c`.
- PR #11 status: merged into `main` with squash commit `e8c5884`.
- PR #12 status: merged into `main` with squash commit `9955372`.
- PR #13 status: merged into `main` with squash commit `1877c21`.
- PR #14 status: merged into `main` with squash commit `d4ea1bd`.
- PR #15 status: merged into `main` with squash commit `eae8337`.
- PR #16 status: merged into `main` with squash commit `2165922`.
- PR #17 status: merged into `main` with squash commit `5d1a89b`.

## Completed Branches

| Branch | PR | Main commit | Status |
| --- | --- | --- | --- |
| `feature/project-baseline` | #1 | `2ce9e20` | Merged |
| `feature/game-engine-core` | #2 | `49f5eab` | Merged |
| `feature/combat-slot-machine` | #3 | `6edc91d` | Merged |
| `feature/combat-resolution` | #6 | `445265a` | Merged |
| `feature/build-reward-synergy` | #7 | `622f52f` | Merged |
| `feature/augment-slot-machine` | #8 | `ca51454` | Merged |
| `feature/content-effect-schema-pilot` | #10 | `8be060c` | Merged |
| `feature/ui-adapter-confirm-result` | #11 | `e8c5884` | Merged |
| `feature/ui-adapter-map-node` | #12 | `9955372` | Merged |
| `feature/ui-adapter-select-map-node` | #13 | `1877c21` | Merged |
| `feature/ui-adapter-node-type-routing` | #14 | `d4ea1bd` | Merged |
| `feature/ui-adapter-event-node-entry` | #15 | `eae8337` | Merged |
| `feature/ui-adapter-event-choice-command` | #16 | `2165922` | Merged |
| `feature/ui-adapter-showcase-slot-guard` | #17 | `5d1a89b` | Merged |

## Current Branch

`feature/showcase-ui-entry-overlay` is local and verified; draft PR creation is pending.

Implemented:

- Title screen now exposes a user-facing Showcase Mode button.
- The button dispatches the existing `START_SHOWCASE` command.
- `App` renders `ShowcaseOverlay` while `gameState.showcase.active` is true.
- Overlay next-step input continues through the existing `NEXT_SHOWCASE_STEP` command path.

Current branch commits:

- `f3422ca` - `docs: plan showcase ui entry overlay`
- `4846552` - `feat: wire showcase ui entry overlay`

## Verification

Latest verification on `feature/showcase-ui-entry-overlay`:

- Targeted `npm.cmd run test:run -- src/app/App.test.tsx`: failed first because the Showcase Mode button did not exist, then passed with 3 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 55 tests across 10 files.
- `npm.cmd run build`: passed.

TDD evidence:

- `src/app/App.test.tsx` failed first because title-screen Showcase entry and App-level overlay rendering were missing.

## Architecture Decisions Preserved

- React renders state and events; it does not decide game outcomes.
- Pure TypeScript systems own deterministic game rules.
- `CombatSlotMachine` and `AugmentSlotMachine` are separate systems.
- `RewardSystem` owns reward option generation.
- `AugmentSlotMachine` only presents a preselected reward result and must not call random APIs to decide rewards.
- Showcase Mode remains separate and must not mutate normal combat balance.
- Content effects are bounded typed data, not free-form scripts.

## Remaining Work

Next planned work:

1. Commit, push, and open a draft PR for `feature/showcase-ui-entry-overlay`.
2. Continue with a small UI/UX review or seed-based playable Showcase QA after this branch lands.

Do not merge later PRs without explicit user approval.
