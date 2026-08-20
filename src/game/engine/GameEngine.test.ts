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

  it('generates build rewards after combat victory and applies the chosen reward', () => {
    const engine = new GameEngine('reward-table')

    engine.dispatch({ type: 'START_RUN' })
    const victoryEvents = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x3',
      },
    })

    expect(victoryEvents).toEqual([
      expect.objectContaining({
        type: 'COMBAT_SLOT_RESOLVED',
        outcome: 'victory',
      }),
      expect.objectContaining({
        type: 'REWARDS_GENERATED',
        options: expect.arrayContaining([
          expect.objectContaining({ kind: 'augment', id: expect.any(String) }),
        ]),
        augmentSlot: expect.objectContaining({
          reels: [
            expect.objectContaining({ id: 'primary-tag' }),
            expect.objectContaining({ id: 'rarity' }),
            expect.objectContaining({ id: 'reward-name' }),
          ],
          targetReward: expect.objectContaining({ id: expect.any(String) }),
          isRevealed: false,
        }),
      }),
    ])
    const rewardState = engine.getState().rewards
    expect(rewardState.augmentSlot?.targetReward).toEqual(rewardState.options[0])
    expect(engine.getState()).toMatchObject({
      phase: 'reward',
      rewards: {
        options: expect.arrayContaining([
          expect.objectContaining({ kind: 'augment', id: expect.any(String) }),
        ]),
        augmentSlot: expect.objectContaining({
          targetReward: expect.objectContaining({ id: expect.any(String) }),
          isRevealed: false,
        }),
      },
    })

    const reward = engine.getState().rewards.options[0]
    const rewardEvents = engine.dispatch({
      type: 'CHOOSE_REWARD',
      reward: {
        kind: reward.kind,
        id: reward.id,
      },
    })

    expect(rewardEvents).toEqual([
      expect.objectContaining({
        type: 'REWARD_CHOSEN',
        reward: {
          kind: reward.kind,
          id: reward.id,
        },
      }),
    ])
    expect(engine.getState().build[`${reward.kind}s`]).toContain(reward.id)
    expect(engine.getState().phase).toBe('battle')
    expect(engine.getState().rewards.options).toEqual([])
    expect(engine.getState().rewards.augmentSlot).toBeNull()
  })

  it('passes completed build synergy effects into combat resolution', () => {
    const engine = new GameEngine('combo-effects')

    engine.dispatch({ type: 'START_RUN' })
    engine.dispatch({ type: 'CHOOSE_REWARD', reward: { kind: 'augment', id: 'combo_starter' } })
    engine.dispatch({ type: 'CHOOSE_REWARD', reward: { kind: 'item', id: 'multi_hit_charm' } })
    engine.dispatch({ type: 'CHOOSE_REWARD', reward: { kind: 'augment', id: 'combo_finisher' } })

    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
    })

    expect(engine.getState().combat.enemy.health).toBe(9)
    expect(events).toEqual([
      expect.objectContaining({
        type: 'COMBAT_SLOT_RESOLVED',
        combatEvents: expect.arrayContaining([
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 6 }),
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 3 }),
        ]),
      }),
    ])
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
    expect(state.build).toMatchObject({
      augments: [],
      items: [],
      synergies: {
        active: [],
        completed: [],
      },
    })
    expect(state.rewards.options).toEqual([])
  })
})
