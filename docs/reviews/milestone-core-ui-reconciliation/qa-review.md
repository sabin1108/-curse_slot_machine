# Seeded Gameplay QA — 코어–UI 통합

## 대상

- Build or commit: `cfe3a1e`
- Review path: `seeded-gameplay-qa`
- Decision state: 모든 결과 `Proposed`
- 실행 환경: Chromium desktop, reduced motion
- 대표 seed: `origin-demo-334`, `origin-demo-3066`, `origin-demo-367`

## 판정

대표 세 seed에서 결정론적 코어 회귀와 화면에 노출된 조작만 사용하는 15스테이지 완주가 확인됐다. Blocker 또는 High 결함은 재현되지 않았다.

## 확인된 계약

- 같은 origin/seed/command를 두 번 재생한 state/event SHA-256 digest가 일치한다.
- 잠근 릴은 리롤 후 유지되고, 잠금 수에 따른 저주 비용이 적용된다.
- 도박사의 전투당 첫 리롤은 무료이며 이후 리롤부터 정상 비용이 적용된다.
- 저주 5/8의 적 공격 압력과 저주 10 defeat가 테스트된다.
- preview는 전투 상태를 변경하지 않으며 실제 resolve delta와 일치한다.
- victory/defeat 이후 전투 command가 `COMMAND_REJECTED`로 차단된다.
- 세 origin 모두 Stage 15, boss phase 2, victory에 도달한다.
- 브라우저 `pageerror`와 console error가 없었다.

## 재현 증거

- 결정론·Stage 15·phase 2: `src/game/demo/OriginDemoTraces.test.ts`
- 릴 잠금·리롤 비용: `src/game/slot/CombatSlotMachine.test.ts`, `src/game/engine/GameEngine.test.ts`
- 저주 임계치·preview: `src/game/combat/MvpCombatContracts.test.ts`
- terminal command 차단: `src/game/engine/MvpEngineContracts.test.ts`
- visible play와 브라우저 오류 수집: `tests/e2e/smoke.spec.ts`
- 실행 결과: Vitest 17파일/79테스트 통과, Playwright 3/3 통과

## Finding QA-01

- Area: QA
- Severity: Low
- Build or commit: `cfe3a1e`
- Observed seed: 공통
- Evidence: exact preview의 상태 비변경과 resolve delta 일치는 검증되지만, preview 호출 전후 RNG 내부 상태를 직접 직렬화해 비교하는 테스트는 없다.
- Moment: spin 이후 preview 생성
- Suspected cause: 현재 테스트는 외부 관측 상태와 결과 일치에 초점을 둔다.
- Recommended experiment: RNG snapshot을 노출하지 않고, preview 호출 유무만 다른 동일 seed 공개 command trace의 다음 spin 결과를 비교한다.
- Confidence: Medium
- Status: Proposed
- Related GitHub PR or issue: 없음
- Human decision reason: 미결정

## Finding QA-02

- Area: QA
- Severity: Low
- Build or commit: `cfe3a1e`
- Observed seed: `origin-demo-334`
- Evidence: 검사 trace는 마지막 교환에서 플레이어 HP 0과 victory가 함께 성립할 수 있다.
- Moment: Stage 15 최종 확정
- Suspected cause: 적 사망을 우선하는 현재 동시 사망 판정 계약
- Recommended experiment: 현 계약을 의도된 디자인으로 명시하거나, 동시 사망 전용 테스트와 시각 피드백을 추가한다.
- Confidence: High
- Status: Proposed
- Related GitHub PR or issue: 없음
- Human decision reason: 미결정

## 범위 밖

- 전체 seed 공간의 승률과 밸런스
- 키보드/스크린리더 접근성
- Chromium 이외 브라우저와 모바일 viewport
- 반복 플레이의 재미와 선택 다양성

위 항목은 별도 UX·레벨 디자인 리뷰가 필요하며, 인간이 `Accepted`하기 전에는 구현 작업으로 전환하지 않는다.
