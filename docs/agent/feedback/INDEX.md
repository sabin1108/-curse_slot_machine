# Agent Feedback Index

Last updated: 2026-08-21

| Document | One-Line Summary | Status | Related Files / PR |
| --- | --- | --- | --- |
| `2026-08-20-1420-current-structure-agent-feedback.md` | Duplicate engine/runtime split is the primary implementation landmine. | accepted | `src/game/GameEngine.ts`, `src/game/engine/GameEngine.ts`, PR #8 |
| `2026-08-20-1421-content-schema-agent-feedback.md` | Use bounded JSON effect modules, not free-form content scripts. | accepted | `docs/design/CONTENT_EFFECT_SCHEMA_PLAN.md`, `src/game/build/BuildTypes.ts` |
| `2026-08-20-1422-pilot-content-agent-feedback.md` | Pilot content should use three four-pickup archetypes plus one bridge item for 13 authored rewards. | accepted | `docs/design/PILOT_AUGMENT_ITEM_SYNERGY_SETS.md` |
| `2026-08-20-1423-scope-difficulty-agent-feedback.md` | Broad functional expansion is rejected until canonical runtime is chosen; small pilot is feasible. | accepted | `src/game/build/*`, `src/game/combat/*`, PR #8 |
| `2026-08-20-1424-stage-flow-agent-feedback.md` | A 15-stage demo should complete the first synergy around stages 5-7 and cap pickups near 13. | accepted | `docs/design/MVP_REWARD_AND_STAGE_FLOW.md` |
| `2026-08-20-1442-ui-engine-adapter-agent-feedback.md` | Use a UI adapter seam; direct structured-engine import would break existing UI contracts. | accepted | `src/app/App.tsx`, `src/game/GameEngine.ts`, `src/game/engine/GameEngine.ts` |
| `2026-08-21-core-ui-integration-review.md` | Canonical engine과 최신 UI의 통합 결과, 실제 플레이 범위, Landmine·스킬·OMX 활용 및 잔여 위험을 기록한다. | proposed | `cfe3a1e`, `docs/demo/MVP_DEMO_RUNBOOK.md` |
