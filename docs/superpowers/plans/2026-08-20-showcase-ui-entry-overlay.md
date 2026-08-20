# Showcase UI Entry And Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Showcase Mode reachable from the title screen and visible through the existing overlay.

**Architecture:** React remains a command dispatcher and state renderer. `TitleScreen` dispatches `START_SHOWCASE`; `App` renders `ShowcaseOverlay` from `gameState.showcase`; `UiGameEngine` remains responsible for Showcase state and scripted slot behavior.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library.

## Global Constraints

- Do not move RNG, combat resolution, rewards, or Showcase step rules into React.
- Reuse existing `START_SHOWCASE`, `NEXT_SHOWCASE_STEP`, and `ShowcaseOverlay`.
- Keep this branch small and TDD-protected.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Showcase Button And Overlay Wiring

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/components/Title/TitleScreen.tsx`

**Interfaces:**
- Consumes: `GameCommand` variants `{ type: 'START_SHOWCASE' }` and `{ type: 'NEXT_SHOWCASE_STEP' }`.
- Produces: a visible title-screen Showcase button and mounted `ShowcaseOverlay` while `gameState.showcase.active` is true.

- [x] **Step 1: Write failing App tests**

Add tests to `src/app/App.test.tsx`:

```tsx
it('starts showcase mode from the title screen and shows the overlay', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /showcase mode/i }))

  expect(screen.getByText(/SHOWCASE MODE/i)).toBeInTheDocument()
  expect(screen.getByText(/STEP 1/i)).toBeInTheDocument()
})

it('advances showcase overlay steps through the existing command path', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /showcase mode/i }))
  const firstInstruction = screen.getByText(/전투 시작/i)

  await user.click(screen.getByRole('button', { name: /NEXT STEP/i }))

  expect(firstInstruction).not.toBeInTheDocument()
  expect(screen.getByText(/STEP 2/i)).toBeInTheDocument()
})
```

- [x] **Step 2: Run tests to verify RED**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: FAIL because the Showcase button is not rendered and `App` does not mount `ShowcaseOverlay`.

- [x] **Step 3: Implement minimal UI wiring**

In `TitleScreen`, add a `handleStartShowcase` handler:

```tsx
const handleStartShowcase = () => {
  soundManager.playClick()
  onDispatch({ type: 'START_SHOWCASE' })
}
```

Render a button-like control with accessible button semantics:

```tsx
<button className="k-btn big showcase glow-pulse" onClick={handleStartShowcase} type="button">
  Showcase Mode
</button>
```

In `App`, import and render:

```tsx
{gameState.showcase.active && (
  <ShowcaseOverlay
    currentStepIndex={gameState.showcase.currentStep}
    steps={gameState.showcase.steps}
    onDispatch={handleDispatch}
  />
)}
```

- [x] **Step 4: Run targeted tests to verify GREEN**

Run: `npm.cmd run test:run -- src/app/App.test.tsx`

Expected: PASS.

### Task 2: Verification And Publish

- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run test:run`.
- [x] Run `npm.cmd run build`.
- [ ] Update handoff/progress/collaboration docs.
- [ ] Commit, push, and open a draft PR.
