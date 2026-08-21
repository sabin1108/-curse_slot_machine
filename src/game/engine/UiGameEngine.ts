import type { EventChoice, GameCommand as UiGameCommand, GameState as UiGameState, MapNodeType } from '../../types/game'
import { GameEngine as LegacyGameEngine } from '../GameEngine'
import { DEFAULT_BUILD_CATALOG } from '../build/BuildCatalog'
import type { BuildRewardDefinition } from '../build/BuildTypes'
import type { CombatEvent } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import { getCombatRerollCurseCost, rerollCombatSlot, spinCombatSlot } from '../slot/CombatSlotMachine'
import { GameEngine as StructuredGameEngine } from './GameEngine'
import {
  getReelIndex,
  toUiAugment,
  toUiReward,
  toUiSlotResult,
  toUiSynergyName,
  toUiSynergyProgress,
} from './UiProjection'
import type { GameEvent } from './events'
import { createSeededRng, type SeededRng } from './rng'

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

    if (command.type === 'START_SHOWCASE') {
      const state = this.legacy.dispatch(command)
      this.structured = new StructuredGameEngine(state.seed)
      this.structured.dispatch({ type: 'START_RUN' })
      this.slotRng = createSeededRng(state.seed)
      this.currentStructuredSlot = null
      this.presentation = state
      return this.presentation
    }

    if (command.type === 'SPIN_COMBAT_SLOT') {
      if (this.presentation.showcase.active) {
        this.currentStructuredSlot = null
        this.presentation = this.legacy.dispatch(command)
        return this.presentation
      }

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
      const hasFreeReroll = this.consumeFreeRerollIfAvailable()
      const curseCost = hasFreeReroll ? 0 : getCombatRerollCurseCost(locks)
      this.presentation.curse.current = Math.min(
        this.presentation.curse.max,
        this.presentation.curse.current + curseCost,
      )
      this.projectStructuredSlot(this.currentStructuredSlot)
      if (hasFreeReroll) {
        this.presentation.combatLogs.push('[Origin:Gambler] free reroll ignored curse gain')
      }
      return this.presentation
    }

    if (command.type === 'CHOOSE_REWARD') {
      const reward = getStructuredReward(command.augmentId)
      if (reward) {
        const shouldAdvanceMapShell = this.presentation.screen === 'REWARD'
        this.structured.dispatch({
          type: 'CHOOSE_REWARD',
          reward: {
            kind: reward.kind,
            id: reward.id,
          },
        })
        if (shouldAdvanceMapShell) {
          this.presentation = this.legacy.dispatch(command)
          this.presentation.player.shield = 0
          this.syncStructuredCombatFromPresentation()
        }
        this.projectStructuredBuild()
        this.projectStructuredRewards()
        this.resetOriginTraitState()
        this.presentation.combatLogs.push(`[Reward] ${reward.name}`)
        return this.presentation
      }
    }

    if (command.type === 'SELECT_MAP_NODE') {
      this.presentation = this.legacy.dispatch(command)
      this.presentation.screen = getMapNodeDestinationScreen(command.nodeType)
      this.currentStructuredSlot = null
      this.presentation.currentResult = null
      this.presentation.hasSpunThisTurn = false
      this.presentation.isSpinning = false
      this.presentation.lockedReels.clear()
      this.presentation.player.shield = 0
      this.resetOriginTraitState()
      this.projectStructuredBuild()
      this.syncStructuredCombatFromPresentation()
      return this.presentation
    }

    if (command.type === 'RESOLVE_EVENT_CHOICE') {
      this.presentation = this.legacy.dispatch(getEventChoiceCommand(command.choice))
      return this.presentation
    }

    if (command.type === 'CONFIRM_SLOT_RESULT' && (this.currentStructuredSlot || this.hasStructuredBuild())) {
      const slotResult = this.currentStructuredSlot ?? mapUiSlotResult(this.presentation)
      if (slotResult) {
        const events = this.structured.dispatch({
          type: 'RESOLVE_COMBAT_SLOT',
          result: slotResult,
          originTrait: this.getStructuredOriginTrait(),
        })
        this.projectStructuredState(events)
        this.applyGamblerJackpotTrait(slotResult)
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
      augments: [
        ...build.augments.map((id) => toUiAugment(getRequiredStructuredReward(id, 'augment'))),
        ...build.items.map((id) => toUiAugment(getRequiredStructuredReward(id, 'item'))),
      ],
      items: build.items,
      activeSynergies: build.synergies.active.map((synergy) => toUiSynergyName(synergy)),
      synergyProgress: DEFAULT_BUILD_CATALOG.synergies.map((synergy) =>
        toUiSynergyProgress(
          synergy,
          build.synergies.progress.find((progress) => progress.synergyId === synergy.id),
        ),
      ),
    }
  }

  private resetOriginTraitState(): void {
    this.presentation.originTraitState = {
      freeRerollAvailable: this.presentation.selectedOrigin === 'GAMBLER',
    }
  }

  private syncStructuredCombatFromPresentation(): void {
    this.structured.syncCombatFromPresentation(
      this.presentation.player,
      this.presentation.enemy,
      this.presentation.curse.current,
    )
  }

  private consumeFreeRerollIfAvailable(): boolean {
    if (this.presentation.selectedOrigin !== 'GAMBLER' || !this.presentation.originTraitState.freeRerollAvailable) {
      return false
    }

    this.presentation.originTraitState.freeRerollAvailable = false
    return true
  }

  private getStructuredOriginTrait(): 'swordsman' | 'gambler' | 'priest' | undefined {
    if (this.presentation.selectedOrigin === 'SWORDSMAN') {
      return 'swordsman'
    }

    if (this.presentation.selectedOrigin === 'GAMBLER') {
      return 'gambler'
    }

    if (this.presentation.selectedOrigin === 'PRIEST') {
      return 'priest'
    }

    return undefined
  }

  private applyGamblerJackpotTrait(slotResult: CombatSlotResult): void {
    if (this.presentation.selectedOrigin !== 'GAMBLER' || slotResult.modifier !== 'x3') {
      return
    }

    this.presentation.player.gold += 25
    this.presentation.combatLogs.push('[Origin:Gambler] x3 jackpot: gold +25, curse -1')
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
      if (event.target === 'enemy') {
        this.presentation.combatLogs.push(`적에게 ${event.healthLost} 피해를 주었습니다.`)
        this.presentation.lastDamagePop = {
          value: event.healthLost,
          type: 'ENEMY_DMG',
          id: Date.now(),
        }
      } else {
        this.presentation.combatLogs.push(`플레이어가 ${event.healthLost} 피해를 받았습니다.`)
      }
    }

    if (event.type === 'BLOCK_GAINED') {
      this.presentation.combatLogs.push(`방어막 ${event.amount}을 얻었습니다.`)
      this.presentation.lastDamagePop = {
        value: event.amount,
        type: 'SHIELD',
        id: Date.now(),
      }
    }

    if (event.type === 'ENEMY_ATTACKED') {
      if (event.blocked > 0 && event.healthLost > 0) {
        this.presentation.combatLogs.push(`적의 공격을 방어막으로 ${event.blocked} 경감하고 HP가 ${event.healthLost} 감소했습니다.`)
      } else if (event.blocked > 0) {
        this.presentation.combatLogs.push(`적의 공격을 방어막으로 ${event.blocked} 막았습니다.`)
      } else {
        this.presentation.combatLogs.push(`적의 공격으로 HP가 ${event.healthLost} 감소했습니다.`)
      }
      if (event.healthLost > 0) {
        this.presentation.lastDamagePop = {
          value: event.healthLost,
          type: 'PLAYER_DMG',
          id: Date.now(),
        }
      }
    }

    if (event.type === 'CURSE_INCREASED') {
      if (event.amount > 0) {
        this.presentation.combatLogs.push(`저주가 ${event.amount} 증가했습니다. 적 공격력은 저주 1당 10% 강해집니다.`)
      }
    }
  }
}

function getMapNodeDestinationScreen(nodeType: MapNodeType | undefined): UiGameState['screen'] {
  if (nodeType === 'SHOP') {
    return 'SHOP'
  }

  if (nodeType === 'REST') {
    return 'REST'
  }

  if (nodeType === 'EVENT') {
    return 'MAP'
  }

  return 'BATTLE'
}

function getEventChoiceCommand(choice: EventChoice): UiGameCommand {
  if (choice === 'OPEN') {
    return { type: 'BUY_SHOP_ITEM', itemId: '보물상자 획득', price: 0 }
  }

  if (choice === 'REST') {
    return { type: 'REST_ACTION', actionType: 'HEAL' }
  }

  return { type: 'NAVIGATE', screen: 'BATTLE' }
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
