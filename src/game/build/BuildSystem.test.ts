import { describe, expect, it } from 'vitest'

import { applyReward, createBuildState, evaluateSynergies, getActiveEffects } from './BuildSystem'
import type { BuildCatalog } from './BuildTypes'

describe('BuildSystem', () => {
  it('tracks tiered synergy progress across augments and items', () => {
    const build = createBuildState({
      augments: ['combo_starter', 'combo_finisher'],
      items: ['multi_hit_charm'],
    })

    const result = evaluateSynergies(build)

    expect(result.completed).toEqual([])
    expect(result.progress).toContainEqual({
      synergyId: 'combo_engine',
      current: 2,
      required: 4,
      completed: false,
    })
    expect(result.active).toContainEqual({
      synergyId: 'combo_engine:tier_2',
      name: 'Combo Engine I',
      effectId: '2 COMBO: bullet +15%',
      tier: 2,
    })
  })

  it('applies a reward once and reports newly completed full synergies', () => {
    const build = createBuildState({
      augments: ['combo_starter', 'combo_finisher', 'split_blade'],
    })

    const result = applyReward(build, { kind: 'item', id: 'lucky_receipt' })

    expect(result.build.items).toEqual(['lucky_receipt'])
    expect(result.build.synergies.completed).toEqual(['combo_engine'])
    expect(result.events).toContainEqual({
      type: 'REWARD_ADDED',
      reward: { kind: 'item', id: 'lucky_receipt' },
    })
    expect(result.events).toContainEqual({
      type: 'SYNERGY_COMPLETED',
      synergyId: 'combo_engine',
    })
  })

  it('does not duplicate an already owned reward', () => {
    const build = createBuildState({
      augments: ['combo_starter'],
    })

    const result = applyReward(build, { kind: 'augment', id: 'combo_starter' })

    expect(result.build.augments).toEqual(['combo_starter'])
    expect(result.events).toEqual([
      {
        type: 'REWARD_ALREADY_OWNED',
        reward: { kind: 'augment', id: 'combo_starter' },
      },
    ])
  })

  it('resolves effects from owned rewards and completed synergies', () => {
    const catalog: BuildCatalog = {
      rewards: [
        {
          id: 'combo_starter',
          kind: 'augment',
          name: 'Combo Starter',
          rarity: 'common',
          tags: ['COMBO'],
          description: 'Starts combo.',
          effects: [
            {
              id: 'starter_damage',
              type: 'combat.action_amount.add_pct',
              params: { action: 'bullet', percent: 25 },
            },
          ],
        },
        {
          id: 'multi_hit_charm',
          kind: 'item',
          name: 'Multi-Hit Charm',
          rarity: 'uncommon',
          tags: ['MULTI_HIT'],
          description: 'Adds a hit.',
          effects: [
            {
              id: 'charm_extra_hit',
              type: 'combat.bullet.extra_hit',
              params: { percent: 50 },
            },
          ],
        },
      ],
      synergies: [
        {
          id: 'combo_engine',
          name: 'Combo Engine',
          description: 'Combo and multi-hit activate scaling.',
          requiredTags: [
            { tag: 'COMBO', count: 1, source: 'augment' },
            { tag: 'MULTI_HIT', count: 1, source: 'item' },
          ],
          effects: [
            {
              id: 'combo_curse_relief',
              type: 'combat.curse_gain.add',
              params: { amount: -1 },
            },
          ],
        },
      ],
    }
    const build = createBuildState({
      augments: ['combo_starter'],
      items: ['multi_hit_charm'],
    })

    const effects = getActiveEffects(build, catalog)

    expect(effects.map((effect) => effect.id)).toEqual([
      'starter_damage',
      'charm_extra_hit',
      'combo_curse_relief',
    ])
  })
})
