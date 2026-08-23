import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../../game/data'
import type { SlotResult } from '../../types/game'
import { CombatSlotMachineView } from './CombatSlotMachineView'

describe('CombatSlotMachineView', () => {
  it('renders visible reel symbols before and after a spin result', () => {
    const onSpin = vi.fn()
    const onReroll = vi.fn()
    const onConfirm = vi.fn()

    const { rerender } = render(
      <CombatSlotMachineView
        currentResult={null}
        hasSpunThisTurn={false}
        isSpinning={false}
        lockedReels={new Set()}
        onConfirm={onConfirm}
        onReroll={onReroll}
        onSpin={onSpin}
        onToggleLock={() => undefined}
        reelIndexes={{ action: 0, target: 0, modifier: 0 }}
        reels={{ action: ACTION_SYMBOLS, target: TARGET_SYMBOLS, modifier: MODIFIER_SYMBOLS }}
      />,
    )

    expect(screen.getByText(ACTION_SYMBOLS[0].name)).toBeInTheDocument()
    expect(screen.getByText(TARGET_SYMBOLS[0].name)).toBeInTheDocument()
    expect(screen.getByText(MODIFIER_SYMBOLS[0].name)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '스핀' }))
    expect(onSpin).toHaveBeenCalledTimes(1)

    const result: SlotResult = {
      action: ACTION_SYMBOLS[1],
      target: TARGET_SYMBOLS[1],
      modifier: MODIFIER_SYMBOLS[1],
      isMiss: false,
      calculatedValue: 12,
      finalEffectText: '12 damage',
    }

    rerender(
      <CombatSlotMachineView
        currentResult={result}
        hasSpunThisTurn
        isSpinning={false}
        lockedReels={new Set()}
        onConfirm={onConfirm}
        onReroll={onReroll}
        onSpin={onSpin}
        onToggleLock={() => undefined}
        reelIndexes={{ action: 1, target: 1, modifier: 1 }}
        reels={{ action: ACTION_SYMBOLS, target: TARGET_SYMBOLS, modifier: MODIFIER_SYMBOLS }}
      />,
    )

    expect(screen.getByText(ACTION_SYMBOLS[1].name)).toBeInTheDocument()
    expect(screen.getByText(TARGET_SYMBOLS[1].name)).toBeInTheDocument()
    expect(screen.getByText(MODIFIER_SYMBOLS[1].name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /확정/ })).toBeEnabled()
  })
})
