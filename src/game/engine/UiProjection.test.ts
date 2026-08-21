import { describe, expect, it } from 'vitest'
import { toUiSlotResult } from './UiProjection'

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
})
