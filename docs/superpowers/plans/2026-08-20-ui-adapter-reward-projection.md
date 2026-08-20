# UI Adapter Reward Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Project structured engine reward options into the existing React reward modal state after a structured combat victory.

**Architecture:** Keep reward generation in the structured pure engine. `UiGameEngine` observes structured `GameState.rewards` after combat resolution and converts `RewardOption`/`AugmentSlotPresentation` into the legacy UI presentation fields `rewardCandidates` and `augSlotPresentation`.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-first.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- Do not migrate map, shop, rest, or showcase in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Reward Projection After Structured Victory

**Files:**
- Modify: `src/game/engine/UiGameEngine.ts`
- Test: `src/game/engine/UiGameEngine.test.ts`

**Interfaces:**
- Consumes: structured `GameState.rewards.options` and `GameState.rewards.augmentSlot`.
- Produces: UI `rewardCandidates: AugmentItem[]` and UI `augSlotPresentation`.

- [x] **Step 1: Write the failing test**

Add a test that activates the structured adapter path, confirms a lethal `bullet/enemy/x3` slot result, and expects:

- `screen` is `REWARD`
- `rewardCandidates` contains three UI-visible rewards
- `augSlotPresentation.reels` contains string labels
- `augSlotPresentation.targetAugment.id` equals the first candidate ID

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: fail because reward projection is missing.

- [x] **Step 3: Write minimal implementation**

Add projection from structured reward options to UI `AugmentItem` presentation and from structured augment slot reels to legacy `[string, string, string]` presentation.

- [x] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: pass.

### Task 2: Verification

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [ ] Commit and push the follow-up change to the draft PR branch.
