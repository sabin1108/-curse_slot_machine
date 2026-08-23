# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-17
- Primary product surfaces: Web build UI prototype for a slot-machine roguelike.
- Evidence reviewed: `src/App.tsx`, `src/styles.css`, `src/App.test.tsx`, `tests/e2e/smoke.spec.ts`, `C:\Users\sabin\Desktop\겜 코덱스\files\룰렛_로그라이크_슬롯머신_UI목업.html`, `D:\sabin\note\codex_ai 게임해커톤\슬롯머신로그라이크_UIUX기획서.md`, `C:\Users\sabin\Desktop\겜 코덱스\무료 에셋`.

## Brand
- Personality: Dark dungeon, casino tension, readable roguelike systems, compact game HUD.
- Trust signals: Clear HP/gold/wave stats, visible reward rarity, stable static preview states.
- Avoid: Marketing landing page, oversized hero copy, logic-heavy gameplay implementation, unreadable effects, single-color monotony.

## Product goals
- Goals: Present the game UI/UX only, using the supplied mockup and asset direction as a web-build ready prototype.
- Non-goals: Slot result logic, combat math, inventory persistence, audio playback, real map progression.
- Success signals: The first viewport communicates the actual game screen, supporting screens are visible, and tests/build pass.

## Personas and jobs
- Primary personas: Hackathon judges, developer teammates, UI implementers.
- User jobs: Understand the core loop quickly, inspect major screens, hand off to gameplay logic later.
- Key contexts of use: Desktop browser first, responsive fallback for smaller screens.

## Information architecture
- Primary navigation: Static top tabs showing Run, Rewards, Map, Shop, Rest.
- Core routes/screens: Battle cockpit, reward selection, dungeon route map, shop, rest site.
- Content hierarchy: HUD and slot cabinet first, then side augment list, then downstream run screens.

## Design principles
- Principle 1: The slot machine is the protagonist; HUD panels must frame it instead of covering it.
- Principle 2: Every number-like result needs immediate visual explanation through color, label, and placement.
- Tradeoffs: Static prototype favors strong state presentation over click-driven simulation.

## Visual language
- Color: Low-value dungeon base with gold CTA, red HP danger, cyan route affordance, green healing, purple curse accents.
- Typography: System UI with high-weight headings and tabular numeric counters for stability.
- Spacing/layout rhythm: Dense game UI, 8px grid, fixed-format panels with responsive wrapping.
- Shape/radius/elevation: 4-8px radii, hard borders, inset shadows, pixel-style edges.
- Motion: Ambient-only CSS pulses; no required gameplay logic.
- Imagery/iconography: CSS-built pixel tiles and compact symbolic glyphs until final extracted art pipeline is chosen.

## Components
- Existing components to reuse: React/Vite shell only.
- New/changed components: Top HUD, slot cabinet, reels, augment list, reward cards, map nodes, shop rows, rest actions.
- Variants and states: Selected nav tab, active payline, rarity card states, current/available/locked map nodes, disabled shop row.
- Token/component ownership: `src/styles.css` owns tokens and component styling for this prototype.

## Accessibility
- Target standard: WCAG AA where practical for the static prototype.
- Keyboard/focus behavior: Buttons and tabs keep visible focus outlines.
- Contrast/readability: Text uses high-contrast cream on dark surfaces; color states are paired with text labels.
- Screen-reader semantics: Main screen has headings, sections, lists, and button roles.
- Reduced motion and sensory considerations: `prefers-reduced-motion` disables ambient animation.

## Responsive behavior
- Supported breakpoints/devices: Desktop 1280x720 primary, usable down to 360px width.
- Layout adaptations: Three-column cockpit collapses to stacked panels; screen gallery becomes one column.
- Touch/hover differences: Buttons keep 44px minimum targets where possible.

## Interaction states
- Loading: Not represented; UI-only request.
- Empty: Placeholder stats show intended layout.
- Error: Not represented; logic is out of scope.
- Success: Reward cards and map progress communicate positive run state.
- Disabled: Shop row demonstrates unavailable purchase.
- Offline/slow network, if applicable: No remote assets required in the implemented UI.

## Content voice
- Tone: Short Korean game UI labels with direct verbs.
- Terminology: "슬롯", "증강", "웨이브", "보상", "휴식" are canonical.
- Microcopy rules: Keep cards to two short lines and actions to verb-first labels.

## Implementation constraints
- Framework/styling system: React 19, TypeScript, Vite, plain CSS.
- Design-token constraints: Keep tokens in CSS custom properties; no new dependency.
- Performance constraints: Static DOM/CSS, no large runtime asset decoding or gameplay loops.
- Compatibility constraints: Web build output through existing Vite scripts.
- Test/screenshot expectations: Unit and e2e smoke tests assert the UI shell and key CTAs.

## Open questions
- [ ] Final asset extraction path / owner / affects whether CSS placeholders are replaced with real sprites.
- [ ] Exact Hangul pixel font license / owner / affects production typography.
- [ ] Gameplay data contract from logic team / owner / affects later binding of static UI states.
