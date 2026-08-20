# Content Effect Schema Plan

Date: 2026-08-20
Scope: short MVP schema for AI-generatable item, augment, and synergy content

## Goal

Define a content contract that AI or humans can generate as JSON without turning content into arbitrary code. The engine should interpret a small allowlist of effect modules, and content should only fill validated parameters.

YAML can be a later authoring convenience. MVP should use JSON because `tsconfig.app.json:15` enables `resolveJsonModule`, while `package.json` has no YAML parser dependency.

## Current Starting Point

The current pure build model already has:

- reward identity: `kind`, `id`, `name`, `rarity`
- synergy tags: `tags`
- synergy requirements: `requiredTags`
- placeholder effect identity: `effectId`
- deterministic reward scoring and synergy completion

Missing pieces:

- structured effect definitions
- condition definitions beyond synergy tag requirements
- effect timing hooks
- resolver-owned gameplay interpretation
- schema validation rules

## Proposed Top-Level JSON Shape

```ts
type ContentPack = {
  schemaVersion: 1
  rewards: RewardContent[]
  synergies: SynergyContent[]
}

type RewardContent = {
  id: string
  kind: 'augment' | 'item'
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'cursed' | 'legendary'
  tags: SynergyTag[]
  description: string
  effects: EffectDefinition[]
  synergyHints?: string[]
}

type SynergyContent = {
  id: string
  name: string
  description: string
  requiredTags: SynergyRequirement[]
  effects: EffectDefinition[]
  completionEffects?: EffectDefinition[]
}
```

## Allowed Tags

Use the current `SynergyTag` set first:

- `COMBO`
- `MULTI_HIT`
- `CRITICAL`
- `BURN`
- `DEFENSE`
- `CURSE`
- `RISK`
- `RESOURCE`

Candidate later tags:

- `POISON`
- `FREEZE`
- `LIGHTNING`
- `SHOP`
- `REST`

Do not add candidate tags before resolver support exists, or reward scoring will imply gameplay value that does not exist.

## MVP Effect Type IDs

Use exact string IDs so generated JSON is easy to validate.

| Effect type | Parameters | Execution |
| --- | --- | --- |
| `combat.action_amount.add` | `action`, `amount` | Adds after base slot amount. |
| `combat.action_amount.add_pct` | `action`, `percent` | Applies after flat bonuses. |
| `combat.bullet.extra_hit` | `percent` | Adds one same-target bullet hit before enemy attack. |
| `combat.curse_gain.add` | `amount` | Modifies the normal per-resolution curse gain. |
| `reward.score.add` | `amount` | Adds a separate content score component to reward ranking. |

These five cover the existing placeholder direction in `BuildCatalog`: damage seed/bonus, extra hit, block bonus, curse tradeoff, and cursed reward bonus.

## Deferred Effect Type IDs

These should be schema candidates but not first implementation targets:

| Effect type | Reason to defer |
| --- | --- |
| `combat.status.apply` | Requires canonical status enum and duration/stack rules. |
| `combat.status.damage_pct` | Requires status lifecycle and cap tests. |
| `combat.enemy_turn.skip_once` | High balance risk; must consume freeze/shock or another bounded resource. |
| `shop.price.discount_pct` | Current shop is UI-local data plus legacy engine command handling. |
| `rest.action.bonus` | Current rest is legacy UI path; pure route/rest state does not exist. |
| `combat.aoe.damage_pct` | Multi-enemy combat does not exist yet. |

## Effect Shape

```ts
type EffectDefinition = {
  id: string
  type:
    | 'combat.action_amount.add'
    | 'combat.action_amount.add_pct'
    | 'combat.bullet.extra_hit'
    | 'combat.curse_gain.add'
    | 'reward.score.add'
  params: Record<string, number | string | boolean>
  conditions?: EffectCondition[]
}
```

Conditions are AND-only in the first MVP.

## Allowed Condition Type IDs

| Condition | Parameters |
| --- | --- |
| `slot.action_is` | `action: bullet | shield | heart` |
| `slot.target_is` | `target: enemy | self | all` |
| `slot.modifier_is` | `modifier: x1 | x2 | x3` |
| `slot.locked_reels_at_least` | `count: 1 | 2` |
| `combat.curse_at_least` | `value` |
| `combat.player_health_pct_at_most` | `percent` |
| `reward.kind_is` | `kind: augment | item` |
| `reward.rarity_is` | existing lowercase rarity |
| `reward.has_tag` | existing `SynergyTag` |
| `build.synergy_active` | `synergyId` |

No nesting, OR, NOT, random rolls, arbitrary stat names, or authored triggers in the first MVP.

## Validation Constraints

- Reject unknown fields, effect types, condition types, parameters, tags, rarities, and kinds.
- IDs must match `^[a-z][a-z0-9_]{1,47}$`.
- Reward IDs are globally unique.
- Synergy IDs are globally unique.
- Effect IDs are unique within their owner.
- Each reward or synergy can have 1 to 3 effects.
- Each effect can have 0 to 3 conditions.
- Tags are unique per reward.
- `requiredTags` has 1 to 3 entries.
- Requirement `count` is an integer from 1 to 3.
- No duplicate `(tag, source)` requirement pairs.

Parameter caps:

- flat action bonus: `1..20`
- percentage bonus: `5..200`
- extra-hit percentage: `25..100`
- curse adjustment: `-1..2`
- reward score adjustment: `-50..50`
- maximum two extra hits after aggregate resolution
- final curse gain clamped to `0..3`
- summed percentage bonuses capped at `+200%`

Deterministic amount order:

1. base slot amount
2. add flat bonuses
3. apply summed percentages with `Math.floor`
4. apply extra hits
5. apply enemy turn
6. apply curse gain

## System Placement

Recommended modules:

- `src/game/build/ContentTypes.ts`
- `src/game/build/ContentValidation.ts`
- `src/game/effects/EffectTypes.ts`
- `src/game/effects/EffectResolver.ts`

Responsibility split:

- `BuildSystem`: validate catalog shape and resolve active reward/synergy effects by owned IDs and completed synergies.
- `RewardSystem`: apply active `reward.score.add` effects to a separate `contentValue` score field.
- `CombatSystem`: accept optional resolved-effect context; apply action amount, extra hit, and curse-gain effects.
- `GameEngine`: orchestrate by resolving active effects from build state and passing them into `RewardSystem` or `CombatSystem`.
- React: display only; no effect resolution or RNG decisions.

## Example JSON

```json
{
  "schemaVersion": 1,
  "rewards": [
    {
      "id": "combo_starter",
      "kind": "augment",
      "name": "Combo Starter",
      "rarity": "common",
      "tags": ["COMBO"],
      "description": "Makes high modifiers matter.",
      "effects": [
        {
          "id": "combo_x2_damage",
          "type": "combat.action_amount.add_pct",
          "params": { "action": "bullet", "percent": 25 },
          "conditions": [
            { "type": "slot.modifier_is", "params": { "modifier": "x2" } }
          ]
        }
      ],
      "synergyHints": ["combo_lock_engine"]
    }
  ],
  "synergies": [
    {
      "id": "combo_lock_engine",
      "name": "Combo Lock Engine",
      "description": "Combo rewards and lock risk create extra hits.",
      "requiredTags": [
        { "tag": "COMBO", "count": 2, "source": "augment" },
        { "tag": "MULTI_HIT", "count": 1, "source": "item" }
      ],
      "effects": [
        {
          "id": "locked_extra_hit",
          "type": "combat.bullet.extra_hit",
          "params": { "percent": 50 },
          "conditions": [
            { "type": "slot.locked_reels_at_least", "params": { "count": 1 } }
          ]
        }
      ]
    }
  ]
}
```

## Exclusions

- No user-authored JavaScript functions.
- No dynamic `eval`, string formulas, or script files.
- No arbitrary trigger graph where effects emit commands.
- No final balance claims until deterministic tests and playtest seeds exist.

