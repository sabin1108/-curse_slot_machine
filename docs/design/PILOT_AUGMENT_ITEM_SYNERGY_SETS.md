# Pilot Augment Item Synergy Sets

Date: 2026-08-20
Scope: MVP content proposals, not implementation approval

## Design Target

The pilot should prove that rewards are interesting because they connect to other rewards. The first pickup hints at a future payoff, the second pickup changes tactical behavior, and the completed synergy makes combat or route decisions feel different.

Assumption: a 15-stage demo grants at most about 13 total build pickups, including combat rewards, event rewards, and up to 4 shop items. A full archetype should become recognizable at 2 pickups and complete around 3 to 5 pickups.

## Recommended First Pilot: Combo Lock Engine

Core emotion: "If I lock the right reel, this build rewards my risk."

| ID | Kind | Tags | Effect Module | Purpose |
| --- | --- | --- | --- | --- |
| `aug_combo_starter` | augment | `COMBO` | `combat.action_amount.add_pct` | Makes `x2/x3` spins desirable. |
| `item_weighted_handle` | item | `COMBO`, `RISK` | lock condition support | Makes lock/reroll decisions feel intentional. |
| `aug_chain_strike` | augment | `COMBO`, `MULTI_HIT` | `combat.bullet.extra_hit` | Converts setup into visible repeated hits. |
| `item_cracked_counter` | item | `RESOURCE` | `combat.curse_gain.add` | Lets the player keep using locks without immediate collapse. |

Synergy: `combo_lock_engine`

- Requires: `COMBO` augment x2, `MULTI_HIT` any x1, `RISK` item x1
- Effect: first bullet hit after locking at least one reel gains one extra hit at 50% damage
- Completion target: stages 5 to 7

Why next reward is exciting:

- First `COMBO` reward makes large modifiers matter.
- Lock support makes the player preserve the best reel and accept curse pressure.
- Extra hit visibly changes combat output.
- Curse support becomes desirable because it fuels the lock strategy.

## Archetype 2: Burn Poison Pressure

Core emotion: "Statuses turn small attacks into a ticking payoff."

| ID | Kind | Tags | Effect Module | Purpose |
| --- | --- | --- | --- | --- |
| `aug_burning_edge` | augment | `BURN` | deferred `combat.status.apply` | Starts damage-over-time identity. |
| `item_toxic_vial` | item | `POISON`, `RESOURCE` | deferred `combat.status.apply` | Adds second status lane. |
| `aug_cinder_tax` | augment | `BURN`, `CURSE` | deferred `combat.status.damage_pct` | Converts status stacks into burst damage. |
| `item_ash_collector` | item | `BURN`, `SHOP` | deferred `shop.price.discount_pct` | Lets shops complete the status build. |

Synergy: `status_pressure_engine`

- Requires: `BURN` any x2, `POISON` any x1
- Effect: bullet hits deal bonus damage per burn/poison stack, capped at 60%
- Completion target: stages 7 to 11

Why next reward is exciting:

- Burn alone promises future stack payoff.
- Poison adds a second axis and makes status payoff rewards more valuable.
- Status damage turns setup into a visible spike.
- Shop support creates a non-combat reason to care about archetype tags.

MVP note: this is a second pilot, not the first implementation, because status lifecycle is not canonical yet.

## Archetype 3: Defense Curse Economy

Core emotion: "I can survive curse pressure and turn recovery nodes into build progress."

| ID | Kind | Tags | Effect Module | Purpose |
| --- | --- | --- | --- | --- |
| `aug_guard_core` | augment | `DEFENSE` | `combat.action_amount.add` on shield | Starts defensive identity. |
| `item_purifier_coin` | item | `CURSE`, `RESOURCE` | deferred rest curse reduction | Makes rest nodes part of build planning. |
| `aug_bastion_reflect` | augment | `DEFENSE`, `RISK` | future counter effect | Rewards high block. |
| `item_black_market_pass` | item | `SHOP`, `CURSE` | deferred shop discount | Connects curse risk to shop choices. |

Synergy: `curse_bastion_engine`

- Requires: `DEFENSE` any x2, `CURSE` item x1
- Effect: after gaining block, reduce next curse increase by 1 once per turn
- Completion target: stages 6 to 9

Why next reward is exciting:

- Defense starter makes shield rolls feel less passive.
- Curse reduction turns rest choices into build decisions.
- Shop discount makes high curse less one-dimensional.
- The synergy unlocks safer risk-taking without pure damage inflation.

## Archetype 4: Freeze Lightning Control

Core emotion: "I can trade raw damage for tempo and enemy turn control."

| ID | Kind | Tags | Effect Module | Purpose |
| --- | --- | --- | --- | --- |
| `aug_frost_mark` | augment | `DEFENSE`, `FREEZE` | deferred freeze apply | Makes shield proactive. |
| `item_static_coil` | item | `LIGHTNING`, `MULTI_HIT` | deferred shock apply | Links control to multi-hit. |
| `aug_storm_break` | augment | `LIGHTNING`, `CRITICAL` | extra hit against controlled target | Rewards setup. |
| `item_hourglass_relay` | item | `DEFENSE`, `RESOURCE` | deferred skip enemy turn | Adds tempo payoff. |

Synergy: `tempo_control_engine`

- Requires: `FREEZE` any x1, `LIGHTNING` any x1, `DEFENSE` augment x1
- Effect: once per combat, consuming freeze skips the next enemy attack
- Completion target: stages 11 to 14

MVP note: defer this archetype until status consume and enemy-turn skip have explicit tests. It has the highest chance of bypassing combat rules.

## Pilot Catalog Recommendation

First implementation should include only:

1. Combo Lock Engine as functional logic.
2. Defense Curse Economy as partial schema/content preview.
3. Burn Poison Pressure as schema-only status preview.

This shows three archetypes without forcing status, shop, rest, and enemy-turn control into the same PR.

## Authored 13-Reward MVP Catalog

For the 15-stage demo, use exactly 13 authored rewards: three four-pickup archetypes plus one bridge item. Five entries can reuse or rename current catalog concepts, and eight are new. Synergies are unlocks, not additional rewards.

### Clockwork Barrage

Theme: lock -> mark -> extra hits.

| Pick | Reward | Kind | Status |
| ---: | --- | --- | --- |
| 1 | `combo_starter` / Combo Starter | augment | existing concept |
| 2 | `multi_hit_charm` / Multi-Hit Charm | item | existing concept |
| 3 | `combo_finisher` / Combo Finisher | augment | existing concept |
| 4 | `ember_magazine` / Ember Magazine | item | new |

Intended progression:

- Combo Starter: a locked attack applies a small primer mark.
- Multi-Hit Charm: adds one extra hit so the primer has an immediate payoff.
- Combo Finisher: consuming primer creates one final extra hit once per attack.
- Ember Magazine: extra hits apply burn once per attack.

Pilot test idea: grant picks 1 to 3, force locked `bullet/enemy/x2`, and verify the first extra hit can copy the rolled modifier once without recursion.

### Iron Refrain

Theme: defense becomes a follow-up attack.

| Pick | Reward | Kind | Status |
| ---: | --- | --- | --- |
| 1 | `guard_core` / Guard Core | augment | existing concept |
| 2 | `steadfast_latch` / Steadfast Latch | item | new |
| 3 | `retaliation_matrix` / Retaliation Matrix | augment | new |
| 4 | `mirror_buckler` / Mirror Buckler | item | new |

Intended progression:

- Guard Core: a full block prevents the next baseline curse gain once.
- Steadfast Latch: locked shield results gain bonus block.
- Retaliation Matrix: a full block fires one x1 retaliation hit.
- Mirror Buckler: retaliation applies exposed; the next normal attack gains one multiplier step.

Pilot test idea: force locked `shield/self/x2` against an attack fully covered by block; expect one guarded state and one retaliation, with no second trigger that turn.

### House Credit

Theme: curse becomes debt to manage.

| Pick | Reward | Kind | Status |
| ---: | --- | --- | --- |
| 1 | `cursed_lens` / Cursed Lens | item | existing concept, must be adjusted |
| 2 | `hexed_clutch` / Hexed Clutch | augment | new |
| 3 | `debt_collector` / Debt Collector | augment | new |
| 4 | `black_market_stamp` / Black-Market Stamp | item | new |

Intended progression:

- Cursed Lens: at curse 5+, x1 can step up to x2.
- Hexed Clutch: locked rerolls create debt alongside normal curse.
- Debt Collector: the first attack each turn can consume one debt for an extra hit.
- Black-Market Stamp: rest purification creates a next-shop discount; first shop purchase removes one curse.

Pilot test idea: start at curse 4, perform one locked reroll, then attack; verify threshold activation, one debt consumption, and one extra hit. Follow with Rest -> Shop when those systems are pure.

### Shared Bridge Pickup

`safety_valve` / Safety Valve

- Kind: item
- Tags: `DEFENSE`, `CURSE`
- Effect: once per combat, consuming a status or fully depleting block prevents the next baseline curse gain.
- Constraint: does not prevent reroll curse and must be once per combat.

This item can bridge Iron Refrain or House Credit without completing either archetype alone.

## Balance Guardrails

- A player with 13 pickups should complete one primary archetype and partially progress one secondary archetype.
- No single reward should multiply final damage by more than 2.
- Completed synergies can be strong, but their condition must be readable from tags and current state.
- At least one reward in every archetype should interact with a non-damage decision: lock, curse, shop, or rest.
- Dual-tag rewards must not complete an entire synergy alone unless explicitly scripted for Showcase.

## Current Catalog Fix Candidate

`cursed_lens` currently has both `CURSE` and `RISK`, while `risk_engine` requires one of each from any source. That can make a complete synergy from one reward. A pilot content pass should either:

- split `CURSE` and `RISK` across two different rewards, or
- change `risk_engine` to require `CURSE` from item and `RISK` from augment, or
- gate `risk_engine` completion until stage 5+ through reward pool tiers.
