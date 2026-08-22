# Effect Resolver Boundary Design

Date: 2026-08-22

## Goal

Create a pure engine-side effect resolver boundary so combat-time effect conditions are evaluated in one module before `CombatSystem` applies its own combat arithmetic and state mutation.

## Scope

- Add `src/game/effects/EffectResolver.ts` as the owner of generic combat condition matching.
- Preserve current gameplay output for existing MVP rewards and synergies.
- Keep React out of effect resolution.
- Keep owned reward and completed synergy activation in `BuildSystem.getActiveEffects`.
- Keep catalog validation in `src/game/build/ContentValidation.ts`.
- Do not add new reward content, new effect types, new dependencies, or balance changes.

## Design

`EffectResolver` exposes:

- `effectConditionsMatch(effect, context)` to evaluate shared combat conditions from slot result, curse value, player health percentage, and locked reel count.

`BuildSystem.getActiveEffects` remains the activation boundary for owned reward and completed synergy effects. `RewardSystem` keeps reward scoring conditions for this branch. `CombatSystem` keeps modifier ordering, caps, arithmetic, final state transitions, and event emission, but calls `effectConditionsMatch` when deciding whether a combat effect applies.

## Testing

- Add direct resolver tests for condition matching.
- Add combat regressions for chained modifier-step ordering, modifier-conditioned bonuses after stepping, and condition filtering on every condition-bearing combat effect handler.
- Keep existing `BuildSystem`, `CombatSystem`, `GameEngine`, and e2e tests green to prove behavior is preserved.

## Risks

- Effect condition behavior was partially implemented inside combat. Moving it must not drop lock, curse, health, or slot conditions.
- Existing effect types that are not condition-filtered today must remain unaffected.
