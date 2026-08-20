# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/ui-adapter-node-type-routing`
- Current PR: draft PR #14 - https://github.com/sabin1108/-curse_slot_machine/pull/14
- PR #8 status: merged into `main` with squash commit `ca51454`.
- PR #10 status: merged into `main` with squash commit `8be060c`.
- PR #11 status: merged into `main` with squash commit `e8c5884`.
- PR #12 status: merged into `main` with squash commit `9955372`.
- PR #13 status: merged into `main` with squash commit `1877c21`.

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

## Current Branch

`feature/ui-adapter-node-type-routing` is pushed and open as draft PR #14.

Implemented:

- `SELECT_MAP_NODE` accepts optional `nodeType` command data.
- `UiGameEngine` routes battle-like map nodes to `BATTLE`, shop nodes to `SHOP`, and rest nodes to `REST`.
- Map node selection still clears stale adapter-owned structured slot results before the destination screen.
- `DungeonMapScreen` no longer dispatches extra `NAVIGATE` commands for battle/shop/rest node selections.

Current branch commits:

- `723e0c1` - `fix: route typed map nodes in ui adapter`

## Verification

Latest verification on `feature/ui-adapter-node-type-routing`:

- Targeted `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `SHOP` and `REST` node selections returned `screen: 'BATTLE'`, then passed with 9 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 47 tests across 10 files.
- `npm.cmd run build`: passed.

TDD evidence:

- `src/game/engine/UiGameEngine.test.ts` failed first because `SELECT_MAP_NODE` returned `screen: 'BATTLE'` instead of `SHOP` or `REST` for typed map nodes.

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

1. Keep PR #14 draft until review and explicit merge approval.
2. Continue event/showcase migration as separate TDD slices.

Do not merge later PRs without explicit user approval.
