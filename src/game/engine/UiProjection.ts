import type {
  AugmentItem,
  ReelSymbol,
  SlotResult,
  SynergyProgress as UiSynergyProgress,
} from '../../types/game'
import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../data'
import type {
  BuildRewardDefinition,
  SynergyDefinition,
  SynergyProgress as BuildSynergyProgress,
  SynergyTag,
} from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import { getAsset } from '../../assets/assetHelper'

export function toUiAugment(reward: BuildRewardDefinition): AugmentItem {
  return {
    id: reward.id,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : undefined,
    effectValue: reward.effectLabel ?? reward.effectId ?? reward.effects?.[0]?.id ?? 'EFFECT',
  }
}

export function toUiReward(reward: RewardOption): AugmentItem {
  return {
    id: reward.id,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: reward.kind === 'item' ? 'ITEM' : 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : undefined,
    effectValue: reward.effectLabel ?? `score ${reward.score.total}`,
  }
}

export function toUiSlotResult(slotResult: CombatSlotResult): SlotResult {
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

export function getReelIndex(symbols: ReelSymbol[], id: string): number {
  return Math.max(0, symbols.findIndex((symbol) => symbol.id === id))
}

export function toUiSynergyProgress(
  synergy: SynergyDefinition,
  progress?: BuildSynergyProgress,
): UiSynergyProgress {
  const required = getSynergyRequired(synergy)
  const current = progress?.current ?? 0
  const activeTier = [...(synergy.tiers ?? [])]
    .sort((left, right) => right.count - left.count)
    .find((tier) => current >= tier.count)

  return {
    synergyId: synergy.id,
    name: synergy.name,
    tag: synergy.tierTag ?? synergy.requiredTags[0]?.tag ?? ('COMBO' satisfies SynergyTag),
    current,
    required,
    completed: progress?.completed ?? current >= required,
    effectDescription: activeTier
      ? `${activeTier.effectLabel} / ${activeTier.description}`
      : synergy.description,
  }
}

function getSynergyRequired(synergy: SynergyDefinition): number {
  const tierRequired = Math.max(0, ...(synergy.tiers ?? []).map((tier) => tier.count))
  const baseRequired = synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0)

  return Math.max(tierRequired, baseRequired)
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
    icon: type,
    color: '#cccccc',
    description: type,
  }
}

function getUiSlotAmount(slotResult: CombatSlotResult): number {
  const base = slotResult.action === 'bullet' ? 6 : slotResult.action === 'shield' ? 5 : 4
  const multiplier = slotResult.modifier === 'x1' ? 1 : slotResult.modifier === 'x2' ? 2 : 3

  return base * multiplier
}
