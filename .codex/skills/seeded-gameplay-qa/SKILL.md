# seeded-gameplay-qa

Use this skill for review-only seeded gameplay QA after deterministic game commands and debug seeds exist.

## Scope

- Verify same seed produces same result.
- Verify locked reels persist correctly.
- Verify reroll costs and curse thresholds.
- Verify commands are blocked after win or loss.
- Verify overclock preview does not consume RNG.
- Verify browser console errors and representative seed regressions.

## Output

Write reproduction-focused findings under `docs/reviews/`. Do not edit production code.
