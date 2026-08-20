# Content Effect Schema Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded, typed content effect pilot so owned rewards and completed synergies can affect pure combat resolution.

**Architecture:** Keep this pilot in the pure TypeScript path. BuildSystem resolves active effect definitions from owned reward IDs and completed synergy IDs; CombatSystem accepts those effects as optional context and applies only a small allowlist. React and the legacy UI engine are not changed in this branch.

**Tech Stack:** TypeScript, Vitest, existing pure game modules under `src/game`.

## Global Constraints

- New behavior is TDD-first.
- React renders state and controls only.
- Game rules, RNG, rewards, and combat calculations stay in pure TypeScript systems.
- `CombatSlotMachine` and `AugmentSlotMachine` remain separate systems.
- No free-form scripting, `eval`, dynamic function content, or YAML parser dependency.
- PR #8 is merged; this branch starts after `main` includes augment slot machine.

---

### Task 1: Define Active Effects

**Files:**
- Create: `src/game/effects/EffectTypes.ts`
- Modify: `src/game/build/BuildTypes.ts`
- Modify: `src/game/build/BuildSystem.ts`
- Test: `src/game/build/BuildSystem.test.ts`

**Interfaces:**
- Produces: `EffectDefinition`, `EffectCondition`, and `getActiveEffects(build, catalog)`.
- Consumes: existing `BuildCatalog`, `BuildState`, reward IDs, and completed synergy IDs.

- [ ] **Step 1: Write the failing test**

Add a `BuildSystem.test.ts` case that builds a custom catalog with reward `effects` and synergy `effects`, creates a build with owned rewards that complete the synergy, and expects `getActiveEffects` to return both the owned reward effect and completed synergy effect.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`
Expected: fail because `getActiveEffects` or structured `effects` does not exist.

- [ ] **Step 3: Write minimal implementation**

Add typed effect definitions and make build catalog entries accept optional `effects`. Implement `getActiveEffects` by looking up owned reward definitions and completed synergy definitions. Keep existing `effectId` optional for compatibility.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`
Expected: pass.

### Task 2: Apply Combat Effects

**Files:**
- Modify: `src/game/combat/CombatTypes.ts`
- Modify: `src/game/combat/CombatSystem.ts`
- Test: `src/game/combat/CombatSystem.test.ts`

**Interfaces:**
- Consumes: `EffectDefinition[]`.
- Produces: `resolveCombatSlot(state, slotResult, { effects })`.

- [ ] **Step 1: Write the failing tests**

Add combat tests for:

- `combat.action_amount.add_pct` increases bullet damage.
- `combat.bullet.extra_hit` adds one same-target bullet hit before enemy attack.
- `combat.curse_gain.add` can reduce baseline curse gain to zero.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/combat/CombatSystem.test.ts`
Expected: fail because `resolveCombatSlot` does not accept effect context.

- [ ] **Step 3: Write minimal implementation**

Add optional context to `resolveCombatSlot`. Apply only the three supported combat effects. Clamp curse gain to `0..3`; keep extra hit non-recursive.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/combat/CombatSystem.test.ts`
Expected: pass.

### Task 3: Engine Integration

**Files:**
- Modify: `src/game/engine/GameEngine.ts`
- Test: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Consumes: `getActiveEffects(this.state.build)`.
- Produces: combat resolution that includes active build effects in the pure engine path.

- [ ] **Step 1: Write the failing test**

Add a test that uses existing commands to choose enough rewards for an effect-bearing synergy, then resolves combat and observes the combat delta. If default catalog has no structured effects, add the smallest catalog effect needed first in Task 1.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`
Expected: fail because GameEngine does not pass active effects into CombatSystem.

- [ ] **Step 3: Write minimal implementation**

Call `getActiveEffects` in `resolveCombatSlot` and pass the effects into `CombatSystem`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`
Expected: pass.

### Task 4: Verification

**Files:**
- Existing docs and source files only.

- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run test:run`.
- [ ] Run `npm.cmd run build`.
- [ ] Report changed files, verification evidence, and the legacy UI integration gap.

