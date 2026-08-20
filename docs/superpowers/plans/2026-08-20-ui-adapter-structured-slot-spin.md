# UI Adapter Structured Slot Spin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route UI combat slot spin and lock-aware reroll through the pure `CombatSlotMachine` functions in the UI adapter.

**Architecture:** `UiGameEngine` owns an adapter-local seeded slot RNG and latest structured `CombatSlotResult`. `SPIN_COMBAT_SLOT` uses `spinCombatSlot`; `REROLL_UNLOCKED` uses `rerollCombatSlot` and `getCombatRerollCurseCost`; the adapter then projects the pure slot result into the existing UI `SlotResult` shape. React remains display/input only.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-first.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- Do not migrate map, shop, rest, or showcase in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Structured Spin And Reroll Projection

**Files:**
- Modify: `src/game/engine/UiGameEngine.ts`
- Test: `src/game/engine/UiGameEngine.test.ts`

**Interfaces:**
- Consumes: `spinCombatSlot`, `rerollCombatSlot`, `getCombatRerollCurseCost`, `createSeededRng`.
- Produces: UI `currentResult`, `hasSpunThisTurn`, `curse.current`, and lock-aware reroll state.

- [x] **Step 1: Write failing tests**

Add tests that assert:

- seed `slot-ui` spins to pure result `bullet/enemy/x2`
- seed `slot-ui-2` spins to `shield/all/x1`, then locking action and rerolling keeps `shield`, changes to `self/x3`, and increases curse by `2`

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: fail because adapter still delegates spin/reroll to the legacy engine.

- [x] **Step 3: Implement minimal adapter routing**

Add adapter-local slot RNG/current result and handlers for `SPIN_COMBAT_SLOT` and `REROLL_UNLOCKED`.

- [x] **Step 4: Run test to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: pass.

### Task 2: Verification

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [ ] Commit and push the follow-up change to draft PR #10.
