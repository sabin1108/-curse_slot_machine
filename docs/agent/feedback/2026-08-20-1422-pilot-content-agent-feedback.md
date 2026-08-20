# Agent Feedback - pilot content

## Context

The team feedback warned that simply adding more items and augments would become number play. Pilot content needs paired or set-based rewards.

## Agent / Role

Main Codex agent plus native `designer` subagent.

## Token Allocation

- Estimated token budget: 9,000
- Actual or estimated usage: about 7,000
- Under/over use: appropriate
- Next adjustment: spend more on player-facing reward copy and deterministic reward order.

## Work Efficiency

- Effective: archetypes were tied to lock, curse, status, shop, and rest decisions.
- Ineffective: status/shop/rest pure systems are not ready, so several ideas remain schema-only.
- Duplicate work: none material.
- Improvement: implement only one functional archetype first.

## Findings

- Combo Lock Engine best fits existing slot lock/reroll mechanics.
- Burn Poison Pressure is compelling but requires status lifecycle.
- Defense Curse Economy avoids damage inflation and connects curse/rest/shop.
- Freeze Lightning Control should be deferred because skip-turn can bypass combat balance.
- A more concrete 13-reward MVP catalog should use three four-pickup archetypes plus one bridge item.
- The 13-reward set can reuse current concepts for `combo_starter`, `multi_hit_charm`, `combo_finisher`, `guard_core`, and `cursed_lens`, while adding eight new rewards.

## Risks / Landmines

- Implementing all archetypes at once expands into resolver, status, shop, rest, and UI preview work.
- Completing synergies on stage 1 breaks the 15-stage growth curve.
- Status strings must not stay free-form.

## Proposed Fixes

- Short-term: use Combo Lock Engine as the first functional pilot.
- Mid-term: add Burn Poison after status tests exist.
- Post-hackathon: add Freeze Lightning after enemy-turn skip tests and caps exist.

## Decision

Accepted with scope reduction. Three archetypes and a 13-reward authored catalog are documented, but the first implementation candidate remains Combo Lock Engine.
