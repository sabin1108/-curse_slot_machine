import { describe, expect, it } from 'vitest'

import { toUiEnemyIntent } from './UiProjection'

describe('UiProjection enemy intent', () => {
  it('projects attack damage', () => {
    expect(toUiEnemyIntent({ type: 'attack', baseAmount: 7, amount: 8 })).toMatchObject({
      id: 'attack',
      type: 'ATTACK',
      value: 8,
      name: '예고된 공격',
    })
  })

  it('projects a harmless wait with clear Korean copy', () => {
    expect(toUiEnemyIntent({ type: 'wait', baseAmount: 7, amount: 0 })).toEqual({
      id: 'wait',
      name: '숨 고르기',
      type: 'WAIT',
      value: 0,
      icon: '💤',
      description: '이번 턴에는 공격하지 않습니다.',
    })
  })

  it('projects a low defense intent', () => {
    expect(toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 1 })).toEqual({
      id: 'defend',
      name: '방어 태세',
      type: 'DEFEND',
      value: 1,
      icon: '🛡️',
      description: '방어를 최대 1 얻습니다. (상한 2)',
    })
  })
})
