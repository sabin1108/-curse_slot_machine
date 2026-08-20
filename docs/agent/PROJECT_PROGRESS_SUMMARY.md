# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/ui-adapter-synergy-progress`
- Current PR: draft PR #23 - https://github.com/sabin1108/-curse_slot_machine/pull/23
- PR #8 status: merged into `main` with squash commit `ca51454`.
- PR #10 status: merged into `main` with squash commit `8be060c`.
- PR #11 status: merged into `main` with squash commit `e8c5884`.
- PR #12 status: merged into `main` with squash commit `9955372`.
- PR #13 status: merged into `main` with squash commit `1877c21`.
- PR #14 status: merged into `main` with squash commit `d4ea1bd`.
- PR #15 status: merged into `main` with squash commit `eae8337`.
- PR #16 status: merged into `main` with squash commit `2165922`.
- PR #17 status: merged into `main` with squash commit `5d1a89b`.
- PR #18 status: merged into `main` with squash commit `fed924e`.
- PR #19 status: merged into `main` with squash commit `f1145c6`.
- PR #20 status: merged into `main` with squash commit `61744f1`.
- PR #21 status: merged into `main` with squash commit `605b62d`.
- PR #22 status: merged into `main` with squash commit `00a810c`.

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
| `feature/showcase-ui-entry-overlay` | #18 | `fed924e` | Merged |
| `review/showcase-playable-qa` | #19 | `f1145c6` | Merged |
| `feature/showcase-reward-modal-accessibility` | #20 | `61744f1` | Merged |
| `feature/showcase-step-header-spacing` | #21 | `605b62d` | Merged |
| `feature/offline-font-fallback` | #22 | `00a810c` | Merged |

## Current Branch

`feature/ui-adapter-synergy-progress` is open as draft PR #23.

Implemented:

- `UiGameEngine` projects real structured `BuildState.synergies.progress` values into the legacy UI build panel state.
- `toUiSynergyProgress` accepts structured progress while preserving catalog-derived fallback values.
- React remains display/input only; synergy calculation stays in the pure TypeScript build system.

Current branch commits:

- `4742591` - `docs: plan ui synergy progress projection`
- `4d44cda` - `fix: project structured synergy progress`
- `b0811e6` - `docs: update ui synergy progress pr handoff`

## Verification

Latest verification on `feature/ui-adapter-synergy-progress`:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 59 tests across 11 files.
- `npm.cmd run build`: passed.

TDD evidence:

- RED: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts` failed because `combo_engine` UI progress stayed at `current: 0`.
- GREEN: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts` passed with 16 tests after passing structured progress through the adapter projection.

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

1. Finish merging PR #23 after conflict resolution and verification.
2. Next recommended structured-engine UI migration slice: project item cards with item-specific UI shape instead of using augment-shaped presentation.

Do not merge later PRs without explicit user approval.
