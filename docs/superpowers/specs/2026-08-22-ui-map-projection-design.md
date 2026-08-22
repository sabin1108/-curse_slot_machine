# UI Map Projection Design

Date: 2026-08-22
Branch: `feature/ui-map-projection`
Base: `main` at `c937bb5`

## Goal

Move map presentation data behind `projectUiGameState` so React no longer derives route progression directly from core run state.

## Scope

- Add a projected map view model to the UI game state.
- Include route nodes, completed node IDs, current node, next available node, and reward policy text needed by the current map UI.
- Update `DungeonMapScreen` to consume the projected map model instead of importing `MVP_ROUTE` or reading `RunStageDefinition`.
- Keep event choice commands, route rules, shop/rest/reward behavior, and engine state ownership unchanged.
- Leave shop offer projection for a follow-up branch.

## Design

`RunSystem` remains the owner of route definitions and progression. It exposes a pure `getNextStage(run)` selector so engine transition and UI projection share one route-selection rule. `UiProjection` reads the core run state and produces the exact route view model React needs. `DungeonMapScreen` renders that model and dispatches the existing `ENTER_NEXT_STAGE` and `RESOLVE_EVENT` commands.

This preserves the one-way projection boundary: core systems decide what stage is current or completed; React renders the supplied map nodes and sends commands only.

## Testing

- Add projection coverage for the initial map route, available stage, completed nodes, and current event stage.
- Add selector-backed projection coverage that derives run state through `enterNextStage` and `completeCurrentStage`.
- Keep the existing App integration path that starts a run and shows Stage 1 as enabled.
- Run targeted `UiProjection` and App tests before full verification.

## Risks

- Route selection must stay sourced from `RunSystem.getNextStage`, not independently reconstructed in React or projection callers.
- Event modal rendering must still use the current projected event node and must not move event outcome rules into React.
