import type { RewardRef } from '../build/BuildTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'

export type GameCommand =
  | {
      type: 'START_RUN'
    }
  | {
      type: 'ADVANCE_TURN'
    }
  | {
      type: 'RESOLVE_COMBAT_SLOT'
      result: CombatSlotResult
    }
  | {
      type: 'CHOOSE_REWARD'
      reward: RewardRef
    }
