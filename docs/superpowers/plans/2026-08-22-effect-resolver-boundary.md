# Effect Resolver Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract reusable combat condition matching into a pure `EffectResolver` boundary without changing current gameplay.

**Architecture:** `src/game/effects/EffectResolver.ts` becomes the shared engine module for testing combat effect conditions. `BuildSystem.getActiveEffects` remains the active-effect ownership/synergy activation boundary, `RewardSystem` keeps reward scoring conditions for this branch, and `CombatSystem` keeps modifier ordering, arithmetic caps, state mutation, and event emission.

**Tech Stack:** TypeScript, Vitest, existing pure game systems.

## Global Constraints

- Pure TypeScript game systems own RNG, reel outcomes, combat resolution, rewards, and enemy actions.
- React renders state and events only.
- No new dependencies.
- No reward-content or balance changes in this branch.
- Add tests before production code changes.

---

### Task 1: Add Resolver Contract

**Files:**
- Create: `src/game/effects/EffectResolver.test.ts`
- Create: `src/game/effects/EffectResolver.ts`

**Interfaces:**
- Consumes: `EffectDefinition`, `CombatSlotResult`, `CombatState`, `CombatSlotLocks`
- Produces: `effectConditionsMatch(effect, context): boolean`

- [ ] **Step 1: Write failing resolver tests**

Add tests that expect `effectConditionsMatch` to honor slot action, target, modifier, locked reel count, curse threshold, and player health percentage conditions independently. Add one test proving reward/build-only conditions remain inactive in this combat-only context.

- [ ] **Step 2: Run targeted test and verify RED**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts`.
Expected: fail because `EffectResolver.ts` does not exist.

- [ ] **Step 3: Implement condition matching**

Create `EffectResolver.ts` with an explicit context type and AND-only matching for combat-relevant condition variants. Reward and build conditions return `false`; their migration remains separate.

- [ ] **Step 4: Run targeted tests**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts`.
Expected: pass.

### Task 2: Rewire Combat Condition Calls

**Files:**
- Modify: `src/game/effects/EffectResolver.ts`
- Modify: `src/game/effects/EffectResolver.test.ts`
- Modify: `src/game/combat/CombatSystem.ts`
- Modify: `src/game/combat/CombatSystem.test.ts`

**Interfaces:**
- Consumes: `effectConditionsMatch(effect, context): boolean`

- [ ] **Step 1: Write combat ordering and filtering tests**

Add tests for `x1 -> x2` followed by an `x2`-conditioned amount bonus, chained `x1 -> x2 -> x3` modifier steps, and condition filtering on `combat.status.apply`, full-block retaliation, extra-hit status application, full-block curse prevention, and safety curse prevention.

- [ ] **Step 2: Run targeted test and verify RED**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts`.
Expected: pass after Task 1 and before combat rewiring.

- [ ] **Step 3: Rewire combat filters**

Replace local combat amount, extra-hit, curse-gain, status-apply, status-consume, full-block retaliation, extra-hit status-apply, curse-prevention, and modifier-step condition checks with `effectConditionsMatch(...)` while preserving existing event/state mutation code and arithmetic.

- [ ] **Step 4: Run targeted tests**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts src/game/combat/CombatSystem.test.ts src/game/engine/GameEngine.test.ts`.
Expected: pass.

### Task 3: Document And Verify

**Files:**
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [ ] **Step 1: Record branch scope and merged-stack baseline**

Update agent docs to state that PR #27-#31 are merged and this branch starts from `main` commit `16e58cb`.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

Expected: all pass.

- [ ] **Step 3: Request review**

Dispatch code-review and architecture review subagents against the branch diff. Fix blocking feedback before PR creation.
