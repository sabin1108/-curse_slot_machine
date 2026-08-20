import type {
  AugmentItem,
  GameCommand as UiGameCommand,
  GameState as UiGameState,
  ReelSymbol,
  SlotResult,
  SynergyProgress as UiSynergyProgress,
} from '../../types/game'
import { GameEngine as LegacyGameEngine } from '../GameEngine'
import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../data'
import { DEFAULT_BUILD_CATALOG } from '../build/BuildCatalog'
import type { BuildRewardDefinition, SynergyDefinition, SynergyTag } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatEvent } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import { getCombatRerollCurseCost, rerollCombatSlot, spinCombatSlot } from '../slot/CombatSlotMachine'
import { GameEngine as StructuredGameEngine } from './GameEngine'
import type { GameEvent } from './events'
import { createSeededRng, type RngSeed, type SeededRng } from './rng'

export class GameEngine {
  private legacy: LegacyGameEngine

  private structured: StructuredGameEngine

  private slotRng: SeededRng

  private currentStructuredSlot: CombatSlotResult | null

  private presentation: UiGameState

  constructor(seedString: string = 'curse_slot_demo_2026') {
    this.legacy = new LegacyGameEngine(seedString)
    this.structured = new StructuredGameEngine(seedString)
    this.slotRng = createSeededRng(seedString)
    this.currentStructuredSlot = null
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
      this.slotRng = createSeededRng(seed)
      this.currentStructuredSlot = null
      this.presentation = state
      return this.presentation
    }

    if (command.type === 'SPIN_COMBAT_SLOT') {
      this.currentStructuredSlot = spinCombatSlot(this.slotRng)
      this.projectStructuredSlot(this.currentStructuredSlot)
      return this.presentation
    }

    if (command.type === 'TOGGLE_LOCK_REEL') {
      if (this.presentation.lockedReels.has(command.reelId)) {
        this.presentation.lockedReels.delete(command.reelId)
      } else {
        this.presentation.lockedReels.add(command.reelId)
      }
      return this.presentation
    }

    if (command.type === 'REROLL_UNLOCKED' && this.currentStructuredSlot) {
      const locks = {
        action: this.presentation.lockedReels.has('action'),
        target: this.presentation.lockedReels.has('target'),
        modifier: this.presentation.lockedReels.has('modifier'),
      }
      this.currentStructuredSlot = rerollCombatSlot(this.currentStructuredSlot, locks, this.slotRng)
      this.presentation.curse.current = Math.min(
        this.presentation.curse.max,
        this.presentation.curse.current + getCombatRerollCurseCost(locks),
      )
      this.projectStructuredSlot(this.currentStructuredSlot)
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

  private projectStructuredSlot(slotResult: CombatSlotResult): void {
    this.presentation.currentResult = toUiSlotResult(slotResult)
    this.presentation.reelIndexes = {
      action: getReelIndex(this.presentation.reels.action, this.presentation.currentResult.action.id),
      target: getReelIndex(this.presentation.reels.target, this.presentation.currentResult.target.id),
      modifier: getReelIndex(this.presentation.reels.modifier, this.presentation.currentResult.modifier.id),
    }
    this.presentation.hasSpunThisTurn = true
    this.presentation.isSpinning = false
    this.presentation.combatLogs.push(`[Slot] ${this.presentation.currentResult.finalEffectText}`)
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

function toUiSlotResult(slotResult: CombatSlotResult): SlotResult {
  const action = getUiActionSymbol(slotResult.action)
  const target = getUiTargetSymbol(slotResult.target)
  const modifier = getUiModifierSymbol(slotResult.modifier)
  const calculatedValue = getUiSlotAmount(slotResult)

  return {
    action,
    target,
    modifier,
    isMiss: false,
    calculatedValue,
    finalEffectText: `${slotResult.action}/${slotResult.target}/${slotResult.modifier}: ${calculatedValue}`,
  }
}

function getUiActionSymbol(action: CombatSlotResult['action']): ReelSymbol {
  return getRequiredSymbol(ACTION_SYMBOLS, action)
}

function getUiTargetSymbol(target: CombatSlotResult['target']): ReelSymbol {
  if (target === 'enemy') {
    return TARGET_SYMBOLS.find((symbol) => symbol.type === 'ENEMY') ?? createTargetSymbol('enemy', 'ENEMY')
  }

  return createTargetSymbol(target, target === 'self' ? 'SELF' : 'ALL')
}

function getUiModifierSymbol(modifier: CombatSlotResult['modifier']): ReelSymbol {
  return getRequiredSymbol(MODIFIER_SYMBOLS, modifier)
}

function getRequiredSymbol(symbols: ReelSymbol[], id: string): ReelSymbol {
  const symbol = symbols.find((candidate) => candidate.id === id)
  if (!symbol) {
    throw new Error(`Missing UI reel symbol: ${id}`)
  }
  return symbol
}

function createTargetSymbol(id: CombatSlotResult['target'], type: 'SELF' | 'ALL' | 'ENEMY'): ReelSymbol {
  return {
    id,
    name: type,
    type,
    category: 'TARGET',
    baseValue: 0,
    icon: type === 'SELF' ? 'SELF' : type === 'ALL' ? 'ALL' : 'ENEMY',
    color: '#cccccc',
    description: type,
  }
}

function getUiSlotAmount(slotResult: CombatSlotResult): number {
  const base = slotResult.action === 'bullet' ? 6 : slotResult.action === 'shield' ? 5 : 4
  const multiplier = slotResult.modifier === 'x1' ? 1 : slotResult.modifier === 'x2' ? 2 : 3

  return base * multiplier
}

function getReelIndex(symbols: ReelSymbol[], id: string): number {
  return Math.max(0, symbols.findIndex((symbol) => symbol.id === id))
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
