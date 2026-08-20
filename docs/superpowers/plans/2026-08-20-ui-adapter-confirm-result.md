# UI Adapter Confirm Result Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `CONFIRM_SLOT_RESULT` resolve the adapter-owned pure combat slot result instead of trusting mutable UI `currentResult`.

**Architecture:** `UiGameEngine` keeps `currentStructuredSlot` as the command-authoritative result from `SPIN_COMBAT_SLOT`/`REROLL_UNLOCKED`. UI `currentResult` remains presentation only. Combat confirmation reads `currentStructuredSlot`; if absent, it may fall back to legacy behavior for unsupported paths.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-first.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- Do not migrate map, shop, rest, or showcase in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Confirm Uses Adapter-Owned Slot Result

**Files:**
- Modify: `src/game/engine/UiGameEngine.ts`
- Test: `src/game/engine/UiGameEngine.test.ts`

**Interfaces:**
- Consumes: adapter `currentStructuredSlot`.
- Produces: `CONFIRM_SLOT_RESULT` resolution that ignores externally mutated UI `currentResult`.

- [x] **Step 1: Write failing tests**

Update structured confirm tests to spin through the adapter. Add a test that mutates `getState().currentResult` after spin and proves confirm still resolves the original pure slot result.

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: fail because confirm currently maps from mutable UI `currentResult`.

- [x] **Step 3: Implement minimal code**

Resolve `CONFIRM_SLOT_RESULT` from `currentStructuredSlot` when a structured build is active.

- [x] **Step 4: Run test to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: pass.

### Task 2: Verification

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [ ] Commit, push, and open a draft PR.
