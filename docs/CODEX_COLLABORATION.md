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
