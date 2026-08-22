# Project Progress Summary

Last updated: 2026-08-22

## Repository

- GitHub: `https://github.com/sabin1108/-curse_slot_machine`
- Current worktree: `C:\Users\00\Documents\Codex\curse_slot_machine_repo_fresh`
- Current branch: `feature/ui-map-projection`
- Current branch base: `main`
- Baseline before this map projection slice: `c937bb5`
- Draft PR: https://github.com/sabin1108/-curse_slot_machine/pull/34
- Policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.

## Merged Stack

The stacked PR chain was merged on 2026-08-22 after explicit user approval:

- PR #31 -> PR #30 branch: `f65e213`
- PR #30 -> PR #29 branch: `36377db`
- PR #29 -> PR #28 branch: `652e407`
- PR #28 -> PR #27 branch: `7d57de0`
- PR #27 -> `main`: `16e58cb`
- PR #32 -> `main`: `ad33fcd`
- PR #33 -> `main`: `c937bb5`

## Current Branch: UI Map Projection

`feature/ui-map-projection` continues the structured UI projection line after PR #33.

Completed in this slice:

1. Added a projected map view model to `GameState`.
2. Added `RunSystem.getNextStage(run)` so engine transition and projection share one next-stage selector.
3. Projected route nodes, completed IDs, current node, next available node, and active node from core run state.
4. Rewired `App` to pass `gameState.map` into the map screen.
5. Removed `MVP_ROUTE` and `RunStageDefinition` imports from `DungeonMapScreen`; the component now renders projected map nodes and dispatches existing commands only.
6. Kept shop offer projection, route rules, event outcomes, reward flow, rest behavior, and combat behavior out of scope.

Targeted verification for this branch:

```powershell
npm.cmd run test:run -- src/game/engine/UiProjection.test.ts  # failed first, projected.map was missing
npm.cmd run test:run -- src/game/engine/UiProjection.test.ts  # passed, 12 tests
npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/app/App.test.tsx  # passed, 2 files / 17 tests
npm.cmd run test:run -- src/game/run/RunSystem.test.ts src/game/engine/UiProjection.test.ts src/app/App.test.tsx  # passed after review fix, 3 files / 21 tests
npm.cmd run typecheck  # passed
```

Review status for this branch:

- Code-review lane found no code defects; process gate depended on architecture evidence.
- Architecture lane returned `WATCH` for duplicated next-stage selection; fixed by sharing `RunSystem.getNextStage(run)` between `enterNextStage` and `UiProjection`.
- Architecture re-review returned `CLEAR`.

Full verification for this branch:

```powershell
npm.cmd run typecheck   # passed
npm.cmd run test:run    # passed, 22 files / 134 tests
npm.cmd run build       # passed
npm.cmd run test:e2e    # passed, 4 Chromium tests
git diff --check         # passed
```

## Current Branch: Reward Effect Condition Resolver

`feature/reward-effect-condition-resolver` continues the effect resolver boundary after PR #32.

Completed in this slice:

1. Extended `EffectResolver` with reward facts and active synergy IDs.
2. Added independent resolver coverage for reward kind, rarity, tag, and active synergy conditions.
3. Rewired `RewardSystem` content-value scoring to delegate reward/build condition truth evaluation to `effectConditionsMatch`.
4. Projected only candidate reward facts into the resolver instead of passing full reward definitions.
5. Added pre-pick synergy regression coverage so a candidate reward cannot score from a synergy it activates only after being picked.
6. Preserved reward scoring ownership, sorting, active-effect ownership, catalog validation, combat behavior, and UI projection.

Targeted verification for this branch:

```powershell
npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts  # failed first, reward/build conditions returned false
npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts  # passed, 12 tests
npm.cmd run test:run -- src/game/build/RewardSystem.test.ts      # passed, 4 tests
npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts src/game/build/RewardSystem.test.ts  # passed after review fixes, 2 files / 17 tests
```

Review status for this branch:

- Code-review lane returned `REQUEST CHANGES`; explicit reward fact projection, direct pre-pick synergy regression coverage, and no-context active-synergy coverage were fixed.
- Architecture lane returned `CLEAR`; the low-risk pre-pick coverage recommendation was fixed.

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
npm.cmd run typecheck  # passed
npm.cmd run test:run   # passed, 22 files / 130 tests
npm.cmd run build      # passed
npm.cmd run test:e2e   # passed, 4 Chromium tests
git diff --check        # passed
```

Review feedback and remaining risks are recorded in `docs/agent/SESSION_HANDOFF.md`.

## Current Branch: Reward Modal Accessibility Coverage

`feature/reward-modal-accessibility-coverage` is stacked on `feature/reward-inventory-naming-cleanup`.

Completed in this slice:

1. Added React Testing Library coverage for Showcase step 3 reward-modal ownership and reward choice role/name/focus/selected state.
2. Restored Showcase step 3 reward presentation by dispatching the existing deterministic demo command prefix through the pure engine.
3. Added Playwright coverage for keyboard activation of a focused reward choice and step 4 continuation.
4. Marked `SHOWCASE-QA-001` and `SHOWCASE-QA-002` resolved in follow-up while preserving original milestone evidence.

Targeted verification for this branch:

```powershell
npm.cmd run test:run -- src/app/App.test.tsx  # passed, 5 tests
npm.cmd run typecheck                         # passed
npm.cmd run test:e2e -- tests/e2e/showcase-accessibility.spec.ts --project=chromium  # passed, 1 Chromium test
npm.cmd run test:run                          # passed, 21 files / 109 tests
npm.cmd run build                             # passed
npm.cmd run test:e2e                          # passed, 4 Chromium tests
git diff --check                              # passed
```

Review status for this branch:

- Code-review lane: `COMMENT`; one low-severity remaining-work wording issue was fixed.
- Architecture lane: `CLEAR`; hard-coded reward-step index tradeoff was removed after review.

## Parent Stacked Branch: Reward Inventory Naming Cleanup

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

- Review draft PR #34 and merge only after explicit user approval.
- Do not merge or change PR state without explicit user approval.
