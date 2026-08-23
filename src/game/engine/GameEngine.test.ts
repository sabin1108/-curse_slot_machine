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
          expect.objectContaining({ type: 'CURSE_INCREASED', value: 0 }),
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
          value: 0,
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

    expect(engine.getState().combat.enemy.health).toBe(8)
    expect(events).toEqual([
      expect.objectContaining({
        type: 'COMBAT_SLOT_RESOLVED',
        combatEvents: expect.arrayContaining([
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 8 }),
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 2 }),
        ]),
      }),
    ])
  })

  it('generates deterministic random event rewards with event source', () => {
    const first = new GameEngine('event-reward-random')
    const second = new GameEngine('event-reward-random')
    const differentSeed = new GameEngine('event-reward-random-alt')
    first.dispatch({ type: 'START_RUN' })
    second.dispatch({ type: 'START_RUN' })
    differentSeed.dispatch({ type: 'START_RUN' })

    const firstEvents = first.dispatch({ type: 'GENERATE_EVENT_REWARDS' })
    const secondEvents = second.dispatch({ type: 'GENERATE_EVENT_REWARDS' })
    differentSeed.dispatch({ type: 'GENERATE_EVENT_REWARDS' })

    expect(firstEvents).toEqual(secondEvents)
    expect(first.getState()).toEqual(second.getState())
    expect(first.getState().phase).toBe('reward')
    expect(first.getState().rewards.source).toBe('event')
    expect(first.getState().rewards.options).toHaveLength(3)
    expect(new Set(first.getState().rewards.options.map((option) => option.id)).size).toBe(3)
    expect(differentSeed.getState().rewards.options.map((option) => option.id))
      .not.toEqual(first.getState().rewards.options.map((option) => option.id))
  })

  it('applies a shop reward without consuming pending combat or event rewards', () => {
    const engine = new GameEngine('shop-preserves-reward')
    engine.dispatch({ type: 'START_RUN' })
    engine.dispatch({ type: 'GENERATE_EVENT_REWARDS' })
    const pendingRewards = structuredClone(engine.getState().rewards)

    const events = engine.dispatch({
      type: 'APPLY_SHOP_REWARD',
      reward: { kind: 'item', id: 'multi_hit_charm' },
    })

    expect(events).toEqual([
      expect.objectContaining({
        type: 'SHOP_REWARD_APPLIED',
        reward: { kind: 'item', id: 'multi_hit_charm' },
        added: true,
      }),
    ])
    expect(engine.getState().build.items).toContain('multi_hit_charm')
    expect(engine.getState().phase).toBe('reward')
    expect(engine.getState().rewards).toEqual(pendingRewards)
  })

  it('reports duplicate shop rewards without mutating build or pending rewards', () => {
    const engine = new GameEngine('shop-duplicate')
    engine.dispatch({ type: 'START_RUN' })
    engine.dispatch({ type: 'APPLY_SHOP_REWARD', reward: { kind: 'item', id: 'multi_hit_charm' } })
    engine.dispatch({ type: 'GENERATE_EVENT_REWARDS' })
    const before = engine.getState()

    const events = engine.dispatch({
      type: 'APPLY_SHOP_REWARD',
      reward: { kind: 'item', id: 'multi_hit_charm' },
    })

    expect(events).toEqual([
      expect.objectContaining({ type: 'SHOP_REWARD_APPLIED', added: false }),
    ])
    expect(engine.getState()).toEqual(before)
  })

  it('selects enemy intent profiles from presentation enemy identity', () => {
    const engine = new GameEngine('enemy-profile-sync')
    const player = { hp: 30, maxHp: 30, shield: 0, gold: 0 }
    const createEnemy = (id: string, name: string) => ({
      id,
      name,
      hp: 100,
      maxHp: 100,
      shield: 0,
      statuses: [],
      intent: {
        id: 'attack',
        name: 'Attack',
        type: 'ATTACK' as const,
        value: 10,
        icon: '',
        description: '',
      },
    })

    engine.syncCombatFromPresentation(player, createEnemy('ogre_chief', 'Stage 6: Ogre'), 0)
    expect(engine.getState().combat.enemyBehavior).toMatchObject({
      rank: 'elite',
      defenseAmount: 2,
      blockCap: 50,
      patternIndex: 0,
    })

    engine.syncCombatFromPresentation(player, createEnemy('house_dealer_boss', 'Stage 15: Dealer'), 0)
    expect(engine.getState().combat.enemyBehavior).toMatchObject({
      rank: 'boss',
      defenseAmount: 3,
      blockCap: 80,
      patternIndex: 0,
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
