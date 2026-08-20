# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/ui-item-card-projection`
- Current PR: draft PR #24 - https://github.com/sabin1108/-curse_slot_machine/pull/24
- PR #21 status: merged into `main` with squash commit `605b62d`.
- PR #22 status: merged into `main` with squash commit `00a810c`.
- PR #23 status: merged into `main` with squash commit `1ae1850`.

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
| `feature/ui-adapter-synergy-progress` | #23 | `1ae1850` | Merged |

## Current Branch

`feature/ui-item-card-projection` is pushed and open as draft PR #24.

Implemented:

- Added display-only `RewardCard` UI type with `kind: 'augment' | 'item'` and `kindLabel: '증강' | '아이템'`.
- `toUiReward()` now projects structured reward kind into UI reward cards.
- `RewardModal` renders item/augment labels and uses reward-neutral local naming.
- Legacy presentation rewards are converted to augment `RewardCard`s at the legacy engine boundary.
- React remains display/input only; reward kind/scoring/ownership stays in pure TypeScript systems.

Current branch commits:

- `1bdb3df` - `docs: plan ui item card projection`
- `9a2fe0b` - `fix: project item reward cards distinctly`

## Verification

Latest verification on `feature/ui-item-card-projection`:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 63 tests across 13 files.
- `npm.cmd run build`: passed.

TDD evidence:

- RED: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/components/Reward/RewardModal.test.tsx` failed because reward cards lacked `kind`/`kindLabel` and the modal did not render `아이템`.
- GREEN: the same targeted command passed with 5 tests after adding `RewardCard` projection and modal label rendering.

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

1. Keep PR #24 draft/open until explicit merge approval.
2. Next structured-engine UI migration slice: rename command payload/UI fields from augment-specific names (`augmentId`, `targetAugment`) to reward-neutral aliases while preserving backward compatibility.

Do not merge later PRs without explicit user approval.
