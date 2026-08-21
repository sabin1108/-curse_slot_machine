# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-21
- Primary product surface: Desktop-first playable web MVP for a slot-machine roguelike.
- Architecture companion: `docs/design/PLANNING_SUMMARY.md`
- Playable checkpoint: `cfe3a1e`

## Product goal

Curse Slot Machine은 저주받은 카지노를 통과하는 결정론적 로그라이크다. 플레이어는 세 릴을 `[행동, 대상, 배율]` 문장으로 읽고, 잠금·리롤·확정으로 15스테이지 run을 완주한다.

MVP 성공 조건은 다음과 같다.

- 검사·도박사·사제 중 하나를 선택해 실제 조작으로 플레이할 수 있다.
- 같은 seed와 command 순서는 같은 state와 event를 만든다.
- 전투, 보상, 상점, 휴식, 이벤트, 보스 phase 2, 승리/패배가 하나의 코어 상태에서 이어진다.
- React는 결과를 표시하고 command를 보낼 뿐, 피해·가격·저주·보상·stage 결과를 결정하지 않는다.

MVP 비목표는 backend, 계정, 결제, multiplayer, meta progression, branching route, AI runtime integration이다.

## Experience principles

1. 슬롯 머신이 화면의 주인공이다. HUD와 보조 패널은 슬롯 결과의 의미를 설명한다.
2. 플레이어는 스핀 결과, 잠금 상태, 리롤 비용, exact preview, 적 intent를 행동 전에 읽을 수 있어야 한다.
3. seed는 결과를 미리 고르는 showcase 장치가 아니라 동일한 실제 플레이를 재현하는 도구다.
4. 위험과 보상은 HP, 저주, 골드, 빌드 시너지의 짧고 명확한 피드백으로 전달한다.
5. Showcase는 presentation-only이며 normal run의 계산이나 RNG를 우회하지 않는다.

## Core flow

1. 제목 화면에서 seed를 입력하고 시작한다.
2. 프롤로그를 거쳐 오리진을 선택한다.
3. 고정된 다음 stage에 진입한다.
4. 전투에서 스핀하고, 필요하면 릴을 잠근 뒤 리롤하고, 결과를 확정한다.
5. 보상·상점·휴식·이벤트 선택으로 빌드를 조정한다.
6. Stage 15 보스의 phase 2를 넘기고 victory에 도달하거나 HP/저주로 defeat한다.

## Information architecture

- Title / Prologue / Origin
- Battle cockpit: HUD, enemy intent, three-reel cabinet, exact result preview, build panel, combat log
- Fixed route map
- Reward reveal and selection
- Shop, rest, event
- Victory / Game over

전역 디버그 탭과 보스 바로가기는 normal run에 노출하지 않는다.

## System ownership

- `src/game/engine/GameEngine.ts`: canonical command 처리와 전체 run 상태 전이
- `src/game/run`: 15-stage route와 stage 진행
- `src/game/slot`: seeded combat/augment slot
- `src/game/combat`: 전투 계산, 적 intent, 저주, preview
- `src/game/build`: reward catalog, offer, item/augment/synergy 효과
- `src/game/engine/UiProjection.ts`: canonical state/event를 UI view model로 순수 변환
- React components: controls, layout, animation, audio cue, presentation-only feedback

두 번째 game engine, React-owned game outcome, UI price/trait 입력, 별도 gameplay RNG를 추가하지 않는다.

## Visual language

- Dark dungeon base, casino gold CTA, red HP danger, cyan route affordance, green healing, purple curse accents.
- Dense desktop HUD with an 8px rhythm, hard borders, inset shadows, and pixel-style edges.
- 숫자 결과는 색만으로 전달하지 않고 label과 위치를 함께 사용한다.
- 공급된 보스·캐릭터 자산과 오디오는 presentation layer에서 사용한다.

## Accessibility and responsive behavior

- Desktop 1280×720을 주요 시연 환경으로 삼는다.
- 좁은 화면에서는 cockpit을 세로로 재배치한다.
- 버튼은 visible focus를 유지하고 가능하면 44px target을 제공한다.
- `prefers-reduced-motion`에서는 필수적이지 않은 animation을 줄인다.
- 주요 상태는 색상 외 text label로도 구분한다.

접근성 완성도, keyboard-only 전체 run, screen reader 흐름, 다른 브라우저와 mobile viewport는 후속 검증 대상이다.

## Content voice

- 짧고 직접적인 한국어 동사를 사용한다.
- “슬롯”, “증강”, “저주”, “스테이지”, “보상”, “휴식”을 canonical 용어로 사용한다.
- 카드 설명은 핵심 효과와 조건을 먼저 보여준다.

## Implementation constraints

- React 19, TypeScript, Vite, plain CSS를 유지한다.
- 새 dependency는 명시적 승인 없이 추가하지 않는다.
- gameplay RNG와 계산은 pure TypeScript에 둔다.
- combat slot과 augment slot의 RNG 소비를 분리한다.
- content-specific item, augment, enemy, synergy는 data로 정의한다.
- seed 기반 Vitest와 visible-control Playwright E2E를 회귀 기준으로 유지한다.

## Current verification boundary

- 세 대표 origin seed가 Stage 1~15, boss phase 2, victory를 통과한다.
- 전체 seed 공간의 밸런스와 반복 플레이 재미는 아직 증명하지 않았다.
- 검사 대표 trace의 동시 사망 victory 연출은 인간 디자인 결정을 기다리는 `Proposed` 이슈다.

## Open questions

- [ ] 동시 사망 시 적 사망 우선 victory 계약을 유지할지 결정한다.
- [ ] keyboard/screen-reader/browser/viewport 범위를 다음 milestone에 정한다.
- [ ] 대표 seed 밖의 난이도 분포와 build 선택 다양성을 level-design review로 평가한다.
- [ ] 최종 Hangul pixel font와 남은 asset license를 확정한다.
