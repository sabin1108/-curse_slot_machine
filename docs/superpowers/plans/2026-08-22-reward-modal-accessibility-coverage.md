# Reward Modal Accessibility Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore and cover the Showcase reward-modal accessibility path.

**Architecture:** `App.test.tsx` and Playwright drive the same user-visible Showcase path that produced the milestone QA findings. `App` prepares Showcase step 3 by dispatching the existing deterministic demo command prefix through the pure engine, then React renders the projected `REWARD` state. `RewardModal` remains a command-dispatching view; no game rules or reward generation move into React.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, Playwright.

## Global Constraints

- Keep this branch stacked on `feature/reward-inventory-naming-cleanup`.
- Do not change reward selection production behavior.
- Do not change reward generation, RNG, combat, or Showcase command rules.
- Keep normal-run e2e selectors unchanged unless a current test fails for a selector-specific reason.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, `npm.cmd run build`, `npm.cmd run test:e2e`, and `git diff --check` before PR.

---

### Task 1: Add Reward Modal Accessibility Regressions

**Files:**
- Modify: `src/app/App.test.tsx`
- Create: `tests/e2e/showcase-accessibility.spec.ts`

**Interfaces:**
- Consumes: title-screen `Showcase Mode` button, Showcase overlay `NEXT STEP` button, reward choice buttons rendered by `RewardModal`.
- Produces: regressions that prove role/name discovery, reward-modal input ownership, `aria-pressed`, keyboard focus, and browser keyboard activation.

- [ ] **Step 1: Add the failing App test**

Add a test that clicks `Showcase Mode`, clicks `NEXT STEP` twice, expects `.reward-modal-backdrop`, expects no overlay `NEXT STEP` button while reward selection owns input, and verifies the first `button[data-reward-id]` can be found again by `button` role and its accessible name.

- [ ] **Step 2: Add browser keyboard coverage**

Add `tests/e2e/showcase-accessibility.spec.ts` that follows the same path, focuses the first `button[data-reward-id]`, presses Enter, waits for overlay `NEXT STEP` to return, clicks it, and expects `STEP 4 / 4`.

- [ ] **Step 3: Run RED**

Run:

```powershell
npm.cmd run test:run -- src/app/App.test.tsx
```

Expected: FAIL before the `App` fix because Showcase step 3 does not open the reward modal.

### Task 2: Restore Showcase Reward Step

**Files:**
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `MVP_DEMO_REWARD_SETUP_COMMANDS`, `MVP_DEMO_SEED`, and existing core engine dispatch.
- Produces: Showcase step 3 renders the projected `REWARD` screen, and `ShowcaseOverlay` is hidden while `gameState.screen === 'REWARD'`.

- [ ] **Step 1: Implement the minimal App fix**

Import demo commands:

```tsx
import { MVP_DEMO_REWARD_SETUP_COMMANDS, MVP_DEMO_SEED } from '../game/demo/MvpDemoTrace'
```

Derive the reward-step index from the Showcase step metadata:

```tsx
const SHOWCASE_REWARD_STEP_INDEX = getShowcaseRewardStepIndex()
```

In `src/game/demo/MvpDemoTrace.ts`, export `MVP_DEMO_REWARD_SETUP_COMMANDS` as the `MVP_DEMO_COMMANDS` prefix before the first `CHOOSE_REWARD` command. Cover it in `src/game/demo/OriginDemoTraces.test.ts` so trace edits cannot silently move Showcase step 3 away from a real reward state.

When `NEXT_SHOWCASE_STEP` advances to step index `2`, create a fresh `GameEngine(DEFAULT_SEED)`, dispatch `MVP_DEMO_REWARD_SETUP_COMMANDS`, clear `introScreen`, set `coreState`, and preserve `showcase.active/currentStep`.

Render `ShowcaseOverlay` only when:

```tsx
gameState.showcase.active && gameState.screen !== 'REWARD'
```

- [ ] **Step 2: Run targeted GREEN**

Run:

```powershell
npm.cmd run test:run -- src/app/App.test.tsx
npm.cmd run test:e2e -- tests/e2e/showcase-accessibility.spec.ts --project=chromium
```

Expected: PASS.

### Task 3: Update QA And Handoff Docs

**Files:**
- Modify: `docs/reviews/milestone-showcase-playable-qa/qa-review.md`
- Modify: `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- Modify: `docs/agent/SESSION_HANDOFF.md`
- Modify: `docs/CODEX_COLLABORATION.md`

**Interfaces:**
- Consumes: current test evidence and existing milestone review findings.
- Produces: current-state docs that distinguish original review evidence from later resolved verification.

- [ ] **Step 1: Mark SHOWCASE-QA-001 and SHOWCASE-QA-002 resolved**

Keep the original `Build or commit: fed924e` and evidence lines, but update both status blocks to resolved follow-up status against `feature/reward-modal-accessibility-coverage`.

- [ ] **Step 2: Update branch docs**

Record that this branch restores and covers the Showcase reward accessibility path. Keep merge policy unchanged.

- [ ] **Step 3: Run documentation scan**

Run:

```powershell
rg -n "SHOWCASE-QA-001|SHOWCASE-QA-002|Status: Proposed|clickable `div|clickable divs|reward choices are clickable" docs/reviews/milestone-showcase-playable-qa docs/agent docs/CODEX_COLLABORATION.md src -S
```

Expected: any remaining references are historical context, not current unresolved status.

### Task 4: Verification, Review, And PR

**Files:**
- All files modified in Tasks 1-3.

**Interfaces:**
- Consumes: completed test, App, and doc updates.
- Produces: a verified stacked draft PR.

- [ ] **Step 1: Run full verification**

Run each command:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
git diff --check
```

- [ ] **Step 2: Request independent review**

Use a `code-reviewer` subagent for the full branch diff and an `architect` subagent for the React/game-boundary check. The required verdict is no Critical/Important blockers.

- [ ] **Step 3: Commit and publish**

Commit with:

```powershell
git add src/app/App.tsx src/app/App.test.tsx src/game/demo/MvpDemoTrace.ts src/game/demo/OriginDemoTraces.test.ts tests/e2e/showcase-accessibility.spec.ts docs
git commit -m "test: cover reward modal accessibility"
```

Push and create a draft PR:

```powershell
git push -u origin feature/reward-modal-accessibility-coverage
gh pr create --base feature/reward-inventory-naming-cleanup --head feature/reward-modal-accessibility-coverage --draft --title "Cover reward modal accessibility" --body-file <body-file>
```

- [ ] **Step 4: Verify PR**

Run:

```powershell
gh pr view <pr-number> --json number,state,isDraft,url,headRefName,baseRefName,headRefOid
```

Expected: draft PR is open against `feature/reward-inventory-naming-cleanup`.

## Self-Review

- Spec coverage: every acceptance criterion maps to Tasks 1-4.
- Placeholder scan: no placeholder tasks or unspecified commands remain.
- Type consistency: no new production API is introduced.
