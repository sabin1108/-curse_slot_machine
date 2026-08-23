import { describe, expect, it } from 'vitest'
import { GameEngine } from './UiGameEngine'

function forceLethalDualRoll(engine: GameEngine): void {
  ;(engine as any).currentStructuredSlot = {
    action: 'bullet',
    target: 'enemy',
    modifier: 'x3',
    attackRoll: 10,
    defenseRoll: 1,
    attackModifier: 'x3',
    defenseModifier: 'x2',
  }
}

function forceShieldDualRoll(engine: GameEngine): void {
  ;(engine as any).currentStructuredSlot = {
    action: 'shield',
    target: 'self',
    modifier: 'x2',
    attackRoll: 1,
    defenseRoll: 3,
    attackModifier: 'x2',
    defenseModifier: 'x2',
  }
}

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
      calculatedValue: expect.any(Number),
      defenseValue: expect.any(Number),
      attackRoll: expect.any(Number),
      defenseRoll: expect.any(Number),
      multiplierValue: 2,
      attackMultiplierValue: 2,
      defenseMultiplierValue: expect.any(Number),
    })
    expect(state.currentResult?.attackRoll).toBeLessThanOrEqual(5)
    expect(state.currentResult?.defenseRoll).toBeLessThanOrEqual(5)
  })

  it('applies defense roulette block even before any augment is chosen', () => {
    const engine = new GameEngine('slot-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceShieldDualRoll(engine)
    ;(engine as any).projectStructuredSlot((engine as any).currentStructuredSlot)
    const spunState = engine.getState()
    const expectedBlock = spunState.currentResult?.defenseValue

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(expectedBlock).toBeGreaterThan(0)
    expect(resolvedState.player.shield).toBeGreaterThan(0)
  })

  it('rerolls unlocked pure combat roll values and applies pure lock curse cost', () => {
    const engine = new GameEngine('slot-ui-2')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui-2' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    engine.dispatch({ type: 'TOGGLE_LOCK_REEL', reelId: 'action' })
    const state = engine.dispatch({ type: 'REROLL_UNLOCKED' })

    expect(state.curse.current).toBe(2)
    expect(state.currentResult).toMatchObject({
      action: { id: 'bullet' },
      target: { type: 'ENEMY' },
      modifier: { id: 'x3' },
      calculatedValue: 3,
      defenseValue: expect.any(Number),
      attackRoll: 1,
      defenseRoll: expect.any(Number),
      multiplierValue: 3,
      attackMultiplierValue: 3,
      defenseMultiplierValue: expect.any(Number),
    })
  })

  it('projects Gambler origin free reroll into structured slot rerolls', () => {
    const engine = new GameEngine('slot-ui-gambler')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui-gambler' })
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'GAMBLER' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1 })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    engine.dispatch({ type: 'TOGGLE_LOCK_REEL', reelId: 'action' })
    const firstReroll = engine.dispatch({ type: 'REROLL_UNLOCKED' })

    expect(firstReroll.curse.current).toBe(0)
    expect(firstReroll.originTraitState.freeRerollAvailable).toBe(false)

    const secondReroll = engine.dispatch({ type: 'REROLL_UNLOCKED' })
    expect(secondReroll.curse.current).toBe(2)
  })

  it('projects Gambler x3 jackpots into UI gold rewards', () => {
    const engine = new GameEngine('slot-ui-gambler-jackpot')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui-gambler-jackpot' })
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'GAMBLER' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    ;(engine as any).currentStructuredSlot = {
      action: 'shield',
      target: 'self',
      modifier: 'x3',
    }

    const state = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(state.player.gold).toBe(225)
  })

  it('projects structured combo combat effects into UI-visible state', () => {
    const engine = new GameEngine('structured-spin-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'structured-spin-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'multi_hit_charm' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_finisher' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBeLessThan(18)
    expect(resolvedState.build.activeSynergies).toContain('연계 엔진')
  })

  it('projects structured synergy progress values into the UI build panel', () => {
    const engine = new GameEngine('structured-progress-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'structured-progress-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    const partialState = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'split_blade' })

    expect(partialState.build.synergyProgress).toContainEqual(
      expect.objectContaining({
        synergyId: 'combo_engine',
        current: 2,
        required: 4,
        completed: false,
      }),
    )

    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_finisher' })
    const completedState = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'lucky_receipt' })

    expect(completedState.build.synergyProgress).toContainEqual(
      expect.objectContaining({
        synergyId: 'combo_engine',
        current: 4,
        required: 4,
        completed: true,
      }),
    )
  })

  it('projects structured victory rewards into the UI reward modal state', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceLethalDualRoll(engine)

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

  it('ends the run instead of offering a reward after the final boss is defeated', () => {
    const engine = new GameEngine('final-boss-ending')

    engine.dispatch({ type: 'START_RUN', seed: 'final-boss-ending' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1502, nodeType: 'BOSS' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    ;(engine as any).currentStructuredSlot = {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x3',
      attackRoll: 1000,
      defenseRoll: 1,
      attackModifier: 'x3',
      defenseModifier: 'x2',
    }

    const state = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(state.screen).toBe('VICTORY')
    expect(state.rewardCandidates).toEqual([])
    expect(state.augSlotPresentation).toBeNull()
    expect(state.combatLogs).toContain('[Victory] Final boss defeated. Ending unlocked.')
  })

  it('chooses structured rewards and returns the UI to map progression', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceLethalDualRoll(engine)
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
    forceLethalDualRoll(engine)
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
    forceLethalDualRoll(engine)
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

  it('generates deterministic persistent shop offers without changing combat slot rng', () => {
    const first = new GameEngine('deterministic-shop')
    const second = new GameEngine('deterministic-shop')
    const control = new GameEngine('deterministic-shop')

    first.dispatch({ type: 'START_RUN', seed: 'deterministic-shop' })
    second.dispatch({ type: 'START_RUN', seed: 'deterministic-shop' })
    control.dispatch({ type: 'START_RUN', seed: 'deterministic-shop' })

    const firstShop = first.dispatch({ type: 'NAVIGATE', screen: 'SHOP' })
    const secondShop = second.dispatch({ type: 'NAVIGATE', screen: 'SHOP' })
    expect(firstShop.shop.offers).toEqual(secondShop.shop.offers)
    expect(firstShop.shop.offers).toHaveLength(4)

    first.dispatch({ type: 'NAVIGATE', screen: 'MAP' })
    expect(first.dispatch({ type: 'NAVIGATE', screen: 'SHOP' }).shop.offers).toEqual(firstShop.shop.offers)

    first.dispatch({ type: 'NAVIGATE', screen: 'BATTLE' })
    control.dispatch({ type: 'NAVIGATE', screen: 'BATTLE' })
    expect(first.dispatch({ type: 'SPIN_COMBAT_SLOT' }).currentResult)
      .toEqual(control.dispatch({ type: 'SPIN_COMBAT_SLOT' }).currentResult)
  })

  it('charges engine-owned shop prices once and rejects duplicate purchases', () => {
    const engine = new GameEngine('atomic-shop')
    engine.dispatch({ type: 'START_RUN', seed: 'atomic-shop' })
    const shopState = engine.dispatch({ type: 'NAVIGATE', screen: 'SHOP' })
    shopState.player.gold = 1000
    const offer = shopState.shop.offers[0]
    const goldBefore = shopState.player.gold

    const purchased = engine.dispatch({ type: 'BUY_SHOP_ITEM', itemId: offer.id })

    expect(purchased.player.gold).toBe(goldBefore - offer.price)
    expect(purchased.build.items).toContain(offer.id)
    expect(purchased.shop.offers.find((candidate) => candidate.id === offer.id)?.purchased).toBe(true)

    const afterDuplicate = engine.dispatch({ type: 'BUY_SHOP_ITEM', itemId: offer.id })
    expect(afterDuplicate.player.gold).toBe(purchased.player.gold)
    expect(afterDuplicate.build.items.filter((id) => id === offer.id)).toHaveLength(1)
  })

  it('keeps pending event rewards modal and rejects shop navigation or purchases', () => {
    const engine = new GameEngine('pending-reward-shop')
    engine.dispatch({ type: 'START_RUN', seed: 'pending-reward-shop' })
    const stock = engine.dispatch({ type: 'NAVIGATE', screen: 'SHOP' }).shop.offers
    engine.dispatch({ type: 'NAVIGATE', screen: 'MAP' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 501, nodeType: 'EVENT' })
    const rewardState = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'OPEN' })
    rewardState.player.gold = 1000
    const before = structuredClone({
      screen: rewardState.screen,
      rewardSource: rewardState.rewardSource,
      rewardCandidates: rewardState.rewardCandidates,
      gold: rewardState.player.gold,
      items: rewardState.build.items,
    })

    const afterNavigate = engine.dispatch({ type: 'NAVIGATE', screen: 'SHOP' })
    const afterPurchase = engine.dispatch({ type: 'BUY_SHOP_ITEM', itemId: stock[0].id })

    expect(afterNavigate.screen).toBe('REWARD')
    expect({
      screen: afterPurchase.screen,
      rewardSource: afterPurchase.rewardSource,
      rewardCandidates: afterPurchase.rewardCandidates,
      gold: afterPurchase.player.gold,
      items: afterPurchase.build.items,
    }).toEqual(before)
  })

  it('selects a rest map node into clean rest entry without resolving a stale slot', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceLethalDualRoll(engine)
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

  it('selects an event map node into clean map event entry without resolving a stale slot', () => {
    const engine = new GameEngine('lethal-ui-24')

    engine.dispatch({ type: 'START_RUN', seed: 'lethal-ui-24' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceLethalDualRoll(engine)
    const rewardState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    const chosenRewardId = rewardState.rewardCandidates[0].id
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    const eventState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })
    const enemyHpBeforeConfirm = eventState.enemy.hp

    expect(eventState.screen).toBe('MAP')
    expect(eventState.visitedNodePath).toContain(6)
    expect(eventState.currentResult).toBeNull()
    expect(eventState.hasSpunThisTurn).toBe(false)
    expect(eventState.lockedReels.size).toBe(0)

    const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
    expect(afterInvalidConfirm.screen).toBe('MAP')
  })

  it('resolves event open choice through the adapter command', () => {
    const engine = new GameEngine('event-choice-open')

    engine.dispatch({ type: 'START_RUN', seed: 'event-choice-open' })
    const eventState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 501, nodeType: 'EVENT' })
    const waveBeforeReward = eventState.wave
    const enemyBeforeReward = structuredClone(eventState.enemy)
    const ownedBeforeReward = [
      ...eventState.build.augments.map((augment) => augment.id),
      ...eventState.build.items,
    ]

    const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'OPEN' })

    expect(state.screen).toBe('REWARD')
    expect(state.rewardSource).toBe('EVENT')
    expect(state.rewardCandidates).toHaveLength(3)
    expect(state.rewardCandidates.every((candidate) => !ownedBeforeReward.includes(candidate.id))).toBe(true)

    const chosenRewardId = state.rewardCandidates[0].id
    const afterChoose = engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: chosenRewardId })

    expect(afterChoose.screen).toBe('MAP')
    expect(afterChoose.rewardSource).toBeNull()
    expect(afterChoose.wave).toBe(waveBeforeReward)
    expect(afterChoose.enemy).toEqual(enemyBeforeReward)
    expect(afterChoose.visitedNodePath).toContain(501)
    expect(afterChoose.rewardCandidates).toEqual([])
    expect([
      ...afterChoose.build.augments.map((augment) => augment.id),
      ...afterChoose.build.items,
    ]).toContain(chosenRewardId)
  })

  it('resolves event rest choice through the adapter command', () => {
    const engine = new GameEngine('event-choice-rest')

    engine.dispatch({ type: 'START_RUN', seed: 'event-choice-rest' })
    const eventState = engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 6, nodeType: 'EVENT' })
    eventState.player.hp = 60

    const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'REST' })

    expect(state.player.hp).toBe(95)
    expect(state.screen).toBe('MAP')
  })

  it('resolves event skip choice through the adapter command', () => {
    const engine = new GameEngine('event-choice-skip')

    engine.dispatch({ type: 'START_RUN', seed: 'event-choice-skip' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 501, nodeType: 'EVENT' })

    const state = engine.dispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: 'SKIP' })

    expect(state.screen).toBe('MAP')
    expect(state.visitedNodePath).toContain(501)
    expect(state.currentResult).toBeNull()
    expect(state.hasSpunThisTurn).toBe(false)
    expect(state.isEnemyAttacking).toBe(false)
    expect(state.lockedReels.size).toBe(0)
  })

  it('uses showcase forced slot results instead of structured slot rng', () => {
    const engine = new GameEngine('showcase-forced-slot')

    engine.dispatch({ type: 'START_SHOWCASE' })

    const state = engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    expect(state.showcase.active).toBe(true)
    expect(state.currentResult).toMatchObject({
      action: { id: 'bullet' },
      target: { id: 'pow_10' },
      modifier: { id: 'x2' },
    })
  })

  it('clears adapter-owned slot state when starting showcase mode', () => {
    const engine = new GameEngine('showcase-clears-structured-slot')

    engine.dispatch({ type: 'START_RUN', seed: 'showcase-clears-structured-slot' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })

    const showcaseState = engine.dispatch({ type: 'START_SHOWCASE' })
    const enemyHpBeforeConfirm = showcaseState.enemy.hp
    const afterInvalidConfirm = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(showcaseState.showcase.active).toBe(true)
    expect(showcaseState.currentResult).toBeNull()
    expect(afterInvalidConfirm.enemy.hp).toBe(enemyHpBeforeConfirm)
  })

  it('confirms the adapter-owned pure slot result even if UI currentResult is mutated', () => {
    const engine = new GameEngine('slot-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'slot-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'combo_starter' })
    const spunState = engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    forceLethalDualRoll(engine)

    spunState.currentResult = {
      ...spunState.currentResult!,
      action: spunState.reels.action.find((symbol) => symbol.id === 'heart')!,
      calculatedValue: 0,
      finalEffectText: 'mutated presentation result',
    }

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBe(0)
  })

  it('projects boss counterattack motion and enemy damage pop from structured combat', () => {
    const engine = new GameEngine('boss-attack-motion')

    engine.dispatch({ type: 'START_RUN', seed: 'boss-attack-motion' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1501, nodeType: 'BOSS' })
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    ;(engine as any).currentStructuredSlot = {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x3',
      attackRoll: 30,
      defenseRoll: 1,
      attackModifier: 'x3',
      defenseModifier: 'x2',
    }
    ;(engine as any).projectStructuredSlot((engine as any).currentStructuredSlot)
    const spunState = engine.getState()
    const expectedDamage = spunState.currentResult?.calculatedValue
    const expectedHits = spunState.currentResult?.attackMultiplierValue
    expect(expectedDamage).toBeDefined()
    expect(expectedHits).toBeDefined()

    const resolvedState = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })

    expect(resolvedState.enemy.hp).toBeLessThan(resolvedState.enemy.maxHp)
    expect(resolvedState.isEnemyAttacking).toBe(true)
    expect(resolvedState.enemyDamagePops.map((pop) => pop.value).reduce((sum, value) => sum + value, 0)).toBeGreaterThanOrEqual(expectedDamage!)
    expect(resolvedState.enemyDamagePops.length).toBeGreaterThanOrEqual(expectedHits!)
    expect(resolvedState.lastEnemyDamagePop).toEqual(resolvedState.enemyDamagePops.at(-1))
  })

  it('projects the boss attack, attack, and defense cadence through the dual-engine adapter', () => {
    const engine = new GameEngine('enemy-intent-cycle-ui')

    engine.dispatch({ type: 'START_RUN', seed: 'enemy-intent-cycle-ui' })
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1501, nodeType: 'BOSS' })

    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const afterAttack = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    expect(afterAttack.enemy.intent).toMatchObject({ type: 'ATTACK' })
    expect(afterAttack.isEnemyAttacking).toBe(true)

    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const afterSecondAttack = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    expect(afterSecondAttack.enemy.intent).toMatchObject({ type: 'DEFEND', value: 3 })
    expect(afterSecondAttack.isEnemyAttacking).toBe(true)

    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' })
    const afterDefense = engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' })
    expect(afterDefense.enemy.intent).toMatchObject({ type: 'ATTACK' })
    expect(afterDefense.isEnemyAttacking).toBe(false)
  })

  it('projects multiplier caps from item and matching limit synergy', () => {
    const engine = new GameEngine('limit-break-ui')
    const forcedSlot = {
      action: 'bullet' as const,
      target: 'enemy' as const,
      modifier: 'x3' as const,
      attackRoll: 5,
      defenseRoll: 5,
      attackModifier: 'x3' as const,
      defenseModifier: 'x3' as const,
    }

    engine.dispatch({ type: 'START_RUN', seed: 'limit-break-ui' })
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'limit_breaker' })
    ;(engine as any).projectStructuredSlot(forcedSlot)
    const itemOnlyState = engine.getState()
    expect(itemOnlyState.currentResult?.attackMultiplierValue).toBeLessThanOrEqual(5)

    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'limit_core' })
    ;(engine as any).projectStructuredSlot(forcedSlot)
    const synergyState = engine.getState()

    expect(synergyState.build.activeSynergies).toContain('한계 돌파')
    expect(synergyState.currentResult?.attackMultiplierValue).toBe(10)
  })
})
