import { describe, expect, it } from 'vitest'

import { GameEngine } from './GameEngine'
import type { OriginId } from './OriginCatalog'

const PRESETS = [
  { originId: 'SWORDSMAN', health: 32, gold: 150, block: 3, rewardId: 'combo_starter' },
  { originId: 'GAMBLER', health: 26, gold: 200, block: 0, rewardId: 'hexed_clutch' },
  { originId: 'PRIEST', health: 36, gold: 160, block: 5, rewardId: 'guard_core' },
] as const

describe('canonical origin contracts', () => {
  it('requires an idle origin selection before a run starts', () => {
    const engine = new GameEngine('origin-selection')
    const initial = engine.getState()

    expect(engine.dispatch({ type: 'START_RUN' })).toEqual([
      { type: 'COMMAND_REJECTED', command: 'START_RUN', reason: 'an origin must be selected before starting a run' },
    ])
    expect(engine.getState()).toEqual(initial)
    expect(engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'SWORDSMAN' })).toEqual([
      { type: 'ORIGIN_SELECTED', originId: 'SWORDSMAN' },
    ])
    engine.dispatch({ type: 'START_RUN' })
    expect(engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'PRIEST' })).toEqual([
      { type: 'COMMAND_REJECTED', command: 'SELECT_ORIGIN', reason: 'an origin can only be selected while idle' },
    ])
  })

  it.each(PRESETS)('applies the $originId preset and starting reward exactly once', (preset) => {
    const engine = startRun(`origin-${preset.originId}`, preset.originId)
    const state = engine.getState()

    expect(state).toMatchObject({
      selectedOrigin: preset.originId,
      economy: { gold: preset.gold },
      combat: { player: { health: preset.health, maxHealth: preset.health, block: preset.block } },
    })
    expect([...state.build.augments, ...state.build.items]).toEqual([preset.rewardId])
  })

  it('preserves initial block through stage one entry and clears it at the next combat', () => {
    const engine = startRun('initial-block', 'SWORDSMAN')
    expect(engine.getState().combat.player.block).toBe(3)

    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(engine.getState().combat.player.block).toBe(3)
    engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })
    chooseFirstReward(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(engine.getState().combat.player.block).toBe(0)
  })

  it('derives the swordsman bonus strike from engine origin state', () => {
    const engine = startRun('swordsman-trait', 'SWORDSMAN')
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })

    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })

    expect(events).toContainEqual({
      type: 'ORIGIN_TRAIT_TRIGGERED', originId: 'SWORDSMAN', effect: 'bonus_strike', amount: 9,
    })
  })

  it('grants one free reroll per gambler combat and pays the x3 jackpot', () => {
    const engine = startRun('gambler-trait', 'GAMBLER')
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    engine.dispatch({ type: 'TOGGLE_REEL_LOCK', reel: 'action' })

    const curseBefore = engine.getState().combat.curse.value
    expect(engine.dispatch({ type: 'REROLL_UNLOCKED' })).toContainEqual({
      type: 'ORIGIN_TRAIT_TRIGGERED', originId: 'GAMBLER', effect: 'free_reroll', amount: 2,
    })
    expect(engine.getState().combat.curse.value).toBe(curseBefore)
    engine.dispatch({ type: 'REROLL_UNLOCKED' })
    expect(engine.getState().combat.curse.value).toBe(curseBefore + 2)

    const goldBefore = engine.getState().economy.gold
    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })
    expect(engine.getState().economy.gold).toBe(goldBefore + 25)
    expect(events).toContainEqual({
      type: 'ORIGIN_TRAIT_TRIGGERED', originId: 'GAMBLER', effect: 'jackpot', amount: 25,
    })
  })

  it('purifies one point of baseline curse on priest shield and heart confirmations', () => {
    for (const action of ['shield', 'heart'] as const) {
      const engine = startRun(`priest-${action}`, 'PRIEST')
      engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
      const events = engine.dispatch({
        type: 'RESOLVE_COMBAT_SLOT',
        result: { action, target: 'self', modifier: 'x1' },
      })

      expect(engine.getState().combat.curse.value).toBe(0)
      expect(events).toContainEqual({
        type: 'ORIGIN_TRAIT_TRIGGERED', originId: 'PRIEST', effect: 'purify', amount: 1,
      })
    }
  })
})

function startRun(seed: string, originId: OriginId): GameEngine {
  const engine = new GameEngine(seed)
  engine.dispatch({ type: 'SELECT_ORIGIN', originId })
  engine.dispatch({ type: 'START_RUN' })
  return engine
}

function chooseFirstReward(engine: GameEngine): void {
  const reward = engine.getState().rewards.options[0]
  if (reward) engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: reward.id })
}
