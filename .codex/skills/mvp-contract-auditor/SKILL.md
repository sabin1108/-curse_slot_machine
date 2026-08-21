---
name: mvp-contract-auditor
description: Audit Curse Slot Machine MVP architecture invariants before a playable checkpoint or merge. Use for explicit read-only contract audits, not implementation or general code review.
---

# MVP Contract Auditor

Determine whether the current implementation preserves the product architecture contracts. Do not edit production code or turn findings into work automatically.

## Preconditions

Require a commit or clearly identified working tree. Read `AGENTS.md`, `DESIGN.md`, `docs/design/PLANNING_SUMMARY.md`, and the relevant implementation before judging a contract.

When duplicate or ambiguous engine symbols exist and `AGENTS.md` defines a Landmine procedure, follow it exactly. If no procedure or executable is available, inspect candidates manually and record Landmine as unavailable rather than inventing a command. Treat partial analysis as bounded evidence, not approval.

## Audit

Check each applicable invariant with direct file, test, or runtime evidence:

- one pure TypeScript authority owns RNG, slot outcomes, combat resolution, enemy actions, rewards, shops, rests, events, and terminal state;
- React only dispatches commands and renders state or presentation animation;
- the same seed and command sequence produce the same state and events;
- combat and augment slot machines remain separate;
- augment animation presents a preselected reward without consuming reward RNG;
- Showcase remains isolated from normal combat calculations;
- reward, item, enemy, and synergy content is data-driven rather than branched by content ID;
- terminal phases reject outcome-changing commands without changing RNG or state.

Search for competing engine definitions, UI-side random calls, direct resolver imports in components, content-ID conditionals, and normal-play calls into Showcase code. Run the smallest existing tests needed to prove or disprove a claim.

## Output

Return a table with `Contract`, `Verdict` (`Pass`, `Fail`, or `Unknown`), `Evidence`, and `Confidence`. Separate observed evidence from inference. Rank failures by player or determinism impact and give the smallest recommended verification or repair boundary.

Do not claim `Pass` from missing search results, partial Landmine output, or an unexecuted test. Do not write review artifacts unless the user requests them and the project review policy permits it.
