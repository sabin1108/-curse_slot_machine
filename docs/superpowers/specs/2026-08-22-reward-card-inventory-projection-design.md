# Reward Card Inventory Projection Design

Date: 2026-08-22
Branch: `feature/reward-card-inventory-projection`
Base: `feature/enemy-defense-intent`

## Goal

Split the UI projection for owned augments and owned items so the battle inventory can render both as explicit reward cards without React inferring item identity from raw IDs or icon text.

## Constraints

- Core build state remains ID-based: `src/game/build/BuildTypes.ts` keeps `augments: string[]` and `items: string[]`.
- `projectUiGameState` is the boundary that resolves IDs into render-ready card data.
- React may combine card arrays for display, but it must not resolve reward definitions or decide gameplay ownership.
- Reward and combat systems are out of scope.

## Acceptance Criteria

- UI `BuildState.items` is an `AugmentItem[]` card array with `kind: 'item'`.
- UI `BuildState.augments` only contains augment cards with `kind: 'augment'`.
- Battle inventory count and rows include owned augment and item cards.
- Existing multiplier ownership checks still use IDs derived from projected cards.
- Targeted projection and render tests cover the split.
