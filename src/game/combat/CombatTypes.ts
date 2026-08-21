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
}

export type EnemyIntent = {
  type: 'attack'
  amount: number
}

export type CurseState = {
  value: number
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
      type: 'CURSE_INCREASED'
      amount: number
      value: number
    }
  | {
      type: 'COMBAT_ENDED'
      outcome: Exclude<CombatOutcome, 'ongoing'>
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

export type CombatResolution = CombatState & {
  events: CombatEvent[]
  outcome: CombatOutcome
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
