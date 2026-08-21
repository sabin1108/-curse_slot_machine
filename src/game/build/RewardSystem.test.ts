import { describe, expect, it } from 'vitest'

import { createBuildState } from './BuildSystem'
import { generateRewardOptions } from './RewardSystem'
import type { BuildCatalog } from './BuildTypes'

describe('RewardSystem', () => {
  it('excludes owned rewards and prioritizes synergy completion', () => {
    const build = createBuildState({
      augments: ['combo_starter'],
      items: ['multi_hit_charm'],
    })

    const options = generateRewardOptions(build, { count: 3 })

    expect(options).toHaveLength(3)
    expect(options.map((option) => option.id)).not.toContain('combo_starter')
    expect(options[0].score).toMatchObject({
      completionValue: expect.any(Number),
    })
    expect(options[0].score.completionValue).toBeGreaterThan(0)
  })

  it('returns deterministic unique options when no synergy is close to completion', () => {
    const first = generateRewardOptions(createBuildState(), { count: 3 })
    const second = generateRewardOptions(createBuildState(), { count: 3 })

    expect(first).toEqual(second)
    expect(new Set(first.map((option) => `${option.kind}:${option.id}`)).size).toBe(first.length)
  })

  it('applies bounded reward.score.add effects as separate content value', () => {
    const catalog: BuildCatalog = {
      rewards: [
        {
          id: 'authored_common', kind: 'item', name: 'Authored Common', rarity: 'common', tags: ['RESOURCE'],
          description: 'Content-scored option.',
          effects: [{ id: 'authored_score', type: 'reward.score.add', params: { amount: 10 } }],
        },
        {
          id: 'plain_legendary', kind: 'item', name: 'Plain Legendary', rarity: 'legendary', tags: [],
          description: 'Rarity-only option.',
        },
      ],
      synergies: [],
    }

    const options = generateRewardOptions(createBuildState(), { count: 2, catalog })
    expect(options[0].id).toBe('authored_common')
    expect(options[0].score.contentValue).toBe(10)
  })
})
