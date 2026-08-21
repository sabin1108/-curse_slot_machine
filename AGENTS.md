# Curse Slot Machine Agent Guide

## Project goal

Build a desktop-first React and TypeScript roguelike where deterministic game systems produce readable combat-slot sentences: `[action, target, modifier]`.

Use `DESIGN.md` and `docs/design/PLANNING_SUMMARY.md` as the product and architecture sources of truth. Do not expand the MVP without explicit human approval.

## Workflow ownership

- Superpowers owns requirements clarification, implementation planning, TDD, debugging, code review, verification, and branch completion.
- OMX is optional and review-only. Use it only after a playable milestone is fixed to a commit.
- OMX does not create implementation plans, edit production code, or automatically convert feedback into work.
- Do not run implementation agents and milestone-review agents against the same writable checkout concurrently.
- Only findings explicitly marked `Accepted` by a human may enter a new implementation cycle.

If an installed tool or generated instruction conflicts with these boundaries, this project guide wins. Disable the conflicting workflow rather than improvising around it.

## Architecture invariants

- Pure TypeScript game systems own RNG, reel outcomes, combat resolution, rewards, and enemy actions.
- React renders state, events, controls, and animation; it does not decide game outcomes.
- The same seed and command sequence must produce the same state and events.
- `CombatSlotMachine` and `AugmentSlotMachine` remain separate systems.
- Augment animation displays a preselected result and must not consume reward RNG.
- Showcase Mode uses scripted scenarios and must not add shortcuts to normal combat calculations.
- Put content-specific items, augments, enemies, and synergies in data rather than engine branches.

## Implementation workflow

1. Read the relevant design and existing implementation before planning.
2. Keep each branch focused on one approved feature or repair.
3. Add or update tests before changing deterministic game behavior.
4. Make the smallest change that satisfies the approved scope.
5. Run targeted checks, then the repository verification commands.
6. Report changed files, evidence, and remaining risks.

One implementation owner should write a feature at a time. Use subagents only for independent, bounded exploration, review, or verification that materially improves the result. Parallel review agents must not edit product code.

## Project skills

Repository-native skills live under `.agents/skills/`.

- `$slot-level-designer`: evidence-backed pacing and risk/reward review after a playable milestone.
- `$slot-ux-review`: evidence-backed combat UX and accessibility review after a playable milestone.
- `$seeded-gameplay-qa`: deterministic gameplay regression review after seed controls and commands exist.

Read the selected skill's complete `SKILL.md` before following its workflow. Review skills return findings; they do not implement fixes.

## Tools

- Use Context7 only for current library or API documentation.
- Use Playwright MCP for exploratory browser review and evidence capture.
- Use committed Playwright tests for repeatable browser regression checks.
- Use Vitest for deterministic engine, state-transition, and component behavior.
- Bind local browser testing to `127.0.0.1` unless the task explicitly requires another interface.

## GitHub and external actions

- Treat GitHub access as read-only by default.
- Creating or changing issues, pull requests, comments, labels, branches, merge state, releases, or repository settings requires explicit human authorization.
- Do not merge a pull request without explicit human approval.
- Record the reviewed commit, PR or issue, representative seed, review path, and decision state for playable milestones.

## Safety

- Never commit API keys, OAuth tokens, cookies, browser profiles, credentials, or machine-local secrets.
- Do not copy marketplace plugins or user-home Codex configuration into this repository.
- Do not use `--madmax`, `--yolo`, `--dangerously-bypass-approvals-and-sandbox`, or `--no-sandbox` for project work.
- Preserve unrelated user changes and keep diffs focused and reversible.
- Ask before destructive, irreversible, credential-gated, external-production, or materially scope-changing actions.

## Verification

Run the smallest targeted check first, then the applicable full checks:

```powershell
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

Do not claim a check passed unless it was run against the reported commit or the validation gap is stated explicitly.

## Milestone reviews

Run full UX, level-design, and gameplay-QA reviews only after a playable checkpoint. Fix the review target to a commit and provide:

- local URL and run command;
- milestone intent and acceptance criteria;
- representative seeds;
- known limitations;
- prohibited modification scope.

Store accepted review artifacts under `docs/reviews/milestone-XX/` using the schema in `docs/reviews/README.md`. Every finding needs a screenshot, seed, turn log, console output, or reproducible steps.
