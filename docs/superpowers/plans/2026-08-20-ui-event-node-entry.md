# UI Event Node Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make event map node selection pass through the UI adapter command boundary before the React event choice modal opens.

**Architecture:** `DungeonMapScreen` keeps local modal display for event choices in this slice, but it must dispatch `SELECT_MAP_NODE` with `nodeType: 'EVENT'` when an event node is selected. `UiGameEngine` records the visited event node, clears stale combat slot presentation state, and keeps the visible screen on `MAP` so the existing map overlay can render.

**Tech Stack:** TypeScript, React, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Game outcomes, RNG, rewards, and combat effects stay in pure TypeScript systems.
- Do not implement event choice reward/rest/skip resolution in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Route Event Node Entry Through The Adapter

**Files:**
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`
- Modify: `src/components/Navigation/DungeonMapScreen.tsx`

**Interfaces:**
- Consumes: UI command `{ type: 'SELECT_MAP_NODE'; nodeId: number; nodeType: 'EVENT' }`
- Produces: `UiGameState` with selected node in `visitedNodePath`, stale combat presentation cleared, and `screen: 'MAP'`.

- [x] **Step 1: Write failing adapter test**

Add a `UiGameEngine` test:

```ts
it('selects an event map node into clean map event entry without resolving a stale slot', () => {
  const engine = new GameEngine('lethal-ui-24')

  engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
  engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
  const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
  const chosenRewardId = rewardState.rewardCandidates[0].id
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

  const eventState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })
  const enemyHpBeforeConfirm = eventState.enemy.hp

  expect(eventState.screen).toBe('MAP')
  expect(eventState.visitedNodePath).toContain(6)
  expect(eventState.currentResult).toBeNull()
  expect(eventState.hasSpunThisTurn).toBe(false)
  expect(eventState.lockedReels.size).toBe(0)

  const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

  expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
  expect(afterInvalidConfirm.screen).toBe('MAP')
})
```

- [x] **Step 2: Run test to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because `EVENT` currently routes through the battle default.

- [x] **Step 3: Implement minimal event node destination**

In `getMapNodeDestinationScreen`, route `nodeType === 'EVENT'` to `MAP`. Keep existing cleanup logic unchanged.

- [x] **Step 4: Dispatch event node selection before opening the local modal**

In `DungeonMapScreen.handleSelectNode`, for `EVENT` nodes call:

```ts
onDispatch({ type: 'SELECT_MAP_NODE', nodeId: node.id, nodeType: node.type })
setActiveEventNode(node)
return
```

Do not change `handleEventChoice` in this slice.

- [x] **Step 5: Run targeted tests to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [x] Commit, push, and open a draft PR.
