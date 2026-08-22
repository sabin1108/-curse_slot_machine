# OpenAI Game Hackathon - Codex 협업 및 개발 기록

## 1. 개요
- **프로젝트명**: 저주받은 슬롯머신 (Cursed Slot Machine Roguelike)
- **개발 플랫폼**: Web Browser (Desktop First, Vite + React + TypeScript)
- **대회 트랙**: OpenAI Game Builders Warm-up Challenge (Track 1)

## 2. 사람이 직접 결정한 중요 판단
1. **슬롯머신 용어 및 시스템 명확 분리**:
   - `CombatSlotMachine`: 실제 전투 규칙 및 3릴 문장 생성 (`[행동] [대상] [변형]`).
   - `AugmentSlotMachine`: 보상 연출 전용 3릴 시각화 UI (RNG 소유하지 않음).
2. **UX 4대 원칙 적용**:
   - 도파민 중심을 단일 스핀의 우연보다 모은 증강과 시너지의 폭발적 성장에 배치.
   - 정보 패널이 스핀 캐비닛을 가리지 않도록 3단 레이아웃(좌측 증강 목록 - 중앙 릴 캐비닛 - 우측 예상 결과) 설계.
3. **Showcase Mode (3분 대회 시연 모드)**:
   - 3분 내에 시연 영상을 촬영할 수 있도록 시나리오 기반 스텝 진행 모드 구현.

## 3. Codex (Antigravity AI)가 수행한 역할
1. `D:\sabin\note\codex_ai 게임해커톤` 통합 명세서 v2.1 및 UI/UX 기획서 완벽 학습 및 아키텍처 설계.
2. 에셋 검수 및 최적 오픈소스 에셋 팩 추출/배치.
3. Seeded RNG 기반 `GameEngine` 구현 및 단일 페이라인 `CombatSlotMachine` 문장 조합 및 MISS 로직 개발.
4. 다크 던전 카지노 테마의 반응형 CSS 스타일링, 레버 당김 애니메이션, 릴 블러 스핀 연출, Web Audio API 사운드 매니저 제작.
5. 결정론적 코어 엔진(PR #2)과 픽셀 레트로 UI/UX 연동 및 통합 검증 완료.

---

# Codex Collaboration Log

## 2026-08-18 - Project Baseline & UI/UX Integration

### Human Direction

- Use local planning documents as reference material.
- Work branch by branch, open draft PRs, and merge after local verification.
- Maintain retro UI/UX pixel visual experience while building core engine systems.

### Codex Work

- Initialized project baseline with Vite + React + TypeScript.
- Implemented core deterministic game engine primitives (`src/game/engine`).
- Moved app shell to `src/app/App.tsx`.
- Integrated retro pixel visual UI (`BattleScreen`, `DungeonMapScreen`, `RestScreen`, `ShopScreen`, `RewardModal`).
- Verified `typecheck`, `test:run`, `build`, and Playwright e2e smoke tests.

### Human Decisions

- Approved squash merge of PR #1 after local verification.

### GitHub / Git Identity

- GitHub CLI authenticated as `kimcheolhui9846`.
- Repository-local Git author set to `kim cheol hui <144594976+kimcheolhui9846@users.noreply.github.com>`.
- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/1
- PR #1 merged with squash commit `2ce9e20`.

### Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 1 test.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 1 test.

## 2026-08-18 - Game Engine Core

### Human Direction

- Continue to `feature/game-engine-core` after merging the baseline branch.
- Use TDD for the engine core.

### Codex Work

- Created `feature/game-engine-core` from updated `main`.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing tests before implementation for seeded RNG, initial game state, and deterministic command processing.
- Implemented framework-free engine modules under `src/game/engine`.

### Verification

- `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`: passed, 3 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 4 tests across 2 files.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 1 Playwright Chromium test.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/2
- Implementation commit: `06b9cdc`; PR documentation updates are included on the branch.

### Human Decisions

- Approved marking PR #2 ready and merging it after local verification.

### Merge Result

- PR #2 merged: https://github.com/sabin1108/-curse_slot_machine/pull/2
- Squash merge commit: `49f5eab`.
- Next branch started from updated `main`: `feature/combat-slot-machine`.

## 2026-08-18 - Combat Slot Machine

### Human Direction

- Continue from the merged game engine core.
- Implement `feature/combat-slot-machine` with TDD.
- Keep combat slot outcome logic in pure TypeScript, separate from React UI.

### Codex Work

- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing combat slot tests before adding production slot modules.
- Implemented weighted reel picking, default combat reel pools, one-payline spin results, lock-aware rerolls, deterministic seeded sequences, and lock-count curse costs.

### Verification

- `npm.cmd run test:run -- src/game/slot/CombatSlotMachine.test.ts`: failed first because slot modules did not exist, then passed with 5 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 9 tests across 3 files.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 1 Playwright Chromium test.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/3
- Implementation commit: `4a2edb5`; PR documentation updates are included on the branch.

## 2026-08-19 - Combat Resolution

### Human Direction

- Proceed with item 1 from the spec gap list: interpret slot results into real combat state changes.
- Keep this work on a combat resolution branch and continue the TDD workflow.
- Verify `typecheck`, unit tests, and build before opening a draft PR.
- Do not merge without explicit user approval.

### Codex Work

- Created and used the isolated worktree `C:\Users\00\Documents\Codex\curse_slot_machine_repo_combat_resolution`.
- Stacked `feature/combat-resolution` on `feature/combat-slot-machine` because PR #3 is still open and this branch depends on its combat slot result types.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `CombatSystem` tests before adding production combat modules.
- Implemented deterministic combat actors, curse state, enemy attack intent, slot result resolution, block absorption, capped healing, victory/defeat outcomes, and event emission.
- Wrote failing `GameEngine` integration tests before adding the `RESOLVE_COMBAT_SLOT` command.
- Integrated combat resolution into `GameState`, `GameCommand`, `GameEvent`, and `GameEngine`.

### Verification

- `npm.cmd run test:run -- src/game/combat/CombatSystem.test.ts`: failed first because `CombatSystem` did not exist, then passed with 4 tests.
- `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`: failed first because combat state and `RESOLVE_COMBAT_SLOT` did not exist, then passed with 4 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 14 tests across 4 files.
- `npm.cmd run build`: passed.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/6
- Implementation commit: `1be0afa`; PR documentation updates are included on the branch.
- Merge policy: no merge without explicit user approval.

### Merge Result

- User approved merging PR #3 and PR #6 on 2026-08-19.
- PR #3 was updated with a fast-forward merge of `origin/main` to resolve a documentation conflict, then squash merged into `main`.
- PR #3 squash merge commit: `6edc91d`.
- PR #6 was retargeted to `main` after PR #3 merged, verified, then squash merged into `main`.
- PR #6 squash merge commit: `445265a`.

## 2026-08-19 - Build Reward Synergy

### Human Direction

- After merging combat slot machine and combat resolution, start the next planned branch.
- Implement `feature/build-reward-synergy` with TDD.
- Keep AugmentSlotMachine reveal animation and Showcase scripted rewards out of this branch.

### Codex Work

- Created and used the isolated worktree `C:\Users\00\Documents\Codex\csm_reward_synergy`.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `BuildSystem` tests before adding build modules.
- Implemented pure build state, reward catalog, multi-requirement synergy evaluation, immutable reward application, duplicate reward handling, and synergy completion events.
- Wrote failing `RewardSystem` tests before adding reward scoring.
- Implemented deterministic reward candidate generation that excludes owned rewards and prioritizes synergy completion.
- Wrote failing `GameEngine` tests before adding reward state and commands.
- Integrated combat victory into a `reward` phase with generated reward options and `CHOOSE_REWARD` build application.

### Verification

- `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`: failed first because `BuildSystem` did not exist, then passed with 3 tests.
- `npm.cmd run test:run -- src/game/build/RewardSystem.test.ts`: failed first because `RewardSystem` did not exist, then passed with 2 tests.
- `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`: failed first because build/reward state and reward events did not exist, then passed with 5 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 24 tests across 7 files.
- `npm.cmd run build`: passed.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/7
- Implementation commit: `f2edf57`; PR documentation updates are included on the branch.
- Merge policy: no merge without explicit user approval.

### Merge Result

- User approved merging PR #7 on 2026-08-19.
- PR #7 was marked ready, verified, and squash merged into `main`.
- PR #7 squash merge commit: `622f52f`.

## 2026-08-19 - Augment Slot Machine

### Human Direction

- After merging build reward synergy, proceed to the next branch.
- Implement `feature/augment-slot-machine` with TDD.
- Keep AugmentSlotMachine as a reveal/presentation system; reward generation remains owned by RewardSystem.

### Codex Work

- Created and used the isolated worktree `C:\Users\00\Documents\Codex\csm_augment_slot`.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `AugmentSlotMachine` tests before adding production slot modules.
- Implemented deterministic three-reel reward presentation and immutable reveal behavior.
- Added a random API guard test to keep augment slot presentation from deciding reward RNG.
- Wrote failing `GameEngine` tests before adding reward presentation state and event fields.
- Integrated combat victory reward generation with `rewards.augmentSlot`, and clear it on `CHOOSE_REWARD`.

### Verification

- `npm.cmd run test:run -- src/game/slot/AugmentSlotMachine.test.ts`: failed first because `AugmentSlotMachine` did not exist, then passed with 3 tests.
- `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`: failed first because reward state/events did not include augment slot presentation, then passed with 5 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 27 tests across 8 files.
- `npm.cmd run build`: passed.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/8
- Implementation commit: `e57b615`; PR documentation updates are included on the branch.
- Merge policy: no merge without explicit user approval.

### Merge Result

- User approved merging PR #8 on 2026-08-20.
- PR #8 was marked ready and squash merged into `main`.
- PR #8 squash merge commit: `ca51454`.

## 2026-08-20 - Content Effect Schema Pilot

### Human Direction

- Merge PR #8 and continue the next work.
- Use the meeting feedback about insufficient item/augment/synergy logic.
- Keep new gameplay logic in pure TypeScript systems and avoid large structure changes without approval.

### Codex Work

- Created `feature/content-effect-schema-pilot` from updated `main` after PR #8 merge.
- Added content logic analysis and design documents:
  - `docs/agent/CONTENT_LOGIC_ANALYSIS.md`
  - `docs/design/CONTENT_EFFECT_SCHEMA_PLAN.md`
  - `docs/design/PILOT_AUGMENT_ITEM_SYNERGY_SETS.md`
  - `docs/design/MVP_REWARD_AND_STAGE_FLOW.md`
  - `docs/agent/feedback/*`
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `BuildSystem` test before adding `getActiveEffects`.
- Added bounded `EffectDefinition` and `EffectCondition` types.
- Implemented active effect resolution from owned rewards and completed synergies.
- Wrote failing `CombatSystem` tests before adding combat effect context.
- Implemented initial combat effects for action amount adjustment, bullet extra hit, and curse gain adjustment.
- Wrote failing pure `GameEngine` test before passing active build effects into combat.
- Added a default `combo_engine` structured extra-hit effect and pure engine integration.
- Used a read-only `explore` subagent to verify the UI/engine split before adapter work.
- Wrote failing `UiGameEngine` adapter test before adding a UI-facing bridge to structured reward/combat effects.
- Switched `App.tsx` to import the adapter after the existing App render test passed.
- Created draft PR #10 after verification and pushed commit `5ba1851`.
- Wrote a failing `UiGameEngine` reward projection test before projecting structured victory rewards into the legacy RewardModal state contract.
- Wrote failing `UiGameEngine` spin/reroll tests before routing UI combat slot commands through pure `CombatSlotMachine` functions.

### Verification

- `npm.cmd run test:run -- src/game/build/BuildSystem.test.ts`: failed first because `getActiveEffects` did not exist, then passed with 4 tests.
- `npm.cmd run test:run -- src/game/combat/CombatSystem.test.ts`: failed first because combat effects were ignored, then passed with 7 tests.
- `npm.cmd run test:run -- src/game/engine/GameEngine.test.ts`: failed first because active build effects were not passed into combat, then passed with 6 tests.
- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `UiGameEngine` did not exist, then passed with 1 test.
- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because structured victory rewards left `rewardCandidates` empty, then passed with 2 tests after projection.
- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because spin/reroll still produced legacy slot output, then passed with 4 tests after pure slot routing.
- `npm.cmd run test:run -- src/app/App.test.tsx`: passed before and after the adapter import switch.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 37 tests across 9 files.
- `npm.cmd run build`: passed.

### Remaining Gap

- The visible React app imports `src/game/engine/UiGameEngine.ts`, which preserves the current UI state contract and delegates ordinary legacy commands while exposing a narrow structured combo-effect combat path. Full legacy engine retirement remains out of scope for this branch.

### Merge Result

- User approved merging PR #10 on 2026-08-20.
- PR #10 was marked ready and squash merged into `main`.
- PR #10 squash merge commit: `8be060c`.

## 2026-08-20 - UI Adapter Confirm Result

### Human Direction

- Merge PR #10 and continue the next adapter slice.

### Codex Work

- Created `feature/ui-adapter-confirm-result` from updated `main` after PR #10 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote a failing `UiGameEngine` test proving `CONFIRM_SLOT_RESULT` still trusted mutable UI `currentResult`.
- Updated `CONFIRM_SLOT_RESULT` to prefer the adapter-owned pure `currentStructuredSlot`.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because mutated UI presentation prevented enemy damage, then passed with 5 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 41 tests across 9 files.
- `npm.cmd run build`: passed.

## 2026-08-20 - UI Projection Helper Extraction

### Human Direction

- Continue the next adapter cleanup on draft PR #11 after approval.
- Keep the work small, TDD-protected, and avoid broad engine/UI migration in this slice.

### Codex Work

- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `UiProjection` tests before adding the production projection module.
- Extracted reusable UI projection helpers from `UiGameEngine` into `src/game/engine/UiProjection.ts`.
- Kept `UiGameEngine` focused on command orchestration, adapter-owned combat slot state, and structured state projection.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`: failed first because `UiProjection.ts` did not exist.
- `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/game/engine/UiGameEngine.test.ts`: passed, 7 tests across 2 files.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 43 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/11
- User approved merging PR #11 on 2026-08-20.
- PR #11 was marked ready and squash merged into `main`.
- PR #11 squash merge commit: `e8c5884`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Reward To Map Adapter

### Human Direction

- Merge PR #11 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-map-node` from updated `main` after PR #11 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote a failing `UiGameEngine` test proving structured reward selection left the UI on `REWARD`.
- Updated structured `CHOOSE_REWARD` handling to apply the reward in the structured engine while using the legacy presentation engine only for temporary map/wave/enemy shell progression when the visible UI is on the reward screen.
- Re-projected structured build and reward presentation after the legacy shell update so reward candidates and augment slot state clear.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `screen` stayed `REWARD`, then passed with 6 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 44 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/12
- User approved merging PR #12 on 2026-08-20.
- PR #12 was marked ready and squash merged into `main`.
- PR #12 squash merge commit: `9955372`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Select Map Node Adapter

### Human Direction

- Merge PR #12 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-select-map-node` from updated `main` after PR #12 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote a failing `UiGameEngine` test proving `SELECT_MAP_NODE` left the UI on `MAP`.
- Updated `SELECT_MAP_NODE` handling to delegate map path bookkeeping to the legacy presentation engine, then prepare a clean `BATTLE` entry state.
- Cleared adapter-owned structured slot state on map node selection so `CONFIRM_SLOT_RESULT` cannot re-resolve a previous slot before the next spin.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `screen` stayed `MAP`, then passed with 7 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 45 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/13
- User approved merging PR #13 on 2026-08-20.
- PR #13 was marked ready and squash merged into `main`.
- PR #13 squash merge commit: `1877c21`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Map Node Type Routing

### Human Direction

- Merge PR #13 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-node-type-routing` from updated `main` after PR #13 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `UiGameEngine` tests proving `SHOP` and `REST` node selections still routed to `BATTLE`.
- Extended `SELECT_MAP_NODE` with optional `nodeType` command data.
- Updated `UiGameEngine` to route typed map nodes to `SHOP`, `REST`, or battle entry while clearing stale adapter-owned slot state.
- Updated `DungeonMapScreen` to pass node type in the command and stop dispatching extra `NAVIGATE` commands for battle/shop/rest nodes.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `SHOP` and `REST` nodes returned `BATTLE`, then passed with 9 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 47 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/14
- User approved merging PR #14 on 2026-08-20.
- PR #14 was marked ready and squash merged into `main`.
- PR #14 squash merge commit: `d4ea1bd`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Event Node Entry

### Human Direction

- Merge PR #14 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-event-node-entry` from updated `main` after PR #14 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote a failing `UiGameEngine` test proving `EVENT` node selection still routed to `BATTLE`.
- Updated `UiGameEngine` to route typed event node entry to `MAP` while clearing stale adapter-owned slot state.
- Updated `DungeonMapScreen` to dispatch `SELECT_MAP_NODE` for event nodes before opening the existing local event choice modal.
- Kept event choice reward/rest/skip resolution out of this slice.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `EVENT` node selection returned `BATTLE`, then passed with 10 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 48 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/15
- User approved merging PR #15 on 2026-08-20.
- PR #15 was marked ready and squash merged into `main`.
- PR #15 squash merge commit: `eae8337`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Event Choice Command

### Human Direction

- Merge PR #15 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-event-choice-command` from updated `main` after PR #15 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `UiGameEngine` tests proving `RESOLVE_EVENT_CHOICE` did not yet affect open/rest/skip outcomes.
- Added `EventChoice` and `RESOLVE_EVENT_CHOICE`.
- Updated `UiGameEngine` to map event choices to existing TypeScript engine commands.
- Updated `DungeonMapScreen` so event buttons dispatch one event choice command instead of branching into outcome-specific commands.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `RESOLVE_EVENT_CHOICE` left outcomes unchanged, then passed with 13 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 51 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/16
- User approved merging PR #16 on 2026-08-20.
- PR #16 was marked ready and squash merged into `main`.
- PR #16 squash merge commit: `2165922`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - UI Showcase Slot Guard

### Human Direction

- Merge PR #16 and continue the next adapter slice.
- Keep the work small and TDD-protected.

### Codex Work

- Created `feature/ui-adapter-showcase-slot-guard` from updated `main` after PR #16 merge.
- Added a branch implementation plan under `docs/superpowers/plans/`.
- Wrote failing `UiGameEngine` tests proving showcase spins used structured RNG and stale structured slots could resolve after `START_SHOWCASE`.
- Updated `UiGameEngine` so `START_SHOWCASE` clears adapter-owned structured slot state.
- Updated showcase active `SPIN_COMBAT_SLOT` to delegate to the legacy presentation engine, preserving scripted forced results.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because showcase forced results were bypassed, then passed with 15 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 53 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/17
- User approved merging PR #17 on 2026-08-20.
- PR #17 was marked ready and squash merged into `main`.
- PR #17 squash merge commit: `5d1a89b`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - Showcase UI Entry Overlay

### Human Direction

- Merge PR #17 and continue the next Showcase UI slice.
- Keep React as display/input only.

### Codex Work

- Created `feature/showcase-ui-entry-overlay` from updated `main` after PR #17 merge.
- Added `docs/superpowers/specs/2026-08-20-showcase-ui-entry-overlay-design.md`.
- Added `docs/superpowers/plans/2026-08-20-showcase-ui-entry-overlay.md`.
- Wrote failing `App` tests for title-screen Showcase entry and overlay step advancement.
- Added a title-screen `Showcase Mode` button that dispatches `START_SHOWCASE`.
- Rendered `ShowcaseOverlay` while `gameState.showcase.active` is true.

### Verification

- `npm.cmd run test:run -- src/app/App.test.tsx`: failed first because the Showcase button did not exist, then passed with 3 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 55 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- PR: https://github.com/sabin1108/-curse_slot_machine/pull/18
- User approved merging PR #18 on 2026-08-20.
- PR #18 was marked ready and squash merged into `main`.
- PR #18 squash merge commit: `fed924e`.
- Merge policy: no later merge without explicit user approval.

## 2026-08-20 - Showcase Playable QA

### Human Direction

- Merge PR #18 and continue the next work.
- Run focused Showcase playable QA before broad structured-engine replacement.

### Codex Work

- Created `review/showcase-playable-qa` from updated `main` after PR #18 merge.
- Read `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, and `docs/reviews/README.md`.
- Ran existing Playwright smoke test.
- Captured Showcase browser evidence at 1280x720 under `docs/reviews/milestone-showcase-playable-qa/evidence/`.
- Wrote `docs/reviews/milestone-showcase-playable-qa/qa-review.md`.

### Findings

- `SHOWCASE-QA-001`: step 3 reward modal makes the visible overlay `NEXT STEP` button non-actionable until a reward is selected.
- `SHOWCASE-QA-002`: reward choices are clickable divs rather than semantic buttons.
- `SHOWCASE-QA-003`: step counter and title can visually run together.
- `SHOWCASE-QA-004`: Google Fonts request fails in network-restricted review.

### Verification

- `npm.cmd run test:e2e`: passed, 1 Chromium smoke test.
- Browser QA repeated the step 3 obstruction and confirmed the reward-card path reaches step 4.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 55 tests across 10 files.
- `npm.cmd run build`: passed.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/19
- Merge policy: no merge without explicit user approval.

## 2026-08-20 - Showcase Reward Modal Accessibility

### Human Direction

- User approved merging PR #19 and continuing with the accepted QA fixes.
- Keep the fix small, TDD-protected, and limited to React display/input behavior.

### Codex Work

- Merged PR #19 after approval; squash merge commit on `main`: `f1145c6`.
- Created `feature/showcase-reward-modal-accessibility` from updated `main`.
- Added `docs/superpowers/plans/2026-08-20-showcase-reward-modal-accessibility.md`.
- Wrote failing App tests for `SHOWCASE-QA-001` and `SHOWCASE-QA-002`.
- Updated `App` so `ShowcaseOverlay` is not rendered while the reward modal owns input on `REWARD`.
- Updated `RewardModal` so reward cards are semantic `button type="button"` controls with accessible reward-name labels.

### Verification

- `npm.cmd run test:run -- src/app/App.test.tsx`: failed first for each accepted QA issue, then passed with 5 tests after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 57 tests across 10 files.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e`: passed, 1 Chromium smoke test.
- Focused Playwright browser check passed: reward modal hides `NEXT STEP`, `방벽 코어` is selectable as a button, and Showcase overlay returns after reward selection.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/20
- Head commit: `428b1ca`.
- Merge policy: no merge without explicit user approval.

## 2026-08-20 - Showcase Step Header Spacing

### Human Direction

- User approved merging PR #20 and continuing with the next accepted Showcase QA polish slice.
- Keep the fix scoped to `SHOWCASE-QA-003`.

### Codex Work

- Merged PR #20 after approval; squash merge commit on `main`: `61744f1`.
- Created `feature/showcase-step-header-spacing` from updated `main`.
- Added `docs/superpowers/plans/2026-08-20-showcase-step-header-spacing.md`.
- Wrote a failing `ShowcaseOverlay` component test for dedicated step heading separation.
- Updated `ShowcaseOverlay` to render separate `.step-num`, `.step-separator`, and `.step-title` elements.
- Added CSS spacing/wrapping hooks so the step counter and Korean title do not visually run together.

### Verification

- `npm.cmd run test:run -- src/components/Showcase/ShowcaseOverlay.test.tsx`: failed first because `.showcase-step-heading` did not exist, then passed after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 58 tests across 11 files.
- `npm.cmd run build`: passed.
- Focused Playwright browser check passed: step 4 heading visible, separator renders `•`, computed heading gap is `10px`.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/21
- Head commit: `8ba4287`.
- Merge policy: no merge without explicit user approval.

## 2026-08-22 - Showcase Reward Accessibility Regression Recovery

### Human Direction

- Continue the stacked branch sequence using the default draft-PR workflow.
- Use subagents for exploration/review and keep fixes scoped.

### Codex Work

- Created `feature/reward-modal-accessibility-coverage` from `feature/reward-inventory-naming-cleanup`.
- Added `docs/superpowers/specs/2026-08-22-reward-modal-accessibility-coverage-design.md`.
- Added `docs/superpowers/plans/2026-08-22-reward-modal-accessibility-coverage.md`.
- Added React Testing Library coverage for Showcase step 3 reward-modal ownership and reward choice role/name/focus/selected state.
- Restored Showcase step 3 reward presentation by dispatching the deterministic demo command prefix through the pure engine.
- Added Playwright coverage for focusing a reward choice, pressing Enter, returning to the Showcase overlay, and advancing to step 4.
- Marked `SHOWCASE-QA-001` and `SHOWCASE-QA-002` resolved in follow-up in the milestone QA review.

### Verification

- `npm.cmd run test:run -- src/app/App.test.tsx`: failed first because Showcase step 3 did not open the reward modal, then passed after implementation.
- `npm.cmd run test:run -- src/app/App.test.tsx src/game/demo/OriginDemoTraces.test.ts`: passed after replacing the magic Showcase reward setup count with `MVP_DEMO_REWARD_SETUP_COMMANDS`.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 109 tests across 21 files.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e -- tests/e2e/showcase-accessibility.spec.ts --project=chromium`: passed.
- `npm.cmd run test:e2e`: passed, 4 Chromium tests.
- `git diff --check`: passed.
- Code-review lane returned `COMMENT`; one low-severity progress-summary wording issue was fixed.
- Architecture lane returned `CLEAR`; hard-coded reward-step index tradeoff was removed after review.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/31
- Later merged into `feature/reward-inventory-naming-cleanup` as part of the approved stacked PR merge.

## 2026-08-22 - Stacked PR Merge And Effect Resolver Boundary

- User approved merging the stacked PR chain and continuing work.
- Merged PR #31 into `feature/reward-inventory-naming-cleanup`: `f65e213`.
- Merged PR #30 into `feature/reward-card-type-cleanup`: `36377db`.
- Merged PR #29 into `feature/reward-card-inventory-projection`: `652e407`.
- Merged PR #28 into `feature/enemy-defense-intent`: `7d57de0`.
- Merged PR #27 into `main`: `16e58cb`.
- Verified merged `main`:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 109 tests across 21 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Started `feature/effect-resolver-boundary` from merged `main`.
- Added `src/game/effects/EffectResolver.ts` as a pure combat condition resolver.
- Rewired `CombatSystem` to consume resolver condition matching without moving modifier ordering, arithmetic, event emission, or state ownership.
- TDD evidence:
  - Resolver test first failed because `EffectResolver.ts` did not exist.
  - Targeted resolver/combat/engine test pass after review corrections: 4 files, 45 tests.
  - `npm.cmd run typecheck`: passed.
- Plan-review lane returned `REJECT`; corrected the branch scope from condition-plus-aggregation to condition-only and added ordering/filtering regressions.
- Code-review lane returned `REQUEST CHANGES`; split resolver condition tests into independent branch checks.
- Code-review re-review returned `APPROVE`.
- Architecture lane returned `WATCH`; routed all condition-bearing combat handlers through the resolver and narrowed resolver context to minimal facts.
- Architecture re-review returned `CLEAR`.
- Full branch verification after correction:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 124 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/32
- Later merged into `main`: `ad33fcd`.

## 2026-08-22 - Reward Effect Condition Resolver

- User approved merging PR #32 and continuing work.
- Verified PR #32 branch before merge:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 124 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Merged PR #32 into `main`: `ad33fcd`.
- Verified merged `main`:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 124 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Started `feature/reward-effect-condition-resolver` from merged `main`.
- Added `docs/superpowers/specs/2026-08-22-reward-effect-condition-resolver-design.md`.
- Added `docs/superpowers/plans/2026-08-22-reward-effect-condition-resolver.md`.
- Extended `EffectResolver` to support reward facts and active synergy IDs.
- Rewired `RewardSystem` content-value condition matching through `effectConditionsMatch`.
- Projected only candidate reward facts into the resolver, preserving the fact-only boundary.
- Added regression coverage that keeps `build.synergy_active` reward scoring tied to pre-pick active synergies.
- TDD evidence:
  - Resolver test first failed because reward/build conditions returned false.
  - Resolver tests passed with 12 tests after implementation.
  - RewardSystem tests passed with 4 tests.
  - Targeted resolver/reward tests passed with 2 files and 17 tests after review fixes.
- Review:
  - Code-review lane returned `REQUEST CHANGES`; explicit reward fact projection, direct pre-pick synergy regression coverage, and no-context active-synergy coverage were fixed.
  - Architecture lane returned `CLEAR`; low-risk pre-pick coverage recommendation was fixed.
- Full branch verification after review fixes:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 130 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/33
- Later merged into `main`: `c937bb5`.
- Merge policy: no merge without explicit user approval.

## 2026-08-22 - UI Map Projection

- User approved merging PR #33 and continuing work.
- Verified PR #33 branch before merge:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 130 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Merged PR #33 into `main`: `c937bb5`.
- Verified merged `main`:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 130 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.
- Started `feature/ui-map-projection` from merged `main`.
- Added `docs/superpowers/specs/2026-08-22-ui-map-projection-design.md`.
- Added `docs/superpowers/plans/2026-08-22-ui-map-projection.md`.
- Added `RunSystem.getNextStage(run)` so engine transition and projection use one next-stage selector.
- Added projected map state to `projectUiGameState`.
- Rewired `App` and `DungeonMapScreen` so the map screen consumes projected map nodes instead of raw core run data.
- TDD evidence:
  - `UiProjection` map tests first failed because `projected.map` was missing.
  - `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts`: passed with 12 tests.
  - `npm.cmd run test:run -- src/game/engine/UiProjection.test.ts src/app/App.test.tsx`: passed with 2 files and 17 tests.
  - `npm.cmd run test:run -- src/game/run/RunSystem.test.ts src/game/engine/UiProjection.test.ts src/app/App.test.tsx`: passed with 3 files and 21 tests after selector review fix.
  - `npm.cmd run typecheck`: passed.
- Review:
  - Code-review lane found no code defects; process gate depended on architecture evidence.
  - Architecture lane returned `WATCH` for duplicated next-stage selection; fixed by sharing `RunSystem.getNextStage(run)`.
  - Architecture re-review returned `CLEAR`.
- Full branch verification:
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run test:run`: passed, 134 tests across 22 files.
  - `npm.cmd run build`: passed.
  - `npm.cmd run test:e2e`: passed, 4 Chromium tests.
  - `git diff --check`: passed.

## 2026-08-20 - Offline Font Fallback

### Human Direction

- User approved merging PR #21 and continuing with `SHOWCASE-QA-004`.
- Remove the Google Fonts network failure/noise while preserving offline-safe typography.

### Codex Work

- Merged PR #21 after approval; squash merge commit on `main`: `605b62d`.
- Created `feature/offline-font-fallback` from updated `main`.
- Added `docs/superpowers/plans/2026-08-20-offline-font-fallback.md`.
- Wrote a failing offline browser asset policy test for externally hosted Google Fonts.
- Removed the Google Fonts `@import` from `src/styles.css`.
- Added `--font-display` with Korean/system font fallbacks and reused it for body, nav tabs, and buttons.

### Verification

- `npm.cmd run test:run -- src/app/OfflineAssetPolicy.test.ts`: failed first because `src/styles.css` imported `https://fonts.googleapis.com/css2?family=Jua&display=swap`, then passed after implementation.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 59 tests across 12 files.
- `npm.cmd run build`: passed.
- Focused Playwright browser check passed: title screen loaded with `failedCount: 0` and `fontFailures: []`.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/22
- Head commit: `51822c8`.
- Merge result: user approved merging PR #22 on 2026-08-20; PR #22 was marked ready and squash merged into `main`.
- Squash merge commit: `00a810c`.
- Merge policy: no merge without explicit user approval.

## 2026-08-20 - UI Adapter Synergy Progress

### Human Direction

- Continue structured-engine UI migration after fixing `SHOWCASE-QA-004`.
- Keep React as display/input only and keep synergy calculation in pure TypeScript systems.

### Codex Work

- Created `feature/ui-adapter-synergy-progress` from `main`.
- Added `docs/superpowers/plans/2026-08-20-ui-adapter-synergy-progress.md`.
- Wrote a failing `UiGameEngine` adapter test proving legacy UI synergy progress stayed at zero.
- Updated `toUiSynergyProgress` to accept structured progress values.
- Updated `UiGameEngine.projectStructuredBuild()` to pass `build.synergies.progress` into the UI projection helper.

### Verification

- `npm.cmd run test:run -- src/game/engine/UiGameEngine.test.ts`: failed first because `combo_engine` progress stayed at `current: 0`, then passed with 16 tests.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 59 tests.
- `npm.cmd run build`: passed.

### GitHub

- Draft PR opened: https://github.com/sabin1108/-curse_slot_machine/pull/23
- Head commit: updated after PR #22 merge; see PR #23.
- Merge policy: no merge without explicit user approval.
