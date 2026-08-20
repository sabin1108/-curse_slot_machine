# Agent Feedback - ui-engine-adapter

## Context
The previous content effect pilot is implemented in the structured pure engine path, but the running React UI still imports the legacy `src/game/GameEngine.ts`. A read-only `explore` subagent mapped the gap before starting the next implementation slice.

## Agent / Role
OMX/native subagent role: `explore`.

## Token Allocation
- 예상 토큰 예산: 3,000-5,000
- 실제 사용량 또는 추정 사용량: 약 3,500
- 과소/과다 사용 여부: 적정
- 다음 작업에서 줄이거나 늘릴 부분: duplicate engine mapping is now known, so future passes should spend fewer tokens rediscovering it and more on adapter tests.

## Work Efficiency
- 효과적이었던 점: React import path, legacy state schema, structured engine schema, and test seam were mapped independently while main work continued.
- 비효율적이었던 점: full UI migration risks had to be restated because both engines expose similar names.
- 중복 작업 여부: partial overlap with earlier content logic analysis, but useful because it focused on the immediate UI adapter seam.
- 다음 작업에서 개선할 점: treat direct `App.tsx` import replacement as a separate milestone unless adapter compatibility is proven.

## Findings
- `src/app/App.tsx` imports `GameEngine` from `src/game/GameEngine.ts`.
- The structured engine under `src/game/engine/GameEngine.ts` already passes active build effects into `CombatSystem`.
- The two engines are not drop-in compatible: command protocol, state shape, build representation, reward representation, and navigation coverage differ.
- The smallest durable seam is an application-facing adapter that preserves the current UI state/command contract while deriving combat/build results from the structured engine.
- The first TDD target should be adapter-level: prove a structured combo build resolves combat into UI-visible state with the extra-hit effect.

## Risks / Landmines
- Directly replacing the UI import with the structured engine would break map, shop, rest, showcase, and component prop contracts.
- Reimplementing structured effect evaluation in the legacy engine would keep duplicate rule ownership alive.
- Reward IDs and rarities differ between legacy UI data and structured build catalog data.
- `getState()` clone behavior differs between the structured engine and mutable legacy UI state.

## Proposed Fixes
- 단기 해법: add a thin UI adapter with tests that translate a narrow structured combat/reward flow into current UI state.
- 중기 해법: move App to the adapter after it covers the commands currently exercised by UI components.
- 해커톤 이후 해법: retire the legacy engine by moving map, shop, rest, showcase, and presentation projection around the structured engine.

## Decision
Accepted for the next implementation slice. Avoid a direct engine swap; implement a small adapter test and seam first.
