# Reward Inventory Naming Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename stale augment-only UI inventory symbols to reward-inventory terminology.

**Architecture:** This is a display-boundary refactor. React components continue to render projected `RewardCard` values from `BuildState`, and `src/game/data.ts` continues to expose a display catalog derived from `DEFAULT_BUILD_CATALOG`. Engine reward state, RNG, combat, and augment-slot reveal behavior are unchanged.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, Playwright.

## Global Constraints

- Keep this branch stacked on `feature/reward-card-type-cleanup`.
- Do not change combat, reward generation, RNG, command handling, or augment-slot reveal behavior.
- Do not rename `AugmentSlotMachine`, `augSlotPresentation`, or `targetAugment`.
- Preserve existing rendered class names: `.reward-card-list`, `.reward-card-row`, `.reward-card-row-augment`, `.reward-card-row-item`.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, `npm.cmd run build`, `npm.cmd run test:e2e`, and `git diff --check` before PR.

---

### Task 1: Rename Battle Inventory Side Panel

**Files:**
- Rename: `src/components/Battle/AugmentSidePanel.tsx` to `src/components/Battle/RewardInventorySidePanel.tsx`
- Modify: `src/components/Battle/BattleScreen.test.tsx`

**Interfaces:**
- Consumes: `BuildState` from `src/types/game.ts`.
- Produces: `RewardInventorySidePanel: React.FC<RewardInventorySidePanelProps>`.

- [ ] **Step 1: Write the failing test**

In `src/components/Battle/BattleScreen.test.tsx`, replace:

```tsx
import { AugmentSidePanel } from './AugmentSidePanel'
```

with:

```tsx
import { RewardInventorySidePanel } from './RewardInventorySidePanel'
```

Then rename the legacy side-panel test to:

```tsx
it('keeps the reward inventory side panel aligned with the projected card model', () => {
```

and render:

```tsx
render(<RewardInventorySidePanel build={state.build} />)
```

- [ ] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/components/Battle/BattleScreen.test.tsx`

Expected: FAIL because `./RewardInventorySidePanel` does not exist yet.

- [ ] **Step 3: Implement the minimal rename**

Run: `git mv src/components/Battle/AugmentSidePanel.tsx src/components/Battle/RewardInventorySidePanel.tsx`

In the moved file, rename:

```tsx
interface AugmentSidePanelProps {
  build: BuildState;
}

export const AugmentSidePanel: React.FC<AugmentSidePanelProps> = ({ build }) => {
```

to:

```tsx
interface RewardInventorySidePanelProps {
  build: BuildState;
}

export const RewardInventorySidePanel: React.FC<RewardInventorySidePanelProps> = ({ build }) => {
```

Also rename the local map variable from `aug` to `rewardCard` without changing rendered class names or text.

- [ ] **Step 4: Run GREEN**

Run: `npm.cmd run test:run -- src/components/Battle/BattleScreen.test.tsx`

Expected: PASS.

### Task 2: Rename Display Reward Catalog Export

**Files:**
- Modify: `src/game/data.ts`
- Test: `src/game/data.test.ts`

**Interfaces:**
- Consumes: `RewardCard` from `src/types/game.ts`.
- Produces: `ALL_REWARD_CARDS: RewardCard[]`.

- [ ] **Step 1: Write the failing test**

Create `src/game/data.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'

import { ALL_REWARD_CARDS } from './data'

describe('display reward card catalog', () => {
  it('exports reward cards with explicit augment and item kinds', () => {
    const kinds = new Set(ALL_REWARD_CARDS.map((rewardCard) => rewardCard.kind))

    expect(kinds.has('augment')).toBe(true)
    expect(kinds.has('item')).toBe(true)
  })
})
```

- [ ] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/game/data.test.ts`

Expected: FAIL because `ALL_REWARD_CARDS` is not exported yet.

- [ ] **Step 3: Implement the export rename**

In `src/game/data.ts`, rename:

```ts
export const ALL_AUGMENTS: RewardCard[] = [
```

to:

```ts
export const ALL_REWARD_CARDS: RewardCard[] = [
```

Do not keep an `ALL_AUGMENTS` compatibility alias because this repo has no remaining caller and the old export is the naming debt.

- [ ] **Step 4: Run GREEN**

Run: `npm.cmd run test:run -- src/game/data.test.ts`

Expected: PASS.

### Task 3: Documentation, Review, And PR

**Files:**
- Modify: `DESIGN.md`
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/agent/CONTENT_LOGIC_ANALYSIS.md`

**Interfaces:**
- Consumes: completed code/test changes from Tasks 1 and 2.
- Produces: updated handoff and review context for the next stacked branch.

- [ ] **Step 1: Update docs**

Record that reward-card model cleanup now also covers side-panel and display-catalog names. Keep remaining open questions unchanged unless this branch directly resolves them.

- [ ] **Step 2: Run full verification**

Run each command:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

- [ ] **Step 3: Request independent review**

Use a `code-reviewer` subagent for the full branch diff and an `architect` subagent for the boundary check. The required verdict is no Critical/Important blockers.

- [ ] **Step 4: Commit and publish**

Commit with:

```powershell
git add src/components/Battle src/game docs DESIGN.md
git commit -m "refactor: rename reward inventory display"
```

Push and create a draft PR:

```powershell
git push -u origin feature/reward-inventory-naming-cleanup
gh pr create --base feature/reward-card-type-cleanup --head feature/reward-inventory-naming-cleanup --draft --title "Rename reward inventory display" --body-file <body-file>
```

- [ ] **Step 5: Verify PR**

Run:

```powershell
gh pr view <pr-number> --json number,state,isDraft,url,headRefName,baseRefName,headRefOid
```

Expected: draft PR is open against `feature/reward-card-type-cleanup`.

## Self-Review

- Spec coverage: every acceptance criterion maps to Tasks 1-3.
- Placeholder scan: no placeholder tasks or unspecified commands remain.
- Type consistency: `RewardInventorySidePanel` and `ALL_REWARD_CARDS` are the only new public names.
