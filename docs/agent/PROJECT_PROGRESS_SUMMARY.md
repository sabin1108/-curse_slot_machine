# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/showcase-reward-modal-accessibility`
- Current PR: draft PR #20 - https://github.com/sabin1108/-curse_slot_machine/pull/20
- PR #8 status: merged into `main` with squash commit `ca51454`.
- PR #10 status: merged into `main` with squash commit `8be060c`.
- PR #11 status: merged into `main` with squash commit `e8c5884`.
- PR #12 status: merged into `main` with squash commit `9955372`.
- PR #13 status: merged into `main` with squash commit `1877c21`.
- PR #14 status: merged into `main` with squash commit `d4ea1bd`.
- PR #15 status: merged into `main` with squash commit `eae8337`.
- PR #16 status: merged into `main` with squash commit `2165922`.
- PR #17 status: merged into `main` with squash commit `5d1a89b`.
- PR #18 status: merged into `main` with squash commit `fed924e`.
- PR #19 status: merged into `main` with squash commit `f1145c6`.

## Completed Branches

| Branch | PR | Main commit | Status |
| --- | --- | --- | --- |
| `feature/project-baseline` | #1 | `2ce9e20` | Merged |
| `feature/game-engine-core` | #2 | `49f5eab` | Merged |
| `feature/combat-slot-machine` | #3 | `6edc91d` | Merged |
| `feature/combat-resolution` | #6 | `445265a` | Merged |
| `feature/build-reward-synergy` | #7 | `622f52f` | Merged |
| `feature/augment-slot-machine` | #8 | `ca51454` | Merged |
| `feature/content-effect-schema-pilot` | #10 | `8be060c` | Merged |
| `feature/ui-adapter-confirm-result` | #11 | `e8c5884` | Merged |
| `feature/ui-adapter-map-node` | #12 | `9955372` | Merged |
| `feature/ui-adapter-select-map-node` | #13 | `1877c21` | Merged |
| `feature/ui-adapter-node-type-routing` | #14 | `d4ea1bd` | Merged |
| `feature/ui-adapter-event-node-entry` | #15 | `eae8337` | Merged |
| `feature/ui-adapter-event-choice-command` | #16 | `2165922` | Merged |
| `feature/ui-adapter-showcase-slot-guard` | #17 | `5d1a89b` | Merged |
| `feature/showcase-ui-entry-overlay` | #18 | `fed924e` | Merged |
| `review/showcase-playable-qa` | #19 | `f1145c6` | Merged |

## Current Branch

`feature/showcase-reward-modal-accessibility` is pushed and open as draft PR #20.

Implemented:

- `App` hides `ShowcaseOverlay` while `gameState.screen === 'REWARD'`, so the visible `NEXT STEP` CTA is not blocked by the reward modal backdrop.
- `RewardModal` exposes each reward choice as a real `button type="button"` with an accessible reward-name label.
- App-level regression tests cover accepted QA findings `SHOWCASE-QA-001` and `SHOWCASE-QA-002`.

Current branch commits:

- `8217da6` - `docs: plan showcase reward accessibility fixes`
- `428b1ca` - `fix: improve showcase reward accessibility`

## Verification

Latest verification on `feature/showcase-reward-modal-accessibility`:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 57 tests across 10 files.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 1 Chromium smoke test.
- Focused Playwright browser check: passed; reward modal hides `NEXT STEP`, `방벽 코어` is selectable as a button, and Showcase overlay returns after reward selection.

TDD evidence:

- RED: `npm.cmd run test:run -- src/app/App.test.tsx` failed while `NEXT STEP` remained rendered behind the reward modal.
- RED: `npm.cmd run test:run -- src/app/App.test.tsx` failed because reward cards were clickable `div`s, not semantic buttons.
- GREEN: `npm.cmd run test:run -- src/app/App.test.tsx` passed with 5 App tests after implementation.

## Architecture Decisions Preserved

- React renders state and events; it does not decide game outcomes.
- Pure TypeScript systems own deterministic game rules.
- `CombatSlotMachine` and `AugmentSlotMachine` are separate systems.
- `RewardSystem` owns reward option generation.
- `AugmentSlotMachine` only presents a preselected reward result and must not call random APIs to decide rewards.
- Showcase Mode remains separate and must not mutate normal combat balance.
- Content effects are bounded typed data, not free-form scripts.

## Remaining Work

Next planned work:

1. Keep PR #20 draft until review and explicit merge approval.
2. Next recommended slice: fix low-risk Showcase polish finding `SHOWCASE-QA-003` or continue structured-engine UI migration.

Do not merge later PRs without explicit user approval.
