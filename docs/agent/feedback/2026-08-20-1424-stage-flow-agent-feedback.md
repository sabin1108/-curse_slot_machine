# Agent Feedback - stage flow

## Context

Meeting constraints suggested a 15-stage demo with 7 to 9 combats, about 3 rests, shop items capped near 4, and total build pickups near 13.

## Agent / Role

Main Codex agent plus native `planner` subagent.

## Token Allocation

- Estimated token budget: 7,000
- Actual or estimated usage: about 5,500
- Under/over use: appropriate
- Next adjustment: implementation should spend more on route graph tests and reward count simulation.

## Work Efficiency

- Effective: reward count was separated from room count.
- Ineffective: current visible map is component-local while pure engine has no route/shop/rest model.
- Duplicate work: none material.
- Improvement: add pure route model before coding final 15-stage behavior.

## Findings

- Recommended route: 8 combats, 3 rests, 2 shops, 2 events.
- Reward ceiling: 7 pre-boss combat rewards, 4 shop purchases, 2 event rewards, total about 13.
- First synergy should complete around stages 5 to 7.
- Second synergy should complete around stages 11 to 14.
- Boss should be payoff, not another build-growth step.

## Risks / Landmines

- `completionValue = +100` can overpower reward scoring if finishers are not gated.
- `cursed_lens` can complete `risk_engine` alone.
- Current shop cap is not engine-owned.

## Proposed Fixes

- Short-term: document 15-stage route and gate finishers by stage/reward tier.
- Mid-term: add engine-owned shop item cap and event reward budget.
- Post-hackathon: add route generation and reward simulation.

## Decision

Accepted. Reflected in `docs/design/MVP_REWARD_AND_STAGE_FLOW.md`.

