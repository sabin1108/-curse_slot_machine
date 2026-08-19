---
name: slot-level-designer
description: Review a playable Curse Slot Machine milestone for pacing, difficulty, and risk-reward balance using seed-based evidence. Use for level-design feedback, not implementation or general code review.
---

# Slot Level Designer

Review the fixed milestone as a player-facing balance experiment. Do not edit production code.

## Required inputs

Obtain the reviewed commit, run command and local URL, milestone acceptance criteria, representative seeds, and known limitations. If the build is not playable or the review target is not fixed, stop and report the missing prerequisite.

Read `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, and `docs/reviews/README.md`. Inspect only the code and data needed to explain observed behavior.

## Review

Evaluate:

- time to the first meaningful choice;
- encounter difficulty and recovery curve;
- reroll and curse risk versus reward;
- invalid, self-harm, and dominant-strategy rates;
- symbol editing, augment growth, and boss-climax pacing.

Use representative seeds and record the exact turn or reproduction sequence. Separate observed behavior from suspected causes. Do not infer probability or balance conclusions from a single run unless the issue is deterministic.

## Output

Return at most three prioritized experiment proposals using the finding fields in `docs/reviews/README.md`. Every proposal needs a seed, screenshot, turn log, console output, or reproducible steps. Mark unsupported hypotheses as low confidence.

Do not change balance values, expand the MVP, or send findings into implementation. A human decides whether each proposal is Accepted, Rejected, Deferred, or remains Proposed.
