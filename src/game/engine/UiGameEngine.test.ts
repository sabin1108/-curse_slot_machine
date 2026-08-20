import { describe, expect, it } from 'vitest'
import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../data'
import { GameEngine } from './UiGameEngine'

describe('UiGameEngine', () => {
  it('projects structured combo combat effects into UI-visible state', () => {
    const engine = new GameEngine('combo-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'combo-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'multi_hit_charm' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_finisher' })

    const state = engine.getState()
    state.currentResult = {
      action: ACTION_SYMBOLS.find((symbol) => symbol.id === 'bullet')!,
      target: TARGET_SYMBOLS.find((symbol) => symbol.id === 'pow_6')!,
      modifier: MODIFIER_SYMBOLS.find((symbol) => symbol.id === 'x1')!,
      isMiss: false,
      calculatedValue: 6,
      finalEffectText: 'bullet enemy x1',
    }

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBe(9)
    expect(resolvedState.build.activeSynergies).toContain('Combo Engine')
  })

  it('projects structured victory rewards into the UI reward modal state', () => {
    const engine = new GameEngine('reward-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'reward-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })

    const state = engine.getState()
    state.currentResult = {
      action: ACTION_SYMBOLS.find((symbol) => symbol.id === 'bullet')!,
      target: TARGET_SYMBOLS.find((symbol) => symbol.id === 'pow_6')!,
      modifier: MODIFIER_SYMBOLS.find((symbol) => symbol.id === 'x3')!,
      isMiss: false,
      calculatedValue: 18,
      finalEffectText: 'lethal bullet enemy x3',
    }

    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(rewardState.screen).toBe('REWARD')
    expect(rewardState.rewardCandidates).toHaveLength(3)
    expect(rewardState.augSlotPresentation?.reels).toEqual([
      expect.any(String),
      expect.any(String),
      expect.any(String),
    ])
    expect(rewardState.augSlotPresentation?.targetAugment?.id).toBe(rewardState.rewardCandidates[0].id)
  })
})
