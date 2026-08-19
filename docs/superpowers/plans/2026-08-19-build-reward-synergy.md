# Build Reward Synergy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic build, reward, and synergy systems so combat victory can offer build-linked rewards and reward choices can activate synergies.

**Architecture:** Keep build/reward/synergy as pure TypeScript under `src/game/build`. `GameEngine` owns command integration only: it asks `RewardSystem` for options after combat victory and applies selected options through `BuildSystem`. React UI demo data remains unchanged in this branch.

**Tech Stack:** TypeScript, Vitest, existing seeded engine modules, no new runtime dependencies.

## Global Constraints

- Game outcomes are produced by pure TypeScript game systems.
- React renders state, events, controls, and animation only.
- Seeded RNG is required for reproducible normal-game results.
- Combat slots and augment slots are different systems.
- Showcase Mode uses scripted scenario/reward data and must not mutate normal combat balance.
- MVP content should favor extensible data structures over hardcoded augment, item, or synergy names.

---

### Task 1: Build And Synergy System

**Files:**
- Create: `src/game/build/BuildTypes.ts`
- Create: `src/game/build/BuildCatalog.ts`
- Create: `src/game/build/BuildSystem.ts`
- Test: `src/game/build/BuildSystem.test.ts`

**Interfaces:**
- Produces: `createBuildState(overrides?)`, `evaluateSynergies(build, catalog?)`, `applyReward(build, reward, catalog?)`.
- Consumes: no React or UI demo types.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'

import { applyReward, createBuildState, evaluateSynergies } from './BuildSystem'

describe('BuildSystem', () => {
  it('tracks multi-requirement synergy progress across augments and items', () => {
    const build = createBuildState({
      augments: ['combo_starter', 'combo_finisher'],
      items: ['multi_hit_charm'],
    })

    const result = evaluateSynergies(build)

    expect(result.completed).toEqual(['combo_engine'])
    expect(result.progress).toContainEqual({
      synergyId: 'combo_engine',
      current: 3,
      required: 3,
      completed: true,
    })
  })

  it('applies an augment reward once and reports newly completed synergies', () => {
    const build = createBuildState({
      augments: ['combo_starter'],
      items: ['multi_hit_charm'],
    })

    const result = applyReward(build, { kind: 'augment', id: 'combo_finisher' })

    expect(result.build.augments).toEqual(['combo_starter', 'combo_finisher'])
    expect(result.events).toContainEqual({
      type: 'SYNERGY_COMPLETED',
      synergyId: 'combo_engine',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`

- [ ] **Step 3: Implement minimal system**

Add catalog definitions for `combo_starter`, `combo_finisher`, `multi_hit_charm`, and `combo_engine`. Count tags by source, compute aggregate progress, and return immutable build copies.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`

### Task 2: Reward System

**Files:**
- Create: `src/game/build/RewardSystem.ts`
- Test: `src/game/build/RewardSystem.test.ts`

**Interfaces:**
- Consumes: `BuildState`, `BuildCatalog`, and `evaluateSynergies`.
- Produces: `generateRewardOptions(build, options?)`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'

import { createBuildState } from './BuildSystem'
import { generateRewardOptions } from './RewardSystem'

describe('RewardSystem', () => {
  it('excludes owned rewards and prioritizes synergy completion', () => {
    const build = createBuildState({
      augments: ['combo_starter'],
      items: ['multi_hit_charm'],
    })

    const options = generateRewardOptions(build, { count: 3 })

    expect(options.map((option) => option.id)).not.toContain('combo_starter')
    expect(options[0]).toMatchObject({
      kind: 'augment',
      id: 'combo_finisher',
      score: expect.objectContaining({ completionValue: expect.any(Number) }),
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/build/RewardSystem.test.ts`

- [ ] **Step 3: Implement minimal scoring**

Score unowned rewards with immediate power, synergy gap value, completion value, and future value. Sort by total score, then rarity, then id for deterministic output.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/build/RewardSystem.test.ts`

### Task 3: GameEngine Integration

**Files:**
- Modify: `src/game/engine/GameState.ts`
- Modify: `src/game/engine/commands.ts`
- Modify: `src/game/engine/events.ts`
- Modify: `src/game/engine/GameEngine.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Consumes: `createBuildState`, `generateRewardOptions`, and `applyReward`.
- Produces: `GENERATE_REWARDS` and `CHOOSE_REWARD` command behavior.

- [ ] **Step 1: Write failing tests**

Add tests showing lethal combat moves the engine to `reward` phase with reward candidates, and choosing a reward adds it to `state.build`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`

- [ ] **Step 3: Implement minimal integration**

Add `build` and `rewards` to engine state. After combat outcome `victory`, set phase to `reward` and populate reward candidates. Add `CHOOSE_REWARD` to apply the reward and return to `battle`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`

### Task 4: Verification And PR

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [ ] Run `npm.cmd run typecheck`
- [ ] Run `npm.cmd run test:run`
- [ ] Run `npm.cmd run build`
- [ ] Commit, push, and open a draft PR.

## Self-Review

- Spec coverage: covers build state, synergy progress/completion, reward system candidate generation, and engine reward choice integration.
- Explicitly out of scope: AugmentSlotMachine reveal animation, authored item economy, Showcase scripted reward sequence, UI wiring.
- Placeholder scan: no task contains TBD/TODO placeholders.
- Type consistency: `BuildState`, `RewardOption`, `SynergyProgress`, and command names are defined before integration tasks.
