import { describe, expect, it } from 'vitest'

import { GameEngine } from './GameEngine'

describe('MVP engine contracts', () => {
  it('rejects active-run restarts and all non-start commands after a terminal state', () => {
    const engine = new GameEngine('terminal-contract')
    engine.dispatch({ type: 'START_RUN' })
    const active = engine.getState()

    expect(engine.dispatch({ type: 'START_RUN' })).toEqual([
      { type: 'COMMAND_REJECTED', command: 'START_RUN', reason: 'a run can only start from idle or a terminal phase' },
    ])
    expect(engine.getState()).toEqual(active)

    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    for (let turn = 0; turn < 12 && engine.getState().phase === 'battle'; turn += 1) {
      engine.dispatch({ type: 'RESOLVE_COMBAT_SLOT', result: { action: 'heart', target: 'all', modifier: 'x1' } })
    }
    expect(['defeat', 'victory']).toContain(engine.getState().phase)
    const terminal = engine.getState()
    expect(engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })).toEqual([
      { type: 'COMMAND_REJECTED', command: 'SPIN_COMBAT_SLOT', reason: 'the run has ended; start a new run first' },
    ])
    expect(engine.getState()).toEqual(terminal)

    expect(engine.dispatch({ type: 'START_RUN' })[0]).toMatchObject({ type: 'RUN_STARTED' })
    expect(engine.getState()).toMatchObject({
      phase: 'map',
      turn: 0,
      economy: { shopPurchases: 0, purchasedRewardIds: [] },
      combat: { player: { health: 30 }, curse: { value: 0 } },
    })
  })

  it('stores an exact preview after spin and recomputes it when locks change', () => {
    const engine = new GameEngine('preview-contract')
    engine.dispatch({ type: 'START_RUN' })
    engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const spun = engine.getState()

    expect(spun.slot.current).not.toBeNull()
    expect(spun.slot.preview).not.toBeNull()
    engine.dispatch({ type: 'TOGGLE_REEL_LOCK', reel: 'action' })
    expect(engine.getState().slot.preview).not.toBeNull()

    const preview = engine.getState().slot.preview
    engine.dispatch({ type: 'CONFIRM_COMBAT_SLOT' })
    const resolved = engine.getState()
    expect(resolved.combat.player.health - spun.combat.player.health).toBe(preview?.playerHealthDelta)
    expect(resolved.combat.enemy.health - spun.combat.enemy.health).toBe(preview?.enemyHealthDelta)
    expect(resolved.combat.curse.value - spun.combat.curse.value).toBe(preview?.curseDelta)
  })

  it('owns active shop offers and prices and keeps the purchase count across shops', () => {
    const engine = new GameEngine('shop-contract')
    reachStage(engine, 4)
    const firstShop = engine.getState()

    expect(firstShop.phase).toBe('shop')
    expect(firstShop.shop.offers).toHaveLength(6)
    expect(firstShop.shop.offers[0]).toMatchObject({
      reward: { id: expect.any(String), kind: expect.stringMatching(/augment|item/) },
      basePrice: expect.any(Number),
      price: expect.any(Number),
    })
    expect(engine.dispatch({ type: 'BUY_SHOP_ITEM', rewardId: 'not-an-active-offer' })).toEqual([
      { type: 'COMMAND_REJECTED', command: 'BUY_SHOP_ITEM', reason: 'item must be purchased from the active shop offer' },
    ])

    const affordable = firstShop.shop.offers.find((offer) => offer.price <= firstShop.economy.gold)
    expect(affordable).toBeDefined()
    engine.dispatch({ type: 'BUY_SHOP_ITEM', rewardId: affordable!.reward.id })
    expect(engine.getState().economy.shopPurchases).toBe(1)
    engine.dispatch({ type: 'LEAVE_SHOP' })
    reachStage(engine, 10)
    expect(engine.getState().economy.shopPurchases).toBe(1)
  })
})

function reachStage(engine: GameEngine, target: number): void {
  if (engine.getState().phase === 'idle') engine.dispatch({ type: 'START_RUN' })
  while (engine.getState().run.completedStageIds.length < target - 1) {
    const state = engine.getState()
    if (state.phase === 'map') engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
    else if (state.phase === 'battle') engine.dispatch({ type: 'RESOLVE_COMBAT_SLOT', result: { action: 'bullet', target: 'enemy', modifier: 'x3' } })
    else if (state.phase === 'reward') engine.dispatch({ type: 'CHOOSE_REWARD', reward: state.rewards.options[0] })
    else if (state.phase === 'rest') engine.dispatch({ type: 'RESOLVE_REST', action: 'purify' })
    else if (state.phase === 'shop') engine.dispatch({ type: 'LEAVE_SHOP' })
    else if (state.phase === 'event') engine.dispatch({ type: 'RESOLVE_EVENT', choice: 'gold' })
    else throw new Error(`unexpected terminal phase before stage ${target}: ${state.phase}`)
  }
  if (engine.getState().phase === 'map') engine.dispatch({ type: 'ENTER_NEXT_STAGE' })
}
