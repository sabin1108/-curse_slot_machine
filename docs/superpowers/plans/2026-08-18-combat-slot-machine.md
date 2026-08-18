# Combat Slot Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the deterministic combat slot machine system that produces one-payline `[action, target, modifier]` combat slot results with weighted reels, lock-aware rerolls, and curse costs.

**Architecture:** Keep the slot system as pure TypeScript under `src/game/slot`. The system consumes the existing `SeededRng` interface from `src/game/engine/rng.ts`; React UI must only render the produced result and must not determine reel outcomes.

**Tech Stack:** TypeScript, Vitest, existing seeded RNG module.

## Global Constraints

- React UI does not decide RNG, reel results, damage, healing, rewards, or enemy actions.
- `CombatSlotMachine` is the actual combat slot result system.
- Combat slot results use one payline: `[action, target, modifier]`.
- Initial reels are `Action: bullet x3, shield x2, heart x1`, `Target: enemy x3, self x2, all x1`, `Modifier: x1 x3, x2 x2, x3 x1`.
- Reroll curse costs are `0 locks = +1 curse`, `1 lock = +2 curse`, `2 locks = +3 curse`.
- No UI or `Math.random()` dependency is allowed in the slot result system.

---

## File Structure

- Create `src/game/slot/CombatSlotTypes.ts`: symbol unions, reel result types, lock state type, and machine result contracts.
- Create `src/game/slot/ReelPool.ts`: generic weighted reel picker that consumes `SeededRng`.
- Create `src/game/slot/CombatSlotMachine.ts`: combat-specific default reel pools plus `spinCombatSlot` and curse cost calculation.
- Create `src/game/slot/CombatSlotMachine.test.ts`: red-green tests for weighted reels, deterministic spins, lock behavior, and curse costs.
- Modify `docs/agent/SESSION_HANDOFF.md`: update branch progress before PR.
- Modify `docs/CODEX_COLLABORATION.md`: record branch work and verification.

---

### Task 1: Weighted Reel Pool

**Files:**
- Create: `src/game/slot/ReelPool.ts`
- Test: `src/game/slot/CombatSlotMachine.test.ts`

**Interfaces:**
- Consumes: `SeededRng` from `src/game/engine/rng.ts`
- Produces:
  - `type WeightedReelEntry<T extends string> = { symbol: T; weight: number }`
  - `function pickWeightedSymbol<T extends string>(pool: readonly WeightedReelEntry<T>[], rng: SeededRng): T`

- [x] **Step 1: Write the failing test**

```ts
it('picks weighted symbols from the provided reel pool', () => {
  const rng = createSeededRng('weighted-action')
  const picks = Array.from({ length: 30 }, () =>
    pickWeightedSymbol(
      [
        { symbol: 'bullet', weight: 3 },
        { symbol: 'shield', weight: 2 },
        { symbol: 'heart', weight: 1 },
      ],
      rng,
    ),
  )

  expect(picks).toContain('bullet')
  expect(picks).toContain('shield')
  expect(picks).toContain('heart')
  expect(picks.every((symbol) => ['bullet', 'shield', 'heart'].includes(symbol))).toBe(true)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: FAIL because `src/game/slot/ReelPool.ts` does not exist.

- [x] **Step 3: Write minimal implementation**

```ts
import type { SeededRng } from '../engine/rng'

export type WeightedReelEntry<T extends string> = {
  symbol: T
  weight: number
}

export function pickWeightedSymbol<T extends string>(
  pool: readonly WeightedReelEntry<T>[],
  rng: SeededRng,
): T {
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = rng.nextInt(totalWeight)

  for (const entry of pool) {
    roll -= entry.weight
    if (roll < 0) {
      return entry.symbol
    }
  }

  return pool[pool.length - 1].symbol
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: PASS for the weighted reel test.

---

### Task 2: Initial Combat Spin

**Files:**
- Create: `src/game/slot/CombatSlotTypes.ts`
- Create: `src/game/slot/CombatSlotMachine.ts`
- Test: `src/game/slot/CombatSlotMachine.test.ts`

**Interfaces:**
- Consumes: `pickWeightedSymbol`, `SeededRng`
- Produces:
  - `type CombatActionSymbol = 'bullet' | 'shield' | 'heart'`
  - `type CombatTargetSymbol = 'enemy' | 'self' | 'all'`
  - `type CombatModifierSymbol = 'x1' | 'x2' | 'x3'`
  - `type CombatSlotResult = { action: CombatActionSymbol; target: CombatTargetSymbol; modifier: CombatModifierSymbol }`
  - `function spinCombatSlot(rng: SeededRng): CombatSlotResult`

- [x] **Step 1: Write the failing test**

```ts
it('produces one payline with action, target, and modifier symbols', () => {
  const result = spinCombatSlot(createSeededRng('first-spin'))

  expect(['bullet', 'shield', 'heart']).toContain(result.action)
  expect(['enemy', 'self', 'all']).toContain(result.target)
  expect(['x1', 'x2', 'x3']).toContain(result.modifier)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: FAIL because `spinCombatSlot` does not exist.

- [x] **Step 3: Write minimal implementation**

Use the default weighted reel pools and call `pickWeightedSymbol` once per reel.

- [x] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: PASS for weighted reel and initial spin tests.

---

### Task 3: Determinism And Lock-Aware Rerolls

**Files:**
- Modify: `src/game/slot/CombatSlotTypes.ts`
- Modify: `src/game/slot/CombatSlotMachine.ts`
- Test: `src/game/slot/CombatSlotMachine.test.ts`

**Interfaces:**
- Consumes: `CombatSlotResult`, `SeededRng`
- Produces:
  - `type CombatSlotLocks = { action?: boolean; target?: boolean; modifier?: boolean }`
  - `function rerollCombatSlot(previous: CombatSlotResult, locks: CombatSlotLocks, rng: SeededRng): CombatSlotResult`

- [x] **Step 1: Write the failing test**

```ts
it('keeps locked reels and rerolls unlocked reels', () => {
  const previous = { action: 'bullet', target: 'enemy', modifier: 'x1' } as const

  const result = rerollCombatSlot(
    previous,
    { action: true, target: false, modifier: true },
    createSeededRng('reroll-locks'),
  )

  expect(result.action).toBe(previous.action)
  expect(result.modifier).toBe(previous.modifier)
  expect(['enemy', 'self', 'all']).toContain(result.target)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: FAIL because `rerollCombatSlot` does not exist.

- [x] **Step 3: Write minimal implementation**

Preserve locked reel values and call the matching default pool only for unlocked reels.

- [x] **Step 4: Add deterministic sequence test**

```ts
it('produces the same spin sequence for the same seed', () => {
  const first = createSeededRng('combat-seed')
  const second = createSeededRng('combat-seed')

  expect([
    spinCombatSlot(first),
    spinCombatSlot(first),
    rerollCombatSlot({ action: 'heart', target: 'self', modifier: 'x2' }, { target: true }, first),
  ]).toEqual([
    spinCombatSlot(second),
    spinCombatSlot(second),
    rerollCombatSlot({ action: 'heart', target: 'self', modifier: 'x2' }, { target: true }, second),
  ])
})
```

- [x] **Step 5: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: PASS for all combat slot tests.

---

### Task 4: Curse Cost Calculation

**Files:**
- Modify: `src/game/slot/CombatSlotMachine.ts`
- Test: `src/game/slot/CombatSlotMachine.test.ts`

**Interfaces:**
- Consumes: `CombatSlotLocks`
- Produces:
  - `function getCombatRerollCurseCost(locks: CombatSlotLocks): number`

- [x] **Step 1: Write the failing test**

```ts
it('charges curse based on the number of locked reels', () => {
  expect(getCombatRerollCurseCost({})).toBe(1)
  expect(getCombatRerollCurseCost({ action: true })).toBe(2)
  expect(getCombatRerollCurseCost({ action: true, target: true })).toBe(3)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: FAIL because `getCombatRerollCurseCost` does not exist.

- [x] **Step 3: Write minimal implementation**

Count truthy lock fields and return `lockCount + 1`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`

Expected: PASS for all combat slot tests.

---

### Task 5: Branch Verification And Documentation

**Files:**
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

**Interfaces:**
- Consumes: branch implementation and verification output
- Produces: updated branch handoff and collaboration log

- [x] **Step 1: Run full verification**

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

- [x] **Step 2: Run e2e if browser behavior changed**

No browser behavior changed in this branch. `npm.cmd run test:e2e` was still run as a smoke regression check and passed with 1 Playwright Chromium test.

- [x] **Step 3: Update handoff docs**

Record branch name, commits, verification output, remaining issues, and next branch `feature/combat-resolution`.

- [ ] **Step 4: Commit and open draft PR**

```powershell
git add .
git commit -m "feat: add combat slot machine"
git push -u origin feature/combat-slot-machine
gh pr create --draft --base main --head feature/combat-slot-machine --title "feat: add combat slot machine" --body "<branch summary>"
```

---

## Self-Review

- Spec coverage: weighted reels, initial pools, one payline, locks, rerolls, and curse costs are covered.
- Placeholder scan: no placeholders remain.
- Type consistency: exported type and function names match across tasks.
- Scope check: combat effect resolution is intentionally excluded and belongs to `feature/combat-resolution`.
