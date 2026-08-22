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

  it('applies conditional reward score effects from current reward facts and active synergies', () => {
    const catalog: BuildCatalog = {
      rewards: [
        {
          id: 'owned_combo',
          kind: 'augment',
          name: 'Owned Combo',
          rarity: 'common',
          tags: ['COMBO'],
          description: 'Activates the combo line.',
        },
        {
          id: 'matching_item',
          kind: 'item',
          name: 'Matching Item',
          rarity: 'rare',
          tags: ['RESOURCE'],
          description: 'Matches authored score conditions.',
          effects: [{
            id: 'active_combo_item_score',
            type: 'reward.score.add',
            params: { amount: 25 },
            conditions: [
              { type: 'reward.kind_is', params: { kind: 'item' } },
              { type: 'reward.rarity_is', params: { rarity: 'rare' } },
              { type: 'reward.has_tag', params: { tag: 'RESOURCE' } },
              { type: 'build.synergy_active', params: { synergyId: 'combo_ready' } },
            ],
          }],
        },
        {
          id: 'plain_item',
          kind: 'item',
          name: 'Plain Item',
          rarity: 'rare',
          tags: ['RESOURCE'],
          description: 'Has no content score.',
        },
      ],
      synergies: [{
        id: 'combo_ready',
        name: 'Combo Ready',
        description: 'Already active before the candidate reward is scored.',
        requiredTags: [{ tag: 'COMBO', count: 1, source: 'augment' }],
      }],
    }
    const build = createBuildState({ augments: ['owned_combo'] }, catalog)

    const options = generateRewardOptions(build, { count: 2, catalog })

    expect(options.map((option) => [option.id, option.score.contentValue])).toEqual([
      ['matching_item', 25],
      ['plain_item', 0],
    ])
  })

  it('does not score a reward from synergies activated by that same candidate', () => {
    const catalog: BuildCatalog = {
      rewards: [
        {
          id: 'combo_candidate',
          kind: 'augment',
          name: 'Combo Candidate',
          rarity: 'common',
          tags: ['COMBO'],
          description: 'Would complete the combo line if picked.',
          effects: [{
            id: 'post_pick_combo_score',
            type: 'reward.score.add',
            params: { amount: 30 },
            conditions: [{ type: 'build.synergy_active', params: { synergyId: 'combo_ready' } }],
          }],
        },
        {
          id: 'plain_item',
          kind: 'item',
          name: 'Plain Item',
          rarity: 'common',
          tags: [],
          description: 'Baseline option.',
        },
      ],
      synergies: [{
        id: 'combo_ready',
        name: 'Combo Ready',
        description: 'Candidate reward can complete this, but it is not active before the pick.',
        requiredTags: [{ tag: 'COMBO', count: 1, source: 'augment' }],
      }],
    }

    const options = generateRewardOptions(createBuildState({}, catalog), { count: 2, catalog })

    expect(options.find((option) => option.id === 'combo_candidate')?.score.contentValue).toBe(0)
  })
})
