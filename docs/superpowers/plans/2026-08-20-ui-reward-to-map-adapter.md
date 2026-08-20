# UI Reward To Map Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure choosing a structured reward through `UiGameEngine` exits the reward modal and returns the visible UI to the map progression shell.

**Architecture:** `UiGameEngine` remains the UI adapter. Structured `GameEngine` owns reward/build application; the legacy presentation engine remains the temporary owner of map/wave/enemy UI shell progression until those systems are migrated.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Game outcomes, RNG, rewards, and combat effects stay in pure TypeScript systems.
- Do not migrate full map/shop/rest/showcase state in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Structured Reward Selection Returns To Map

**Files:**
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`

**Interfaces:**
- Consumes: UI command `{ type: 'CHOOSE_REWARD'; augmentId: string }`
- Produces: `UiGameState` with `screen: 'MAP'`, cleared `rewardCandidates`, cleared `augSlotPresentation`, advanced UI `wave`, and projected structured build state.

- [x] **Step 1: Write failing test**

Add a `UiGameEngine` test that reaches structured reward state, chooses the first UI reward candidate, and asserts the UI returns to map progression:

```ts
expect(afterChoose.screen).toBe('MAP')
expect(afterChoose.rewardCandidates).toEqual([])
expect(afterChoose.augSlotPresentation).toBeNull()
expect(afterChoose.wave).toBe(2)
expect(afterChoose.enemy.hp).toBeGreaterThan(0)
expect(afterChoose.build.augments.map((augment) => augment.id)).toContain(chosenRewardId)
```

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because structured `CHOOSE_REWARD` currently returns from `REWARD` without clearing reward presentation or advancing the UI map shell.

- [x] **Step 3: Implement minimal adapter progression**

In `UiGameEngine.dispatch`, after structured reward application succeeds:

- delegate the same UI command to the legacy presentation engine for temporary map/wave/enemy shell progression;
- project structured build over that presentation state;
- project structured rewards so reward candidates and augment slot presentation clear;
- preserve the existing reward combat log.

- [x] **Step 4: Run test to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [ ] Commit, push, and open a draft PR.
