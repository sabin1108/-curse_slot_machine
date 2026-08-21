# MVP 시연 런북

## 고정 체크포인트

- 대표 오리진: 도박사
- 대표 seed: `origin-demo-3066`
- 경로: 코어가 소유하는 고정 15스테이지 normal run
- 명령 fixture: `src/game/demo/OriginDemoTraces.ts`
- 오리진별 seed: 검사 `origin-demo-334`, 도박사 `origin-demo-3066`, 사제 `origin-demo-367`

## 실행

```powershell
npm run dev -- --host 127.0.0.1
```

`http://127.0.0.1:5173`에서 기본 seed를 유지하고 START GAME → 프롤로그 → 도박사를 선택한다.

## 시연 포인트

1. Stage 1에서 세 릴을 돌리고 잠금·리롤·정확한 preview를 확인한다. 도박사의 첫 리롤은 저주가 없다.
2. 전투 보상으로 `combo_starter`, `multi_hit_charm`, `combo_finisher`, `ember_magazine`을 확보해 `clockwork_barrage`를 완성한다.
3. 저주 5 경고와 적 공격 증가를 확인하고 rest에서 저주 5를 정화한다.
4. 상점 상품·가격·구매 수가 UI가 아니라 엔진 상태에서 오는지 확인한다.
5. Stage 15에서 House Sovereign의 phase 2와 공격 10을 확인한 뒤 victory까지 진행한다.

## 판정 증거

- fixture를 두 번 replay했을 때 state/event digest가 같다.
- UI는 `rewardId`와 command만 보내며 피해량·가격·stage 결과를 계산하지 않는다.
- 음소거와 애니메이션 상태는 game digest를 바꾸지 않는다.
- 브라우저 console error, page error, 1280×720 가로 overflow가 없다.

세 오리진 trace 모두 같은 테스트에서 두 번 replay해 state/event digest와 Stage 15 victory를 검증한다.
