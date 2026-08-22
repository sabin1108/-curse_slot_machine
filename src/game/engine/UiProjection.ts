import { getAsset } from '../../assets/assetHelper'
import type { AugmentItem, GameScreen, GameState as UiGameState, ReelSymbol, SlotResult, SynergyProgress as UiSynergyProgress } from '../../types/game'
import { MVP_BUILD_CATALOG } from '../build/MvpBuildCatalog'
import type { BuildRewardDefinition, SynergyDefinition, SynergyProgress as CoreSynergyProgress } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../data'
import type { CombatPreview, EnemyIntent as CoreEnemyIntent } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { GameState as CoreGameState } from './GameState'

export type UiFeedback = {
  combatLogs: string[]
  lastDamagePop: UiGameState['lastDamagePop']
  enemyDamagePops: UiGameState['enemyDamagePops']
  isEnemyAttacking: boolean
  showcase: UiGameState['showcase']
}

export function projectUiGameState(state: CoreGameState, feedback: UiFeedback): UiGameState {
  const currentStageId = state.run.currentStage?.id ?? Math.min(15, state.run.completedStageIds.length + 1)
  const currentResult = state.slot.current ? toUiSlotResult(state.slot.current, state.slot.preview) : null
  const ownedDefinitions = [...state.build.augments, ...state.build.items].map(getRequiredReward)
  const enemyId = state.run.currentStage?.type === 'boss' ? 'house_dealer_boss' : `mvp_${state.run.currentStage?.type ?? 'combat'}`

  return {
    mode: 'NORMAL',
    screen: toUiScreen(state.phase),
    seed: String(state.seed),
    turn: state.turn,
    wave: currentStageId,
    totalWaves: 15,
    floor: 1,
    totalFloors: 1,
    player: {
      hp: state.combat.player.health,
      maxHp: state.combat.player.maxHealth,
      shield: state.combat.player.block,
      gold: state.economy.gold,
    },
    enemy: {
      id: enemyId,
      name: state.combat.enemy.name,
      hp: state.combat.enemy.health,
      maxHp: state.combat.enemy.maxHealth,
      shield: state.combat.enemy.block,
      statuses: state.combat.statuses.enemy.map((status) => ({ type: status.id, duration: 1, value: status.stacks })),
      intent: toUiEnemyIntent(state.combat.enemyIntent),
      spriteUrl: state.run.currentStage?.type === 'boss' ? getAsset('boss_common') : getAsset('ogre'),
    },
    curse: {
      current: state.combat.curse.value,
      max: state.combat.curse.max,
      threshold1Triggered: state.combat.curse.value >= 5,
      threshold2Triggered: state.combat.curse.value >= 8,
    },
    build: {
      augments: ownedDefinitions.map(toUiAugment),
      items: [...state.build.items],
      activeSynergies: state.build.synergies.active.map((synergy) => synergy.name),
      synergyProgress: MVP_BUILD_CATALOG.synergies.map((synergy) => toUiSynergyProgress(synergy, state.build.synergies.progress.find((progress) => progress.synergyId === synergy.id))),
    },
    visitedNodePath: [...state.run.completedStageIds],
    selectedOrigin: state.selectedOrigin ?? undefined,
    originTraitState: { freeRerollAvailable: state.originTraitState.freeRerollAvailable },
    narrativeMicrocopy: state.selectedOrigin ? `${state.selectedOrigin} · 결정론적 15 스테이지` : undefined,
    curseLogsUnlocked: [],
    isEnemyAttacking: feedback.isEnemyAttacking,
    isEnemyDefeated: state.combat.enemy.health <= 0,
    reels: { action: ACTION_SYMBOLS, target: TARGET_SYMBOLS, modifier: MODIFIER_SYMBOLS },
    reelIndexes: currentResult ? {
      action: getReelIndex(ACTION_SYMBOLS, currentResult.action.id),
      target: getReelIndex(TARGET_SYMBOLS, currentResult.target.id),
      modifier: getReelIndex(MODIFIER_SYMBOLS, currentResult.modifier.id),
    } : { action: 0, target: 0, modifier: 0 },
    lockedReels: new Set(Object.entries(state.slot.locks).filter(([, locked]) => locked).map(([reel]) => reel as 'action' | 'target' | 'modifier')),
    currentResult,
    hasSpunThisTurn: state.slot.hasSpun,
    isSpinning: false,
    rewardCandidates: state.rewards.options.map(toUiReward),
    augSlotPresentation: state.rewards.augmentSlot ? {
      reels: state.rewards.augmentSlot.reels.map((reel) => reel.label) as [string, string, string],
      targetAugment: toUiReward(state.rewards.augmentSlot.targetReward),
      isRevealed: state.rewards.augmentSlot.isRevealed,
    } : null,
    combatLogs: feedback.combatLogs,
    lastDamagePop: feedback.lastDamagePop,
    lastEnemyDamagePop: feedback.enemyDamagePops.at(-1) ?? null,
    enemyDamagePops: feedback.enemyDamagePops,
    showcase: feedback.showcase,
  }
}

export function toUiScreen(phase: CoreGameState['phase']): GameScreen {
  if (phase === 'battle') return 'BATTLE'
  if (phase === 'reward') return 'REWARD'
  if (phase === 'shop') return 'SHOP'
  if (phase === 'rest') return 'REST'
  if (phase === 'victory') return 'VICTORY'
  if (phase === 'defeat') return 'GAMEOVER'
  return 'MAP'
}

export function toUiEnemyIntent(intent: CoreEnemyIntent): UiGameState['enemy']['intent'] {
  if (intent.type === 'wait') {
    return {
      id: 'wait',
      name: '숨 고르기',
      type: 'WAIT',
      value: 0,
      icon: '💤',
      description: '이번 턴에는 공격하지 않습니다.',
    }
  }
  if (intent.type === 'defend') {
    return {
      id: 'defend',
      name: '방어 태세',
      type: 'DEFEND',
      value: intent.amount,
      icon: '🛡️',
      description: `방어를 최대 ${intent.amount} 얻습니다. (상한 2)`,
    }
  }
  return {
    id: 'attack',
    name: '예고된 공격',
    type: 'ATTACK',
    value: intent.amount,
    icon: '⚔',
    description: `다음 반격 ${intent.amount}`,
  }
}

export function toUiAugment(reward: BuildRewardDefinition): AugmentItem {
  return {
    id: reward.id,
    kind: reward.kind,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: reward.kind === 'item' ? 'ITEM' : 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : undefined,
    effectValue: reward.effectLabel ?? reward.effectId ?? '효과',
  }
}

export function toUiReward(reward: RewardOption): AugmentItem {
  return toUiAugment(reward)
}

export function toUiSlotResult(result: CombatSlotResult, preview: CombatPreview | null = null): SlotResult {
  const action = getRequiredSymbol(ACTION_SYMBOLS, result.action)
  const target = createTargetSymbol(result.target)
  const modifier = getRequiredSymbol(MODIFIER_SYMBOLS, result.modifier)
  const multiplier = result.modifier === 'x3' ? 3 : result.modifier === 'x2' ? 2 : 1
  const damage = preview ? Math.max(0, -preview.enemyHealthDelta) : 0
  const defense = preview ? Math.max(0, preview.playerBlockDelta) : 0
  return {
    action, target, modifier, isMiss: false, calculatedValue: damage, defenseValue: defense,
    multiplierValue: multiplier, attackMultiplierValue: multiplier, defenseMultiplierValue: multiplier,
    finalEffectText: preview ? `적 HP ${preview.enemyHealthDelta}, 내 HP ${preview.playerHealthDelta}, 방어 ${preview.playerBlockDelta}` : `${result.action}/${result.target}/${result.modifier}`,
  }
}

export function getReelIndex(symbols: ReelSymbol[], id: string): number {
  return Math.max(0, symbols.findIndex((symbol) => symbol.id === id))
}

export function toUiSynergyProgress(synergy: SynergyDefinition, progress?: CoreSynergyProgress): UiSynergyProgress {
  const required = progress?.required ?? Math.max(1, ...synergy.requiredTags.map((tag) => tag.count))
  const current = progress?.current ?? 0
  return {
    synergyId: synergy.id,
    name: synergy.name,
    tag: synergy.tierTag ?? synergy.requiredTags[0]?.tag ?? 'COMBO',
    current,
    required,
    completed: progress?.completed ?? current >= required,
    effectDescription: synergy.description,
    tierEffects: synergy.tiers?.map((tier) => ({ count: tier.count, label: tier.effectLabel, description: tier.description })),
  }
}

function getRequiredReward(id: string): BuildRewardDefinition {
  const reward = MVP_BUILD_CATALOG.rewards.find((candidate) => candidate.id === id)
  if (!reward) throw new Error(`Missing MVP reward definition: ${id}`)
  return reward
}

function getRequiredSymbol(symbols: ReelSymbol[], id: string): ReelSymbol {
  const symbol = symbols.find((candidate) => candidate.id === id)
  if (!symbol) throw new Error(`Missing UI reel symbol: ${id}`)
  return symbol
}

function createTargetSymbol(id: 'enemy' | 'self' | 'all'): ReelSymbol {
  const type = id === 'enemy' ? 'ENEMY' : id === 'self' ? 'SELF' : 'ALL'
  return { id, name: type, type, category: 'TARGET', baseValue: 0, icon: id, color: '#cccccc', description: id }
}
