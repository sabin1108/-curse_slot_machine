# 코어–UI 통합 코드 리뷰

## 대상과 판정

- Base: `22dad6a`
- Build or commit: `cfe3a1e`
- Verdict: `REQUEST CHANGES — Proposed`
- 자동 검증: typecheck, 79 Vitest, build, 세 오리진 15-stage Playwright 통과
- 제품 수정: 없음

실제 플레이 가능성은 재현됐지만 단일 게임 권위 완료 조건에는 미달한다. 아래 finding은 모두 인간 승인 전 `Proposed`다.

## CR-01 — public 결과 주입 command

- Area: Architecture / QA
- Severity: High
- Evidence: `src/game/engine/commands.ts:45`, `src/game/engine/GameEngine.ts:62`, `src/game/engine/GameEngine.ts:395`
- Finding: `RESOLVE_COMBAT_SLOT`이 임의 슬롯 결과를 받아 spin·lock·reroll·RNG를 우회한다. canonical slot 외의 두 번째 결과 권위다.
- Recommended experiment: public `GameCommand`에서 제거하고 `CONFIRM_COMBAT_SLOT`이 현재 slot result만 private resolve로 전달하도록 축소한다. 엔진 진행 테스트도 공개 spin/confirm 경로를 사용한다.
- Status: Proposed

## CR-02 — 같은 턴의 무료 중복 spin

- Area: Game rules
- Severity: High
- Evidence: `src/game/engine/GameEngine.ts:168`, `src/components/Battle/CombatSlotMachineView.tsx:78`
- Finding: `hasSpun=true`인 상태에서도 코어가 다시 spin을 허용한다. 현재 UI 버튼 전환만 이를 막으므로 규칙 일부가 React에 남아 있다.
- Recommended experiment: 코어가 두 번째 `SPIN_COMBAT_SLOT`을 거부하고 RNG, 결과, 저주가 바뀌지 않는 회귀 테스트를 추가한다.
- Status: Proposed

## CR-03 — canonical/UI reel catalog 불일치

- Area: Architecture / UI
- Severity: High
- Evidence: `src/game/data.ts:40`, `src/game/data.ts:65`, `src/game/data.ts:167`, `src/game/engine/UiProjection.ts:71`, `src/game/engine/UiProjection.ts:124`, `src/game/engine/UiProjection.ts:137`, `src/game/engine/UiProjection.ts:167`
- Finding: 코어 target은 `enemy/self/all`인데 UI catalog에는 `pow_6...pow_20`이 남아 있다. projection이 target을 합성하고 누락 index를 0으로 바꿔 불일치를 가린다.
- Recommended experiment: UI reel 정의를 canonical symbol에서 투영하고 누락 ID는 실패시키며 전체 ID/index 일치 테스트를 추가한다.
- Status: Proposed

## CR-04 — origin 수치 중복

- Area: Content contract
- Severity: Medium
- Evidence: `src/game/origins.ts`, `src/game/engine/OriginCatalog.ts`
- Finding: HP, 골드, 방어, 시작 보상이 코어와 UI에 중복 정의된다.
- Recommended experiment: `OriginCatalog`을 수치의 단일 소스로 두고 UI 파일에는 표시 메타데이터만 남긴다.
- Status: Proposed

## CR-05 — 리롤 비용 공식 중복

- Area: UI contract
- Severity: Medium
- Evidence: `src/components/Battle/CombatSlotMachineView.tsx:43`, `src/game/slot/CombatSlotMachine.ts:55`
- Finding: 표시 비용과 실제 비용이 서로 다른 위치에서 같은 공식을 구현한다.
- Recommended experiment: projection이 코어 계산 비용을 제공한다.
- Status: Proposed

## CR-06 — 브라우저 lock 회귀 부재

- Area: QA
- Severity: Medium
- Evidence: `src/game/demo/OriginDemoTraces.ts`, `tests/e2e/smoke.spec.ts`
- Finding: 세 15-stage trace는 reroll을 수행하지만 reel lock UI를 사용하지 않는다.
- Recommended experiment: 대표 trace 하나나 짧은 Playwright 테스트에 lock→reroll→locked reel 유지 경로를 추가한다.
- Status: Proposed

## 인간 결정 필요

CR-01~03은 단일 권위 완료 판정의 차단 항목이다. 프로젝트 규칙에 따라 인간이 `Accepted`로 바꾸기 전에는 다음 구현 주기로 전환하지 않는다.
