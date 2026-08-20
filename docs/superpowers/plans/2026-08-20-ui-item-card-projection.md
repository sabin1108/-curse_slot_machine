# UI Item Card Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue structured-engine UI migration by giving reward cards an explicit item/augment UI discriminator instead of presenting every reward as an augment-shaped card.

**Architecture:** The structured `RewardSystem` and `BuildSystem` continue to own reward kind, scoring, and selection rules. `UiProjection` maps pure reward options into display-only `RewardCard` objects. React renders the `RewardCard` kind/label and dispatches the existing `CHOOSE_REWARD` command with the selected id.

**Tech Stack:** TypeScript, React, Vitest, Testing Library.

## Global Constraints

- React renders state and dispatches commands only.
- Do not move reward generation, RNG, scoring, synergy rules, or item ownership logic into React.
- Keep the command name `CHOOSE_REWARD` behavior-compatible in this slice, even though its payload field is still named `augmentId`.
- Keep this as a narrow projection/display slice.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Add RewardCard UI Shape And Item Label Projection

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/game/engine/UiProjection.test.ts`
- Modify: `src/game/engine/UiProjection.ts`
- Modify: `src/components/Reward/RewardModal.tsx`
- Create: `src/components/Reward/RewardModal.test.tsx`

**Interfaces:**
- Produces: `RewardCard` with `kind: 'augment' | 'item'` and `kindLabel: '증강' | '아이템'`.
- Preserves: `BuildState.augments` as `AugmentItem[]`, `BuildState.items` as `string[]`, and `CHOOSE_REWARD` command behavior.

- [x] **Step 1: Write projection RED test**

Add tests to `src/game/engine/UiProjection.test.ts`:

```ts
import { toUiReward } from './UiProjection'

it('projects structured item rewards with an item discriminator and label', () => {
  const reward = toUiReward({
    kind: 'item',
    id: 'multi_hit_charm',
    name: 'Multi-Hit Charm',
    rarity: 'uncommon',
    tags: ['MULTI_HIT'],
    description: 'Adds multi-hit support.',
    score: {
      immediatePower: 2,
      synergyValue: 10,
      completionValue: 0,
      futureValue: 2,
      total: 14,
    },
  })

  expect(reward).toMatchObject({
    id: 'multi_hit_charm',
    kind: 'item',
    kindLabel: '아이템',
    icon: 'ITEM',
    effectValue: 'score 14',
  })
})

it('projects structured augment rewards with an augment discriminator and label', () => {
  const reward = toUiReward({
    kind: 'augment',
    id: 'combo_starter',
    name: 'Combo Starter',
    rarity: 'common',
    tags: ['COMBO'],
    description: 'Starts a combo-oriented build.',
    score: {
      immediatePower: 1,
      synergyValue: 12,
      completionValue: 0,
      futureValue: 2,
      total: 15,
    },
  })

  expect(reward).toMatchObject({
    id: 'combo_starter',
    kind: 'augment',
    kindLabel: '증강',
    icon: 'AUG',
    effectValue: 'score 15',
  })
})
```

- [x] **Step 2: Write modal RED test**

Add a component test to `src/components/Reward/RewardModal.test.tsx` that renders the reward modal with an item reward candidate and verifies the item label:

```ts
it('renders item reward cards with an item kind label', () => {
  const itemReward = {
    id: 'multi_hit_charm',
    name: 'Multi-Hit Charm',
    rarity: 'UNCOMMON',
    tags: ['MULTI_HIT'],
    description: 'Adds multi-hit support.',
    icon: 'ITEM',
    effectValue: 'score 14',
    kind: 'item',
    kindLabel: '아이템',
  } satisfies AugmentItem & { kind: 'item'; kindLabel: '아이템' }

  render(
    <RewardModal
      candidates={[itemReward]}
      augSlotPresentation={null}
      onDispatch={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: /Multi-Hit Charm/ })).toBeInTheDocument()
  expect(screen.getByText('아이템')).toBeInTheDocument()
})
```

- [x] **Step 3: Run RED**

Run: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/app/App.test.tsx`

Expected: FAIL because `toUiReward()` does not expose `kind`/`kindLabel`, and the reward modal does not render a kind label.

Actual: FAIL with three expected failures: item/augment projections lacked `kind` and `kindLabel`, and RewardModal did not render `아이템`.

- [x] **Step 4: Add display-only RewardCard type**

In `src/types/game.ts`, add:

```ts
export interface RewardCard extends AugmentItem {
  kind: 'augment' | 'item';
  kindLabel: '증강' | '아이템';
}
```

Then update:

```ts
rewardCandidates: RewardCard[];
targetAugment: RewardCard | null;
```

- [x] **Step 5: Project kind and kindLabel in adapter**

Change `toUiReward()` return type to `RewardCard` and add:

```ts
kind: reward.kind,
kindLabel: reward.kind === 'item' ? '아이템' : '증강',
```

- [x] **Step 6: Render kind label in RewardModal**

Update `RewardModal` to import/use `RewardCard`, rename local variables from `AugmentItem`/`selectedAug` to reward-card-neutral names, and render:

```tsx
<div className="card-pixel-kind">{reward.kindLabel}</div>
```

Do not add reward logic in React.

- [x] **Step 7: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/app/App.test.tsx`

Expected: PASS.

Actual: PASS with 5 tests.

- [x] **Step 8: Full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected: all pass.

Actual: `typecheck`, full `test:run` with 63 tests, and `build` passed.

- [ ] **Step 9: Update docs, commit, push, and open draft PR**

Update:
- `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- `docs/agent/SESSION_HANDOFF.md`
- `docs/CODEX_COLLABORATION.md`

Commit, push, and open a draft PR against `main`.
