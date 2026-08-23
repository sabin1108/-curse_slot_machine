import type { RewardRef } from '../build/BuildTypes'
import type { CombatEffectContext } from '../combat/CombatTypes'
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
  } & Pick<CombatEffectContext, 'originTrait'>
  | {
      type: 'CHOOSE_REWARD'
      reward: RewardRef
    }
