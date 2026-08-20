# UI Select Map Node Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `SELECT_MAP_NODE` prepare a safe battle-entry UI state in the adapter.

**Architecture:** `UiGameEngine` still delegates map path bookkeeping to the legacy presentation engine, but the adapter owns battle-entry cleanup for structured combat state. This prevents stale adapter-owned slot results from resolving after map navigation.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Game outcomes, RNG, rewards, and combat effects stay in pure TypeScript systems.
- Do not migrate full map/shop/rest/showcase state in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Map Node Battle Entry

**Files:**
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`

**Interfaces:**
- Consumes: UI command `{ type: 'SELECT_MAP_NODE'; nodeId: number }`
- Produces: `UiGameState` with selected node in `visitedNodePath`, `screen: 'BATTLE'`, no current slot result, no locked reels, and no stale structured slot resolution.

- [x] **Step 1: Write failing test**

Add a `UiGameEngine` test that reaches map state after reward selection, dispatches `SELECT_MAP_NODE`, and asserts:

```ts
expect(battleState.screen).toBe('BATTLE')
expect(battleState.visitedNodePath).toContain(1)
expect(battleState.currentResult).toBeNull()
expect(battleState.hasSpunThisTurn).toBe(false)
expect(battleState.lockedReels.size).toBe(0)
```

Then dispatch `CONFIRM_SLOT_RESULT` without a new spin and assert enemy HP is unchanged.

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because `SELECT_MAP_NODE` currently delegates to legacy map bookkeeping but does not set battle entry or clear adapter-owned structured slot state.

- [x] **Step 3: Implement minimal adapter battle entry**

In `UiGameEngine.dispatch`, handle `SELECT_MAP_NODE` before fallback:

- delegate the command to the legacy presentation engine;
- set `screen` to `BATTLE`;
- clear `currentStructuredSlot`;
- clear `currentResult`;
- set `hasSpunThisTurn` and `isSpinning` false;
- clear `lockedReels`.

- [x] **Step 4: Run test to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [ ] Commit, push, and open a draft PR.
