import type { RewardRef } from '../build/BuildTypes'
import type { CombatEffectContext } from '../combat/CombatTypes'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { CombatSlotLocks } from '../slot/CombatSlotTypes'

export type GameCommand =
  | {
      type: 'START_RUN'
    }
  | {
      type: 'ADVANCE_TURN'
    }
  | {
      type: 'ENTER_NEXT_STAGE'
    }
  | {
      type: 'SPIN_COMBAT_SLOT'
    }
  | {
      type: 'TOGGLE_REEL_LOCK'
      reel: keyof CombatSlotLocks
    }
  | {
      type: 'REROLL_UNLOCKED'
    }
  | {
      type: 'CONFIRM_COMBAT_SLOT'
    }
  | {
      type: 'RESOLVE_REST'
      action: 'heal' | 'purify'
    }
  | {
      type: 'BUY_SHOP_ITEM'
      rewardId: string
    }
  | {
      type: 'LEAVE_SHOP'
    }
  | {
      type: 'RESOLVE_EVENT'
      choice: 'reward' | 'gold' | 'rest' | 'skip'
    }
  | {
    type: 'RESOLVE_COMBAT_SLOT'
    result: CombatSlotResult
  } & Pick<CombatEffectContext, 'originTrait'>
  | {
      type: 'CHOOSE_REWARD'
      reward: RewardRef
    }
