# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/content-effect-schema-pilot`
- Current PR: https://github.com/sabin1108/-curse_slot_machine/pull/10 (draft)
- PR #8 status: merged into `main` with squash commit `ca51454`.

## Completed Branches

| Branch | PR | Main commit | Status |
| --- | --- | --- | --- |
| `feature/project-baseline` | #1 | `2ce9e20` | Merged |
| `feature/game-engine-core` | #2 | `49f5eab` | Merged |
| `feature/combat-slot-machine` | #3 | `6edc91d` | Merged |
| `feature/combat-resolution` | #6 | `445265a` | Merged |
| `feature/build-reward-synergy` | #7 | `622f52f` | Merged |
| `feature/augment-slot-machine` | #8 | `ca51454` | Merged |

## Current Branch

`feature/content-effect-schema-pilot` is pushed and has draft PR #10 open.

Implemented:

- Content logic analysis and MVP schema/design documents under `docs/agent` and `docs/design`.
- Agent feedback documents and cumulative feedback index under `docs/agent/feedback`.
- Bounded `EffectDefinition` and `EffectCondition` types under `src/game/effects`.
- `BuildSystem.getActiveEffects(build, catalog)` for owned reward effects and completed synergy effects.
- Optional combat effect context in `CombatSystem`.
- Initial supported combat effects: `combat.action_amount.add`, `combat.action_amount.add_pct`, `combat.bullet.extra_hit`, and `combat.curse_gain.add`.
- Default `combo_engine` now has a bounded `combo_extra_hit` structured effect.
- Pure `GameEngine` passes active build effects into combat resolution.
- UI adapter `src/game/engine/UiGameEngine.ts` bridges structured reward/combat results into the current React-facing state contract for a narrow combo-effect path.
- `src/app/App.tsx` now imports the UI adapter while unsupported UI commands continue to delegate to the legacy engine.
- UI adapter now projects structured victory reward options and augment-slot presentation into `rewardCandidates` and `augSlotPresentation` for the current RewardModal contract.
- UI adapter now routes `SPIN_COMBAT_SLOT` and lock-aware `REROLL_UNLOCKED` through pure `CombatSlotMachine` functions and projects the result into UI `currentResult`.

Current branch commits:

- `5ba1851` - `feat: add bounded content effect pilot`
- `a261089` - `feat: project structured rewards to ui adapter`
- `b4532a3` - `feat: route ui slot spin through pure slot machine`

## Verification

Latest verification on `feature/content-effect-schema-pilot`:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 40 tests across 9 files.
- `npm.cmd run build`: passed.

TDD evidence:

- `src/game/build/BuildSystem.test.ts` failed first because `getActiveEffects` did not exist, then passed after implementation.
- `src/game/combat/CombatSystem.test.ts` failed first because combat effects were ignored, then passed after implementation.
- `src/game/engine/GameEngine.test.ts` failed first because active build effects were not passed into combat, then passed after integration.
- `src/game/engine/UiGameEngine.test.ts` failed first because `UiGameEngine` did not exist, then passed after adding the adapter.
- `src/game/engine/UiGameEngine.test.ts` failed first because victory reward projection left `rewardCandidates` empty, then passed after projection implementation.
- `src/game/engine/UiGameEngine.test.ts` failed first because spin/reroll still used legacy slot output, then passed after routing through pure slot functions.

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

1. Keep map/shop/rest/showcase migration as separate TDD slices.
2. Keep PR #10 draft until human review/approval.

Do not merge later PRs without explicit user approval.
