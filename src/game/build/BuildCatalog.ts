import type { BuildCatalog } from './BuildTypes'

export const DEFAULT_BUILD_CATALOG: BuildCatalog = {
  rewards: [
    {
      id: 'combo_starter',
      kind: 'augment',
      name: 'Combo Starter',
      rarity: 'common',
      tags: ['COMBO'],
      effectId: 'combo_damage_seed',
      description: 'Starts a combo-oriented build.',
    },
    {
      id: 'combo_finisher',
      kind: 'augment',
      name: 'Combo Finisher',
      rarity: 'rare',
      tags: ['COMBO', 'CRITICAL'],
      effectId: 'combo_damage_bonus',
      description: 'Completes early combo routes when paired with multi-hit support.',
    },
    {
      id: 'multi_hit_charm',
      kind: 'item',
      name: 'Multi-Hit Charm',
      rarity: 'uncommon',
      tags: ['MULTI_HIT'],
      effectId: 'extra_hit_seed',
      description: 'Adds multi-hit support for combo builds.',
    },
    {
      id: 'guard_core',
      kind: 'augment',
      name: 'Guard Core',
      rarity: 'common',
      tags: ['DEFENSE'],
      effectId: 'block_bonus',
      description: 'Supports defensive builds.',
    },
    {
      id: 'cursed_lens',
      kind: 'item',
      name: 'Cursed Lens',
      rarity: 'cursed',
      tags: ['CURSE', 'RISK'],
      effectId: 'curse_tradeoff',
      description: 'Supports risk and curse routes.',
    },
  ],
  synergies: [
    {
      id: 'combo_engine',
      name: 'Combo Engine',
      description: 'Two combo augments plus one multi-hit item activate combo scaling.',
      requiredTags: [
        { tag: 'COMBO', count: 2, source: 'augment' },
        { tag: 'MULTI_HIT', count: 1, source: 'item' },
      ],
      effectId: 'combo_damage_bonus',
      effects: [
        {
          id: 'combo_extra_hit',
          type: 'combat.bullet.extra_hit',
          params: { percent: 50 },
        },
      ],
    },
    {
      id: 'risk_engine',
      name: 'Risk Engine',
      description: 'Risk and curse tags unlock stronger cursed reward routes.',
      requiredTags: [
        { tag: 'RISK', count: 1, source: 'any' },
        { tag: 'CURSE', count: 1, source: 'any' },
      ],
      effectId: 'curse_reward_bonus',
    },
  ],
}
