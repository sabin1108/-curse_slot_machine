# Augment Slot Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before production changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic AugmentSlotMachine presentation system that reveals an already generated reward result without deciding reward RNG.

**Architecture:** Keep AugmentSlotMachine as pure TypeScript under `src/game/slot`. `GameEngine` stores reward presentation state after combat victory and clears it after reward selection. Reward generation remains owned by `RewardSystem`.

**Tech Stack:** TypeScript, Vitest, existing build/reward and engine modules, no new runtime dependencies.

## Global Constraints

- Game outcomes are produced by pure TypeScript game systems.
- React renders state, events, controls, and animation only.
- Combat slots and augment slots are different systems.
- Augment slot animation displays a preselected reward result and must not call random APIs to decide rewards.
- Showcase scripted rewards stay out of this branch.

---

### Task 1: Pure Augment Slot Presentation

**Files:**
- Create: `src/game/slot/AugmentSlotTypes.ts`
- Create: `src/game/slot/AugmentSlotMachine.ts`
- Test: `src/game/slot/AugmentSlotMachine.test.ts`

**Interfaces:**
- Produces: `createAugmentSlotPresentation(targetReward)` and `revealAugmentSlotPresentation(presentation)`.
- Consumes: `RewardOption`.

- [x] **Step 1: Write failing tests**
- [x] **Step 2: Run `npm.cmd run test:run -- src/game/slot/AugmentSlotMachine.test.ts` and confirm RED**
- [x] **Step 3: Implement minimal deterministic presentation**
- [x] **Step 4: Re-run targeted test and confirm GREEN**

### Task 2: GameEngine Reward Presentation Integration

**Files:**
- Modify: `src/game/engine/GameState.ts`
- Modify: `src/game/engine/GameEngine.ts`
- Modify: `src/game/engine/events.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- `GameState.rewards.augmentSlot` stores presentation for `rewards.options[0]`.
- `REWARDS_GENERATED` includes the same presentation.
- `CHOOSE_REWARD` clears reward options and presentation.

- [x] **Step 1: Write failing engine tests**
- [x] **Step 2: Run `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts` and confirm RED**
- [x] **Step 3: Add engine integration**
- [x] **Step 4: Re-run targeted test and confirm GREEN**

### Task 3: Verification And PR

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [x] Run `npm.cmd run typecheck`
- [x] Run `npm.cmd run test:run`
- [x] Run `npm.cmd run build`
- [ ] Commit, push, and open a draft PR.

## Self-Review

- Spec coverage: covers 3-reel augment presentation, result reveal, matching actual reward data, and RNG separation.
- Explicitly out of scope: React animation, Showcase scripted rewards, Overclock, authored final content pass.
- Placeholder scan: no task contains TBD/TODO placeholders.
