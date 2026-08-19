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
