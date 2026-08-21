# Agent, Skill, and Landmine Implementation Retrospective

Date: 2026-08-21  
Scope: structured-engine 15-stage playable MVP implementation

## Outcome

This implementation replaced the normal-play hybrid/legacy engine path with one structured TypeScript engine, connected the React MVP directly to its commands and state, implemented the approved 15-stage route and 13 reward catalog, and added deterministic tests and browser smoke coverage.

The work used one implementation owner. No implementation subagents edited product code. This followed the repository rule that one owner writes a feature at a time and avoided conflicting edits while engine contracts, UI commands, and tests changed together.

## What helped

### Repository agent guide

- **Observed:** `AGENTS.md` identified `DESIGN.md` and `docs/design/PLANNING_SUMMARY.md` as authority, required pure TypeScript outcome ownership, separated combat and augment slot RNG, and prohibited automatic adoption of review feedback.
- **Benefit:** It made the architectural stop condition concrete: the React layer could display and dispatch, but could not spin, reroll, price, resolve, or award independently.
- **Implementation evidence:** the old `src/game/GameEngine.ts` and `src/game/engine/UiGameEngine.ts` paths were deleted; `src/app/App.tsx` now dispatches directly to `src/game/engine/GameEngine.ts`.
- **Limitation:** The generated top-level OMX guidance and project-local guide describe different workflow owners. The project guide correctly won, but an agent must read far enough to discover that conflict before selecting a workflow.
- **Suggested change:** Add a short generated header that points to the project-specific override section and states the effective workflow owner in one line.

### Seeded gameplay QA skill

- **Observed:** `.agents/skills/seeded-gameplay-qa/SKILL.md` requires a fixed commit, representative seeds, command logs, and deterministic replay evidence.
- **Benefit:** Its evidence contract influenced the implementation before review: the title accepts a seed, the engine owns RNG state, the UI shows the active seed, and the browser test uses an explicit representative seed.
- **Limitation:** It cannot help during early implementation because it correctly requires existing seed controls/game commands and a fixed playable checkpoint.
- **Suggested change:** Add a lightweight pre-milestone checklist that only verifies whether the eventual review prerequisites exist, without issuing gameplay findings.

### Slot level designer skill

- **Observed:** `.agents/skills/slot-level-designer/SKILL.md` requires seed-based play evidence and limits itself to pacing, difficulty, and risk/reward findings.
- **Benefit:** It encouraged explicit stage types, enemy profiles, persistent HP/curse, and a fixed route that can be replayed and compared.
- **Limitation:** It cannot establish initial balance without a playable fixed commit, so values such as elite HP 24 and boss HP 36 remain implementation hypotheses until milestone review.
- **Suggested change:** Provide a standard evidence table for per-stage turns-to-kill, damage taken, curse delta, reward chosen, and ending resources.

### Slot UX review skill

- **Observed:** `.agents/skills/slot-ux-review/SKILL.md` requires browser evidence and does not authorize visual implementation or rule changes.
- **Benefit:** Its focus on clarity shaped the UI labels for `[action, target, modifier]`, lock state, reroll curse cost, enemy intent, reward effects, and route progress.
- **Limitation:** Findings arrive after a fixed playable checkpoint; it does not supply a reusable accessibility regression harness.
- **Suggested change:** Add a companion non-review script or checklist for keyboard reachability, focus visibility, accessible names, contrast, and 1280×720 overflow.

### Landmine 0.1.0a3

- **Observed:** a symbol preflight for `GameEngine` returned `ambiguous_symbol` because the repository contained three engine definitions. Explicit-path reruns for `GameState`, the structured `GameEngine`, and `BuildCatalog` returned `analysis_status: partial` with unresolved-import limitations. Analysis IDs included `lm_2dab7616a5ba`, `lm_6daa7c65d4aa`, and `lm_49c0c0ec97c7`.
- **Benefit:** The ambiguous result exposed the central implementation risk early: multiple same-named engines and a hybrid adapter. That evidence bounded manual inspection and directly supported deleting the legacy and adapter paths once the new UI was connected.
- **Limitation:** Partial analysis could show direct imports/tests but could not prove runtime React routing, second-hop calls, alias resolution, or which engine was architecturally canonical. A low summary risk would therefore have been misleading without reading `analysis_status` and limitations first.
- **Suggested change:**
  - Include candidate paths and direct importer counts in the `ambiguous_symbol` decision block.
  - Resolve TypeScript `tsconfig` aliases and package exports.
  - Distinguish “no evidence found” from “analysis could not follow this edge.”
  - Emit a machine-readable `requires_manual_checks` list derived from limitations.
  - Support a compare mode for duplicate symbols that highlights overlapping public methods and import reachability.

### Existing OMX/domain feedback artifacts

- **Observed:** prior feedback artifacts under `docs/agent/feedback/` covered structure, content schema, pilot content, stage flow, and the UI-engine adapter.
- **Benefit:** They provided hypotheses and vocabulary for locating duplicated authority and data-driven content boundaries.
- **Limitation:** They are advisory snapshots, not accepted requirements. Some described the now-deleted adapter as an incremental path. Per project policy, none could automatically become implementation work.
- **Suggested change:** Add status metadata to every feedback artifact: `Proposed`, `Accepted`, `Rejected`, or `Superseded`, plus reviewed commit and human decision date.

## Agent usage assessment

### Helpful cases

- Independent read-only exploration is useful when locating plan documents, duplicate engine definitions, tests, and UI consumers.
- Verification agents are useful after a fixed commit because they can independently challenge deterministic replay, browser interaction, or acceptance claims without editing product code.
- Domain review agents are useful only after the normal run is playable and the review target is immutable.

### Costs and failure modes

- Parallel implementation would have created high conflict risk because `GameState`, commands, engine transitions, UI, and tests formed one tightly coupled contract change.
- Review feedback against a moving checkout would become stale and could be mistaken for current evidence.
- Agent-generated architecture recommendations can conflict with project authority; without explicit decision state they can create accidental scope expansion.
- More agents increase integration and verification cost even when their individual outputs are correct.

### Recommended operating model

1. One implementation owner changes deterministic contracts and UI wiring.
2. Use read-only exploration only for clearly independent repository questions.
3. Run targeted tests, full checks, and browser smoke before fixing the milestone commit.
4. After the commit is fixed, run seeded gameplay QA, level-design review, and UX review independently.
5. Store findings with evidence and a decision state. Only human-marked `Accepted` findings enter the next implementation cycle.

## Proposed additional skills

### `mvp-contract-auditor`

Read-only pre-merge audit that verifies architecture invariants: one outcome-owning engine, no UI RNG, no reward RNG consumption during augment animation, no normal-play showcase shortcuts, and data-driven content. Output should include file/line evidence and explicit unknowns.

### `command-trace-recorder`

Runs a seed plus command sequence through the engine and writes a normalized trace containing phase, stage, slot result, combat delta, rewards, RNG snapshot, and terminal state. It should compare two replays byte-for-byte and produce artifacts consumable by seeded gameplay QA.

### `content-catalog-linter`

Wraps the runtime content validator and reports duplicate IDs, unsupported effects, range violations, unreachable synergy requirements, reward-policy coverage, and shop/reward availability gaps without editing content.

### `playable-checkpoint-preflight`

Checks whether a milestone is ready for domain review: clean/fixed commit, local run command, reachable URL, seed input, normal game commands, no console errors, representative seeds, acceptance criteria, and known limitations.

## Next review handoff

After all repository checks pass, fix the implementation to a commit and run the three repository review skills against that exact commit. Their findings should remain review artifacts until the human assigns a decision state.
