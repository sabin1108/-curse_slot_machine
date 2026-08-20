# Agent Feedback - content schema

## Context

The meeting feedback requested JSON/YAML-generatable content constraints while avoiding a free-form effect engine.

## Agent / Role

Main Codex agent plus native `architect` subagent.

## Token Allocation

- Estimated token budget: 10,000
- Actual or estimated usage: about 8,000
- Under/over use: appropriate
- Next adjustment: spend more on effect fixtures and validator tests if implementation is approved.

## Work Efficiency

- Effective: current `effectId` placeholders gave a clear migration point.
- Ineffective: no resolver exists, so schema and difficulty assessment had to be designed together.
- Duplicate work: none material.
- Improvement: start with JSON because the repo already supports JSON imports and has no YAML parser.

## Findings

- Replace unrestricted `effectId` strings with a discriminated `effects` array.
- MVP effect IDs should be limited to `combat.action_amount.add`, `combat.action_amount.add_pct`, `combat.bullet.extra_hit`, `combat.curse_gain.add`, and `reward.score.add`.
- Conditions should be AND-only and allowlisted.
- Unknown fields and unknown enum values must be rejected.

## Risks / Landmines

- Nested expressions or scripts turn content into a new engine.
- Status and skip-turn effects cause large test and balance scope.
- Adding tags before resolver support creates false reward value.

## Proposed Fixes

- Short-term: document JSON schema and validation caps.
- Mid-term: add pure `EffectResolver` and validator.
- Post-hackathon: add shop/rest/status hooks after their pure systems exist.

## Decision

Accepted. Reflected in `docs/design/CONTENT_EFFECT_SCHEMA_PLAN.md`.

