# Enemy Intent Patterns And Item Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the branch documentation, add data-driven per-enemy intent patterns, and project owned items as item-shaped UI cards.

**Architecture:** Pure TypeScript combat and engine modules own enemy intent rules and deterministic state transitions. React receives projected UI data and renders kind-specific labels without calculating gameplay.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Playwright.

## Global Constraints

- Current branch is `feature/enemy-defense-intent`.
- Preserve deterministic same-seed plus same-command behavior.
- React must not decide RNG, reel outcomes, combat resolution, rewards, or enemy actions.
- Content-specific enemies, rewards, synergies, and item labels must live in data or projection helpers rather than engine branches.
- Add or update tests before changing deterministic game behavior.
- Full verification commands are `npm run typecheck`, `npm run test:run`, `npm run build`, and `npm run test:e2e`.

---

## File Structure

- `docs/agent/SESSION_HANDOFF.md`: replace stale branch/PR handoff with the current branch, current baseline, completed defense intent slice, and next work.
- `docs/agent/PROJECT_PROGRESS_SUMMARY.md`: record current branch progress and verification expectations.
- `docs/design/PLANNING_SUMMARY.md`: add the enemy intent pattern decision and structured item projection slice.
- `DESIGN.md`: refresh baseline metadata and current verification/open-question text.
- `src/game/combat/CombatTypes.ts`: add intent pattern state fields and reusable intent pattern types.
- `src/game/combat/CombatSystem.ts`: compute current and next enemy intent from pattern data and export a helper for curse-aware intent recalculation.
- `src/game/combat/MvpEnemyCatalog.ts`: define per-stage intent patterns.
- `src/game/combat/MvpCombatContracts.test.ts`: add red tests for per-enemy patterns and curse recalculation correctness.
- `src/game/engine/GameEngine.ts`: initialize stage combat state with enemy pattern data and use the shared intent recalculation helper.
- `src/game/engine/GameEngine.test.ts`: cover stage-specific intent pattern initialization through the engine.
- `src/types/game.ts`: add a `kind` field to `AugmentItem`.
- `src/game/engine/UiProjection.ts`: project rewards into item or augment UI cards with explicit kind.
- `src/game/engine/UiProjection.test.ts`: cover item-shaped projection.
- `src/components/Reward/RewardModal.tsx`: use explicit kind for reward card labels.

### Task 1: Branch Documentation Refresh

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/design/PLANNING_SUMMARY.md`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: Current branch baseline `feature/enemy-defense-intent` at `c9ee9c4`.
- Produces: Current documentation that future agents can trust before continuing implementation.

- [ ] **Step 1: Replace stale handoff branch state**

Update `docs/agent/SESSION_HANDOFF.md` so the first sections state:

```markdown
## Current Goal

Continue from `feature/enemy-defense-intent` in `C:\Users\00\Documents\Codex\curse_slot_machine_repo_fresh`. The local checkout was reset to match the GitHub branch after an earlier mistaken local-source sync attempt. Treat `feature/enemy-defense-intent` as the source of truth.

## Current Branch

- Repository: `https://github.com/sabin1108/-curse_slot_machine`
- Branch: `feature/enemy-defense-intent`
- Baseline before this continuation: `c9ee9c4`
- Branch status before this continuation: clean and synchronized with `origin/feature/enemy-defense-intent`
```

- [ ] **Step 2: Record completed defense-intent behavior**

Add a section to `docs/agent/SESSION_HANDOFF.md`:

```markdown
## Enemy Defense Intent Slice

- `attack -> wait -> defend -> attack` is implemented in pure combat state.
- Wait turns produce `ENEMY_WAITED`, deal no player damage, and preview as `enemyAttack: 0`.
- Defend turns produce `ENEMY_DEFENDED`, add 1 enemy block, and cap enemy block at 2.
- Curse overload can still end combat during wait or defend turns.
- UI projection maps attack, wait, and defend into existing enemy intent presentation.
```

- [ ] **Step 3: Update progress summary**

In `docs/agent/PROJECT_PROGRESS_SUMMARY.md`, replace stale `feature/ui-adapter-synergy-progress` current-branch text with:

```markdown
## Current Branch

`feature/enemy-defense-intent` continues from the playable canonical UI integration line.

Implemented before this continuation:

- Enemy attacks alternate with wait turns.
- Enemy wait turns have no incoming damage preview.
- Enemy defense turns add low block and cap accumulated enemy block.
- Combat logs and UI projection describe wait and defense outcomes.

Next work approved on 2026-08-22:

1. Refresh branch documentation and verification notes.
2. Add data-driven per-enemy intent patterns.
3. Continue structured-engine UI migration with item-specific UI projection.
```

- [ ] **Step 4: Update design summary**

Add this bullet to `docs/design/PLANNING_SUMMARY.md` under Architecture Decisions:

```markdown
- Enemy intent sequencing is deterministic combat-engine data: current MVP enemies may define different attack, wait, and defend patterns without React calculating enemy behavior.
```

- [ ] **Step 5: Refresh DESIGN metadata**

Update `DESIGN.md` source-of-truth metadata:

```markdown
- Last refreshed: 2026-08-22
- Playable checkpoint: `c9ee9c4`
```

Add an open question entry:

```markdown
- [ ] After item-specific UI projection lands, decide whether the temporary `AugmentItem` UI type should be renamed to a neutral reward-card type.
```

- [ ] **Step 6: Review documentation diff**

Run:

```powershell
git diff -- docs/agent/SESSION_HANDOFF.md docs/agent/PROJECT_PROGRESS_SUMMARY.md docs/design/PLANNING_SUMMARY.md DESIGN.md
```

Expected: Documentation only, no production code.

### Task 2: Data-Driven Enemy Intent Patterns

**Files:**
- Modify: `src/game/combat/CombatTypes.ts`
- Modify: `src/game/combat/CombatSystem.ts`
- Modify: `src/game/combat/MvpEnemyCatalog.ts`
- Modify: `src/game/combat/MvpCombatContracts.test.ts`
- Modify: `src/game/engine/GameEngine.ts`
- Modify: `src/game/engine/GameEngine.test.ts`

**Interfaces:**
- Consumes: `createCombatState(overrides?: CombatStateOverrides): CombatState`
- Produces: `EnemyIntentPatternStep`, `EnemyIntentPattern`, `recalculateEnemyIntent(intent, curseValue): EnemyIntent`

- [ ] **Step 1: Write failing combat pattern tests**

Add to `src/game/combat/MvpCombatContracts.test.ts`:

```typescript
it('advances custom enemy intent patterns deterministically', () => {
  const state = createCombatState({
    enemy: { maxHealth: 99, health: 99 },
    enemyIntent: {
      baseAmount: 6,
      amount: 6,
      pattern: [
        { type: 'attack' },
        { type: 'defend', amount: 2 },
        { type: 'wait' },
      ],
      patternIndex: 0,
    },
  })

  const attack = resolveCombatSlot(state, safeShot)
  expect(attack.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED', amount: 6 }))
  expect(attack.enemyIntent).toMatchObject({ type: 'defend', baseAmount: 6, amount: 2, patternIndex: 1 })

  const defend = resolveCombatSlot(attack, safeShot)
  expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 2 })
  expect(defend.enemyIntent).toMatchObject({ type: 'wait', baseAmount: 6, amount: 0, patternIndex: 2 })

  const wait = resolveCombatSlot(defend, safeShot)
  expect(wait.events).toContainEqual({ type: 'ENEMY_WAITED' })
  expect(wait.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 6, amount: 6, patternIndex: 0 })
})

it('recalculates wait and defend amounts without turning them into attacks', () => {
  const waiting = createCombatState({
    enemyIntent: { type: 'wait', baseAmount: 7, amount: 0 },
    curse: { value: 8 },
  })
  const defending = createCombatState({
    enemyIntent: { type: 'defend', baseAmount: 7, amount: 1 },
    curse: { value: 8 },
  })

  expect(waiting.enemyIntent).toMatchObject({ type: 'wait', amount: 0 })
  expect(defending.enemyIntent).toMatchObject({ type: 'defend', amount: 1 })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
npm run test:run -- src/game/combat/MvpCombatContracts.test.ts
```

Expected: FAIL because `pattern` and `patternIndex` do not exist yet.

- [ ] **Step 3: Add intent pattern types**

In `src/game/combat/CombatTypes.ts`, add:

```typescript
export type EnemyIntentPatternStep = {
  type: EnemyIntent['type']
  amount?: number
}

export type EnemyIntentPattern = readonly EnemyIntentPatternStep[]
```

Extend `EnemyIntent`:

```typescript
pattern?: EnemyIntentPattern
patternIndex?: number
```

Extend `CombatStateOverrides.enemyIntent` through the existing `Partial<EnemyIntent>` type.

- [ ] **Step 4: Implement pattern-aware intent helpers**

In `src/game/combat/CombatSystem.ts`, export:

```typescript
export function recalculateEnemyIntent(intent: CombatState['enemyIntent'], curseValue: number): CombatState['enemyIntent'] {
  return getPressuredIntent(intent, curseValue)
}
```

Change `createCombatState` so it preserves `pattern` and `patternIndex`, derives the current type from `pattern[patternIndex]` when provided, and computes the amount through one helper.

Change `getNextEnemyIntent` so:

```typescript
if (intent.pattern && intent.pattern.length > 0) {
  const nextIndex = ((intent.patternIndex ?? 0) + 1) % intent.pattern.length
  const step = intent.pattern[nextIndex]
  return getPressuredIntent({
    ...intent,
    type: step.type,
    baseAmount: intent.baseAmount,
    amount: step.amount ?? intent.amount,
    patternIndex: nextIndex,
  }, curseValue)
}
```

Keep the existing fallback cycle for states without a pattern.

Change `getIntentAmount` so defend uses the pattern step amount when provided, and attack uses `baseAmount + curse bonus`.

- [ ] **Step 5: Add stage enemy patterns in data**

In `src/game/combat/MvpEnemyCatalog.ts`, extend `MvpEnemyProfile`:

```typescript
intentPattern: EnemyIntentPattern
```

Use these MVP patterns:

```typescript
combat: attack, wait, defend(1)
elite: attack, wait, attack, defend(1)
gate: attack, wait, defend(1), wait
boss: attack, wait, defend(1), attack
```

These keep the new behavior data-driven while preserving the low-defense MVP balance proven by the origin demo traces.

- [ ] **Step 6: Initialize engine combat state from enemy profile pattern**

In `src/game/engine/GameEngine.ts`, import `recalculateEnemyIntent` and set `enemyIntent` in `createStageCombatState` with:

```typescript
enemyIntent: {
  type: profile.intentPattern[0].type,
  baseAmount: profile.attack,
  amount: profile.intentPattern[0].amount ?? profile.attack + attackBonus,
  pattern: profile.intentPattern,
  patternIndex: 0,
}
```

Use `recalculateEnemyIntent` in reroll and curse update paths instead of manually setting `amount` to `baseAmount + attackBonus`.

- [ ] **Step 7: Add engine-level pattern test**

Add to `src/game/engine/GameEngine.test.ts`:

```typescript
it('enters elite combat with the elite enemy intent pattern', () => {
  const engine = new GameEngine('elite-pattern')
  startRun(engine)
  completeCombatStage(engine)
  completeCombatStage(engine)
  engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
  engine.dispatch({ type: 'RESOLVE_REST', action: 'heal' })
  engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
  engine.dispatch({ type: 'LEAVE_SHOP' })
  engine.dispatch({ type: 'ENTER_NEXT_STAGE' })

  const combat = engine.getState().combat
  expect(combat.enemy.name).toBe('Vault Enforcer')
  expect(combat.enemyIntent.pattern?.map((step) => step.type)).toEqual(['attack', 'wait', 'attack', 'defend'])
  expect(combat.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 5, amount: 5, patternIndex: 0 })
})
```

- [ ] **Step 8: Run targeted tests and verify GREEN**

Run:

```powershell
npm run test:run -- src/game/combat/MvpCombatContracts.test.ts src/game/engine/GameEngine.test.ts
```

Expected: PASS.

### Task 3: Item-Specific UI Projection

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/engine/UiProjection.ts`
- Modify: `src/game/engine/UiProjection.test.ts`
- Modify: `src/components/Reward/RewardModal.tsx`

**Interfaces:**
- Consumes: `BuildRewardDefinition.kind`
- Produces: `AugmentItem.kind: 'augment' | 'item'`

- [ ] **Step 1: Write failing item projection tests**

Add to `src/game/engine/UiProjection.test.ts`:

```typescript
import { toUiReward } from './UiProjection'

describe('UiProjection reward cards', () => {
  it('projects items with explicit item kind and item label fields', () => {
    expect(toUiReward({
      id: 'multi_hit_charm',
      kind: 'item',
      name: 'Multi-Hit Charm',
      rarity: 'uncommon',
      tags: ['MULTI_HIT'],
      description: 'Bullets add a 35% extra hit.',
      effectLabel: 'Bullets add a 35% extra hit.',
    })).toMatchObject({
      id: 'multi_hit_charm',
      kind: 'item',
      icon: 'ITEM',
      effectValue: 'Bullets add a 35% extra hit.',
    })
  })

  it('projects augments with explicit augment kind', () => {
    expect(toUiReward({
      id: 'combo_starter',
      kind: 'augment',
      name: 'Combo Starter',
      rarity: 'common',
      tags: ['COMBO'],
      description: 'Locked bullets apply Primer.',
      effectLabel: 'Locked bullets apply Primer.',
    })).toMatchObject({
      id: 'combo_starter',
      kind: 'augment',
      icon: 'AUG',
    })
  })
})
```

- [ ] **Step 2: Run projection tests and verify RED**

Run:

```powershell
npm run test:run -- src/game/engine/UiProjection.test.ts
```

Expected: FAIL because `AugmentItem.kind` does not exist.

- [ ] **Step 3: Add explicit UI card kind**

In `src/types/game.ts`, extend `AugmentItem`:

```typescript
kind: 'augment' | 'item'
```

In `src/game/engine/UiProjection.ts`, return:

```typescript
kind: reward.kind,
```

from `toUiAugment`.

- [ ] **Step 4: Stop kind checks from depending on icon text**

In `src/components/Reward/RewardModal.tsx`, change:

```typescript
if (augment.icon === 'ITEM') return '아이템'
```

to:

```typescript
if (augment.kind === 'item') return '아이템'
```

- [ ] **Step 5: Run targeted projection tests and verify GREEN**

Run:

```powershell
npm run test:run -- src/game/engine/UiProjection.test.ts
```

Expected: PASS.

### Task 4: Verification, Review, And Handoff Update

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`

**Interfaces:**
- Consumes: Finished code and docs from Tasks 1-3.
- Produces: Verification evidence and review feedback recorded in docs.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

Expected: all commands exit 0.

- [ ] **Step 2: Request independent review**

Dispatch code-reviewer and architect lanes over the full diff from `c9ee9c4` to `HEAD`.

Review scope:

```text
Documentation refresh, data-driven enemy intent patterns, curse-aware intent recalculation, and explicit item/augment UI card projection.
```

Blocking criteria:

```text
React deciding enemy behavior, non-deterministic intent progression, pattern state not initialized from enemy data, wait/defend amount corruption after curse updates, missing tests for new deterministic behavior.
```

- [ ] **Step 3: Fix accepted Critical/High/Important findings**

If the independent review reports blocking findings, fix them with targeted tests first and rerun the relevant verification command.

- [ ] **Step 4: Record final handoff**

Append final implementation notes to `docs/agent/SESSION_HANDOFF.md`:

```markdown
## Continuation Completed On 2026-08-22

- Documentation refreshed for `feature/enemy-defense-intent`.
- Enemy intent patterns now come from stage enemy profiles.
- Wait and defend intent amounts remain stable through curse recalculation paths.
- Reward projection exposes explicit item versus augment kind for UI cards.
- Verification:
  - `npm run typecheck`: [result]
  - `npm run test:run`: [result]
  - `npm run build`: [result]
  - `npm run test:e2e`: [result]
- Independent review:
  - Code review lane: [result]
  - Architecture lane: [result]
```

- [ ] **Step 5: Final diff check**

Run:

```powershell
git status --short
git diff --stat
```

Expected: focused docs, combat, engine, projection, and reward modal changes only.

## Self-Review

- Spec coverage: Task 1 covers documentation, Task 2 covers per-enemy patterns, Task 3 covers item projection, Task 4 covers verification and review.
- Placeholder scan: no `TBD`, unresolved `TODO`, or unspecified test commands remain.
- Type consistency: `EnemyIntentPattern`, `EnemyIntentPatternStep`, `recalculateEnemyIntent`, and `AugmentItem.kind` are introduced before later tasks use them.
