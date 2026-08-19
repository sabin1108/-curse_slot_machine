import type { CombatSlotResult } from '../slot/CombatSlotTypes'

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

export type CombatState = {
  player: CombatActorState
  enemy: CombatActorState
  curse: CurseState
  enemyIntent: EnemyIntent
  lastSlotResult?: CombatSlotResult
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

export type CombatResolution = CombatState & {
  events: CombatEvent[]
  outcome: CombatOutcome
}

export type CombatStateOverrides = {
  player?: Partial<Omit<CombatActorState, 'id'>>
  enemy?: Partial<Omit<CombatActorState, 'id'>>
  curse?: Partial<CurseState>
  enemyIntent?: Partial<EnemyIntent>
  lastSlotResult?: CombatSlotResult
}
