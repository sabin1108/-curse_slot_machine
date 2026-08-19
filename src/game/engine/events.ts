import type { BuildEvent, RewardRef } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatEvent, CombatOutcome } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'

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
      type: 'COMBAT_SLOT_RESOLVED'
      turn: number
      result: CombatSlotResult
      outcome: CombatOutcome
      combatEvents: CombatEvent[]
    }
  | {
      type: 'REWARDS_GENERATED'
      options: RewardOption[]
    }
  | {
      type: 'REWARD_CHOSEN'
      reward: RewardRef
      buildEvents: BuildEvent[]
    }
