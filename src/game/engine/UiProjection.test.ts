import { describe, expect, it } from 'vitest'
import { toUiEnemyIntent, toUiSlotResult } from './UiProjection'

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
      calculatedValue: 10,
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

  it('projects wait and defense intents into the existing enemy intent UI shape', () => {
    expect(toUiEnemyIntent({ type: 'wait', baseAmount: 7, amount: 0 })).toEqual({
      id: 'wait',
      name: '\uC228 \uACE0\uB974\uAE30',
      type: 'WAIT',
      value: 0,
      icon: '\u{1F4A4}',
      description: '\uC774\uBC88 \uD134\uC5D0\uB294 \uACF5\uACA9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
    })
    expect(toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 1 })).toEqual({
      id: 'defend',
      name: '\uBC29\uC5B4 \uD0DC\uC138',
      type: 'DEFEND',
      value: 1,
      icon: '\u{1F6E1}\uFE0F',
      description: '\uBC29\uC5B4\uB97C 1 \uC5BB\uC2B5\uB2C8\uB2E4. (\uC0C1\uD55C 2)',
    })
  })
})
