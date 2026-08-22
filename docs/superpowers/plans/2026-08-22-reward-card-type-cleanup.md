# Reward Card Type Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename UI reward-card types and classes from augment-only terminology to neutral reward-card terminology.

**Architecture:** Core build ownership remains ID-based. `UiProjection` remains the boundary that converts core reward definitions into UI `RewardCard` objects. React components render projected cards without resolving reward definitions or changing gameplay state.

**Tech Stack:** React, TypeScript, Vitest, Playwright.

## Global Constraints

- Pure TypeScript systems own deterministic game behavior.
- React renders projected state only.
- Do not change reward content, combat resolution, RNG, or core build ownership arrays.
- Keep the branch stacked on `feature/reward-card-inventory-projection`.

---

### Task 1: Rename UI Reward Card Types

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/data.ts`
- Modify: `src/components/Reward/RewardModal.tsx`
- Modify: `src/components/Battle/BattleScreen.test.tsx`

**Interfaces:**
- Produces: `RewardCard`, `AugmentCard`, and `ItemCard` from `src/types/game.ts`.
- Consumes: existing `AugmentCard` and `ItemCard` discriminated subtype behavior.

- [ ] Replace `AugmentItem` with `RewardCard` in UI type definitions and imports.
- [ ] Keep `AugmentCard` and `ItemCard` as `RewardCardBase` specializations.
- [ ] Update reward modal local variable names from `selectedAug`/`augment` to reward-card terminology.
- [ ] Run `npm.cmd run typecheck`; expected result after implementation: PASS.

### Task 2: Rename Projection Helper

**Files:**
- Modify: `src/game/engine/UiProjection.ts`
- Modify: `src/game/engine/UiProjection.test.ts`
- Modify: `src/components/Navigation/ShopScreen.tsx`

**Interfaces:**
- Consumes: `RewardCard` UI type.
- Produces: `toUiRewardCard(reward: BuildRewardDefinition): RewardCard` and `toUiReward(reward: RewardOption): RewardCard`.

- [ ] Rename `toUiAugment` to `toUiRewardCard`.
- [ ] Keep `toUiReward` as the public reward-option adapter.
- [ ] Update tests and shop usage.
- [ ] Run targeted projection tests: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`.

### Task 3: Rename Battle Inventory Classes

**Files:**
- Modify: `src/components/Battle/BattleScreen.tsx`
- Modify: `src/components/Battle/AugmentSidePanel.tsx`
- Modify: `src/components/Battle/BattleScreen.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: projected `RewardCard` arrays from UI state.
- Produces: neutral `.reward-card-*` class names for inventory rows, lists, labels, and values.

- [ ] Replace battle inventory class names with neutral `reward-card-*` names.
- [ ] Update tests to assert `.reward-card-list` and `.reward-card-row-*`.
- [ ] Keep old gameplay-visible copy unchanged except where it names the combined inventory panel.
- [ ] Run targeted component tests: `npm.cmd run test:run -- src/components/Battle/BattleScreen.test.tsx`.

### Task 4: Document, Review, Verify, PR

**Files:**
- Modify: `DESIGN.md`
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`

**Interfaces:**
- Produces: updated handoff and progress notes for the stacked branch.

- [ ] Mark the `AugmentItem` naming debt as resolved in `DESIGN.md`.
- [ ] Update handoff/progress docs with verification and review results.
- [ ] Request code-review and architecture review subagents.
- [ ] Run full verification:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

- [ ] Commit, push, and create a draft PR against `feature/reward-card-inventory-projection`.
