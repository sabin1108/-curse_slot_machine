---
name: slot-ux-review
description: Review a playable Curse Slot Machine combat flow for clarity, accessibility, and interaction quality with browser evidence. Use for UX findings, not visual implementation or game-rule changes.
---

# Slot UX Review

Review the fixed milestone in the browser. Do not edit production code.

## Required inputs

Obtain the reviewed commit, run command and local URL, milestone acceptance criteria, representative seeds, and known limitations. If the local build cannot be opened, stop and report the blocker.

Read `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, and `docs/reviews/README.md` before judging intended behavior.

## Review

At minimum, inspect the combat flow at 1280x720 and check:

- distinction between action, target, and modifier reels;
- lock state, reroll cost, and remaining rerolls;
- damage and target preview before commit;
- curse thresholds and warnings;
- enemy intent and result feedback;
- keyboard focus, readable labels, reduced motion, and layout obstruction;
- browser-console errors during the reviewed flow.

Capture the exact interaction sequence and evidence for each finding. Distinguish a missing requirement from an implementation defect or a subjective preference.

## Output

Return prioritized findings using the schema in `docs/reviews/README.md`. Include the reviewed commit, viewport, seed, reproduction steps, evidence path, confidence, and a bounded experiment proposal.

Do not change game rules, redesign unrelated screens, or implement the proposal. A human owns the decision state.
