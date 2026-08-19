# Combat Resolution Plan

## Scope

Implement `feature/combat-resolution` on top of `feature/combat-slot-machine`.

This branch turns a confirmed combat slot result into deterministic combat state changes. It intentionally does not implement build rewards, augments, synergies, showcase mode, or battle UI.

## Design

- Add pure TypeScript combat state and resolution modules under `src/game/combat`.
- Resolve the existing one-payline slot result `[action, target, modifier]` into damage, block, or healing.
- Keep resolution deterministic and independent from React and RNG.
- Integrate a new `RESOLVE_COMBAT_SLOT` command into `GameEngine`.
- Preserve existing starter engine behavior where possible so earlier branch tests keep passing.

## Rules For This Branch

- Modifier multipliers are `x1 = 1`, `x2 = 2`, and `x3 = 3`.
- `bullet` applies damage.
- `shield` grants block.
- `heart` heals, capped by max health.
- `enemy`, `self`, and `all` targets affect enemy, player, or both respectively.
- A surviving enemy attacks after the player slot effect.
- Curse increments after each resolved combat slot.
- Victory and defeat phases are derived from resulting actor health.

## TDD Checkpoints

1. Add failing `CombatSystem` tests for damage, block, heal, enemy attack, curse, and victory.
2. Implement combat types and pure resolution.
3. Add failing `GameEngine` command integration test.
4. Wire `RESOLVE_COMBAT_SLOT` into the engine.
5. Run `typecheck`, full tests, and production build before pushing.
