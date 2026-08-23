import { describe, expect, it } from 'vitest'

import { createBuildState } from './BuildSystem'
import { generateRandomRewardOptions, generateRewardOptions } from './RewardSystem'

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

  it('samples event rewards without enforcing an augment or item quota', () => {
    const catalog = {
      rewards: [
        { id: 'aug_a', kind: 'augment' as const, name: 'A', rarity: 'common' as const, tags: [], description: 'A' },
        { id: 'aug_b', kind: 'augment' as const, name: 'B', rarity: 'common' as const, tags: [], description: 'B' },
        { id: 'aug_c', kind: 'augment' as const, name: 'C', rarity: 'common' as const, tags: [], description: 'C' },
        { id: 'item_a', kind: 'item' as const, name: 'Item', rarity: 'common' as const, tags: [], description: 'Item' },
      ],
      synergies: [],
    }

    const options = generateRandomRewardOptions(createBuildState(), () => 0, { catalog, count: 3 })

    expect(options.map((option) => option.kind)).toEqual(['augment', 'augment', 'augment'])
    expect(new Set(options.map((option) => option.id)).size).toBe(3)
  })
})
