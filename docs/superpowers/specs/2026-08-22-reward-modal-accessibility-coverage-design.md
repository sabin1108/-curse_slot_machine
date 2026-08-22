# Reward Modal Accessibility Coverage Design

Branch: `feature/reward-modal-accessibility-coverage`
Base: `feature/reward-inventory-naming-cleanup`
Date: 2026-08-22

## Problem

The reward modal already renders reward choices as semantic `button type="button"` controls with accessible names and selected state. Exploration found a second gap in the current stacked branch: Showcase step 3 no longer prepares the reward-modal state that the original milestone QA finding expected, so the old QA-001 and QA-002 fixes are not directly verifiable.

## Scope

- Add focused React Testing Library coverage for Showcase reward choices and reward-modal input ownership.
- Restore the Showcase step 3 reward-modal path by dispatching the existing deterministic demo command prefix through the pure engine.
- Add Playwright coverage for keyboard activation of a focused reward choice.
- Update stale QA and branch handoff/progress docs to record the verified status.

## Non-Goals

- Do not change reward selection production behavior.
- Do not change reward generation, RNG, combat, or Showcase command rules.
- Do not redesign reward cards, card copy, or layout.
- Do not replace existing normal-run e2e selector strategy.

## Acceptance Criteria

- `src/app/App.test.tsx` reaches Showcase step 3, verifies the reward modal owns input, finds a reward by `button` role and accessible name, and verifies selected state.
- `tests/e2e/showcase-accessibility.spec.ts` verifies browser keyboard activation: focus reward button, press Enter, observe overlay return, click `NEXT STEP`, and observe Showcase step 4.
- `SHOWCASE-QA-001` and `SHOWCASE-QA-002` are marked resolved/verified against the current branch while preserving the original reviewed commit evidence.
- Documentation states this branch is a focused Showcase accessibility regression repair and coverage branch.
- Full verification passes: `npm.cmd run typecheck`, `npm.cmd run test:run`, `npm.cmd run build`, `npm.cmd run test:e2e`, and `git diff --check`.

## Review Notes

The key review question is whether the branch restores Showcase accessibility using engine commands and UI rendering only, without moving reward generation, combat, or reward-selection rules into React.
