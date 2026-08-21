import { applyReward, getActiveEffects } from '../build/BuildSystem'
import type { RewardRef } from '../build/BuildTypes'
import { MVP_BUILD_CATALOG } from '../build/MvpBuildCatalog'
import { generateMvpRewardOptions } from '../build/MvpRewardSystem'
import { createCombatState, resolveCombatSlot } from '../combat/CombatSystem'
import { createAugmentSlotPresentation } from '../slot/AugmentSlotMachine'
import { getCombatRerollCurseCost, rerollCombatSlot, spinCombatSlot } from '../slot/CombatSlotMachine'
import type { CombatSlotLocks } from '../slot/CombatSlotTypes'
import { completeCurrentStage, createRunState, enterNextStage } from '../run/RunSystem'
import type { RunStageDefinition } from '../run/RunTypes'
import type { GameCommand } from './commands'
import type { GameEvent } from './events'
import { createEmptySlotState, createInitialGameState, type GameState } from './GameState'
import { createSeededRngFromSnapshot, type RngSeed, type SeededRng } from './rng'

export class GameEngine {
  private state: GameState

  private rng: SeededRng

  constructor(seed: RngSeed, options: { startingRewards?: RewardRef[] } = {}) {
    this.state = createInitialGameState(seed)
    for (const reward of options.startingRewards ?? []) {
      this.state.build = applyReward(this.state.build, reward, MVP_BUILD_CATALOG).build
    }
    this.rng = createSeededRngFromSnapshot(this.state.rng)
  }

  dispatch(command: GameCommand): GameEvent[] {
    switch (command.type) {
      case 'START_RUN':
        return this.startRun()
      case 'ADVANCE_TURN':
        return this.advanceTurn()
      case 'ENTER_NEXT_STAGE':
        return this.enterNextStage()
      case 'SPIN_COMBAT_SLOT':
        return this.spinCombatSlot()
      case 'TOGGLE_REEL_LOCK':
        return this.toggleReelLock(command.reel)
      case 'REROLL_UNLOCKED':
        return this.rerollUnlocked()
      case 'CONFIRM_COMBAT_SLOT':
        return this.confirmCombatSlot()
      case 'RESOLVE_REST':
        return this.resolveRest(command.action)
      case 'BUY_SHOP_ITEM':
        return this.buyShopItem(command.rewardId)
      case 'LEAVE_SHOP':
        return this.leaveShop()
      case 'RESOLVE_EVENT':
        return this.resolveEvent(command.choice)
      case 'RESOLVE_COMBAT_SLOT':
        return this.resolveCombatSlot(command)
      case 'CHOOSE_REWARD':
        return this.chooseReward(command)
    }
  }

  getState(): GameState {
    return structuredClone(this.state)
  }

  private startRun(): GameEvent[] {
    const roll = this.consumeRoll()

    this.state = {
      ...this.state,
      phase: 'map',
      rng: this.rng.snapshot(),
      log: [...this.state.log, roll],
      run: createRunState(),
      slot: createEmptySlotState(),
    }

    return [
      {
        type: 'RUN_STARTED',
        turn: this.state.turn,
        roll,
      },
    ]
  }

  private enterNextStage(): GameEvent[] {
    if (this.state.phase !== 'map') return this.reject('ENTER_NEXT_STAGE', 'next stage can only be entered from the map')
    const run = enterNextStage(this.state.run)
    const stage = run.currentStage
    if (!stage) {
      this.state = { ...this.state, phase: 'victory', run }
      return []
    }

    this.state = {
      ...this.state,
      phase: getPhaseForStage(stage),
      run,
      combat: isCombatStage(stage) ? createStageCombatState(this.state.combat, stage) : this.state.combat,
      economy: stage.type === 'shop'
        ? { ...this.state.economy, shopPurchases: 0 }
        : this.state.economy,
      rewards: {
        options: [],
        augmentSlot: null,
      },
      slot: createEmptySlotState(),
    }

    return [{ type: 'STAGE_ENTERED', stage }]
  }

  private spinCombatSlot(): GameEvent[] {
    if (this.state.phase !== 'battle') return this.reject('SPIN_COMBAT_SLOT', 'combat slot can only spin in battle')
    const result = spinCombatSlot(this.rng)
    this.state = {
      ...this.state,
      rng: this.rng.snapshot(),
      slot: {
        ...this.state.slot,
        current: result,
        hasSpun: true,
      },
    }
    return [{ type: 'COMBAT_SLOT_SPUN', result }]
  }

  private toggleReelLock(reel: keyof CombatSlotLocks): GameEvent[] {
    if (this.state.phase !== 'battle' || !this.state.slot.current) {
      return this.reject('TOGGLE_REEL_LOCK', 'a combat result is required before locking reels')
    }
    const locked = !this.state.slot.locks[reel]
    this.state = {
      ...this.state,
      slot: {
        ...this.state.slot,
        locks: { ...this.state.slot.locks, [reel]: locked },
      },
    }
    return [{ type: 'REEL_LOCK_TOGGLED', reel, locked }]
  }

  private rerollUnlocked(): GameEvent[] {
    if (this.state.phase !== 'battle' || !this.state.slot.current) {
      return this.reject('REROLL_UNLOCKED', 'a combat result is required before rerolling')
    }
    const result = rerollCombatSlot(this.state.slot.current, this.state.slot.locks, this.rng)
    const curseCost = getCombatRerollCurseCost(this.state.slot.locks)
    const effects = getActiveEffects(this.state.build, MVP_BUILD_CATALOG)
    const lockedCount = Object.values(this.state.slot.locks).filter(Boolean).length
    const rerollStatus = lockedCount > 0
      ? effects.find((effect) => effect.type === 'reroll.status.add')
      : undefined
    const playerStatuses = this.state.combat.statuses.player.map((status) => ({ ...status }))
    if (rerollStatus) addEngineStatus(playerStatuses, rerollStatus.params.status, rerollStatus.params.stacks)
    this.state = {
      ...this.state,
      rng: this.rng.snapshot(),
      combat: {
        ...this.state.combat,
        curse: { value: this.state.combat.curse.value + curseCost },
        statuses: {
          ...this.state.combat.statuses,
          player: playerStatuses,
        },
      },
      slot: { ...this.state.slot, current: result },
    }
    return [{ type: 'COMBAT_SLOT_REROLLED', result }]
  }

  private confirmCombatSlot(): GameEvent[] {
    if (this.state.phase !== 'battle' || !this.state.slot.current) {
      return this.reject('CONFIRM_COMBAT_SLOT', 'a combat result is required before confirmation')
    }
    return this.resolveCombatSlot(
      { type: 'RESOLVE_COMBAT_SLOT', result: this.state.slot.current },
      this.state.slot.locks,
    )
  }

  private resolveRest(action: 'heal' | 'purify'): GameEvent[] {
    if (this.state.phase !== 'rest' || this.state.run.currentStage?.type !== 'rest') return []

    const amount = action === 'heal' ? 10 : 3
    const restEffect = action === 'purify'
      ? getActiveEffects(this.state.build, MVP_BUILD_CATALOG).find(
          (effect) => effect.type === 'rest.purify.arm_shop_discount',
        )
      : undefined
    const combat = action === 'heal'
      ? {
          ...this.state.combat,
          player: {
            ...this.state.combat.player,
            health: Math.min(this.state.combat.player.maxHealth, this.state.combat.player.health + amount),
          },
        }
      : {
          ...this.state.combat,
          curse: {
            value: Math.max(0, this.state.combat.curse.value - amount),
          },
        }
    const stage = this.state.run.currentStage
    this.state = {
      ...this.state,
      phase: 'map',
      combat,
      run: completeCurrentStage(this.state.run),
      economy: restEffect
        ? {
            ...this.state.economy,
            pendingShopDiscountPct: restEffect.params.discountPercent,
            pendingPurchaseCurseReduction: restEffect.params.purchaseCurseReduction,
          }
        : this.state.economy,
    }

    return [
      { type: 'REST_RESOLVED', action, amount },
      { type: 'STAGE_COMPLETED', stage },
    ]
  }

  private buyShopItem(rewardId: string): GameEvent[] {
    if (this.state.phase !== 'shop' || this.state.economy.shopPurchases >= 4) return []
    const definition = MVP_BUILD_CATALOG.rewards.find((reward) => reward.id === rewardId)
    if (!definition || this.state.economy.purchasedRewardIds.includes(rewardId)) return []

    const basePrice = getRewardPrice(definition.rarity)
    const price = Math.floor(basePrice * (1 - this.state.economy.pendingShopDiscountPct / 100))
    if (this.state.economy.gold < price) return []

    const reward = { kind: definition.kind, id: definition.id } as const
    const result = applyReward(this.state.build, reward, MVP_BUILD_CATALOG)
    this.state = {
      ...this.state,
      build: result.build,
      economy: {
        gold: this.state.economy.gold - price,
        shopPurchases: this.state.economy.shopPurchases + 1,
        purchasedRewardIds: [...this.state.economy.purchasedRewardIds, rewardId],
        pendingShopDiscountPct: 0,
        pendingPurchaseCurseReduction: 0,
      },
      combat: {
        ...this.state.combat,
        curse: {
          value: Math.max(0, this.state.combat.curse.value - this.state.economy.pendingPurchaseCurseReduction),
        },
      },
    }

    return [{ type: 'SHOP_ITEM_PURCHASED', reward, price }]
  }

  private leaveShop(): GameEvent[] {
    if (this.state.phase !== 'shop' || this.state.run.currentStage?.type !== 'shop') return []
    const stage = this.state.run.currentStage
    this.state = {
      ...this.state,
      phase: 'map',
      run: completeCurrentStage(this.state.run),
    }
    return [{ type: 'STAGE_COMPLETED', stage }]
  }

  private resolveEvent(choice: 'reward' | 'gold' | 'rest' | 'skip'): GameEvent[] {
    if (this.state.phase !== 'event' || this.state.run.currentStage?.type !== 'event') return []
    const stage = this.state.run.currentStage
    const combat = choice === 'rest'
      ? {
          ...this.state.combat,
          player: {
            ...this.state.combat.player,
            health: Math.min(this.state.combat.player.maxHealth, this.state.combat.player.health + 6),
          },
        }
      : this.state.combat
    const economy = choice === 'gold'
      ? { ...this.state.economy, gold: this.state.economy.gold + 50 }
      : this.state.economy
    const run = completeCurrentStage(this.state.run)

    if (choice === 'reward') {
      const rewards = generateMvpRewardOptions(this.state.build, stage.rewardPolicy)
      this.state = {
        ...this.state,
        phase: 'reward',
        combat,
        economy,
        run,
        rewards: {
          options: rewards,
          augmentSlot: rewards[0] ? createAugmentSlotPresentation(rewards[0]) : null,
        },
      }
    } else {
      this.state = { ...this.state, phase: 'map', combat, economy, run }
    }

    return [
      { type: 'EVENT_RESOLVED', choice },
      { type: 'STAGE_COMPLETED', stage },
    ]
  }

  private advanceTurn(): GameEvent[] {
    const roll = this.consumeRoll()
    const turn = this.state.turn + 1

    this.state = {
      ...this.state,
      turn,
      rng: this.rng.snapshot(),
      log: [...this.state.log, roll],
    }

    return [
      {
        type: 'TURN_ADVANCED',
        turn,
        roll,
      },
    ]
  }

  private resolveCombatSlot(
    command: Extract<GameCommand, { type: 'RESOLVE_COMBAT_SLOT' }>,
    lockedReels?: CombatSlotLocks,
  ): GameEvent[] {
    if (this.state.phase !== 'battle' || !this.state.run.currentStage || !isCombatStage(this.state.run.currentStage)) {
      return this.reject('RESOLVE_COMBAT_SLOT', 'combat can only resolve during an active battle')
    }
    const resolution = resolveCombatSlot(this.state.combat, command.result, {
      effects: getActiveEffects(this.state.build, MVP_BUILD_CATALOG),
      originTrait: command.originTrait,
      lockedReels,
    })
    const turn = this.state.turn + 1
    const completedStage = resolution.outcome === 'victory' ? this.state.run.currentStage : null
    const run = completedStage ? completeCurrentStage(this.state.run) : this.state.run
    const shouldReward = completedStage?.rewardPolicy !== 'none'
    const rewards = resolution.outcome === 'victory' && shouldReward
      ? generateMvpRewardOptions(this.state.build, completedStage?.rewardPolicy ?? 'normal')
      : []
    const augmentSlot = rewards.length > 0 ? createAugmentSlotPresentation(rewards[0]) : null

    this.state = {
      ...this.state,
      phase: run.status === 'victory'
        ? 'victory'
        : resolution.outcome === 'victory' && rewards.length === 0
          ? 'map'
          : this.getPhaseAfterCombatOutcome(resolution.outcome),
      turn,
      run,
      combat: {
        player: resolution.player,
        enemy: resolution.enemy,
        curse: resolution.curse,
        enemyIntent: resolution.enemyIntent,
        lastSlotResult: resolution.lastSlotResult,
        statuses: resolution.statuses,
        effectUses: resolution.effectUses,
      },
      rewards: {
        options: rewards,
        augmentSlot,
      },
      slot: createEmptySlotState(),
    }

    const events: GameEvent[] = [
      {
        type: 'COMBAT_SLOT_RESOLVED',
        turn,
        result: command.result,
        outcome: resolution.outcome,
        combatEvents: resolution.events,
      },
    ]

    if (completedStage) {
      events.push({ type: 'STAGE_COMPLETED', stage: completedStage })
    }

    if (augmentSlot) {
      events.push({
        type: 'REWARDS_GENERATED',
        options: rewards,
        augmentSlot,
      })
    }

    return events
  }

  private chooseReward(command: Extract<GameCommand, { type: 'CHOOSE_REWARD' }>): GameEvent[] {
    const offered = this.state.rewards.options.some(
      (reward) => reward.kind === command.reward.kind && reward.id === command.reward.id,
    )
    if (this.state.phase !== 'reward' || !offered) {
      return this.reject('CHOOSE_REWARD', 'reward must be selected from the active offer')
    }
    const result = applyReward(this.state.build, command.reward, MVP_BUILD_CATALOG)

    this.state = {
      ...this.state,
      phase: 'map',
      build: result.build,
      rewards: {
        options: [],
        augmentSlot: null,
      },
    }

    return [
      {
        type: 'REWARD_CHOSEN',
        reward: command.reward,
        buildEvents: result.events,
      },
    ]
  }

  private getPhaseAfterCombatOutcome(outcome: 'ongoing' | 'victory' | 'defeat'): GameState['phase'] {
    if (outcome === 'victory') {
      return 'reward'
    }

    if (outcome === 'defeat') {
      return 'defeat'
    }

    return 'battle'
  }

  private consumeRoll(): number {
    return this.rng.nextInt(100)
  }

  private reject(command: string, reason: string): GameEvent[] {
    return [{ type: 'COMMAND_REJECTED', command, reason }]
  }
}

function isCombatStage(stage: RunStageDefinition): boolean {
  return stage.type === 'combat' || stage.type === 'elite' || stage.type === 'gate' || stage.type === 'boss'
}

function getPhaseForStage(stage: RunStageDefinition): GameState['phase'] {
  if (isCombatStage(stage)) return 'battle'
  if (stage.type === 'shop') return 'shop'
  if (stage.type === 'rest') return 'rest'
  return 'event'
}

function getRewardPrice(rarity: 'common' | 'uncommon' | 'rare' | 'cursed' | 'legendary'): number {
  return {
    common: 60,
    uncommon: 80,
    rare: 100,
    cursed: 70,
    legendary: 130,
  }[rarity]
}

function addEngineStatus(
  statuses: GameState['combat']['statuses']['player'],
  id: GameState['combat']['statuses']['player'][number]['id'],
  stacks: number,
): void {
  const existing = statuses.find((status) => status.id === id)
  if (existing) existing.stacks += stacks
  else statuses.push({ id, stacks })
}

function createStageCombatState(previous: GameState['combat'], stage: RunStageDefinition): GameState['combat'] {
  const profile = {
    combat: { maxHealth: 18, attack: 4, name: 'Cursed Drudge' },
    elite: { maxHealth: 24, attack: 5, name: 'Vault Enforcer' },
    gate: { maxHealth: 27, attack: 6, name: 'Gate Warden' },
    boss: { maxHealth: 36, attack: 7, name: 'House Sovereign' },
  }[stage.type as 'combat' | 'elite' | 'gate' | 'boss']

  return createCombatState({
    player: {
      maxHealth: previous.player.maxHealth,
      health: previous.player.health,
      block: 0,
    },
    enemy: {
      name: profile.name,
      maxHealth: profile.maxHealth,
      health: profile.maxHealth,
      block: 0,
    },
    curse: { value: previous.curse.value },
    enemyIntent: { amount: profile.attack },
  })
}
