# UI Adapter Synergy Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue structured-engine UI migration by projecting real structured synergy progress into the existing UI build panel state.

**Architecture:** `UiGameEngine` remains the adapter boundary between pure TypeScript systems and the legacy React state shape. The structured `BuildSystem` continues to own progress/completion calculation; React receives projected values only. No reward scoring, combat resolution, RNG, or React component rule logic changes.

**Tech Stack:** TypeScript, Vitest.

## Global Constraints

- React renders state and dispatches commands only.
- Do not move reward generation, RNG, combat resolution, or synergy rules into React.
- Keep this as a narrow adapter projection slice.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Project Structured Synergy Progress Values

**Files:**
- Modify: `src/game/engine/UiGameEngine.test.ts`
- Modify: `src/game/engine/UiProjection.ts`
- Modify: `src/game/engine/UiGameEngine.ts`

**Interfaces:**
- Consumes: `BuildState.synergies.progress` from `src/game/build/BuildTypes.ts`.
- Produces: UI `build.synergyProgress` entries whose `current`, `required`, and `completed` match the structured build state.

- [x] **Step 1: Write the failing adapter test**

Add this expectation-focused test to `src/game/engine/UiGameEngine.test.ts`:

```ts
it('projects structured synergy progress values into the UI build panel', () => {
  const engine = new GameEngine('structured-progress-ui')

  engine.dispatch({ type: 'START_RUN', seed: 'structured-progress-ui' })
  engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
  const partialState = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'multi_hit_charm' })

  expect(partialState.build.synergyProgress).toContainEqual(
    expect.objectContaining({
      synergyId: 'combo_engine',
      current: 2,
      required: 3,
      completed: false,
    }),
  )

  const completedState = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_finisher' })

  expect(completedState.build.synergyProgress).toContainEqual(
    expect.objectContaining({
      synergyId: 'combo_engine',
      current: 3,
      required: 3,
      completed: true,
    }),
  )
})
```

- [x] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`

Expected: FAIL because UI synergy progress currently stays at `current: 0` and `completed: false`.

Actual: FAIL because `combo_engine` UI progress stayed at `current: 0` while the expected partial progress was `2`.

- [x] **Step 3: Update projection helper signature**

In `src/game/engine/UiProjection.ts`, import structured progress as a type alias:

```ts
import type {
  BuildRewardDefinition,
  SynergyDefinition,
  SynergyProgress as StructuredSynergyProgress,
  SynergyTag,
} from '../build/BuildTypes'
```

Change `toUiSynergyProgress` to:

```ts
export function toUiSynergyProgress(
  synergy: SynergyDefinition,
  progress?: StructuredSynergyProgress,
): UiSynergyProgress {
  return {
    synergyId: synergy.id,
    name: synergy.name,
    tag: synergy.requiredTags[0]?.tag ?? ('COMBO' satisfies SynergyTag),
    current: progress?.current ?? 0,
    required:
      progress?.required ?? synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0),
    completed: progress?.completed ?? false,
    effectDescription: synergy.description,
  }
}
```

- [x] **Step 4: Pass structured progress from adapter**

In `src/game/engine/UiGameEngine.ts`, update `projectStructuredBuild()`:

```ts
synergyProgress: DEFAULT_BUILD_CATALOG.synergies.map((synergy) =>
  toUiSynergyProgress(
    synergy,
    build.synergies.progress.find((progress) => progress.synergyId === synergy.id),
  ),
),
```

- [x] **Step 5: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`

Expected: PASS.

Actual: PASS with 16 tests.

- [x] **Step 6: Full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected: all pass.

Actual: `typecheck`, full `test:run` with 59 tests, and `build` passed.

- [x] **Step 7: Update docs, commit, push, and open draft PR**

Update:
- `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- `docs/agent/SESSION_HANDOFF.md`
- `docs/CODEX_COLLABORATION.md`

Commit, push, and open a draft PR against `main`.

Actual: branch pushed and draft PR #23 opened at https://github.com/sabin1108/-curse_slot_machine/pull/23.
