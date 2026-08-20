# MVP Reward And Stage Flow

Date: 2026-08-20
Scope: 15-stage demo structure and reward pacing proposal

## Goal

Use a short 15-stage demo to make item/augment/synergy logic legible without turning stage 1 into the whole game. The run should provide enough pickups for one primary build to complete and a second build to become tempting.

## Recommended 15-Stage Route

| Stage | Room | Reward / Purpose |
| ---: | --- | --- |
| 1 | Combat | Starter-only reward. |
| 2 | Combat | Support reward; no synergy finisher. |
| 3 | Rest | Heal or curse cleanse. |
| 4 | Shop | Early economy; start tracking item cap. |
| 5 | Combat | First finisher becomes eligible. |
| 6 | Event | One controlled build reward or gold. |
| 7 | Elite Combat | Target first synergy completion. |
| 8 | Rest | Recovery checkpoint. |
| 9 | Combat | Begin second build direction. |
| 10 | Shop | Final normal shop; enforce four purchased items per run. |
| 11 | Elite Combat | Second-synergy finisher may appear. |
| 12 | Rest | Final recovery. |
| 13 | Gate Combat | Power check and normal reward. |
| 14 | Event | Final controlled reward, repair, or gold. |
| 15 | Boss Combat | Ends run; no post-boss build reward. |

Totals:

- 8 combats, including 2 elites and 1 boss
- 3 rests
- 2 shops
- 2 events
- 7 pre-boss combat rewards
- up to 4 purchased shop items
- up to 2 event rewards
- maximum build pickups: about 13

## Synergy Completion Timing

Target timing:

- Stages 1 to 2: starter/support only; no full synergy finisher.
- Stage 5: first finisher becomes eligible.
- Stage 7 elite reward: preferred first synergy completion.
- Stages 9 to 11: secondary archetype direction appears.
- Stages 11 to 14: second synergy may complete if the player invested.
- Stage 15 boss: payoff, not another growth step.

This pacing matters because the current pure `RewardSystem` heavily prioritizes completion. `completionValue` adds 100 per newly completed synergy, while rarity values are only 1 to 4. Also, the current `cursed_lens` and `risk_engine` definitions can complete `Risk Engine` with one reward because `cursed_lens` supplies both required tags.

## Reward Option Rules

Each reward screen should include:

- one build-progressing option
- one adjacent archetype option
- one immediate-power or defensive option

Avoid:

- three unrelated rarity-only choices
- always giving the exact missing piece
- requiring more than 5 pickups for a synergy to function
- letting a dual-tag reward satisfy an entire synergy alone in normal mode

## Shop Role

The shop should solve bridge problems:

- missing item source requirement
- curse economy support
- archetype-specific discount
- defensive stabilization before elite or boss

The max of 4 shop items is a run-wide cap, not just a screen inventory size. Current UI shop purchases are component-local and the legacy engine accepts arbitrary item strings, so a real cap needs engine-owned state.

## Rest Role

Rest should connect to content through safe effect hooks:

- base heal
- base curse reduction
- future `rest.action.bonus`
- future defensive/resource synergy hooks

Rest should not grant random rewards in the first MVP. It exists to pace risk and make curse-linked builds less punishing.

## Stage 1 Bound

For a 1-stage playable slice:

- give one reward choice after the first combat
- show synergy progress preview only
- do not complete a synergy unless it is a scripted showcase scenario
- do not introduce shop/rest effects yet

## Integration Notes

Current visible map data already has route nodes and separate shop/rest screens, but it is owned by the legacy `src/game/GameEngine.ts` path and React components. The newer pure engine only models `idle`, `battle`, `reward`, `victory`, and `defeat`, and choosing a reward returns directly to battle.

A code implementation should choose one path:

1. Short-term UI path: patch the legacy engine with minimal adapter tests for a visual demo.
2. Preferred engine path: add pure route/shop/rest state to `src/game/engine/*`, then wire React to that engine in a separate integration task.

For gameplay correctness, the preferred path is stronger. For an immediate demo, the short-term UI path is faster but carries duplicated-system risk.

