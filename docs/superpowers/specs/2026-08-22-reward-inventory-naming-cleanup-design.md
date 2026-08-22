# Reward Inventory Naming Cleanup Design

Branch: `feature/reward-inventory-naming-cleanup`
Base: `feature/reward-card-type-cleanup`
Date: 2026-08-22

## Problem

The UI card model now represents both augments and items as `RewardCard`, but two display-only names still imply augment-only ownership:

- `src/components/Battle/AugmentSidePanel.tsx`
- `ALL_AUGMENTS` in `src/game/data.ts`

This makes future inventory work harder to review because reward-card UI and augment-slot gameplay concepts are no longer clearly separated.

## Scope

- Rename the legacy side-panel component to `RewardInventorySidePanel`.
- Rename the display catalog export to `ALL_REWARD_CARDS`.
- Keep the rendered inventory behavior unchanged: owned augments and owned items both render in one list with existing `reward-card-*` class names.
- Update docs that summarize current branch state and remaining work.

## Non-Goals

- Do not change combat, reward generation, RNG, or command handling.
- Do not rename `AugmentSlotMachine`, `augSlotPresentation`, or `targetAugment`; those still describe the augment reveal slot flow.
- Do not redesign inventory layout or reward-card visuals.
- Do not repair unrelated mojibake or copy issues in this branch.

## Acceptance Criteria

- Tests import and render `RewardInventorySidePanel` instead of `AugmentSidePanel`.
- No production or test code references `AugmentSidePanel`.
- No production code exports `ALL_AUGMENTS`; callers use `ALL_REWARD_CARDS`.
- Existing targeted component/projection tests pass.
- Full verification passes: `npm.cmd run typecheck`, `npm.cmd run test:run`, `npm.cmd run build`, `npm.cmd run test:e2e`, and `git diff --check`.

## Review Notes

The useful reviewer question is whether this branch only removes stale augment-only naming, without changing reward inventory semantics or accidentally renaming real augment-slot concepts.
