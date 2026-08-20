import { describe, expect, it } from 'vitest'
import { GameEngine } from './UiGameEngine'

describe('UiGameEngine', () => {
  it('projects pure combat slot spins into UI current result', () => {
    const engine = new GameEngine('slot-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui' })
    const state = engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    expect(state.hasSpunThisTurn).toBe(true)
    expect(state.currentResult).toMatchObject({
      action: { id: 'bullet' },
      target: { type: 'ENEMY' },
      modifier: { id: 'x2' },
      calculatedValue: 12,
    })
  })

  it('rerolls unlocked pure combat slot reels and applies pure lock curse cost', () => {
    const engine = new GameEngine('slot-ui-2')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui-2' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    engine.dispatch({ type: 'TOGGLE_LOCK_REEL', reelId: 'action' })
    const state = engine.dispatch({ type: 'REROLL_UNLOCKED' })

    expect(state.curse.current).toBe(2)
    expect(state.currentResult).toMatchObject({
      action: { id: 'shield' },
      target: { type: 'SELF' },
      modifier: { id: 'x3' },
      calculatedValue: 15,
    })
  })

  it('projects structured combo combat effects into UI-visible state', () => {
    const engine = new GameEngine('structured-spin-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'structured-spin-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'multi_hit_charm' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_finisher' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBe(9)
    expect(resolvedState.build.activeSynergies).toContain('Combo Engine')
  })

  it('projects structured victory rewards into the UI reward modal state', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

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

  it('confirms the adapter-owned pure slot result even if UI currentResult is mutated', () => {
    const engine = new GameEngine('slot-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    const spunState = engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    spunState.currentResult = {
      ...spunState.currentResult!,
      action: spunState.reels.action.find((symbol) => symbol.id === 'heart')!,
      calculatedValue: 0,
      finalEffectText: 'mutated presentation result',
    }

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBe(6)
  })
})
