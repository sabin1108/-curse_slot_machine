import { describe, expect, it } from 'vitest'

import { createBuildState } from './BuildSystem'
import { generateRewardOptions } from './RewardSystem'

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
})
