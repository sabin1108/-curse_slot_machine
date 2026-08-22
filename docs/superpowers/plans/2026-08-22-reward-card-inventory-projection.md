# Reward Card Inventory Projection Plan

Date: 2026-08-22
Branch: `feature/reward-card-inventory-projection`

## Plan

1. Add a failing `UiProjection` test for a core state with one owned augment and one owned item.
2. Change UI `BuildState.items` to use the same `AugmentItem` card model as `BuildState.augments`.
3. Update `projectUiGameState` to resolve augment IDs and item IDs separately.
4. Update battle inventory rendering and the legacy side panel to count and display both arrays.
5. Add a render regression proving the battle inventory shows both an augment and an item.
6. Run targeted tests, full verification, independent review, documentation update, commit, push, and draft PR.

## Review Notes

- Initial TDD check failed as expected because `projected.build.augments` contained item cards and `projected.build.items` leaked raw item IDs.
- Explorer subagent confirmed the safe change boundary is `UiProjection` plus UI consumers; core build/reward systems should stay ID-based.
- Code-review feedback identified that the projection boundary also needed kind enforcement and stronger render acceptance coverage.
- Follow-up changes added discriminated UI card subtypes, explicit projection kind validation, wrong-kind regression coverage, combined count coverage, legacy side-panel coverage, and item-card ID multiplier display coverage.
