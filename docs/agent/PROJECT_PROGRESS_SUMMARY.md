# Project Progress Summary

Last updated: 2026-08-20

## Repository

- GitHub: https://github.com/sabin1108/-curse_slot_machine
- Main working policy: branch-by-branch TDD, local verification, draft PR first, merge only after explicit user approval.
- Current worktree: `C:\Users\00\Documents\Codex\csm_augment_slot`
- Current branch: `feature/showcase-step-header-spacing`
- Current PR: draft PR #21 - https://github.com/sabin1108/-curse_slot_machine/pull/21
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
- PR #20 status: merged into `main` with squash commit `61744f1`.

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
| `feature/showcase-reward-modal-accessibility` | #20 | `61744f1` | Merged |

## Current Branch

`feature/showcase-step-header-spacing` is pushed and open as draft PR #21.

Implemented:

- `ShowcaseOverlay` separates the step counter, separator, and Korean step title into dedicated DOM elements.
- `src/styles.css` adds spacing hooks so `STEP 4 / 4` cannot visually run into the title.
- Focused component regression coverage now protects `SHOWCASE-QA-003`.

Current branch commits:

- `f758f60` - `docs: plan showcase step header spacing`
- `8ba4287` - `fix: separate showcase step heading`

## Verification

Latest verification on `feature/showcase-step-header-spacing`:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 58 tests across 11 files.
- `npm.cmd run build`: passed.
- Focused Playwright browser check: passed; Showcase step 4 heading is visible, separator renders `•`, and computed heading gap is `10px`.

TDD evidence:

- RED: `npm.cmd run test:run -- src/components/Showcase/ShowcaseOverlay.test.tsx` failed because `.showcase-step-heading` did not exist.
- GREEN: `npm.cmd run test:run -- src/components/Showcase/ShowcaseOverlay.test.tsx` passed after adding the dedicated heading/separator/title structure.

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

1. Keep PR #21 draft until review and explicit merge approval.
2. Next recommended slice after PR #21: address `SHOWCASE-QA-004` font fallback/network noise or continue structured-engine UI migration.

Do not merge later PRs without explicit user approval.
