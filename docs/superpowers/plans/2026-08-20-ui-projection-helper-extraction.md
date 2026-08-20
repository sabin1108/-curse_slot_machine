# UI Projection Helper Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move UI projection helpers out of `UiGameEngine` into a small pure module without changing behavior.

**Architecture:** Add `src/game/engine/UiProjection.ts` for converting structured rewards, synergies, and slot results into legacy UI presentation types. `UiGameEngine` remains responsible for command orchestration and state transitions.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- Refactor is protected by tests.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- Do not migrate map, shop, rest, or showcase in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Projection Helper Module

**Files:**
- Create: `src/game/engine/UiProjection.ts`
- Test: `src/game/engine/UiProjection.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`

**Interfaces:**
- Produces: `toUiSlotResult`, `toUiReward`, `toUiAugment`, `toUiSynergyProgress`, `getReelIndex`.
- Consumes: existing UI types, structured reward/build/slot types, and UI reel data.

- [x] **Step 1: Write failing tests**

Add helper tests that assert:

- `toUiSlotResult({ action: 'bullet', target: 'enemy', modifier: 'x2' })` returns a UI result with bullet/enemy/x2 and calculated value `12`
- `toUiSlotResult({ action: 'shield', target: 'self', modifier: 'x3' })` returns shield/self/x3 and calculated value `15`

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`
Expected: fail because `UiProjection.ts` does not exist.

- [x] **Step 3: Extract helpers**

Move projection helpers from `UiGameEngine.ts` to `UiProjection.ts` and update imports.

- [x] **Step 4: Run test to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/game/engine/UiGameEngine.test.ts`
Expected: pass.

### Task 2: Verification

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Commit and push the follow-up change to draft PR #11.
