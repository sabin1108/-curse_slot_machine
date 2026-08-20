# UI Showcase Slot Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Showcase Mode slot results on the scripted legacy presentation path instead of the adapter-owned structured slot RNG path.

**Architecture:** `UiGameEngine` continues to use structured slot RNG for normal combat. When Showcase Mode is active, `SPIN_COMBAT_SLOT` delegates to the legacy presentation engine so `SHOWCASE_STEPS.forcedResult` remains authoritative, and `START_SHOWCASE` resets adapter-owned structured slot state to prevent normal-mode stale slots from leaking into the demo path.

**Tech Stack:** TypeScript, Vitest, existing UI adapter and legacy presentation engine.

## Global Constraints

- New behavior is TDD-protected.
- React remains display/input only.
- Showcase Mode stays separate and must not mutate normal combat balance.
- Do not redesign Showcase UI or add a title-screen entry point in this slice.
- Do not merge PRs without explicit user approval.

---

### Task 1: Preserve Showcase Forced Slot Results

**Files:**
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiGameEngine.ts`

**Interfaces:**
- Consumes:
  - `{ type: 'START_SHOWCASE' }`
  - `{ type: 'SPIN_COMBAT_SLOT' }`
- Produces: `UiGameState` where showcase forced result is projected by the legacy presentation engine and stale adapter-owned structured slot state is cleared.

- [x] **Step 1: Write failing adapter tests**

Add two `UiGameEngine` tests:

```ts
it('uses showcase forced slot results instead of structured slot rng', () => {
  const engine = new GameEngine('showcase-forced-slot')

  engine.dispatch({ type: 'START_SHOWCASE' })

  const state = engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

  expect(state.showcase.active).toBe(true)
  expect(state.currentResult).toMatchObject({
    action: { id: 'bullet' },
    target: { id: 'pow_10' },
    modifier: { id: 'x2' },
  })
})
```

```ts
it('clears adapter-owned slot state when starting showcase mode', () => {
  const engine = new GameEngine('showcase-clears-structured-slot')

  engine.dispatch({ type: 'START_RUN', seed: 'showcase-clears-structured-slot' })
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
  engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

  const showcaseState = engine.dispatch({ type: 'START_SHOWCASE' })
  const enemyHpBeforeConfirm = showcaseState.enemy.hp
  const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

  expect(showcaseState.showcase.active).toBe(true)
  expect(showcaseState.currentResult).toBeNull()
  expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
})
```

- [x] **Step 2: Run tests to verify RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: FAIL because showcase spin currently uses structured slot RNG and `START_SHOWCASE` does not clear adapter-owned structured slot state.

- [x] **Step 3: Implement minimal showcase guard**

In `UiGameEngine.dispatch`:

- handle `START_SHOWCASE` before fallback;
- delegate to `this.legacy.dispatch(command)`;
- reset structured engine with the returned seed;
- reset `slotRng`;
- clear `currentStructuredSlot`;
- assign `presentation`.

For `SPIN_COMBAT_SLOT`, if `this.presentation.showcase.active` is true:

```ts
this.currentStructuredSlot = null
this.presentation = this.legacy.dispatch(command)
return this.presentation
```

Keep the existing structured slot path for normal mode.

- [x] **Step 4: Run targeted tests to verify GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`
Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Update handoff/progress/collaboration docs.
- [x] Commit, push, and open a draft PR.
