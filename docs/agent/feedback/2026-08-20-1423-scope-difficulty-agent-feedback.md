# Agent Feedback - scope difficulty

## Context

The task required separating immediately possible work, small-refactor work, and work that would become engine-rewrite scope.

## Agent / Role

Main Codex agent plus native `critic` subagent.

## Token Allocation

- Estimated token budget: 8,000
- Actual or estimated usage: about 6,500
- Under/over use: appropriate
- Next adjustment: if implementation is approved, allocate more to TDD task breakdown.

## Work Efficiency

- Effective: difficulty was evaluated separately for visible legacy runtime and pure engine runtime.
- Ineffective: duplicate engines made every "easy" item conditional.
- Duplicate work: overlaps with current-structure feedback by design.
- Improvement: first line of any implementation plan must name target runtime.

## Findings

Immediately possible:

- Display-only augments, shop items, descriptions, tags, and reward cards.
- Simple augment-only, single-tag synergy thresholds in legacy runtime.
- More pure catalog entries and synergy tests.

Small refactor needed:

- Functional mixed item/augment synergies.
- Bounded effect registry/resolver.
- Catalog-driven rewards and item rewards in the live UI.
- Weighted rarity rolls after RNG ownership is chosen.

Out of hackathon scope:

- Wholesale rendered-app migration to `src/game/engine/GameEngine.ts` in the same PR as content logic.
- General trigger/effect engine with arbitrary hooks.
- Save/replay compatibility across both RNG implementations.

## Risks / Landmines

- Duplicate engines, duplicate RNGs, duplicate rarity contracts.
- Legacy items are strings and purchases store display names.
- Current tests can pass against non-visible systems.

## Proposed Fixes

- Short-term: pure-engine effect pilot, or explicitly legacy-only UI demo adapter.
- Mid-term: adapter for item/reward catalog in live UI.
- Post-hackathon: remove or deprecate duplicate runtime.

## Decision

Accepted. Broad expansion is rejected until canonical runtime is chosen; small pilot remains feasible.

