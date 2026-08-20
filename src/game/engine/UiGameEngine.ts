import type { GameCommand as UiGameCommand, GameState as UiGameState, AugmentItem, SynergyProgress as UiSynergyProgress } from '../../types/game'
import { GameEngine as LegacyGameEngine } from '../GameEngine'
import { DEFAULT_BUILD_CATALOG } from '../build/BuildCatalog'
import type { BuildRewardDefinition, SynergyDefinition, SynergyTag } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatEvent } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import { GameEngine as StructuredGameEngine } from './GameEngine'
import type { GameEvent } from './events'
import type { RngSeed } from './rng'

export class GameEngine {
  private legacy: LegacyGameEngine

  private structured: StructuredGameEngine

  private presentation: UiGameState

  constructor(seedString: string = 'curse_slot_demo_2026') {
    this.legacy = new LegacyGameEngine(seedString)
    this.structured = new StructuredGameEngine(seedString)
    this.presentation = this.legacy.getState()
  }

  getState(): UiGameState {
    return this.presentation
  }

  dispatch(command: UiGameCommand): UiGameState {
    if (command.type === 'START_RUN') {
      const state = this.legacy.dispatch(command)
      const seed = command.seed ?? state.seed
      this.structured = new StructuredGameEngine(seed)
      this.structured.dispatch({ type: 'START_RUN' })
      this.presentation = state
      return this.presentation
    }

    if (command.type === 'CHOOSE_REWARD') {
      const reward = getStructuredReward(command.augmentId)
      if (reward) {
        this.structured.dispatch({
          type: 'CHOOSE_REWARD',
          reward: {
            kind: reward.kind,
            id: reward.id,
          },
        })
        this.projectStructuredBuild()
        this.presentation.combatLogs.push(`[Reward] ${reward.name}`)
        return this.presentation
      }
    }

    if (command.type === 'CONFIRM_SLOT_RESULT' && this.hasStructuredBuild()) {
      const slotResult = mapUiSlotResult(this.presentation)
      if (slotResult) {
        const events = this.structured.dispatch({
          type: 'RESOLVE_COMBAT_SLOT',
          result: slotResult,
        })
        this.projectStructuredState(events)
        return this.presentation
      }
    }

    this.presentation = this.legacy.dispatch(command)
    return this.presentation
  }

  private hasStructuredBuild(): boolean {
    const build = this.structured.getState().build
    return build.augments.length > 0 || build.items.length > 0
  }

  private projectStructuredState(events: GameEvent[]): void {
    const state = this.structured.getState()
    const combat = state.combat

    this.presentation.player = {
      hp: combat.player.health,
      maxHp: combat.player.maxHealth,
      shield: combat.player.block,
      gold: this.presentation.player.gold,
    }
    this.presentation.enemy = {
      ...this.presentation.enemy,
      hp: combat.enemy.health,
      maxHp: combat.enemy.maxHealth,
      shield: combat.enemy.block,
    }
    this.presentation.curse = {
      ...this.presentation.curse,
      current: combat.curse.value,
    }
    this.presentation.screen = state.phase === 'reward' ? 'REWARD' : state.phase === 'defeat' ? 'GAMEOVER' : 'BATTLE'
    this.presentation.hasSpunThisTurn = false
    this.presentation.currentResult = null
    this.presentation.lockedReels.clear()
    this.projectStructuredBuild()
    this.projectStructuredRewards()
    this.appendCombatLogs(events)
  }

  private projectStructuredBuild(): void {
    const build = this.structured.getState().build
    this.presentation.build = {
      ...this.presentation.build,
      augments: build.augments.map((id) => toUiAugment(getRequiredStructuredReward(id, 'augment'))),
      items: build.items,
      activeSynergies: build.synergies.active.map((synergy) => synergy.name),
      synergyProgress: DEFAULT_BUILD_CATALOG.synergies.map((synergy) => toUiSynergyProgress(synergy)),
    }
  }

  private projectStructuredRewards(): void {
    const rewards = this.structured.getState().rewards

    this.presentation.rewardCandidates = rewards.options.map(toUiReward)
    this.presentation.augSlotPresentation = rewards.augmentSlot
      ? {
          reels: rewards.augmentSlot.reels.map((reel) => reel.label) as [string, string, string],
          targetAugment: toUiReward(rewards.augmentSlot.targetReward),
          isRevealed: rewards.augmentSlot.isRevealed,
        }
      : null
  }

  private appendCombatLogs(events: GameEvent[]): void {
    for (const event of events) {
      if (event.type !== 'COMBAT_SLOT_RESOLVED') {
        continue
      }

      for (const combatEvent of event.combatEvents) {
        this.appendCombatEventLog(combatEvent)
      }
    }
  }

  private appendCombatEventLog(event: CombatEvent): void {
    if (event.type === 'DAMAGE_APPLIED') {
      this.presentation.combatLogs.push(`[Damage] ${event.target} -${event.healthLost}`)
      if (event.target === 'enemy') {
        this.presentation.lastDamagePop = {
          value: event.healthLost,
          type: 'ENEMY_DMG',
          id: Date.now(),
        }
      }
    }

    if (event.type === 'ENEMY_ATTACKED') {
      this.presentation.combatLogs.push(`[Enemy] player -${event.healthLost}`)
      if (event.healthLost > 0) {
        this.presentation.lastDamagePop = {
          value: event.healthLost,
          type: 'PLAYER_DMG',
          id: Date.now(),
        }
      }
    }

    if (event.type === 'CURSE_INCREASED') {
      this.presentation.combatLogs.push(`[Curse] +${event.amount}`)
    }
  }
}

function getStructuredReward(id: string): BuildRewardDefinition | undefined {
  return DEFAULT_BUILD_CATALOG.rewards.find((reward) => reward.id === id)
}

function getRequiredStructuredReward(id: string, kind: BuildRewardDefinition['kind']): BuildRewardDefinition {
  const reward = getStructuredReward(id)
  if (!reward || reward.kind !== kind) {
    throw new Error(`Missing structured ${kind} reward: ${id}`)
  }
  return reward
}

function toUiAugment(reward: BuildRewardDefinition): AugmentItem {
  return {
    id: reward.id,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: '◆',
    effectValue: reward.effectId ?? reward.effects?.[0]?.id ?? 'EFFECT',
  }
}

function toUiReward(reward: RewardOption): AugmentItem {
  return {
    id: reward.id,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: reward.kind === 'item' ? '◇' : '◆',
    effectValue: `score ${reward.score.total}`,
  }
}

function toUiSynergyProgress(synergy: SynergyDefinition): UiSynergyProgress {
  return {
    synergyId: synergy.id,
    name: synergy.name,
    tag: synergy.requiredTags[0]?.tag ?? ('COMBO' satisfies SynergyTag),
    current: 0,
    required: synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0),
    completed: false,
    effectDescription: synergy.description,
  }
}

function mapUiSlotResult(state: UiGameState): CombatSlotResult | null {
  const result = state.currentResult
  if (!result || result.isMiss) {
    return null
  }

  const action = result.action.type === 'BULLET'
    ? 'bullet'
    : result.action.type === 'SHIELD'
      ? 'shield'
      : result.action.type === 'HEART'
        ? 'heart'
        : null
  const target = result.target.type === 'ENEMY'
    ? 'enemy'
    : result.target.type === 'SELF'
      ? 'self'
      : result.target.type === 'ALL'
        ? 'all'
        : null
  const modifier = result.modifier.id === 'x2'
    ? 'x2'
    : result.modifier.type === 'X3'
      ? 'x3'
      : 'x1'

  if (!action || !target) {
    return null
  }

  return {
    action,
    target,
    modifier,
  }
}
