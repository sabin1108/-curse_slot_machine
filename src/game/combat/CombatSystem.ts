import type { CombatSlotResult, CombatTargetSymbol } from '../slot/CombatSlotTypes'
import type {
  CombatActorId,
  CombatActorState,
  CombatEvent,
  CombatEffectContext,
  CombatOutcome,
  CombatResolution,
  CombatState,
  CombatStateOverrides,
} from './CombatTypes'
import type { EffectCondition, EffectDefinition } from '../effects/EffectTypes'

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
  context: CombatEffectContext = {},
): CombatResolution {
  const events: CombatEvent[] = []
  let player = { ...state.player }
  let enemy = { ...state.enemy }
  const affectedActors = getAffectedActors(slotResult.target)
  const effects = context.effects ?? []
  const amount = getSlotAmount(slotResult, state, effects)

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

  if (slotResult.action === 'bullet') {
    for (const extraHitAmount of getExtraHitAmounts(amount, slotResult, state, effects)) {
      for (const actorId of affectedActors) {
        const target = actorId === 'player' ? player : enemy
        const resolved = applyDamage(target, extraHitAmount)
        player = actorId === 'player' ? resolved.actor : player
        enemy = actorId === 'enemy' ? resolved.actor : enemy
        events.push({
          type: 'DAMAGE_APPLIED',
          target: actorId,
          amount: extraHitAmount,
          blocked: resolved.blocked,
          healthLost: resolved.healthLost,
        })
      }
    }

    if (context.originTrait === 'swordsman' && affectedActors.includes('enemy') && amount >= 16 && enemy.health > 0) {
      const bonusStrikeAmount = Math.max(1, Math.round(amount * 0.5))
      const resolved = applyDamage(enemy, bonusStrikeAmount)
      enemy = resolved.actor
      events.push({
        type: 'DAMAGE_APPLIED',
        target: 'enemy',
        amount: bonusStrikeAmount,
        blocked: resolved.blocked,
        healthLost: resolved.healthLost,
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

  const baseCurseGain = getCurseGain(state, slotResult, effects)
  const curseGain = context.originTrait === 'priest' && (slotResult.action === 'shield' || slotResult.action === 'heart')
    ? Math.max(0, baseCurseGain - 1)
    : baseCurseGain
  const jackpotCurseReduction = context.originTrait === 'gambler' && slotResult.modifier === 'x3' ? 1 : 0
  const curse = {
    value: Math.max(0, state.curse.value + curseGain - jackpotCurseReduction),
  }
  events.push({
    type: 'CURSE_INCREASED',
    amount: curseGain,
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

function getSlotAmount(
  slotResult: CombatSlotResult,
  state: CombatState,
  effects: EffectDefinition[],
): number {
  const multiplier = MODIFIER_MULTIPLIER[slotResult.modifier]
  const base = getBaseSlotAmount(slotResult) * multiplier
  const flatBonus = effects
    .filter((effect) => effect.type === 'combat.action_amount.add')
    .filter((effect) => effect.params.action === slotResult.action)
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state))
    .reduce((sum, effect) => sum + effect.params.amount, 0)
  const percentBonus = effects
    .filter((effect) => effect.type === 'combat.action_amount.add_pct')
    .filter((effect) => effect.params.action === slotResult.action)
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state))
    .reduce((sum, effect) => sum + effect.params.percent, 0)

  return Math.floor((base + flatBonus) * (1 + Math.min(200, percentBonus) / 100))
}

function getBaseSlotAmount(slotResult: CombatSlotResult): number {
  if (slotResult.action === 'bullet') {
    return COMBAT_BASE_VALUES.bulletDamage
  }

  if (slotResult.action === 'shield') {
    return COMBAT_BASE_VALUES.shieldBlock
  }

  return COMBAT_BASE_VALUES.heartHealing
}

function getExtraHitAmounts(
  amount: number,
  slotResult: CombatSlotResult,
  state: CombatState,
  effects: EffectDefinition[],
): number[] {
  return effects
    .filter((effect) => effect.type === 'combat.bullet.extra_hit')
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state))
    .slice(0, 2)
    .map((effect) => Math.floor((amount * effect.params.percent) / 100))
    .filter((extraHitAmount) => extraHitAmount > 0)
}

function getCurseGain(
  state: CombatState,
  slotResult: CombatSlotResult,
  effects: EffectDefinition[],
): number {
  const adjustment = effects
    .filter((effect) => effect.type === 'combat.curse_gain.add')
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state))
    .reduce((sum, effect) => sum + effect.params.amount, 0)

  return clamp(1 + adjustment, 0, 3)
}

function conditionsMatch(
  conditions: EffectCondition[],
  slotResult: CombatSlotResult,
  state: CombatState,
): boolean {
  return conditions.every((condition) => {
    if (condition.type === 'slot.action_is') {
      return slotResult.action === condition.params.action
    }

    if (condition.type === 'slot.target_is') {
      return slotResult.target === condition.params.target
    }

    if (condition.type === 'slot.modifier_is') {
      return slotResult.modifier === condition.params.modifier
    }

    if (condition.type === 'combat.curse_at_least') {
      return state.curse.value >= condition.params.value
    }

    if (condition.type === 'combat.player_health_pct_at_most') {
      return (state.player.health / state.player.maxHealth) * 100 <= condition.params.percent
    }

    return false
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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
