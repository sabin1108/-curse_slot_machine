# Content Logic Analysis

Date: 2026-08-20
Branch reviewed: `feature/augment-slot-machine`
Worktree reviewed: `C:\Users\00\Documents\Codex\csm_augment_slot`
Reviewed commit: `9844d35`

## Summary

The latest branch has a useful build/reward/synergy skeleton, but gameplay effects are not implemented yet. Rewards and synergies can declare tags, requirements, and `effectId` strings; `BuildSystem` can compute progress and completion; combat, curse, shop, rest, and slot-lock rules do not execute those effect IDs.

The primary landmine is the duplicate engine split. The visible React app imports `src/game/GameEngine.ts`, while the newer deterministic systems live under `src/game/engine/*`, `src/game/build/*`, `src/game/combat/*`, and `src/game/slot/*`. Implementing content logic in only one path can pass tests while not affecting the playable UI, or affect UI while bypassing the pure-system architecture.

## Required Documents Read

- `docs/agent/PROJECT_PROGRESS_SUMMARY.md` from `C:\Users\00\Documents\Codex\csm_augment_slot`
- `docs/agent/SESSION_HANDOFF.md`
- `docs/CODEX_COLLABORATION.md`
- `docs/design/PLANNING_SUMMARY.md`
- `C:\Users\00\Desktop\코덱스 게임\curse_slot_machine_integrated_feature_spec_v2.0_build_synergy.md`
- `C:\Users\00\Desktop\코덱스 게임\as\CURSE_SLOT_MACHINE_TEAM_AGENT_FEEDBACK_AND_LANDMINE_HANDOFF.md`

Note: `docs/agent/PROJECT_PROGRESS_SUMMARY.md` was not present in `C:\Users\00\Documents\Codex\curse_slot_machine_repo_fresh`; it exists in the current PR #8 worktree, `C:\Users\00\Documents\Codex\csm_augment_slot`, and was read there.

## Current Structure

### Pure build/reward/synergy modules

- `src/game/build/BuildTypes.ts:1` defines build-side `SynergyTag`, `RewardKind`, lowercase `Rarity`, `BuildRewardDefinition`, `SynergyRequirement`, `SynergyDefinition`, and `BuildCatalog`.
- `src/game/build/BuildCatalog.ts:3` contains the current small data catalog: five rewards and two synergies.
- `src/game/build/BuildSystem.ts:37` evaluates synergy progress generically from tag count and source constraints.
- `src/game/build/BuildSystem.ts:75` applies reward refs immutably and emits reward and synergy events.
- `src/game/build/RewardSystem.ts:42` generates deterministic reward options from the catalog, filters owned rewards, scores completion value, and sorts deterministically.

### Pure combat and slot modules

- `src/game/slot/CombatSlotMachine.ts:11` defines fixed weighted combat reels.
- `src/game/slot/CombatSlotMachine.ts:37` supports lock-aware rerolls.
- `src/game/slot/CombatSlotMachine.ts:55` computes reroll curse cost as locked reel count plus one.
- `src/game/combat/CombatSystem.ts:61` resolves a `CombatSlotResult` into damage, block, healing, enemy attack, curse increase, and combat end events.
- `src/game/combat/CombatSystem.ts:12` hardcodes base combat values.

### Augment slot presentation

- `src/game/slot/AugmentSlotMachine.ts:4` creates a presentation from a preselected `RewardOption`.
- `src/game/slot/AugmentSlotMachine.ts:27` reveals the presentation immutably.
- This module is presentation-only and must remain separate from reward RNG.

### Modular engine path

- `src/game/engine/GameState.ts:11` composes seed, phase, RNG snapshot, combat state, build state, and reward presentation state.
- `src/game/engine/GameEngine.ts:76` resolves combat, generates rewards on victory, and creates an augment slot presentation for the first reward option.
- `src/game/engine/GameEngine.ts:120` applies a chosen reward and clears reward state.

### Visible UI runtime path

- `src/app/App.tsx:2` imports `GameEngine` from `../game/GameEngine`, not `../game/engine/GameEngine`.
- `src/game/GameEngine.ts:21` is a separate legacy engine with its own state, RNG, combat calculation, reward screen, shop, rest, map, and showcase handling.
- `src/game/data.ts:189` defines legacy UI augment data using uppercase rarity and `effectValue`.
- `src/types/game.ts:39` defines `AugmentItem` separately from `BuildRewardDefinition`.

## Current Data-Driven Extensibility

What is already extensible:

- Reward and synergy definitions are catalog-backed.
- Synergy requirements are generic by tag, count, and source.
- Reward scoring already favors completion over rarity with `completionValue = completedNow * 100`.
- `AugmentSlotMachine` consumes `RewardOption`, so it can display richer generated content later.

What is still missing:

- `effectId` is only a string. There is no effect union, registry, validator, or resolver.
- `BuildState` stores reward IDs, not resolved effect descriptors.
- `CombatSystem.resolveCombatSlot` receives only `CombatState` and `CombatSlotResult`; it has no build/effect context.
- `RewardSystem` scores tags and rarity, not actual effect impact.
- The visible UI display catalog now uses neutral `ALL_REWARD_CARDS` naming; first-three reward selection remains legacy UI behavior.

## Specific Landmines

1. Duplicate engine target:
   - `src/game/GameEngine.ts` drives the React app.
   - `src/game/engine/GameEngine.ts` drives deterministic pure-system tests.
   - Target runtime must be selected before implementation.

2. Duplicate content model:
   - `src/game/data.ts` uses `AugmentItem`, uppercase rarity, and `effectValue`.
   - `src/game/build/BuildCatalog.ts` uses `BuildRewardDefinition`, lowercase rarity, and `effectId`.

3. Rarity vocabulary mismatch:
   - `src/types/game.ts:42` uses uppercase rarity.
   - `src/game/build/BuildTypes.ts:18` uses lowercase rarity.
   - `src/components/Navigation/ShopScreen.tsx:9` uses only `COMMON | RARE | LEGENDARY`.

4. First-reward synergy completion risk:
   - `src/game/build/BuildCatalog.ts:42` defines `cursed_lens` with both `CURSE` and `RISK`.
   - `risk_engine` requires `RISK` x1 and `CURSE` x1 from any source.
   - This means `cursed_lens` can satisfy the whole synergy alone if offered as the first reward.

5. Legacy stale synergy state:
   - `src/game/data.ts:232` starts `syn_burn` completed.
   - `src/game/GameEngine.ts:394` updates progress but does not explicitly revoke stale completion.

6. UI animation randomness:
   - `src/components/Battle/CombatSlotMachineView.tsx:100` uses `Math.random()` for visual reel indexes.
   - This should remain presentation-only and must not decide game outcomes.

## Implementation Readiness

Immediately possible:

- Expand display-only catalog entries.
- Add more tag requirements and synergy progress tests.
- Tune reward scoring to prevent first-pick full synergy completion.

Small refactor needed:

- Replace singular `effectId` with structured `effects`.
- Add an effect validator and resolver.
- Pass resolved build effects into combat/reward execution.
- Add source-aware item support to the visible UI path or migrate UI to the pure engine.

Out of MVP scope:

- Free-form scripting or expression language.
- Full engine unification plus content overhaul in one PR.
- Full route generator and final balance simulator.
- Multi-enemy AOE and permanent enemy-turn skip control.

## Recommended Next Implementation Candidate

The safest pilot is a pure-engine `EffectResolver` supporting one archetype and a small effect allowlist. The first target should be Combo Lock Engine because it reuses existing slot lock/reroll concepts and avoids status-system scope.

Before code starts, choose one:

1. Pure-engine pilot: stronger architecture, may not affect visible UI immediately.
2. Legacy UI pilot: faster playable demo, but must be treated as an adapter and not the long-term rules source.

