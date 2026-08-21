---
name: content-catalog-linter
description: Validate Curse Slot Machine reward and synergy catalogs for schema, reachability, and stage-policy coverage. Use for authored content QA, not balance review or automatic content editing.
---

# Content Catalog Linter

Audit authored MVP content without changing it. Read `docs/design/CONTENT_EFFECT_SCHEMA_PLAN.md`, `docs/design/MVP_REWARD_AND_STAGE_FLOW.md`, and the catalog and validator implementation relevant to the request.

Run the executable reachability check from the repository root:

```powershell
node .codex/skills/content-catalog-linter/scripts/lint-catalog.mjs
```

It evaluates every ownership subset of the 13-item MVP catalog and reports theoretical reward-policy, shop, and synergy reachability. A zero exit code covers those mechanical checks only; it does not prove that the ordered 15-stage route can acquire every combination.

## Checks

Run the catalog validator tests first. Then inspect the applicable catalog for:

- unique, stable reward, synergy, tier, and effect IDs;
- supported effect and condition types with bounded numeric values;
- runtime validator ranges and unknown-type rejection match the authored schema rather than only the TypeScript union;
- one to three meaningful effects per reward as required by the MVP schema;
- satisfiable synergy requirements by tag count and source kind;
- no synergy that requires more copies of a tag/source than the catalog can provide;
- every approved reward reachable from at least one stage reward policy or shop offer;
- no reward policy that can return fewer options than the UI contract without a documented reason;
- descriptions and labels that match the executed effect rather than an aspirational design;
- no content-specific branches in the engine.

Use the executable results, direct catalog counts, and the deterministic reward generator as evidence. Inspect descriptions, content-specific engine branches, and validator/schema mismatches manually because the helper does not judge them.

## Output

Return findings ordered by `Invalid`, `Unreachable`, `Misleading`, then `Coverage gap`. Include the content ID, exact evidence, affected stage policy, and smallest repair boundary. Report a clean result only when validation and reachability checks both ran.

Do not tune probabilities, rarity, prices, or combat power; route those questions to level-design review. Do not edit the catalog unless the user explicitly asks for implementation after reviewing the findings.
