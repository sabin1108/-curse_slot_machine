import type {
  CombatActionSymbol,
  CombatModifierSymbol,
  CombatTargetSymbol,
} from '../slot/CombatSlotTypes'
import type { Rarity, RewardKind, SynergyTag } from '../build/BuildTypes'

export type EffectCondition =
  | {
      type: 'slot.action_is'
      params: { action: CombatActionSymbol }
    }
  | {
      type: 'slot.target_is'
      params: { target: CombatTargetSymbol }
    }
  | {
      type: 'slot.modifier_is'
      params: { modifier: CombatModifierSymbol }
    }
  | {
      type: 'slot.locked_reels_at_least'
      params: { count: 1 | 2 }
    }
  | {
      type: 'combat.curse_at_least'
      params: { value: number }
    }
  | {
      type: 'combat.player_health_pct_at_most'
      params: { percent: number }
    }
  | {
      type: 'reward.kind_is'
      params: { kind: RewardKind }
    }
  | {
      type: 'reward.rarity_is'
      params: { rarity: Rarity }
    }
  | {
      type: 'reward.has_tag'
      params: { tag: SynergyTag }
    }
  | {
      type: 'build.synergy_active'
      params: { synergyId: string }
    }

export type EffectDefinition =
  | {
      id: string
      type: 'combat.action_amount.add'
      params: { action: CombatActionSymbol; amount: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'combat.action_amount.add_pct'
      params: { action: CombatActionSymbol; percent: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'combat.bullet.extra_hit'
      params: { percent: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'combat.curse_gain.add'
      params: { amount: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'combat.multiplier.add'
      params: { amount: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'combat.multiplier.max'
      params: { max: number }
      conditions?: EffectCondition[]
    }
  | {
      id: string
      type: 'reward.score.add'
      params: { amount: number }
      conditions?: EffectCondition[]
    }
