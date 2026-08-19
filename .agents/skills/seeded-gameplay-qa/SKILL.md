---
name: seeded-gameplay-qa
description: Verify deterministic Curse Slot Machine gameplay and representative seed regressions after seed controls and game commands exist. Use for reproducible gameplay QA, not feature implementation.
---

# Seeded Gameplay QA

Verify deterministic behavior against a fixed commit. Do not edit production code.

## Preconditions

Require a runnable build, an exposed or documented seed input, repeatable game commands, representative seeds, and milestone acceptance criteria. If deterministic control is unavailable, stop and state which test surface must exist before this skill can run.

Read `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, and `docs/reviews/README.md`. Inspect engine code only when needed to explain a reproduced result.

## Verification

Check the applicable invariants:

- the same seed and command sequence produce the same result;
- locked reels persist across rerolls;
- reroll costs and curse thresholds change exactly once;
- commands are rejected after win or loss;
- preview operations do not consume RNG;
- normal and Showcase Mode outcomes remain separated;
- representative seeds produce no unexpected console errors.

Repeat a failing sequence before reporting it. Record the seed, initial state, commands, expected result, actual result, and relevant event or console output.

## Output

Return reproduction-focused findings using the schema in `docs/reviews/README.md`. Do not report a nondeterministic suspicion as confirmed unless repeated runs demonstrate it.

Do not fix the bug, alter seeds to hide it, or broaden testing into unrelated UX critique. A human chooses which findings enter implementation.
