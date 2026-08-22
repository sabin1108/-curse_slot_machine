# Showcase Playable QA Review

## Review Target

- Build or commit: `fed924e` (`feat: wire showcase ui entry overlay (#18)`)
- Branch used for review artifacts: `review/showcase-playable-qa`
- Local run command: `npm.cmd run dev`
- Local URL: `http://127.0.0.1:5173/`
- Viewport: `1280x720`
- Observed seed: `showcase_seed_2026`
- Milestone acceptance criteria:
  - Title screen can enter Showcase Mode.
  - Existing Showcase overlay is visible while Showcase Mode is active.
  - Showcase step progression remains command-driven.
  - Normal and Showcase Mode outcomes stay separated.
  - No browser page errors during the reviewed flow.

## Verification Summary

- `npm.cmd run test:e2e`: passed, 1 Chromium smoke test.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:run`: passed, 55 tests across 10 files.
- `npm.cmd run build`: passed.
- Browser path `Showcase Mode -> NEXT STEP -> NEXT STEP`: repeatedly reaches step 3 reward presentation.
- Browser path `Showcase Mode -> NEXT STEP -> NEXT STEP -> click first reward card -> NEXT STEP`: reaches step 4 battle presentation with `EXECUTE` visible.
- Page errors: none.
- Console/resource issue: Google Fonts request fails under network-restricted review environment.

## Evidence

- `evidence/repeat-01-title.png`
- `evidence/repeat-02-step1.png`
- `evidence/repeat-03-step3-blocked.png`
- `evidence/repeat-04-after-blocked-click.png`
- `evidence/showcase-step3-blocker-repeat.json`
- `evidence/06-after-step3-reward-card-click.png`
- `evidence/07-after-reward-step4-battle.png`
- `evidence/showcase-reward-card-then-step4.json`
- `evidence/request-failures.json`

## Finding

- ID: `SHOWCASE-QA-001`
- Area: UX
- Severity: Medium
- Build or commit: `fed924e`
- Observed seed: `showcase_seed_2026`
- Evidence: `evidence/repeat-03-step3-blocked.png`, `evidence/repeat-04-after-blocked-click.png`, `evidence/showcase-step3-blocker-repeat.json`
- Moment: Showcase step 3 reward presentation, after clicking `Showcase Mode`, `NEXT STEP`, `NEXT STEP`, then attempting `NEXT STEP` again.
- Suspected cause: `RewardModal` renders a full-screen `.reward-modal-backdrop` above the main view, while the Showcase overlay remains visible behind it. The visible overlay `NEXT STEP` button is not actionable because the reward modal intercepts pointer events.
- Recommended experiment: When Showcase step 3 opens rewards, either hide/disable the overlay next-step action with copy that says reward selection is required, or render a Showcase-specific continuation control inside the reward modal after reward selection.
- Confidence: High. The same click sequence was repeated and Playwright reported the reward modal backdrop intercepting pointer events.
- Status: Resolved in follow-up
- Related GitHub PR or issue: PR #18; verified on `feature/reward-modal-accessibility-coverage`
- Human decision reason: Showcase step 3 now prepares the reward modal through the deterministic engine demo path and hides overlay `NEXT STEP` while reward selection owns input.

## Finding

- ID: `SHOWCASE-QA-002`
- Area: UX
- Severity: Medium
- Build or commit: `fed924e`
- Observed seed: `showcase_seed_2026`
- Evidence: `evidence/06-after-step3-reward-card-click.png`, `src/components/Reward/RewardModal.tsx`
- Moment: Showcase step 3 reward selection.
- Suspected cause: Reward choices are clickable `div.reward-card-pixel` elements rather than semantic buttons. Mouse users can proceed by clicking a card, but keyboard and assistive-technology users do not get a role-based reward action.
- Recommended experiment: Convert each reward card to a semantic `button` or add correct `role="button"`, `tabIndex`, keyboard handlers, and accessible labels. Prefer a real `button` unless styling constraints block it.
- Confidence: High. Role-based Playwright lookup could not find a reward-selection button, while `.reward-card-pixel` click did trigger selection.
- Status: Resolved in follow-up
- Related GitHub PR or issue: PR #18; verified on `feature/reward-modal-accessibility-coverage`
- Human decision reason: Reward cards are semantic `button type="button"` controls with accessible reward-name labels and `aria-pressed`, covered by React Testing Library role/name/focus checks and Playwright keyboard activation.

## Finding

- ID: `SHOWCASE-QA-003`
- Area: UX
- Severity: Low
- Build or commit: `fed924e`
- Observed seed: `showcase_seed_2026`
- Evidence: `evidence/07-after-reward-step4-battle.png`
- Moment: Showcase step 4 overlay at 1280x720.
- Suspected cause: The step counter and Korean title render without enough visual separation, so `STEP 4 / 4` runs into the title text and can read like `STEP 4 / 44단계`.
- Recommended experiment: Add a separator, line break, or dedicated title block between the step counter and step title.
- Confidence: Medium. The screenshot shows the visual ambiguity, but severity depends on final typography and copy.
- Status: Proposed
- Related GitHub PR or issue: PR #18
- Human decision reason:

## Finding

- ID: `SHOWCASE-QA-004`
- Area: QA
- Severity: Low
- Build or commit: `fed924e`
- Observed seed: `showcase_seed_2026`
- Evidence: `evidence/request-failures.json`
- Moment: Initial page load in network-restricted Playwright review.
- Suspected cause: The app requests `https://fonts.googleapis.com/css2?family=Jua&display=swap`, which fails when external network is denied.
- Recommended experiment: Self-host the font, remove the external font import, or document that the prototype uses a system-font fallback in offline judging environments.
- Confidence: Medium. The failed request is confirmed, but the visual impact was limited in this local review.
- Status: Proposed
- Related GitHub PR or issue: PR #18
- Human decision reason:

## Non-Findings / Passing Checks

- Starting Showcase Mode from the title screen works at 1280x720.
- The overlay appears on step 1 and advances to step 2.
- After selecting a reward card on step 3, the flow can advance to step 4.
- Step 4 displays a battle screen with a forced slot result and `EXECUTE` visible.
- No page-level JavaScript errors were captured.
