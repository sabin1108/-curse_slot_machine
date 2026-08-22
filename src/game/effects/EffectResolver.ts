import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { EffectCondition, EffectDefinition } from './EffectTypes'

export type EffectConditionContext = {
  slotResult?: CombatSlotResult
  curseValue?: number
  playerHealthPct?: number
  lockedReelCount?: number
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
    case 'reward.rarity_is':
    case 'reward.has_tag':
    case 'build.synergy_active':
      return false
    default: {
      const exhaustive: never = condition
      return exhaustive
    }
  }
}
