# Game Engine Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first pure TypeScript game engine core with seeded RNG, commands, events, state, and deterministic command processing.

**Architecture:** The engine is framework-free and lives under `src/game/engine`. `GameEngine` owns state transitions and emits events; React will only consume the state and events in later branches. The first command surface is intentionally small so later slot/combat systems can plug in without hardcoding UI decisions.

**Tech Stack:** TypeScript 5.9, Vitest 3, Vite project test runner.

## Global Constraints

- React UI does not decide RNG, reel outcomes, combat results, rewards, or enemy actions.
- All game outcomes are produced by `GameEngine` or pure TypeScript game systems.
- Same seed plus same command sequence must produce the same state and events.
- `CombatSlotMachine` and `AugmentSlotMachine` remain separate future systems.
- Showcase-specific behavior must not be embedded in normal combat calculations.
- Use TDD: add failing tests before production engine code.

---

### Task 1: Deterministic RNG

**Files:**
- Create: `src/game/engine/rng.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Produces: `createSeededRng(seed: number | string): SeededRng`
- Produces: `SeededRng.next(): number`, `SeededRng.nextInt(maxExclusive: number): number`, `SeededRng.snapshot(): RngSnapshot`

- [x] **Step 1: Write failing RNG determinism test**

Add this test:

```ts
it('produces the same random sequence for the same seed', () => {
  const a = createSeededRng('table-13')
  const b = createSeededRng('table-13')

  expect([a.next(), a.next(), a.nextInt(10)]).toEqual([
    b.next(),
    b.next(),
    b.nextInt(10),
  ])
})
```

- [x] **Step 2: Run targeted test**

Run:

```powershell
npm.cmd run test:run -- src/game/engine/GameEngine.test.ts
```

Expected: fail because `rng.ts` does not exist.

- [x] **Step 3: Implement minimal RNG**

Use a deterministic 32-bit string hash plus a simple PRNG with state snapshots. `next()` returns a number in `[0, 1)`, and `nextInt(maxExclusive)` validates positive integer bounds.

- [x] **Step 4: Rerun targeted test**

Expected: pass.

### Task 2: Game State, Commands, And Events

**Files:**
- Create: `src/game/engine/commands.ts`
- Create: `src/game/engine/events.ts`
- Create: `src/game/engine/GameState.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Produces: `GameCommand` union with `START_RUN` and `ADVANCE_TURN`.
- Produces: `GameEvent` union with `RUN_STARTED` and `TURN_ADVANCED`.
- Produces: `GameState` type and `createInitialGameState(seed)`.

- [x] **Step 1: Write failing state/command test**

Add assertions that a new state starts at phase `idle`, turn `0`, and keeps the original seed.

- [x] **Step 2: Run targeted test**

Expected: fail because state modules do not exist.

- [x] **Step 3: Implement minimal types and initial state**

Implement only fields needed by the deterministic engine branch: `seed`, `phase`, `turn`, `rng`, `log`.

- [x] **Step 4: Rerun targeted test**

Expected: pass.

### Task 3: GameEngine Deterministic Command Processing

**Files:**
- Create: `src/game/engine/GameEngine.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Produces: `new GameEngine(seed: number | string)`
- Produces: `engine.dispatch(command: GameCommand): GameEvent[]`
- Produces: `engine.getState(): GameState`

- [x] **Step 1: Write failing engine determinism test**

Create two engines with the same seed, dispatch identical command sequences, and assert states and emitted events are equal.

- [x] **Step 2: Run targeted test**

Expected: fail because `GameEngine.ts` does not exist.

- [x] **Step 3: Implement minimal engine**

`START_RUN` changes phase from `idle` to `battle`, emits `RUN_STARTED`, and records one deterministic roll from RNG. `ADVANCE_TURN` increments turn, emits `TURN_ADVANCED`, and records one deterministic roll.

- [x] **Step 4: Rerun targeted test**

Expected: pass.

### Task 4: Verification And Handoff

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [x] **Step 1: Run required checks**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Run `npm.cmd run test:e2e` if the app shell remains affected by this branch.

- [x] **Step 2: Update handoff docs**

Record branch, commit placeholder, verification results, and next branch `feature/combat-slot-machine`.

- [ ] **Step 3: Commit**

Run:

```powershell
git add .
git commit -m "feat: add deterministic game engine core"
```

## Self-Review

- Spec coverage: seeded RNG, `GameCommand`, `GameEvent`, `GameState`, `GameEngine`, and same seed plus same commands deterministic test are covered.
- Placeholders: none.
- Type consistency: all produced type/function names match their consuming tasks.
