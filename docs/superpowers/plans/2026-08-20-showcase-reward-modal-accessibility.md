# Showcase Reward Modal Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve accepted Showcase QA findings `SHOWCASE-QA-001` and `SHOWCASE-QA-002` without moving game rules into React.

**Architecture:** `App` controls whether the Showcase overlay is rendered from engine state and current screen only. `RewardModal` keeps reward selection as a UI command dispatch, but exposes each reward choice as a semantic button. Engine-owned reward selection and Showcase progression remain unchanged.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, Playwright.

## Global Constraints

- React renders state and dispatches commands only.
- Do not move reward generation, RNG, combat resolution, or Showcase step rules into React.
- Fix only the accepted QA findings in this branch.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Hide Showcase Overlay While Reward Modal Owns Input

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `gameState.showcase.active`, `gameState.screen`
- Produces: overlay rendering only when Showcase Mode is active and the current screen is not `REWARD`

- [x] **Step 1: Write failing App test**

Add this test to `src/app/App.test.tsx`:

```tsx
it('hides showcase overlay controls while reward selection owns input', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }))
  fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))
  fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))

  expect(screen.getByText(/VICTORY REWARD/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /NEXT STEP/i })).not.toBeInTheDocument()
})
```

- [x] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: FAIL because `NEXT STEP` remains rendered behind the reward modal.

- [x] **Step 3: Implement minimal App change**

In `src/app/App.tsx`, render `ShowcaseOverlay` only when:

```tsx
gameState.showcase.active && gameState.screen !== 'REWARD'
```

- [x] **Step 4: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: PASS for the overlay hiding test.

### Task 2: Make Reward Choices Semantic Buttons

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `src/components/Reward/RewardModal.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `RewardModal` props and `CHOOSE_REWARD` command dispatch.
- Produces: each reward card as a real `button type="button"` with an accessible name that includes the reward name.

- [x] **Step 1: Write failing App test**

Add this test to `src/app/App.test.tsx`:

```tsx
it('offers reward choices as semantic buttons in showcase reward step', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }))
  fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))
  fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))

  expect(screen.getByRole('button', { name: /방벽 코어/ })).toBeInTheDocument()
})
```

- [x] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: FAIL because reward cards are clickable `div`s, not buttons.

- [x] **Step 3: Implement minimal RewardModal change**

Change each `.reward-card-pixel` wrapper from `div` to:

```tsx
<button
  key={aug.id}
  className={`reward-card-pixel ${isSelected ? 'selected' : ''}`}
  style={{ backgroundImage: `url(${getCardFrame(aug.rarity)})` }}
  onClick={() => handleSelectReward(aug)}
  type="button"
  aria-label={`${aug.name} 선택`}
>
```

Close it with `</button>`.

In `src/styles.css`, ensure `.reward-card-pixel` keeps visual layout as a button:

```css
.reward-card-pixel {
  appearance: none;
  border: none;
  font: inherit;
  color: inherit;
}
```

- [x] **Step 4: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: PASS.

### Task 3: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [x] Run focused browser check for Showcase reward step.
- [x] Update handoff/progress/collaboration docs.
- [x] Commit, push, and open a draft PR.
