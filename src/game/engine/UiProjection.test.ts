import { describe, expect, it } from 'vitest'
import { toUiReward, toUiSlotResult } from './UiProjection'

describe('UiProjection', () => {
  it('projects bullet enemy x2 slot results into legacy UI slot result shape', () => {
    const result = toUiSlotResult({
      action: 'bullet',
      target: 'enemy',
      modifier: 'x2',
    })

    expect(result).toMatchObject({
      action: { id: 'bullet' },
      target: { type: 'ENEMY' },
      modifier: { id: 'x2' },
      isMiss: false,
      calculatedValue: 12,
    })
  })

  it('projects shield self x3 slot results into legacy UI slot result shape', () => {
    const result = toUiSlotResult({
      action: 'shield',
      target: 'self',
      modifier: 'x3',
    })

    expect(result).toMatchObject({
      action: { id: 'shield' },
      target: { type: 'SELF' },
      modifier: { id: 'x3' },
      isMiss: false,
      calculatedValue: 15,
    })
  })

  it('projects structured item rewards with an item discriminator and label', () => {
    const reward = toUiReward({
      kind: 'item',
      id: 'multi_hit_charm',
      name: 'Multi-Hit Charm',
      rarity: 'uncommon',
      tags: ['MULTI_HIT'],
      description: 'Adds multi-hit support.',
      score: {
        immediatePower: 2,
        synergyValue: 10,
        completionValue: 0,
        futureValue: 2,
        total: 14,
      },
    })

    expect(reward).toMatchObject({
      id: 'multi_hit_charm',
      kind: 'item',
      kindLabel: '아이템',
      icon: 'ITEM',
      effectValue: 'score 14',
    })
  })

  it('projects structured augment rewards with an augment discriminator and label', () => {
    const reward = toUiReward({
      kind: 'augment',
      id: 'combo_starter',
      name: 'Combo Starter',
      rarity: 'common',
      tags: ['COMBO'],
      description: 'Starts a combo-oriented build.',
      score: {
        immediatePower: 1,
        synergyValue: 12,
        completionValue: 0,
        futureValue: 2,
        total: 15,
      },
    })

    expect(reward).toMatchObject({
      id: 'combo_starter',
      kind: 'augment',
      kindLabel: '증강',
      icon: 'AUG',
      effectValue: 'score 15',
    })
  })
})
