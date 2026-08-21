# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-21
- Product: desktop-first deterministic React/TypeScript roguelike MVP.
- Supporting decisions: `docs/design/PLANNING_SUMMARY.md` and `docs/design/MVP_REWARD_AND_STAGE_FLOW.md`.

## Product goal

The player creates readable combat sentences from `[action, target, modifier]`, manages curse risk, assembles a build, and defeats the stage-15 boss in a reproducible 5–10 minute run.

The normal-run MVP includes the fixed 15-stage route, combat/reward/shop/rest/event rooms, one completable synergy path, a two-phase boss, and deterministic seed controls. Showcase Mode remains a scripted explanation surface and cannot bypass normal combat calculations.

## Architecture

- Pure TypeScript systems own RNG, slots, combat, curse, enemies, rewards, shop offers/prices, and route transitions.
- React renders engine state/events and sends commands. It does not calculate outcomes or prices.
- The same seed and public command sequence must produce identical state and events.
- Combat and augment slot machines remain separate. Augment presentation displays a preselected reward and consumes no reward RNG.
- Content-specific enemies, rewards, effects, and synergies live in catalogs rather than engine branches.

## Normal-run rules

- Route: the fixed 15 stages in `MVP_ROUTE`.
- Shop purchase cap: four per run across every shop.
- Curse pressure: 5–7 grants enemies +1 attack, 8–9 grants +2, and 10 ends the run in defeat.
- Result preview: after spin/reroll/lock changes, show exact projected HP, block, curse, enemy attack, outcome, and threshold warnings without consuming RNG.
- Boss: House Sovereign changes from attack 7 to attack 10 at 18/36 HP; the change applies on the transition turn.
- Terminal phases reject all commands except starting a clean new run.

## Interaction and presentation

- Desktop target: 1280×720; responsive fallback remains usable on narrow screens.
- The battle surface prioritizes enemy intent, the three-reel sentence, exact preview, curse pressure, and confirm/reroll controls.
- Shop cards display only engine-owned active offers and prices.
- Warnings always pair color with text. Buttons retain visible keyboard focus and semantic labels.
- No remote runtime assets or external fonts are required.

## MVP exclusions

- No backend, login, multiplayer, payments, metaprogression, or OpenAI API runtime.
- No arbitrary-seed balance guarantee beyond deterministic behavior and the committed representative demo trace.
- No normal-combat shortcuts from Showcase Mode.
- Legacy unused presentation components are cleanup work, not part of this milestone.

## Verification target

The playable checkpoint requires deterministic engine tests, a committed public-command boss-win trace, a 1280×720 Playwright run with browser-error checks, typecheck, full Vitest, build, and E2E passing against one fixed commit.
