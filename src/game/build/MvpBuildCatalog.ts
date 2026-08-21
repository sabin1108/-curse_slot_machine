import type { BuildCatalog, BuildRewardDefinition } from './BuildTypes'
import { validateBuildCatalog } from './ContentValidation'

export const MVP_REWARD_IDS = [
  'combo_starter',
  'multi_hit_charm',
  'combo_finisher',
  'ember_magazine',
  'guard_core',
  'steadfast_latch',
  'retaliation_matrix',
  'mirror_buckler',
  'cursed_lens',
  'hexed_clutch',
  'debt_collector',
  'black_market_stamp',
  'safety_valve',
] as const

const rewards: BuildRewardDefinition[] = [
  reward('combo_starter', 'augment', 'Combo Starter', 'common', ['COMBO'], 'Locked bullets apply Primer.', [{
    id: 'combo_starter_primer', type: 'combat.status.apply', params: { status: 'primer', stacks: 1, target: 'enemy' },
    conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }, { type: 'slot.locked_reels_at_least', params: { count: 1 } }],
  }]),
  reward('multi_hit_charm', 'item', 'Multi-Hit Charm', 'uncommon', ['MULTI_HIT'], 'Bullets add a 35% extra hit.', [{
    id: 'multi_hit_charm_extra', type: 'combat.bullet.extra_hit', params: { percent: 35 },
  }]),
  reward('combo_finisher', 'augment', 'Combo Finisher', 'rare', ['COMBO', 'CRITICAL'], 'Consumes Primer for a 50% finisher hit.', [{
    id: 'combo_finisher_consume', type: 'combat.status.consume_extra_hit', params: { status: 'primer', percent: 50, target: 'enemy' },
    conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
  }]),
  reward('ember_magazine', 'item', 'Ember Magazine', 'rare', ['COMBO', 'BURN'], 'Extra hits apply Burn once.', [{
    id: 'ember_magazine_burn', type: 'combat.extra_hit.status_apply', params: { status: 'burn', stacks: 1, target: 'enemy' },
  }]),
  reward('guard_core', 'augment', 'Guard Core', 'common', ['DEFENSE'], 'A full block prevents baseline curse once per combat.', [{
    id: 'guard_core_prevent', type: 'combat.full_block.curse_prevent', params: { uses: 1 },
  }]),
  reward('steadfast_latch', 'item', 'Steadfast Latch', 'uncommon', ['DEFENSE'], 'Locked shields gain +4 block.', [{
    id: 'steadfast_latch_block', type: 'combat.action_amount.add', params: { action: 'shield', amount: 4 },
    conditions: [{ type: 'slot.locked_reels_at_least', params: { count: 1 } }],
  }]),
  reward('retaliation_matrix', 'augment', 'Retaliation Matrix', 'rare', ['DEFENSE', 'MULTI_HIT'], 'A full block retaliates for 6 damage.', [{
    id: 'retaliation_matrix_hit', type: 'combat.full_block.retaliate', params: { amount: 6 },
  }]),
  reward('mirror_buckler', 'item', 'Mirror Buckler', 'rare', ['DEFENSE', 'CRITICAL'], 'Retaliation applies Exposed.', [{
    id: 'mirror_buckler_exposed', type: 'combat.retaliation.status_apply', params: { status: 'exposed', stacks: 1 },
  }]),
  reward('cursed_lens', 'item', 'Cursed Lens', 'cursed', ['CURSE'], 'At curse 5+, bullet x1 steps up to x2.', [{
    id: 'cursed_lens_step', type: 'combat.modifier.step_up', params: { from: 'x1', to: 'x2' },
    conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }, { type: 'combat.curse_at_least', params: { value: 5 } }],
  }]),
  reward('hexed_clutch', 'augment', 'Hexed Clutch', 'uncommon', ['RISK'], 'Locked rerolls add one Debt.', [{
    id: 'hexed_clutch_debt', type: 'reroll.status.add', params: { status: 'debt', stacks: 1 },
    conditions: [{ type: 'slot.locked_reels_at_least', params: { count: 1 } }],
  }]),
  reward('debt_collector', 'augment', 'Debt Collector', 'rare', ['CURSE', 'MULTI_HIT'], 'Consumes Debt for a 50% extra hit.', [{
    id: 'debt_collector_hit', type: 'combat.status.consume_extra_hit', params: { status: 'debt', percent: 50, target: 'player' },
    conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
  }]),
  reward('black_market_stamp', 'item', 'Black-Market Stamp', 'rare', ['CURSE', 'RESOURCE'], 'Purify arms a 25% discount and purchase cleanse.', [{
    id: 'black_market_stamp_discount', type: 'rest.purify.arm_shop_discount', params: { discountPercent: 25, purchaseCurseReduction: 1 },
  }]),
  reward('safety_valve', 'item', 'Safety Valve', 'uncommon', ['DEFENSE', 'CURSE'], 'Once per combat, a spent defense or status prevents curse.', [{
    id: 'safety_valve_prevent', type: 'combat.curse_gain.prevent_once', params: { trigger: 'block_depleted_or_status_consumed' },
  }]),
]

export const MVP_BUILD_CATALOG: BuildCatalog = {
  rewards,
  synergies: [
    {
      id: 'clockwork_barrage',
      name: 'Clockwork Barrage',
      description: 'Primer and extra-hit engine.',
      requiredTags: [{ tag: 'COMBO', count: 3, source: 'any' }, { tag: 'MULTI_HIT', count: 1, source: 'item' }],
    },
    {
      id: 'iron_refrain',
      name: 'Iron Refrain',
      description: 'Full-block retaliation engine.',
      requiredTags: [{ tag: 'DEFENSE', count: 3, source: 'any' }, { tag: 'MULTI_HIT', count: 1, source: 'augment' }],
    },
    {
      id: 'house_credit',
      name: 'House Credit',
      description: 'Curse and debt economy.',
      requiredTags: [{ tag: 'CURSE', count: 3, source: 'any' }, { tag: 'RISK', count: 1, source: 'augment' }],
    },
  ],
}

validateBuildCatalog(MVP_BUILD_CATALOG)

function reward(
  id: string,
  kind: 'augment' | 'item',
  name: string,
  rarity: BuildRewardDefinition['rarity'],
  tags: BuildRewardDefinition['tags'],
  description: string,
  effects: NonNullable<BuildRewardDefinition['effects']>,
): BuildRewardDefinition {
  return { id, kind, name, rarity, tags, description, effectLabel: description, effects }
}
