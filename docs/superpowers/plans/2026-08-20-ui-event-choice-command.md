# UI Event Choice Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move event choice outcome selection from React branches into a single UI adapter command.

**Architecture:** `DungeonMapScreen` will only dispatch `{ type: 'RESOLVE_EVENT_CHOICE', choice }` for event modal buttons. `UiGameEngine` will translate the choice into the existing TypeScript presentation engine commands for this slice, preserving current outcome behavior while keeping React as display/input only.

**Tech Stack:** TypeScript, React, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Game outcomes, RNG, rewards, and combat effects stay in TypeScript systems.
- Do not redesign event rewards or add random event tables in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Add RESOLVE_EVENT_CHOICE Command

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`
- Modify: `src/components/Navigation/DungeonMapScreen.tsx`

**Interfaces:**
- Consumes: UI command `{ type: 'RESOLVE_EVENT_CHOICE'; choice: 'OPEN' | 'REST' | 'SKIP' }`
- Produces:
  - `OPEN`: adds the existing event chest item using the TypeScript engine path and keeps the screen on `MAP`.
  - `REST`: applies the existing heal event path and keeps/returns the screen to `MAP`.
  - `SKIP`: enters `BATTLE`.

- [x] **Step 1: Write failing adapter tests**

Add three `UiGameEngine` tests:

```ts
it('resolves event open choice through the adapter command', () => {
  const engine = new GameEngine('event-choice-open')

  engine.dispatch({ type: 'START_RUN', seed: 'event-choice-open' })
  engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })
  const before = engine.getState().build.items.length

  const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'OPEN' })

  expect(state.build.items).toHaveLength(before + 1)
  expect(state.screen).toBe('MAP')
})
```

```ts
it('resolves event rest choice through the adapter command', () => {
  const engine = new GameEngine('event-choice-rest')

  engine.dispatch({ type: 'START_RUN', seed: 'event-choice-rest' })
  const eventState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })
  eventState.player.hp = 60

  const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'REST' })

  expect(state.player.hp).toBe(95)
  expect(state.screen).toBe('MAP')
})
```

```ts
it('resolves event skip choice through the adapter command', () => {
  const engine = new GameEngine('event-choice-skip')

  engine.dispatch({ type: 'START_RUN', seed: 'event-choice-skip' })
  engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })

  const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'SKIP' })

  expect(state.screen).toBe('BATTLE')
})
```

- [x] **Step 2: Run tests to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because `RESOLVE_EVENT_CHOICE` is not part of `GameCommand`.

- [x] **Step 3: Implement minimal adapter command**

Add `EventChoice` and command union:

```ts
export type EventChoice = 'OPEN' | 'REST' | 'SKIP'
| { type: 'RESOLVE_EVENT_CHOICE'; choice: EventChoice }
```

In `UiGameEngine.dispatch`, map choices:

```ts
if (command.type === 'RESOLVE_EVENT_CHOICE') {
  const nextCommand = command.choice === 'OPEN'
    ? { type: 'BUY_SHOP_ITEM' as const, itemId: '보물상자 획득', price: 0 }
    : command.choice === 'REST'
      ? { type: 'REST_ACTION' as const, actionType: 'HEAL' as const }
      : { type: 'NAVIGATE' as const, screen: 'BATTLE' as const }

  this.presentation = this.legacy.dispatch(nextCommand)
  return this.presentation
}
```

- [x] **Step 4: Move React event buttons to the new command**

In `DungeonMapScreen.handleEventChoice`, replace branch-specific dispatches with:

```ts
onDispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: action })
```

Keep `setActiveEventNode(null)`.

- [x] **Step 5: Run targeted tests to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [x] Commit, push, and open a draft PR.
