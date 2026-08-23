import { applyReward, getActiveEffects } from '../build/BuildSystem'
import { generateRandomRewardOptions, generateRewardOptions } from '../build/RewardSystem'
import { resolveCombatSlot } from '../combat/CombatSystem'
import { createEnemyBehaviorState, getEnemyIntentProfile } from '../combat/EnemyIntentProfiles'
import { createAugmentSlotPresentation } from '../slot/AugmentSlotMachine'
import type { GameCommand } from './commands'
import type { GameEvent } from './events'
import { createInitialGameState, type GameState } from './GameState'
import { createSeededRngFromSnapshot, type RngSeed, type SeededRng } from './rng'
import type { EnemyState as UiEnemyState, PlayerState as UiPlayerState } from '../../types/game'

export class GameEngine {
  private state: GameState

  private rng: SeededRng

  constructor(seed: RngSeed) {
    this.state = createInitialGameState(seed)
    this.rng = createSeededRngFromSnapshot(this.state.rng)
  }

  dispatch(command: GameCommand): GameEvent[] {
    switch (command.type) {
      case 'START_RUN':
        return this.startRun()
      case 'ADVANCE_TURN':
        return this.advanceTurn()
      case 'GENERATE_EVENT_REWARDS':
        return this.generateEventRewards()
      case 'RESOLVE_COMBAT_SLOT':
        return this.resolveCombatSlot(command)
      case 'CHOOSE_REWARD':
        return this.chooseReward(command)
      case 'APPLY_SHOP_REWARD':
        return this.applyShopReward(command)
    }
  }

  getState(): GameState {
    return structuredClone(this.state)
  }

  syncCombatFromPresentation(player: UiPlayerState, enemy: UiEnemyState, curseValue: number): void {
    const intentType = enemy.intent.type === 'WAIT'
      ? 'wait'
      : enemy.intent.type === 'DEFEND'
        ? 'defend'
        : 'attack'
    const baseAmount = intentType === 'attack'
      ? enemy.intent.value
      : this.state.combat.enemyIntent.baseAmount
    const profile = getEnemyIntentProfile(enemy.id)
    const isNewEncounter = this.state.combat.enemy.name !== enemy.name
    const enemyBehavior = isNewEncounter || this.state.combat.enemyBehavior.rank !== profile.rank
      ? createEnemyBehaviorState(profile.rank)
      : this.state.combat.enemyBehavior

    this.state = {
      ...this.state,
      combat: {
        ...this.state.combat,
        player: {
          id: 'player',
          name: 'Player',
          maxHealth: player.maxHp,
          health: player.hp,
          block: player.shield,
        },
        enemy: {
          id: 'enemy',
          name: enemy.name,
          maxHealth: enemy.maxHp,
          health: enemy.hp,
          block: enemy.shield,
        },
        curse: {
          value: curseValue,
        },
        enemyIntent: {
          type: intentType,
          baseAmount,
          amount: enemy.intent.value,
        },
        enemyBehavior,
      },
    }
  }

  private startRun(): GameEvent[] {
    const roll = this.consumeRoll()

    this.state = {
      ...this.state,
      phase: 'battle',
      rng: this.rng.snapshot(),
      log: [...this.state.log, roll],
    }

    return [
      {
        type: 'RUN_STARTED',
        turn: this.state.turn,
        roll,
      },
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

  private resolveCombatSlot(command: Extract<GameCommand, { type: 'RESOLVE_COMBAT_SLOT' }>): GameEvent[] {
    const resolution = resolveCombatSlot(this.state.combat, command.result, {
      effects: getActiveEffects(this.state.build),
      originTrait: command.originTrait,
    })
    const turn = this.state.turn + 1
    const rewards = resolution.outcome === 'victory' ? generateRewardOptions(this.state.build) : []
    const augmentSlot = rewards.length > 0 ? createAugmentSlotPresentation(rewards[0]) : null

    this.state = {
      ...this.state,
      phase: this.getPhaseAfterCombatOutcome(resolution.outcome),
      turn,
      combat: {
        player: resolution.player,
        enemy: resolution.enemy,
        curse: resolution.curse,
        enemyIntent: resolution.enemyIntent,
        enemyBehavior: resolution.enemyBehavior,
        lastSlotResult: resolution.lastSlotResult,
      },
      rewards: {
        source: rewards.length > 0 ? 'combat' : null,
        options: rewards,
        augmentSlot,
      },
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

    if (augmentSlot) {
      events.push({
        type: 'REWARDS_GENERATED',
        source: 'combat',
        options: rewards,
        augmentSlot,
      })
    }

    return events
  }

  private generateEventRewards(): GameEvent[] {
    const rewards = generateRandomRewardOptions(this.state.build, (maxExclusive) => this.rng.nextInt(maxExclusive))
    const augmentSlot = rewards.length > 0 ? createAugmentSlotPresentation(rewards[0]) : null

    this.state = {
      ...this.state,
      phase: rewards.length > 0 ? 'reward' : this.state.phase,
      rng: this.rng.snapshot(),
      rewards: {
        source: rewards.length > 0 ? 'event' : null,
        options: rewards,
        augmentSlot,
      },
    }

    return augmentSlot
      ? [{ type: 'REWARDS_GENERATED', source: 'event', options: rewards, augmentSlot }]
      : []
  }

  private chooseReward(command: Extract<GameCommand, { type: 'CHOOSE_REWARD' }>): GameEvent[] {
    const result = applyReward(this.state.build, command.reward)

    this.state = {
      ...this.state,
      phase: 'battle',
      build: result.build,
      rewards: {
        source: null,
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

  private applyShopReward(command: Extract<GameCommand, { type: 'APPLY_SHOP_REWARD' }>): GameEvent[] {
    const result = applyReward(this.state.build, command.reward)
    const added = result.events.some((event) => event.type === 'REWARD_ADDED')

    if (added) {
      this.state = {
        ...this.state,
        build: result.build,
      }
    }

    return [{
      type: 'SHOP_REWARD_APPLIED',
      reward: command.reward,
      buildEvents: result.events,
      added,
    }]
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
}
