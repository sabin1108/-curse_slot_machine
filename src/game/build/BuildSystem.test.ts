import { describe, expect, it } from 'vitest'

import { applyReward, createBuildState, evaluateSynergies } from './BuildSystem'

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
})
