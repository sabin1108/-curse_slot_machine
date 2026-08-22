# Reward Effect Condition Resolver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse `EffectResolver` for reward scoring conditions while preserving current reward scores and ordering.

**Architecture:** `EffectResolver` remains a pure fact-based predicate module. `RewardSystem` keeps scoring and sorting ownership, but delegates `reward.score.add` condition evaluation to `effectConditionsMatch`.

**Tech Stack:** TypeScript, Vitest, existing pure game systems.

## Global Constraints

- Pure TypeScript game systems own deterministic reward scoring and effect condition evaluation.
- React renders state and events only.
- No new dependencies.
- No reward content or balance changes.
- Add tests before production code changes.

---

### Task 1: Extend Resolver Reward Context

**Files:**
- Modify: `src/game/effects/EffectResolver.ts`
- Modify: `src/game/effects/EffectResolver.test.ts`

**Interfaces:**
- Extends: `EffectConditionContext`
- Produces: `reward?: { kind: RewardKind; rarity: Rarity; tags: readonly SynergyTag[] }`
- Produces: `activeSynergyIds?: readonly string[]`

- [x] **Step 1: Write failing resolver tests**

Add table-driven tests for `reward.kind_is`, `reward.rarity_is`, `reward.has_tag`, and `build.synergy_active`. Each test must include one matching context and one mismatching context.

- [x] **Step 2: Run resolver tests and verify RED**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts`.
Expected: fail because reward/build conditions still return false.

- [x] **Step 3: Implement reward/build condition matching**

Add reward facts and `activeSynergyIds` to `EffectConditionContext`, then handle the four reward/build condition cases in the exhaustive switch.

- [x] **Step 4: Run resolver tests and verify GREEN**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts`.
Expected: pass.

### Task 2: Rewire Reward Scoring

**Files:**
- Modify: `src/game/build/RewardSystem.ts`
- Modify: `src/game/build/RewardSystem.test.ts`

**Interfaces:**
- Consumes: `effectConditionsMatch(effect, context): boolean`

- [x] **Step 1: Write failing RewardSystem regression**

Add a test where a `reward.score.add` effect requires reward kind, rarity, tag, and an already active synergy. Verify it contributes to `contentValue` only for the matching candidate and only when the synergy was active before evaluating the candidate.

- [x] **Step 2: Run RewardSystem tests and verify RED**

Run `npm.cmd run test:run -- src/game/build/RewardSystem.test.ts`.
Expected: fail if `RewardSystem` does not use the resolver's reward/build context.

- [x] **Step 3: Delegate content value conditions**

Import `effectConditionsMatch` and replace the inline condition loop in `getContentValue` with a resolver call that passes reward facts and `build.synergies.active.map((synergy) => synergy.synergyId)`.

- [x] **Step 4: Run targeted tests**

Run `npm.cmd run test:run -- src/game/effects/EffectResolver.test.ts src/game/build/RewardSystem.test.ts`.
Expected: pass.

### Task 3: Document, Review, And Verify

**Files:**
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

- [x] **Step 1: Record PR #32 merge baseline and this branch scope**

Document that PR #32 merged into `main` at `ad33fcd`, and that this branch starts from that commit.

- [x] **Step 2: Run full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

Expected: all pass.

- [x] **Step 3: Request code and architecture review**

Dispatch read-only code-review and architecture subagents against the branch diff. Fix blocking findings before opening a draft PR.

Result: code review requested changes for explicit reward fact projection and direct pre-pick synergy regression coverage; both were fixed. Architecture review returned `CLEAR` with the same low-risk coverage recommendation, which was also fixed.
