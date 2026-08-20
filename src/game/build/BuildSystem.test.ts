import { describe, expect, it } from 'vitest'

import { applyReward, createBuildState, evaluateSynergies, getActiveEffects } from './BuildSystem'
import type { BuildCatalog } from './BuildTypes'

describe('BuildSystem', () => {
  it('tracks multi-requirement synergy progress across augments and items', () => {
    const build = createBuildState({
      augments: ['combo_starter', 'combo_finisher'],
      items: ['multi_hit_charm'],
    })

    const result = evaluateSynergies(build)

    expect(result.completed).toEqual(['combo_engine'])
    expect(result.progress).toContainEqual({
      synergyId: 'combo_engine',
      current: 3,
      required: 3,
      completed: true,
    })
    expect(result.active).toContainEqual({
      synergyId: 'combo_engine',
      name: 'Combo Engine',
      effectId: 'combo_damage_bonus',
    })
  })

  it('applies an augment reward once and reports newly completed synergies', () => {
    const build = createBuildState({
      augments: ['combo_starter'],
      items: ['multi_hit_charm'],
    })

    const result = applyReward(build, { kind: 'augment', id: 'combo_finisher' })

    expect(result.build.augments).toEqual(['combo_starter', 'combo_finisher'])
    expect(result.build.synergies.completed).toEqual(['combo_engine'])
    expect(result.events).toContainEqual({
      type: 'REWARD_ADDED',
      reward: { kind: 'augment', id: 'combo_finisher' },
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
