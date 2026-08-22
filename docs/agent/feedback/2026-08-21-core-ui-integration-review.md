# 코어–UI 통합 체크포인트 공유 문서

## 리뷰 대상

- 브랜치: `integration/mvp-core-ui-reconciliation`
- 플레이어블 체크포인트: `cfe3a1e`
- 기준 커밋: `22dad6a`
- 목적: 구조화 코어와 최신 UI 사이의 이중 권위를 제거하고, 세 오리진으로 15스테이지를 실제 플레이할 수 있는 MVP를 고정한다.

## 현재 구현 상태

| 모듈 | 상태 | 확인 내용 |
| --- | --- | --- |
| 결정론/RNG | 완료 | 동일 seed와 command trace의 state/event digest가 일치한다. |
| 전투 슬롯 | 완료 | `[action, target, modifier]`를 코어가 선결정하고 UI는 표시·잠금·리롤·확정 command만 보낸다. |
| 전투/저주/적 행동 | 완료 | 피해, 방어, 회복, 저주 임계치, 적 intent와 보스 phase 2를 코어가 계산한다. |
| 15스테이지 run | 완료 | 전투·엘리트·보상·상점·휴식·이벤트·보스·승리 전이를 고정 경로로 제공한다. |
| 빌드/보상 | 완료 | MVP catalog, 시너지, reward offer 검증, augment reveal을 코어가 소유한다. |
| 오리진 | 완료 | 검사·도박사·사제의 시작 능력치, 시작 보상, 전투 특성을 엔진 상태로 관리한다. |
| React 연결 | 조건부 완료 | 실행 엔진은 하나지만 public resolve 우회, reel catalog 불일치, UI 의존 spin guard가 리뷰에서 발견됐다. |
| 브라우저 플레이 | 완료 | 세 오리진 모두 UI 클릭 경로로 Stage 1~15와 victory를 통과한다. |

현재 MVP는 “미리 정한 결과 영상을 재생하는 시연”이 아니다. 플레이어가 스핀, 릴 잠금, 리롤, 확정, 보상 선택, 상점 구매/건너뛰기, 휴식, 이벤트 선택을 직접 수행한다. 대표 seed는 회귀와 시연 재현성을 위한 것이며, 각 슬롯 결과와 상태 전이는 실제 코어 command로 진행된다.

## 재현 가능한 플레이 경로

- 검사: `origin-demo-334`
- 도박사: `origin-demo-3066`
- 사제: `origin-demo-367`
- 실행: `npm run dev -- --host 127.0.0.1`
- 상세 진행: `docs/demo/MVP_DEMO_RUNBOOK.md`

## 검증 결과

- `npm run typecheck`: 통과
- `npm run test:run`: 17개 파일, 79개 테스트 통과
- `npm run build`: 66개 모듈 프로덕션 빌드 통과
- `npm run test:e2e`: Chromium에서 세 오리진의 visible 15-stage run 통과
- `git diff --check`: 오류 없음

E2E는 화면에 노출된 버튼과 카드만 클릭한다. 테스트 전용 전투 해결 command나 보스 바로가기 UI는 사용하지 않는다. command trace 테스트는 각 오리진을 두 번 재생해 결정론, Stage 15 도달, 보스 phase 2, victory를 검증한다.

## 이중 권위 해소 결과

기존에는 다음 세 경로가 같은 이름과 비슷한 책임을 가졌다.

1. `src/game/GameEngine.ts`
2. `src/game/engine/GameEngine.ts`
3. `src/game/engine/UiGameEngine.ts`

이번 통합에서 1번과 3번을 제거했다. React는 정식 구조화 엔진의 state/event를 `UiProjection`으로 읽고 canonical command를 보낸다. 상점 가격, 피해량, 저주, 보상 유효성, stage 결과를 UI가 다시 계산하지 않으며 슬롯 컴포넌트의 별도 난수와 타이머 기반 결과 생성도 제거했다.

다만 고정 커밋 리뷰에서 완전한 단일 권위 판정을 막는 High 3건이 발견됐다. `RESOLVE_COMBAT_SLOT`이 public command로 남아 임의 결과를 주입할 수 있고, 코어가 같은 턴의 중복 spin을 직접 막지 않으며, UI reel catalog의 ID가 canonical reel과 다르다. 따라서 이 체크포인트는 실제 플레이 가능한 상태지만 이중 권위 해소의 최종 승인 상태는 아니다.

## Landmine 사용 평가

Landmine `0.1.0a3`의 가장 직접적인 기여는 `GameEngine` 심볼이 세 구현으로 중복되어 있다는 사실과 정확한 경로를 작업 시작 전에 강제 확인한 것이다. `ambiguous_symbol`을 hard stop으로 취급한 뒤 canonical 대상인 `src/game/engine/GameEngine.ts`를 명시해 재검사했고, 잘못된 엔진을 수정하는 위험을 줄였다.

다만 이번 작업에서 Landmine이 찾아낸 핵심 신규 문제는 사실상 이 중복 심볼 한 건이다. 이중 권위의 의미, 런타임 데이터 흐름, React의 규칙 누출까지 자동 판정한 것은 아니다. 정적 직접 참조만 보는 현재 커버리지에서는 “유용한 사전 경보기”이지 아키텍처 판정기나 변경 승인 도구로 볼 수 없다. 2-hop 호출 그래프, alias/export map, dynamic import, DI, 동일 책임의 이명 심볼을 확장하면 실효성이 커질 것이다.

## 스킬과 에이전트 사용 평가

- `explore` 역할은 UI 진입점, 세 엔진의 소유 관계, 상점·휴식·보상에서 UI가 규칙을 소유한 위치를 빠르게 지도화하는 데 효과적이었다.
- `executor` 역할은 feature 코어의 선택 이식과 오리진 계약 테스트를 독립 범위로 처리해 통합 시간을 줄였다.
- repo-native gameplay review 스킬은 구현과 분리되어야 하므로 이 커밋을 고정하기 전에는 실행하지 않았다. 이후 결과는 `Proposed`로만 취급하고 인간이 `Accepted`한 항목만 다음 구현 주기에 넣는다.
- 추가로 만든 seed 기반 회귀 자산은 `seeded-gameplay-qa`의 입력 품질을 높인다. 반대로 UX/레벨 디자인 스킬은 자동 진행 trace만으로 재미를 판정하면 안 되며, 브라우저 관찰과 사람의 선택 맥락이 필요하다.

## OMX 피드백 반영

OMX/native 탐색 피드백은 “두 엔진을 동시에 실행하는 하이브리드를 금지하고, UI를 단방향 projection에 연결하라”는 경계를 세우는 데 사용했다. 초기 피드백의 좁은 adapter 제안은 당시 위험을 줄이는 과도기안이었지만, 최종 통합에서는 adapter가 두 번째 mutable game state가 되지 않도록 순수 `UiProjection`만 남겼다.

또한 다음 피드백을 반영했다.

- 상점 command에서 UI 제공 가격을 제거하고 활성 engine offer의 `rewardId`만 수신한다.
- 오리진 특성은 UI 인자가 아니라 엔진 상태에서 파생한다.
- fixed 15-stage route를 코어가 소유하고, UI의 branching/boss shortcut을 제거한다.
- showcase는 normal combat 계산을 우회하지 않는 presentation-only 경로로 제한한다.

OMX 피드백은 설계 입력과 리뷰 증거로 사용했으며, 제품 코드 변경 권위로 사용하지 않았다.

## 남은 위험과 다음 리뷰 포인트

- 코드 리뷰 verdict는 `REQUEST CHANGES — Proposed`다. 상세 내용은 `docs/reviews/milestone-core-ui-reconciliation/code-review.md`에 있다.
- 현재 세 대표 seed는 완주 가능성을 증명하지만 전체 seed 공간의 밸런스나 재미를 증명하지 않는다.
- 검사 대표 trace는 마지막 교환에서 HP 0과 victory가 동시에 성립할 수 있다. 적 사망 우선 판정이라는 현재 계약에는 맞지만, 시연 연출과 플레이어 기대 측면에서는 별도 디자인 결정이 필요하다.
- 이번 E2E는 Chromium desktop 경로다. 키보드 조작, 화면 읽기, 다른 viewport와 브라우저 호환성은 후속 UX 검토 대상이다.
- 15스테이지 콘텐츠는 기능적으로 완주 가능하지만, 반복 플레이 다양성·연출 밀도·선택의 재미는 MVP 이후 튜닝 대상이다.

위 항목은 모두 `Proposed`다. 인간 승인 전에는 게임 규칙 변경 작업으로 자동 전환하지 않는다.
