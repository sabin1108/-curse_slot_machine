# UI Map Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move map presentation data behind `projectUiGameState` while preserving current route behavior.

**Architecture:** `RunSystem` keeps route/progression ownership. `UiProjection` converts core run state into a UI map view model. `DungeonMapScreen` renders projected nodes and dispatches existing commands only.

**Tech Stack:** TypeScript, React, Vitest, React Testing Library.

## Global Constraints

- Pure TypeScript game systems own deterministic route and stage progression.
- React renders projected map state and sends commands only.
- No route, reward, shop, rest, combat, or event outcome behavior changes.
- No new dependencies.
- Add tests before production code changes.

---

### Task 1: Project Map State

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/engine/UiProjection.ts`
- Modify: `src/game/engine/UiProjection.test.ts`

**Interfaces:**
- Produces: `getNextStage(run: RunState): RunStageDefinition | null`
- Produces: `MapNodeView`
- Produces: `MapViewState`
- Extends: `GameState.map`

- [x] **Step 1: Write failing projection tests**

Add tests that assert projected map nodes include all 15 route stages, stage 1 is available on a fresh started run, completed stages are marked completed, and an entered event stage is projected as current.

- [x] **Step 2: Run projection tests and verify RED**

Run `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`.
Expected: fail because `projected.map` does not exist.

- [x] **Step 3: Implement map projection types and data**

Add `MapNodeView` and `MapViewState` to `src/types/game.ts`, export `getNextStage(run)` from `RunSystem`, then populate `map` from `MVP_ROUTE`, `getNextStage`, and core `run` in `projectUiGameState`.

- [x] **Step 4: Run projection tests and verify GREEN**

Run `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`.
Expected: pass.

### Task 2: Render Projected Map State

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/components/Navigation/DungeonMapScreen.tsx`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: `GameState.map`

- [x] **Step 1: Write or confirm App regression**

Keep the existing App regression that starts a run and verifies Stage 1 is enabled through the rendered map.

- [x] **Step 2: Rewire map props**

Pass `gameState.map` from `App` to `DungeonMapScreen`. Remove raw `coreState.run` props from that screen.

- [x] **Step 3: Remove route derivation from DungeonMapScreen**

Make `DungeonMapScreen` render `map.nodes`, `map.activeNode`, and `map.currentNode`. Remove its `MVP_ROUTE` import and `RunStageDefinition` dependency.

- [x] **Step 4: Run targeted UI tests**

Run `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/app/App.test.tsx`.
Expected: pass.

### Task 3: Document, Review, And Verify

**Files:**
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [x] **Step 1: Update branch docs**

Record the `feature/ui-map-projection` branch scope, review status, and verification evidence.

- [x] **Step 2: Request independent review**

Dispatch read-only code and architecture review agents against the branch diff. Fix blocking findings.

Result: code review found no code defects. Architecture review returned `WATCH` for duplicated next-stage selection; fixed by adding `getNextStage(run)` in `RunSystem` and using it from both `enterNextStage` and `UiProjection`. Architecture re-review returned `CLEAR`.

- [ ] **Step 3: Run full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

Expected: all pass before opening a draft PR.
