# Enemy Intent Patterns And Item Projection Design

## Goal

Bring the current `feature/enemy-defense-intent` branch documentation up to date, then extend the existing enemy intent mechanic with data-driven per-enemy patterns, and continue the structured-engine UI migration by projecting owned items as item-shaped UI cards instead of folding them into augment presentation.

## Approved Scope

1. Document and verify the completed enemy defense-intent slice.
2. Add narrow per-enemy defense behavior and balance data.
3. Continue the structured-engine UI migration with item-specific UI projection.

## Current Baseline

- Branch: `feature/enemy-defense-intent`
- Baseline commit: `c9ee9c4`
- Existing intent cycle: attack -> wait -> defend -> attack
- Existing defend values: enemy gains 1 block, capped at 2
- Current docs that require refresh: `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, `docs/agent/SESSION_HANDOFF.md`, `docs/agent/PROJECT_PROGRESS_SUMMARY.md`

## Design Decisions

- Enemy behavior remains owned by pure TypeScript game systems.
- React continues to render projected state only.
- Enemy-specific behavior belongs in `src/game/combat/MvpEnemyCatalog.ts`, not React and not branch-specific UI code.
- The combat system should resolve the current intent from a pattern stored in `CombatState`, so the same seed and command sequence remains deterministic.
- Curse pressure only increases attack intents; wait remains 0 and defend remains its defense amount.
- Items and augments may continue to share the existing `AugmentItem` UI interface temporarily, but projected values must expose a distinct kind marker and item label so item cards no longer rely on the `icon === 'ITEM'` convention.

## Acceptance Criteria

- Documentation names `feature/enemy-defense-intent` and commit `c9ee9c4` as the current baseline before new implementation commits.
- Stage enemy profiles define intent patterns in data.
- Combat state carries enough pattern position data to advance deterministic per-enemy intent sequences.
- Combat preview, resolve, reroll curse updates, shop purchase curse updates, and rest purification keep wait/defend amounts correct.
- UI reward/shop/battle projection can tell item cards from augment cards without inspecting the icon text.
- Verification commands run before completion: `npm run typecheck`, `npm run test:run`, `npm run build`, `npm run test:e2e`.

## Review Requirements

- Run independent code review after implementation.
- Treat any architecture finding about React deciding gameplay as blocking.
- Document remaining risks and accepted limitations in the agent handoff.
