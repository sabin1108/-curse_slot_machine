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

  it('chooses structured rewards and returns the UI to map progression', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    const chosenRewardId = rewardState.rewardCandidates[0].id

    const afterChoose = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    expect(afterChoose.screen).toBe('MAP')
    expect(afterChoose.rewardCandidates).toEqual([])
    expect(afterChoose.augSlotPresentation).toBeNull()
    expect(afterChoose.wave).toBe(2)
    expect(afterChoose.enemy.hp).toBeGreaterThan(0)
    expect([
      ...afterChoose.build.augments.map((augment) => augment.id),
      ...afterChoose.build.items,
    ]).toContain(chosenRewardId)
  })

  it('selects a map node into clean battle entry without resolving a stale slot', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    const chosenRewardId = rewardState.rewardCandidates[0].id
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    const battleState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1 })
    const enemyHpBeforeConfirm = battleState.enemy.hp

    expect(battleState.screen).toBe('BATTLE')
    expect(battleState.visitedNodePath).toContain(1)
    expect(battleState.currentResult).toBeNull()
    expect(battleState.hasSpunThisTurn).toBe(false)
    expect(battleState.lockedReels.size).toBe(0)

    const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
  })

  it('selects a shop map node into clean shop entry without resolving a stale slot', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    const chosenRewardId = rewardState.rewardCandidates[0].id
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    const shopState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 4, nodeType: 'SHOP' })
    const enemyHpBeforeConfirm = shopState.enemy.hp

    expect(shopState.screen).toBe('SHOP')
    expect(shopState.visitedNodePath).toContain(4)
    expect(shopState.currentResult).toBeNull()
    expect(shopState.hasSpunThisTurn).toBe(false)
    expect(shopState.lockedReels.size).toBe(0)

    const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
    expect(afterInvalidConfirm.screen).toBe('SHOP')
  })

  it('selects a rest map node into clean rest entry without resolving a stale slot', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    const chosenRewardId = rewardState.rewardCandidates[0].id
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    const restState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 5, nodeType: 'REST' })
    const enemyHpBeforeConfirm = restState.enemy.hp

    expect(restState.screen).toBe('REST')
    expect(restState.visitedNodePath).toContain(5)
    expect(restState.currentResult).toBeNull()
    expect(restState.hasSpunThisTurn).toBe(false)
    expect(restState.lockedReels.size).toBe(0)

    const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
    expect(afterInvalidConfirm.screen).toBe('REST')
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
