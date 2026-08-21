import type { BuildEvent, RewardRef } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatEvent, CombatOutcome } from '../combat/CombatTypes'
import type { AugmentSlotPresentation } from '../slot/AugmentSlotTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { RunStageDefinition } from '../run/RunTypes'

export type GameEvent =
  | {
      type: 'RUN_STARTED'
      turn: number
      roll: number
    }
  | {
      type: 'TURN_ADVANCED'
      turn: number
      roll: number
    }
  | {
      type: 'STAGE_ENTERED'
      stage: RunStageDefinition
    }
  | {
      type: 'STAGE_COMPLETED'
      stage: RunStageDefinition
    }
  | {
      type: 'COMBAT_SLOT_SPUN' | 'COMBAT_SLOT_REROLLED'
      result: CombatSlotResult
    }
  | {
      type: 'REEL_LOCK_TOGGLED'
      reel: 'action' | 'target' | 'modifier'
      locked: boolean
    }
  | {
      type: 'COMMAND_REJECTED'
      command: string
      reason: string
    }
  | {
      type: 'REST_RESOLVED'
      action: 'heal' | 'purify'
      amount: number
    }
  | {
      type: 'SHOP_ITEM_PURCHASED'
      reward: RewardRef
      price: number
    }
  | {
      type: 'EVENT_RESOLVED'
      choice: 'reward' | 'gold' | 'rest' | 'skip'
    }
  | {
      type: 'COMBAT_SLOT_RESOLVED'
      turn: number
      result: CombatSlotResult
      outcome: CombatOutcome
      combatEvents: CombatEvent[]
    }
  | {
      type: 'REWARDS_GENERATED'
      options: RewardOption[]
      augmentSlot: AugmentSlotPresentation
    }
  | {
      type: 'REWARD_CHOSEN'
      reward: RewardRef
      buildEvents: BuildEvent[]
    }
