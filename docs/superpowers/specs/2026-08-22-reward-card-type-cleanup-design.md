# Reward Card Type Cleanup Design

Date: 2026-08-22
Branch: `feature/reward-card-type-cleanup`
Base: `feature/reward-card-inventory-projection`

## Goal

Rename the UI reward-card model away from augment-only terminology now that owned augments and owned items are both projected as cards.

## Scope

- Rename UI `AugmentItem` to `RewardCard`.
- Keep discriminated subtypes `AugmentCard` and `ItemCard`.
- Rename projection helper `toUiAugment` to `toUiRewardCard`.
- Rename battle inventory CSS classes from `.aug-*` to `.reward-card-*`.
- Preserve compatibility for gameplay data and core build state.

## Non-Goals

- No reward content or balance changes.
- No changes to core `src/game/build/BuildTypes.ts` ownership arrays.
- No redesign of reward selection or augment-slot animation.

## Acceptance Criteria

- No production import or type reference to `AugmentItem` remains.
- UI build, reward modal, shop, battle inventory, and data projection compile against `RewardCard`.
- Existing render tests verify reward-card class names and item/augment badges.
- Full repository verification passes.
