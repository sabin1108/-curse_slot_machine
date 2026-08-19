import type { CombatSlotResult, CombatTargetSymbol } from '../slot/CombatSlotTypes'
import type {
  CombatActorId,
  CombatActorState,
  CombatEvent,
  CombatOutcome,
  CombatResolution,
  CombatState,
  CombatStateOverrides,
} from './CombatTypes'

const COMBAT_BASE_VALUES = {
  bulletDamage: 6,
  shieldBlock: 5,
  heartHealing: 4,
  enemyAttack: 4,
} as const

const MODIFIER_MULTIPLIER = {
  x1: 1,
  x2: 2,
  x3: 3,
} as const satisfies Record<CombatSlotResult['modifier'], number>

export function createCombatState(overrides: CombatStateOverrides = {}): CombatState {
  const player = createActor(
    {
      id: 'player',
      name: 'Player',
      maxHealth: 30,
      health: 30,
      block: 0,
    },
    overrides.player,
  )
  const enemy = createActor(
    {
      id: 'enemy',
      name: 'Enemy',
      maxHealth: 18,
      health: 18,
      block: 0,
    },
    overrides.enemy,
  )

  return {
    player,
    enemy,
    curse: {
      value: overrides.curse?.value ?? 0,
    },
    enemyIntent: {
      type: overrides.enemyIntent?.type ?? 'attack',
      amount: overrides.enemyIntent?.amount ?? COMBAT_BASE_VALUES.enemyAttack,
    },
    ...(overrides.lastSlotResult ? { lastSlotResult: overrides.lastSlotResult } : {}),
  }
}

export function resolveCombatSlot(
  state: CombatState,
  slotResult: CombatSlotResult,
): CombatResolution {
  const events: CombatEvent[] = []
  let player = { ...state.player }
  let enemy = { ...state.enemy }
  const affectedActors = getAffectedActors(slotResult.target)
  const amount = getSlotAmount(slotResult)

  for (const actorId of affectedActors) {
    if (slotResult.action === 'bullet') {
      const target = actorId === 'player' ? player : enemy
      const resolved = applyDamage(target, amount)
      player = actorId === 'player' ? resolved.actor : player
      enemy = actorId === 'enemy' ? resolved.actor : enemy
      events.push({
        type: 'DAMAGE_APPLIED',
        target: actorId,
        amount,
        blocked: resolved.blocked,
        healthLost: resolved.healthLost,
      })
    }

    if (slotResult.action === 'shield') {
      const target = actorId === 'player' ? player : enemy
      const resolved = {
        ...target,
        block: target.block + amount,
      }
      player = actorId === 'player' ? resolved : player
      enemy = actorId === 'enemy' ? resolved : enemy
      events.push({
        type: 'BLOCK_GAINED',
        target: actorId,
        amount,
      })
    }

    if (slotResult.action === 'heart') {
      const target = actorId === 'player' ? player : enemy
      const nextHealth = Math.min(target.maxHealth, target.health + amount)
      const resolved = {
        ...target,
        health: nextHealth,
      }
      player = actorId === 'player' ? resolved : player
      enemy = actorId === 'enemy' ? resolved : enemy
      events.push({
        type: 'HEAL_APPLIED',
        target: actorId,
        amount,
        effectiveAmount: nextHealth - target.health,
      })
    }
  }

  if (enemy.health > 0 && player.health > 0) {
    const resolved = applyDamage(player, state.enemyIntent.amount)
    player = resolved.actor
    events.push({
      type: 'ENEMY_ATTACKED',
      amount: state.enemyIntent.amount,
      blocked: resolved.blocked,
      healthLost: resolved.healthLost,
    })
  }

  const curse = {
    value: state.curse.value + 1,
  }
  events.push({
    type: 'CURSE_INCREASED',
    amount: 1,
    value: curse.value,
  })

  const outcome = getOutcome(player, enemy)
  if (outcome !== 'ongoing') {
    events.push({
      type: 'COMBAT_ENDED',
      outcome,
    })
  }

  return {
    player,
    enemy,
    curse,
    enemyIntent: state.enemyIntent,
    lastSlotResult: slotResult,
    events,
    outcome,
  }
}

function createActor(
  defaults: CombatActorState,
  overrides: Partial<Omit<CombatActorState, 'id'>> = {},
): CombatActorState {
  const maxHealth = overrides.maxHealth ?? defaults.maxHealth
  const health = Math.min(maxHealth, Math.max(0, overrides.health ?? defaults.health))

  return {
    ...defaults,
    ...overrides,
    maxHealth,
    health,
    block: Math.max(0, overrides.block ?? defaults.block),
  }
}

function getSlotAmount(slotResult: CombatSlotResult): number {
  const multiplier = MODIFIER_MULTIPLIER[slotResult.modifier]

  if (slotResult.action === 'bullet') {
    return COMBAT_BASE_VALUES.bulletDamage * multiplier
  }

  if (slotResult.action === 'shield') {
    return COMBAT_BASE_VALUES.shieldBlock * multiplier
  }

  return COMBAT_BASE_VALUES.heartHealing * multiplier
}

function getAffectedActors(target: CombatTargetSymbol): CombatActorId[] {
  if (target === 'enemy') {
    return ['enemy']
  }

  if (target === 'self') {
    return ['player']
  }

  return ['player', 'enemy']
}

function applyDamage(
  actor: CombatActorState,
  amount: number,
): { actor: CombatActorState; blocked: number; healthLost: number } {
  const blocked = Math.min(actor.block, amount)
  const healthLost = Math.min(actor.health, amount - blocked)

  return {
    actor: {
      ...actor,
      block: actor.block - blocked,
      health: actor.health - healthLost,
    },
    blocked,
    healthLost,
  }
}

function getOutcome(player: CombatActorState, enemy: CombatActorState): CombatOutcome {
  if (enemy.health <= 0) {
    return 'victory'
  }

  if (player.health <= 0) {
    return 'defeat'
  }

  return 'ongoing'
}
