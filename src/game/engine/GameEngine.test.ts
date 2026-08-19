import { describe, expect, it } from 'vitest'
import { GameEngine } from './GameEngine'
import { createInitialGameState } from './GameState'
import { createSeededRng } from './rng'

describe('createSeededRng', () => {
  it('produces the same random sequence for the same seed', () => {
    const a = createSeededRng('table-13')
    const b = createSeededRng('table-13')

    expect([a.next(), a.next(), a.nextInt(10)]).toEqual([
      b.next(),
      b.next(),
      b.nextInt(10),
    ])
  })
})

describe('GameEngine', () => {
  it('produces the same events and state for the same seed and commands', () => {
    const commands = [{ type: 'START_RUN' }, { type: 'ADVANCE_TURN' }] as const
    const first = new GameEngine('lucky-curse')
    const second = new GameEngine('lucky-curse')

    const firstEvents = commands.flatMap((command) => first.dispatch(command))
    const secondEvents = commands.flatMap((command) => second.dispatch(command))

    expect(firstEvents).toEqual(secondEvents)
    expect(first.getState()).toEqual(second.getState())
    expect(first.getState()).toMatchObject({
      phase: 'battle',
      turn: 1,
      log: expect.arrayContaining([expect.any(Number)]),
    })
  })

  it('resolves a confirmed combat slot result into combat state', () => {
    const engine = new GameEngine('combat-table')
    const slotResult = {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x2',
    } as const

    engine.dispatch({ type: 'START_RUN' })
    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: slotResult,
    })

    expect(events).toEqual([
      {
        type: 'COMBAT_SLOT_RESOLVED',
        turn: 1,
        result: slotResult,
        outcome: 'ongoing',
        combatEvents: expect.arrayContaining([
          expect.objectContaining({ type: 'DAMAGE_APPLIED', target: 'enemy' }),
          expect.objectContaining({ type: 'ENEMY_ATTACKED' }),
          expect.objectContaining({ type: 'CURSE_INCREASED', value: 1 }),
        ]),
      },
    ])
    expect(engine.getState()).toMatchObject({
      phase: 'battle',
      turn: 1,
      combat: {
        player: {
          health: 26,
        },
        enemy: {
          health: 6,
        },
        curse: {
          value: 1,
        },
        lastSlotResult: slotResult,
      },
    })
  })
})

describe('createInitialGameState', () => {
  it('starts idle at turn zero and preserves the seed', () => {
    const state = createInitialGameState('casino-floor')

    expect(state.seed).toBe('casino-floor')
    expect(state.phase).toBe('idle')
    expect(state.turn).toBe(0)
    expect(state.log).toEqual([])
    expect(state.combat).toMatchObject({
      player: {
        health: 30,
      },
      enemy: {
        health: 18,
      },
      curse: {
        value: 0,
      },
    })
  })
})
