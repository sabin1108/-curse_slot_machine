# Reward Effect Condition Resolver Design

Date: 2026-08-22

## Goal

Extend the pure `EffectResolver` condition boundary to cover reward scoring conditions so `RewardSystem` no longer duplicates reward/build predicate logic.

## Scope

- Add reward facts and active synergy IDs to `EffectConditionContext`.
- Make `effectConditionsMatch` evaluate `reward.kind_is`, `reward.rarity_is`, `reward.has_tag`, and `build.synergy_active` when those facts are supplied.
- Rewire `RewardSystem.getContentValue` to use `effectConditionsMatch`.
- Preserve current reward ordering and score values.
- Do not change combat arithmetic, active effect ownership, catalog validation, UI projection, or reward content.

## Design

`EffectResolver` remains a pure predicate module. Combat callers pass slot/curse/health/lock facts. Reward callers pass a candidate reward's kind, rarity, and tags plus the currently active synergy IDs. Unsupported condition domains continue to fail closed when the caller does not provide the relevant facts.

`RewardSystem` still owns reward scoring, scoring weights, option sorting, and the choice of which effects contribute to `contentValue`; it only delegates condition truth evaluation.

## Testing

- Add resolver tests proving reward and build conditions match independently and fail without required context.
- Add a reward scoring regression where a `reward.score.add` effect applies only when reward facts and an active synergy condition match.
- Add a pre-pick regression where a candidate that would activate a synergy does not score an effect gated by that same synergy.
- Keep full repository verification green after the refactor.

## Risks

- Reward scoring must keep using pre-pick active synergies, not synergies completed by the candidate reward itself.
- Resolver context must remain fact-based and not import `BuildState` or `CombatState`.
