# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/ui-adapter-showcase-slot-guard`
- Current PR: draft PR #17 - https://github.com/sabin1108/-curse_slot_machine/pull/17
- PR #8 status: merged into `main` with squash commit `ca51454`.
- PR #10 status: merged into `main` with squash commit `8be060c`.
- PR #11 status: merged into `main` with squash commit `e8c5884`.
- PR #12 status: merged into `main` with squash commit `9955372`.
- PR #13 status: merged into `main` with squash commit `1877c21`.
- PR #14 status: merged into `main` with squash commit `d4ea1bd`.
- PR #15 status: merged into `main` with squash commit `eae8337`.
- PR #16 status: merged into `main` with squash commit `2165922`.

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

## Current Branch

`feature/ui-adapter-showcase-slot-guard` is pushed and open as draft PR #17.

Implemented:

- `START_SHOWCASE` now clears adapter-owned structured slot state and resets structured adapter internals.
- Showcase active `SPIN_COMBAT_SLOT` delegates to the legacy presentation engine so scripted forced results remain authoritative.
- Normal combat still uses the adapter-owned structured slot RNG path.

Current branch commits:

- `16c54a3` - `fix: preserve showcase slot path in ui adapter`

## Verification

Latest verification on `feature/ui-adapter-showcase-slot-guard`:

- Targeted `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because showcase spin used structured RNG and `START_SHOWCASE` leaked a stale structured slot, then passed with 15 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 53 tests across 10 files.
- `npm.cmd run build`: passed.

TDD evidence:

- `src/game/engine/UiGameEngine.test.ts` failed first because showcase forced slot results were bypassed and stale structured slots could still resolve after `START_SHOWCASE`.

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

1. Keep PR #17 draft until review and explicit merge approval.
2. Continue Showcase UI entry/overlay wiring as a separate TDD slice.

Do not merge later PRs without explicit user approval.
