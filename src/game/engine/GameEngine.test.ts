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
    const commands = [
      { type: 'SELECT_ORIGIN', originId: 'SWORDSMAN' },
      { type: 'START_RUN' },
      { type: 'ENTER_NEXT_STAGE' },
      { type: 'SPIN_COMBAT_SLOT' },
    ] as const
    const first = new GameEngine('lucky-curse')
    const second = new GameEngine('lucky-curse')

    const firstEvents = commands.flatMap((command) => first.dispatch(command))
    const secondEvents = commands.flatMap((command) => second.dispatch(command))

    expect(firstEvents).toEqual(secondEvents)
    expect(first.getState()).toEqual(second.getState())
    expect(first.getState()).toMatchObject({
      phase: 'battle',
      turn: 0,
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

    startRun(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
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
          health: 31,
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

    startRun(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    const victoryEvents = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x3',
      },
    })

    expect(victoryEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'COMBAT_SLOT_RESOLVED',
        outcome: 'victory',
      }),
      expect.objectContaining({
        type: 'STAGE_COMPLETED',
        stage: expect.objectContaining({ id: 1, type: 'combat' }),
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
    ]))
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
      rewardId: reward.id,
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
    expect(engine.getState().phase).toBe('map')
    expect(engine.getState().rewards.options).toEqual([])
    expect(engine.getState().rewards.augmentSlot).toBeNull()
  })

  it('passes active MVP build effects into combat resolution', () => {
    const engine = new GameEngine('combo-effects', {
      startingRewards: [
        { kind: 'augment', id: 'combo_starter' },
        { kind: 'item', id: 'multi_hit_charm' },
        { kind: 'augment', id: 'combo_finisher' },
      ],
    })

    startRun(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })

    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
    })

    expect(engine.getState().combat.enemy.health).toBe(10)
    expect(events).toEqual([
      expect.objectContaining({
        type: 'COMBAT_SLOT_RESOLVED',
        combatEvents: expect.arrayContaining([
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 6 }),
          expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 2 }),
        ]),
      }),
    ])
  })

  it('routes the fixed run through battle and non-combat stages', () => {
    const engine = new GameEngine('mvp-route')

    startRun(engine)
    expect(engine.getState().phase).toBe('map')

    const firstStageEvents = engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(firstStageEvents).toContainEqual(
      expect.objectContaining({ type: 'STAGE_ENTERED', stage: expect.objectContaining({ id: 1, type: 'combat' }) }),
    )
    expect(engine.getState()).toMatchObject({ phase: 'battle', run: { currentStage: { id: 1 } } })
  })

  it('rejects combat resolution outside an active battle without mutating state', () => {
    const engine = new GameEngine('phase-guard')
    startRun(engine)
    const before = engine.getState()

    const events = engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })

    expect(events).toEqual([
      expect.objectContaining({ type: 'COMMAND_REJECTED', command: 'RESOLVE_COMBAT_SLOT' }),
    ])
    expect(engine.getState()).toEqual(before)
  })

  it('rejects rewards that were not offered by the active reward phase', () => {
    const engine = new GameEngine('reward-guard')
    startRun(engine)
    const before = engine.getState()

    const events = engine.dispatch({
      type: 'CHOOSE_REWARD',
      rewardId: 'not-an-active-offer',
    })

    expect(events).toEqual([
      expect.objectContaining({ type: 'COMMAND_REJECTED', command: 'CHOOSE_REWARD' }),
    ])
    expect(engine.getState()).toEqual(before)
  })

  it('carries player health and curse into the next combat while scaling elite encounters', () => {
    const engine = new GameEngine('persistent-run-state')
    startRun(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x1' },
    })
    const carried = engine.getState().combat
    engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })
    const reward = engine.getState().rewards.options[0]
    engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: reward.id })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })

    expect(engine.getState().combat.player.health).toBe(carried.player.health)
    expect(engine.getState().combat.curse.value).toBe(carried.curse.value + 1)

    engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })
    const secondReward = engine.getState().rewards.options[0]
    engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: secondReward.id })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'RESOLVE_REST', action: 'heal' })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'LEAVE_SHOP' })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({
      type: 'RESOLVE_COMBAT_SLOT',
      result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
    })
    const thirdReward = engine.getState().rewards.options[0]
    engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: thirdReward.id })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'RESOLVE_EVENT', choice: 'gold' })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })

    expect(engine.getState().combat.enemy.maxHealth).toBe(24)
    expect(engine.getState().combat.enemyIntent.amount).toBe(5)
  })

  it('owns deterministic spin, lock, reroll, curse cost, and confirmation state', () => {
    const first = new GameEngine('canonical-slot')
    const second = new GameEngine('canonical-slot')
    for (const engine of [first, second]) {
      startRun(engine)
      engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    }

    first.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    second.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    expect(first.getState().slot.current).toEqual(second.getState().slot.current)

    const lockedAction = first.getState().slot.current?.action
    first.dispatch({ type: 'TOGGLE_REEL_LOCK', reel: 'action' })
    const curseBefore = first.getState().combat.curse.value
    first.dispatch({ type: 'REROLL_UNLOCKED' })
    expect(first.getState().slot.current?.action).toBe(lockedAction)
    expect(first.getState().combat.curse.value).toBe(curseBefore + 2)

    const confirmed = first.getState().slot.current
    const events = first.dispatch({ type: 'CONFIRM_COMBAT_SLOT' })
    expect(events).toContainEqual(expect.objectContaining({ type: 'COMBAT_SLOT_RESOLVED', result: confirmed }))
    expect(first.getState().slot).toMatchObject({ current: null, hasSpun: false })
  })

  it('passes canonical reel locks to lock-dependent reward effects on confirmation', () => {
    let engine: GameEngine | undefined

    for (let index = 0; index < 100; index += 1) {
      const candidate = new GameEngine(`locked-effect-${index}`, {
        startingRewards: [{ kind: 'augment', id: 'combo_starter' }],
      })
      startRun(candidate)
      candidate.dispatch({ type: 'ENTER_NEXT_STAGE' })
      candidate.dispatch({ type: 'SPIN_COMBAT_SLOT' })
      if (candidate.getState().slot.current?.action === 'bullet') {
        engine = candidate
        break
      }
    }

    expect(engine).toBeDefined()
    engine!.dispatch({ type: 'TOGGLE_REEL_LOCK', reel: 'action' })
    engine!.dispatch({ type: 'CONFIRM_COMBAT_SLOT' })

    expect(engine!.getState().combat.statuses.enemy).toContainEqual({ id: 'primer', stacks: 1 })
  })

  it('creates debt from a locked reroll when Hexed Clutch is owned', () => {
    const engine = new GameEngine('debt-reroll', {
      startingRewards: [{ kind: 'augment', id: 'hexed_clutch' }],
    })
    startRun(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    engine.dispatch({ type: 'TOGGLE_REEL_LOCK', reel: 'action' })
    engine.dispatch({ type: 'REROLL_UNLOCKED' })

    expect(engine.getState().combat.statuses.player).toContainEqual({ id: 'debt', stacks: 1 })
  })

  it('arms and consumes Black-Market Stamp shop benefits after purification', () => {
    const engine = new GameEngine('black-market', {
      startingRewards: [{ kind: 'item', id: 'black_market_stamp' }],
    })
    startRun(engine)
    completeCombatStage(engine)
    completeCombatStage(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'RESOLVE_REST', action: 'purify' })

    expect(engine.getState().economy).toMatchObject({
      pendingShopDiscountPct: 25,
      pendingPurchaseCurseReduction: 1,
    })

    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    const goldBefore = engine.getState().economy.gold
    const offer = engine.getState().shop.offers[0]
    engine.dispatch({ type: 'BUY_SHOP_ITEM', rewardId: offer.reward.id })
    expect(goldBefore - engine.getState().economy.gold).toBe(offer.price)
    expect(offer.price).toBe(Math.floor(offer.basePrice * 0.75))
    expect(engine.getState().economy).toMatchObject({
      pendingShopDiscountPct: 0,
      pendingPurchaseCurseReduction: 0,
    })
  })

  it('owns rest, shop, and event progression in deterministic run state', () => {
    const engine = new GameEngine('mvp-noncombat')
    startRun(engine)

    completeCombatStage(engine)
    completeCombatStage(engine)

    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(engine.getState()).toMatchObject({ phase: 'rest', run: { currentStage: { id: 3 } } })
    const curseBeforeRest = engine.getState().combat.curse.value
    engine.dispatch({ type: 'RESOLVE_REST', action: 'purify' })
    expect(engine.getState().combat.curse.value).toBe(Math.max(0, curseBeforeRest - 3))
    expect(engine.getState()).toMatchObject({ phase: 'map', run: { completedStageIds: [1, 2, 3] } })

    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(engine.getState().phase).toBe('shop')
    const goldBeforePurchase = engine.getState().economy.gold
    const shopOffer = engine.getState().shop.offers.find((offer) => offer.price <= goldBeforePurchase)!
    engine.dispatch({ type: 'BUY_SHOP_ITEM', rewardId: shopOffer.reward.id })
    expect(engine.getState().economy.gold).toBeLessThan(goldBeforePurchase)
    expect(engine.getState().build[`${shopOffer.reward.kind}s`]).toContain(shopOffer.reward.id)
    engine.dispatch({ type: 'LEAVE_SHOP' })
    expect(engine.getState()).toMatchObject({ phase: 'map', run: { completedStageIds: [1, 2, 3, 4] } })

    completeCombatStage(engine)
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    expect(engine.getState()).toMatchObject({ phase: 'event', run: { currentStage: { id: 6 } } })
    const goldBeforeEvent = engine.getState().economy.gold
    engine.dispatch({ type: 'RESOLVE_EVENT', choice: 'gold' })
    expect(engine.getState().economy.gold).toBe(goldBeforeEvent + 50)
    expect(engine.getState()).toMatchObject({ phase: 'map', run: { completedStageIds: [1, 2, 3, 4, 5, 6] } })
  })

  it('can complete the full fifteen-stage normal run without a post-boss reward', () => {
    const engine = new GameEngine('mvp-complete-run')
    startRun(engine, 'GAMBLER')

    while (engine.getState().run.status !== 'victory') {
      engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
      const state = engine.getState()

      if (state.phase === 'battle') {
        let combatTurns = 0
        while (engine.getState().phase === 'battle' && combatTurns < 10) {
          engine.dispatch({
            type: 'RESOLVE_COMBAT_SLOT',
            result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
          })
          combatTurns += 1
        }
        expect(engine.getState().phase).not.toBe('defeat')
        const reward = engine.getState().rewards.options[0]
        if (reward) engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: reward.id })
      } else if (state.phase === 'rest') {
        engine.dispatch({ type: 'RESOLVE_REST', action: 'heal' })
      } else if (state.phase === 'shop') {
        engine.dispatch({ type: 'LEAVE_SHOP' })
      } else if (state.phase === 'event') {
        engine.dispatch({ type: 'RESOLVE_EVENT', choice: 'gold' })
      }
    }

    expect(engine.getState()).toMatchObject({
      phase: 'victory',
      run: { completedStageIds: Array.from({ length: 15 }, (_, index) => index + 1) },
      rewards: { options: [], augmentSlot: null },
    })
  })
})

function completeCombatStage(engine: GameEngine): void {
  engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
  engine.dispatch({
    type: 'RESOLVE_COMBAT_SLOT',
    result: { action: 'bullet', target: 'enemy', modifier: 'x3' },
  })

  const reward = engine.getState().rewards.options[0]
  if (reward) {
    engine.dispatch({ type: 'CHOOSE_REWARD', rewardId: reward.id })
  }
}

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
    expect(state.run).toMatchObject({
      status: 'not_started',
      currentStage: null,
      completedStageIds: [],
    })
  })
})


function startRun(engine: GameEngine, originId: 'SWORDSMAN' | 'GAMBLER' | 'PRIEST' = 'SWORDSMAN'): void {
  engine.dispatch({ type: 'SELECT_ORIGIN', originId })
  engine.dispatch({ type: 'START_RUN' })
}
