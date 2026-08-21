import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import type { CombatStatusId, EffectDefinition } from '../effects/EffectTypes'
import type { CombatSlotLocks } from '../slot/CombatSlotTypes'

export type CombatActorId = 'player' | 'enemy'

export type CombatActorState = {
  id: CombatActorId
  name: string
  maxHealth: number
  health: number
  block: number
  phase?: 1 | 2
  phaseTwoThreshold?: number
  phaseTwoAttack?: number
}

export type EnemyIntent = {
  type: 'attack' | 'wait' | 'defend'
  baseAmount: number
  amount: number
}

export type CurseState = {
  value: number
  max: 10
  attackBonus: number
}

export type CombatStatusStack = {
  id: CombatStatusId
  stacks: number
}

export type CombatState = {
  player: CombatActorState
  enemy: CombatActorState
  curse: CurseState
  enemyIntent: EnemyIntent
  lastSlotResult?: CombatSlotResult
  statuses: {
    player: CombatStatusStack[]
    enemy: CombatStatusStack[]
  }
  effectUses: string[]
}

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat'

export type CombatEndReason = 'enemy_defeated' | 'player_defeated' | 'curse_overload'

export type CombatPreview = {
  playerHealthDelta: number
  playerBlockDelta: number
  enemyHealthDelta: number
  enemyBlockDelta: number
  curseDelta: number
  enemyAttack: number
  outcome: CombatOutcome
  endReason?: CombatEndReason
  warnings: string[]
}

export type CombatEvent =
  | {
      type: 'DAMAGE_APPLIED'
      target: CombatActorId
      amount: number
      blocked: number
      healthLost: number
    }
  | {
      type: 'BLOCK_GAINED'
      target: CombatActorId
      amount: number
    }
  | {
      type: 'HEAL_APPLIED'
      target: CombatActorId
      amount: number
      effectiveAmount: number
    }
  | {
      type: 'ENEMY_ATTACKED'
      amount: number
      blocked: number
      healthLost: number
    }
  | {
      type: 'ENEMY_WAITED'
    }
  | {
      type: 'ENEMY_DEFENDED'
      amount: number
    }
  | {
      type: 'CURSE_INCREASED'
      amount: number
      value: number
    }
  | {
      type: 'COMBAT_ENDED'
      outcome: Exclude<CombatOutcome, 'ongoing'>
      reason: CombatEndReason
    }
  | {
      type: 'STATUS_APPLIED'
      target: CombatActorId
      status: CombatStatusId
      stacks: number
    }
  | {
      type: 'STATUS_CONSUMED'
      target: CombatActorId
      status: CombatStatusId
      stacks: number
    }
  | {
      type: 'CURSE_PREVENTED'
      effectId: string
    }
  | {
      type: 'CURSE_THRESHOLD_REACHED'
      threshold: 5 | 8 | 10
      attackBonus: number
    }
  | {
      type: 'BOSS_PHASE_CHANGED'
      phase: 2
      attack: number
    }
  | {
      type: 'ORIGIN_TRAIT_TRIGGERED'
      origin: 'swordsman'
      effect: 'bonus_strike'
      amount: number
    }

export type CombatResolution = CombatState & {
  events: CombatEvent[]
  outcome: CombatOutcome
  endReason?: CombatEndReason
}

export type CombatEffectContext = {
  effects?: EffectDefinition[]
  originTrait?: 'swordsman' | 'gambler' | 'priest'
  lockedReels?: CombatSlotLocks
}

export type CombatStateOverrides = {
  player?: Partial<Omit<CombatActorState, 'id'>>
  enemy?: Partial<Omit<CombatActorState, 'id'>>
  curse?: Partial<CurseState>
  enemyIntent?: Partial<EnemyIntent>
  lastSlotResult?: CombatSlotResult
  statuses?: Partial<CombatState['statuses']>
  effectUses?: string[]
}
