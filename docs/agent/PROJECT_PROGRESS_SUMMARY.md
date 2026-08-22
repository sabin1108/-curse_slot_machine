# Project Progress Summary

Last updated: 2026-08-22

## Repository

- GitHub: `https://github.com/sabin1108/-curse_slot_machine`
- Current worktree: `C:\Users\00\Documents\Codex\curse_slot_machine_repo_fresh`
- Current branch: `feature/reward-inventory-naming-cleanup`
- Current branch base: `feature/reward-card-type-cleanup`
- Baseline before this stacked cleanup: `e8adb7a`
- Policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.

## Parent Branch

`feature/enemy-defense-intent` continues from the playable canonical UI integration line.

Implemented before this continuation:

- Enemy attacks alternate with wait turns.
- Enemy wait turns have no incoming damage preview.
- Enemy defense turns add low block and cap accumulated enemy block.
- Combat logs and UI projection describe wait and defense outcomes.

Continuation work completed on 2026-08-22:

1. Refreshed branch documentation and verification notes.
2. Added data-driven per-enemy intent patterns.
3. Continued structured-engine UI migration with explicit item-specific reward projection.
4. Hardened review findings around pattern invariants, catalog validation, and command-path regressions.

## Architecture Decisions Preserved

- React renders state and events; it does not decide game outcomes.
- Pure TypeScript systems own deterministic game rules.
- Enemy intent sequencing is combat-engine data.
- `CombatSlotMachine` and `AugmentSlotMachine` remain separate systems.
- `RewardSystem` owns reward option generation.
- Showcase Mode remains separate and must not mutate normal combat balance.
- Content effects and enemy balance are bounded typed data, not free-form scripts.

## Verification Status

Latest verified results for this continuation:

```powershell
npm run typecheck  # passed
npm run test:run   # passed, 19 files / 100 tests
npm run build      # passed
npm run test:e2e   # passed, 3 Chromium tests
```

Review feedback and remaining risks are recorded in `docs/agent/SESSION_HANDOFF.md`.

## Current Branch: Reward Inventory Naming Cleanup

`feature/reward-inventory-naming-cleanup` is stacked on `feature/reward-card-type-cleanup`.

Completed in this slice:

1. Renamed the legacy battle inventory side panel from `AugmentSidePanel` to `RewardInventorySidePanel`.
2. Renamed the display reward catalog export from `ALL_AUGMENTS` to `ALL_REWARD_CARDS`.
3. Updated battle inventory local reward-card variable names without changing rendered class names or gameplay behavior.
4. Added direct catalog coverage that confirms the display reward catalog includes explicit augment and item card kinds.

Verification for this cleanup branch:

```powershell
npm.cmd run test:run -- src/components/Battle/BattleScreen.test.tsx src/game/data.test.ts src/game/engine/UiProjection.test.ts  # passed, 3 files / 13 tests
npm.cmd run typecheck  # passed
npm.cmd run test:run   # passed, 21 files / 107 tests
npm.cmd run build      # passed
npm.cmd run test:e2e   # passed, 3 Chromium tests
git diff --check        # passed
```

Review status for this cleanup branch:

- Code-review lane: `COMMENT`; one low-severity progress-summary wording issue was fixed.
- Architecture lane: `CLEAR`.

## Parent Stacked Branch: Reward Card Type Cleanup

`feature/reward-card-type-cleanup` is stacked on `feature/reward-card-inventory-projection`.

Completed in this slice:

1. Renamed the shared UI card type from `AugmentItem` to `RewardCard`.
2. Kept `AugmentCard` and `ItemCard` as discriminated UI subtypes for owned inventory arrays.
3. Renamed `toUiAugment` to `toUiRewardCard` while keeping `toUiReward` as the reward-option adapter.
4. Renamed battle inventory row/list/value CSS classes from augment-specific names to `reward-card-*`.
5. Added direct coverage for `toUiReward`, `toUiRewardCard`, and neutral battle inventory selectors.

Verification for this cleanup branch:

```powershell
npm run typecheck  # passed
npm run test:run   # passed, 20 files / 106 tests
npm run build      # passed
npm run test:e2e   # passed, 3 Chromium tests
```

Review status for this cleanup branch:

- Code-review lane: initial `REQUEST CHANGES`, re-review `APPROVE`.
- Architecture lane: `CLEAR`.

## Grandparent Stacked Branch: Reward Card Inventory Projection

`feature/reward-card-inventory-projection` is stacked on `feature/enemy-defense-intent`.

Completed in this slice:

1. UI `BuildState.items` now carries item reward cards instead of raw item IDs.
2. `projectUiGameState` resolves owned augment IDs and item IDs into separate card arrays.
3. `projectUiGameState` rejects owned reward IDs stored under the wrong core kind instead of silently projecting them into the wrong UI array.
4. Battle inventory rendering derives ownership IDs from projected cards and shows both augments and items with `AUG`/`ITEM` badges.
5. Projection and render regressions cover owned augment/item display, combined counts, legacy side-panel alignment, and item-card ID extraction for display-only multiplier caps.

Verification for this stacked branch:

```powershell
npm run typecheck  # passed
npm run test:run   # passed, 20 files / 105 tests
npm run build      # passed
npm run test:e2e   # passed, 3 Chromium tests
```

Review status for this stacked branch:

- Code-review lane: initial `REQUEST CHANGES`, re-review `APPROVE`.
- Architecture lane: `CLEAR`.

## Remaining Work

- Push and open a draft PR for the stacked `feature/reward-inventory-naming-cleanup` branch.
- Do not merge or change PR state without explicit user approval.
