import type { Rarity, RewardKind, SynergyTag } from '../build/BuildTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { EffectCondition, EffectDefinition } from './EffectTypes'

export type RewardEffectFacts = {
  kind: RewardKind
  rarity: Rarity
  tags: readonly SynergyTag[]
}

export type EffectConditionContext = {
  slotResult?: CombatSlotResult
  curseValue?: number
  playerHealthPct?: number
  lockedReelCount?: number
  reward?: RewardEffectFacts
  activeSynergyIds?: readonly string[]
}

export function effectConditionsMatch(
  effect: Pick<EffectDefinition, 'conditions'>,
  context: EffectConditionContext,
): boolean {
  return (effect.conditions ?? []).every((condition) => conditionMatches(condition, context))
}

function conditionMatches(
  condition: EffectCondition,
  context: EffectConditionContext,
): boolean {
  switch (condition.type) {
    case 'slot.action_is':
      return context.slotResult?.action === condition.params.action
    case 'slot.target_is':
      return context.slotResult?.target === condition.params.target
    case 'slot.modifier_is':
      return context.slotResult?.modifier === condition.params.modifier
    case 'slot.locked_reels_at_least':
      return (context.lockedReelCount ?? 0) >= condition.params.count
    case 'combat.curse_at_least':
      return (context.curseValue ?? -Infinity) >= condition.params.value
    case 'combat.player_health_pct_at_most':
      return context.playerHealthPct !== undefined && context.playerHealthPct <= condition.params.percent
    case 'reward.kind_is':
      return context.reward?.kind === condition.params.kind
    case 'reward.rarity_is':
      return context.reward?.rarity === condition.params.rarity
    case 'reward.has_tag':
      return context.reward?.tags.includes(condition.params.tag) ?? false
    case 'build.synergy_active':
      return context.activeSynergyIds?.includes(condition.params.synergyId) ?? false
    default: {
      const exhaustive: never = condition
      return exhaustive
    }
  }
}
