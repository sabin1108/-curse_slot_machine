# Showcase UI Entry And Overlay Design

## Goal

Expose the existing Showcase Mode through the visible React UI without moving game rules, scripted results, RNG, or step progression into React.

## Context

PR #17 preserved Showcase forced slot behavior inside `UiGameEngine`. The remaining gap is access and visibility: the title screen has no Showcase entry button, and `ShowcaseOverlay` exists but is not rendered by `App`.

## Design

Use the existing command contract:

- `TitleScreen` renders a secondary Showcase button.
- Clicking it only dispatches `{ type: 'START_SHOWCASE' }`.
- `App` renders `ShowcaseOverlay` when `gameState.showcase.active` is true.
- `ShowcaseOverlay` continues to dispatch `{ type: 'NEXT_SHOWCASE_STEP' }` and title navigation commands.

This keeps React limited to input and display. Showcase state, scenario steps, screen changes, and forced slot results remain owned by `UiGameEngine` and the legacy presentation engine path it delegates to while Showcase Mode is active.

## Components

- `src/components/Title/TitleScreen.tsx`
  - Add a Showcase Mode button beside the existing start/log controls.
  - The button must call `soundManager.playClick()` and dispatch `START_SHOWCASE`.

- `src/app/App.tsx`
  - Import `ShowcaseOverlay`.
  - Render it when `gameState.showcase.active` is true.
  - Pass `gameState.showcase.currentStep`, `gameState.showcase.steps`, and `handleDispatch`.

- `src/app/App.test.tsx`
  - Add a user-facing regression test that clicks the Showcase button and verifies the overlay appears.
  - Add a regression test that clicks the overlay next-step button and verifies the displayed step changes.

## Out Of Scope

- No new Showcase scenarios.
- No Showcase-specific combat cheats.
- No structured-engine replacement for the legacy presentation engine.
- No CSS redesign beyond using existing button/overlay classes.

## Test Strategy

Use React Testing Library against `App` because this slice is UI wiring. The tests should fail before implementation because no Showcase button is rendered and no overlay is mounted by `App`.

Full branch verification remains:

- `npm.cmd run typecheck`
- `npm.cmd run test:run`
- `npm.cmd run build`

## Self-Review

- No placeholders remain.
- Scope is one small UI wiring slice.
- React dispatches commands and renders state only; no game rules move into components.
- Existing `ShowcaseOverlay` is reused rather than duplicated.
