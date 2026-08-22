# Planning Summary

## Game Pitch

Curse Slot Machine is a desktop-first web roguelike prototype where the player fights through a cursed casino by shaping three slot reels into readable combat sentences: `[action] [target] [modifier]`.

## Core Loop

1. Show the enemy's next intent.
2. Spin the combat slot.
3. Read the result as one sentence.
4. Confirm the result or lock reels and reroll.
5. Apply player slot effects.
6. Apply curse and surviving enemy actions.
7. Choose rewards that improve the build.

## Architecture Decisions

- Game outcomes are produced by pure TypeScript game systems.
- React renders state, events, controls, and animation only.
- Seeded RNG is required for reproducible normal-game results.
- Combat slots and augment slots are different systems.
- Showcase Mode uses scripted scenario/reward data and must not mutate normal combat balance.
- Content-specific augment, item, and synergy names should live in data, not engine branches.
- Enemy intent sequencing is deterministic combat-engine data: current MVP enemies may define different attack, wait, and defend patterns without React calculating enemy behavior.
- Structured UI projection should expose item-specific reward card data instead of forcing items to masquerade as augments.

## Branch Sequence

1. `feature/project-baseline`
2. `feature/game-engine-core`
3. `feature/combat-slot-machine`
4. `feature/combat-resolution`
5. `feature/build-reward-synergy`
6. `feature/augment-slot-machine`
7. `feature/showcase-mode`
8. `feature/ui-ux-battle-flow`
9. `feature/e2e-release-checks`

## MVP Exclusions

- No OpenAI API runtime integration.
- No login, backend, Hive, multiplayer, payments, or full roguelike meta progression.
- No unlicensed external assets.
- No normal-combat showcase damage shortcut.
