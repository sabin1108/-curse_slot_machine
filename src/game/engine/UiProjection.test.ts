import { describe, expect, it } from 'vitest'

import { toUiEnemyIntent, toUiReward } from './UiProjection'

const emptyScore = {
  immediatePower: 0,
  synergyValue: 0,
  completionValue: 0,
  futureValue: 0,
  contentValue: 0,
  total: 0,
}

describe('UiProjection enemy intent', () => {
  it('projects attack damage', () => {
    expect(toUiEnemyIntent({ type: 'attack', baseAmount: 7, amount: 8 })).toMatchObject({
      id: 'attack',
      type: 'ATTACK',
      value: 8,
    })
  })

  it('projects a harmless wait', () => {
    expect(toUiEnemyIntent({ type: 'wait', baseAmount: 7, amount: 0 })).toMatchObject({
      id: 'wait',
      type: 'WAIT',
      value: 0,
    })
  })

  it('projects a low defense intent', () => {
    expect(toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 1 })).toMatchObject({
      id: 'defend',
      type: 'DEFEND',
      value: 1,
    })
  })

  it('projects defense intent descriptions from the intent amount', () => {
    const intent = toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 2 })

    expect(intent.description).toContain('2')
    expect(intent.description).not.toContain('1 ')
  })
})

describe('UiProjection reward cards', () => {
  it('projects items with explicit item kind and item label fields', () => {
    expect(toUiReward({
      id: 'multi_hit_charm',
      kind: 'item',
      name: 'Multi-Hit Charm',
      rarity: 'uncommon',
      tags: ['MULTI_HIT'],
      description: 'Bullets add a 35% extra hit.',
      effectLabel: 'Bullets add a 35% extra hit.',
      score: emptyScore,
    })).toMatchObject({
      id: 'multi_hit_charm',
      kind: 'item',
      icon: 'ITEM',
      effectValue: 'Bullets add a 35% extra hit.',
    })
  })

  it('projects augments with explicit augment kind', () => {
    expect(toUiReward({
      id: 'combo_starter',
      kind: 'augment',
      name: 'Combo Starter',
      rarity: 'common',
      tags: ['COMBO'],
      description: 'Locked bullets apply Primer.',
      effectLabel: 'Locked bullets apply Primer.',
      score: emptyScore,
    })).toMatchObject({
      id: 'combo_starter',
      kind: 'augment',
      icon: 'AUG',
    })
  })
})
