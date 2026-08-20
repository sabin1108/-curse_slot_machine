# UI Map Node Type Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move map node screen routing for battle/shop/rest nodes out of React and into the UI adapter command boundary.

**Architecture:** `DungeonMapScreen` will still own static map node data and user input, but it will pass the selected node type with `SELECT_MAP_NODE`. `UiGameEngine` will delegate visit bookkeeping to the legacy presentation engine, then choose the correct destination screen and clear stale combat slot presentation state.

**Tech Stack:** TypeScript, React, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Game outcomes, RNG, rewards, and combat effects stay in pure TypeScript systems.
- Do not implement full event node logic in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Route Shop And Rest Map Nodes Through The Adapter

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`
- Modify: `src/components/Navigation/DungeonMapScreen.tsx`

**Interfaces:**
- Consumes: UI command `{ type: 'SELECT_MAP_NODE'; nodeId: number; nodeType?: 'BATTLE' | 'ELITE' | 'SHOP' | 'REST' | 'EVENT' | 'BOSS' }`
- Produces: `UiGameState` with selected node in `visitedNodePath`, stale combat presentation cleared, and screen set to `SHOP`, `REST`, or `BATTLE` for known node types.

- [x] **Step 1: Write failing adapter tests**

Add `UiGameEngine` tests for shop and rest nodes:

```ts
it('selects a shop map node into clean shop entry without resolving a stale slot', () => {
  const engine = new GameEngine('lethal-ui-24')

  engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
  engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
  const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
  const chosenRewardId = rewardState.rewardCandidates[0].id
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

  const shopState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 4, nodeType: 'SHOP' })
  const enemyHpBeforeConfirm = shopState.enemy.hp

  expect(shopState.screen).toBe('SHOP')
  expect(shopState.visitedNodePath).toContain(4)
  expect(shopState.currentResult).toBeNull()
  expect(shopState.hasSpunThisTurn).toBe(false)
  expect(shopState.lockedReels.size).toBe(0)

  const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

  expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
  expect(afterInvalidConfirm.screen).toBe('SHOP')
})
```

Repeat the same shape for `{ nodeId: 5, nodeType: 'REST' }` and expect `screen` to be `REST`.

- [x] **Step 2: Run tests to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because `SELECT_MAP_NODE` currently always sets `screen` to `BATTLE`.

- [x] **Step 3: Implement minimal adapter routing**

Extend `GameCommand` with optional `nodeType` on `SELECT_MAP_NODE`.

In `UiGameEngine.dispatch`, route:

```ts
const screen = command.nodeType === 'SHOP'
  ? 'SHOP'
  : command.nodeType === 'REST'
    ? 'REST'
    : 'BATTLE'
```

Keep existing cleanup:

```ts
this.currentStructuredSlot = null
this.presentation.currentResult = null
this.presentation.hasSpunThisTurn = false
this.presentation.isSpinning = false
this.presentation.lockedReels.clear()
```

- [x] **Step 4: Move React node screen decision to command data**

In `DungeonMapScreen`, dispatch one `SELECT_MAP_NODE` command with `nodeType: node.type`.

Remove the extra `NAVIGATE` dispatches for `SHOP`, `REST`, and battle-like nodes. Keep the local event modal branch for `EVENT` only.

- [x] **Step 5: Run targeted tests to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [x] Commit, push, and open a draft PR.
