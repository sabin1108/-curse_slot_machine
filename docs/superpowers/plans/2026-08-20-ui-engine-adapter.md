# UI Engine Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the structured content-effect combat result visible through a UI-facing engine seam without moving game rules into React.

**Architecture:** Add a thin adapter beside the structured engine. The adapter preserves the legacy UI command/state contract where practical, delegates structured reward and combat resolution to the pure engine, and projects the resulting build/combat state into existing UI presentation fields. This is an incremental bridge, not a full replacement for map/shop/rest/showcase.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-first.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- Do not merge PRs without explicit user approval.
- Keep changes small and reversible; do not rewrite the full legacy UI engine in this slice.

---

### Task 1: Adapter-Level Combat Visibility Test

**Files:**
- Create: `src/game/engine/UiGameEngine.ts`
- Test: `src/game/engine/UiGameEngine.test.ts`

**Interfaces:**
- Consumes: structured `GameEngine`, legacy UI `GameState`/`GameCommand`, `DEFAULT_BUILD_CATALOG`.
- Produces: a UI-facing `GameEngine` class with `getState()` and `dispatch(command)`.

- [x] **Step 1: Write the failing test**

Add a test that chooses `combo_starter`, `multi_hit_charm`, and `combo_finisher` through the UI-facing adapter, resolves `bullet/enemy/x1`, and expects UI-visible enemy HP to become `9` plus active synergy display to include `Combo Engine`.

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: fail because `UiGameEngine.ts` does not exist.

- [x] **Step 3: Write minimal implementation**

Create the adapter. Support only the commands required by the test through the structured engine; keep unsupported UI commands delegated to the legacy engine or no-op where safe.

- [x] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: pass.

### Task 2: Safe App Import Switch

**Files:**
- Modify: `src/app/App.tsx`
- Test: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: adapter class exported as `GameEngine`.
- Produces: React continues to render through the same UI state shape.

- [x] **Step 1: Write or run the existing App test as the guard**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`
Expected before import switch: pass.

- [x] **Step 2: Switch App import**

Change `src/app/App.tsx` to import `GameEngine` from `../game/engine/UiGameEngine`.

- [x] **Step 3: Run App test**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`
Expected: pass.

### Task 3: Verification

**Files:**
- Existing source and docs.

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Report changed files, verification evidence, and remaining adapter coverage gaps.
