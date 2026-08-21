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
  CombatStatusStack,
} from './CombatTypes'
import type { CombatStatusId, EffectCondition, EffectDefinition } from '../effects/EffectTypes'

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
    statuses: {
      player: (overrides.statuses?.player ?? []).map((status) => ({ ...status })),
      enemy: (overrides.statuses?.enemy ?? []).map((status) => ({ ...status })),
    },
    effectUses: [...(overrides.effectUses ?? [])],
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
  const effects = context.effects ?? []
  const statuses = cloneStatuses(state.statuses)
  const effectUses = [...state.effectUses]
  let statusConsumed = false

  const burnStacks = getStatusStacks(statuses.enemy, 'burn')
  if (burnStacks > 0 && enemy.health > 0) {
    const burnDamage = burnStacks * 2
    const resolved = applyDamage(enemy, burnDamage)
    enemy = resolved.actor
    consumeStatus(statuses.enemy, 'burn', 1)
    events.push({
      type: 'DAMAGE_APPLIED',
      target: 'enemy',
      amount: burnDamage,
      blocked: resolved.blocked,
      healthLost: resolved.healthLost,
    })
    events.push({ type: 'STATUS_CONSUMED', target: 'enemy', status: 'burn', stacks: 1 })
    statusConsumed = true
  }

  const effectiveSlotResult = applyModifierSteps(slotResult, state, effects, statuses, context, events)
  if (effectiveSlotResult.modifier !== slotResult.modifier && getStatusStacks(state.statuses.enemy, 'exposed') > 0) {
    statusConsumed = true
  }
  const affectedActors = getAffectedActors(effectiveSlotResult.target)
  const amount = getSlotAmount(effectiveSlotResult, state, effects, context)

  for (const actorId of affectedActors) {
    if (effectiveSlotResult.action === 'bullet') {
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

    if (effectiveSlotResult.action === 'shield') {
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

    if (effectiveSlotResult.action === 'heart') {
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

  let extraHitOccurred = false
  if (effectiveSlotResult.action === 'bullet') {
    const extraHitAmounts = getExtraHitAmounts(amount, effectiveSlotResult, state, effects, context)
    for (const effect of effects.filter((candidate) => candidate.type === 'combat.status.consume_extra_hit')) {
      if (!conditionsMatch(effect.conditions ?? [], effectiveSlotResult, state, context)) continue
      const targetStatuses = statuses[effect.params.target]
      if (getStatusStacks(targetStatuses, effect.params.status) <= 0) continue
      consumeStatus(targetStatuses, effect.params.status, 1)
      events.push({ type: 'STATUS_CONSUMED', target: effect.params.target, status: effect.params.status, stacks: 1 })
      extraHitAmounts.push(Math.floor((amount * effect.params.percent) / 100))
      statusConsumed = true
    }

    for (const extraHitAmount of extraHitAmounts) {
      extraHitOccurred = true
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

  let fullBlock = false
  let blockDepleted = false
  if (enemy.health > 0 && player.health > 0) {
    const blockBeforeAttack = player.block
    const resolved = applyDamage(player, state.enemyIntent.amount)
    player = resolved.actor
    fullBlock = state.enemyIntent.amount > 0 && resolved.blocked === state.enemyIntent.amount && resolved.healthLost === 0
    blockDepleted = blockBeforeAttack > 0 && player.block === 0
    events.push({
      type: 'ENEMY_ATTACKED',
      amount: state.enemyIntent.amount,
      blocked: resolved.blocked,
      healthLost: resolved.healthLost,
    })
  }

  if (fullBlock && enemy.health > 0) {
    const retaliation = effects.find((effect) => effect.type === 'combat.full_block.retaliate')
    if (retaliation) {
      const resolved = applyDamage(enemy, retaliation.params.amount)
      enemy = resolved.actor
      events.push({
        type: 'DAMAGE_APPLIED', target: 'enemy', amount: retaliation.params.amount,
        blocked: resolved.blocked, healthLost: resolved.healthLost,
      })
      for (const effect of effects.filter((candidate) => candidate.type === 'combat.retaliation.status_apply')) {
        addStatus(statuses.enemy, effect.params.status, effect.params.stacks)
        events.push({ type: 'STATUS_APPLIED', target: 'enemy', status: effect.params.status, stacks: effect.params.stacks })
      }
    }
  }

  for (const effect of effects.filter((candidate) => candidate.type === 'combat.status.apply')) {
    if (!conditionsMatch(effect.conditions ?? [], effectiveSlotResult, state, context)) continue
    addStatus(statuses[effect.params.target], effect.params.status, effect.params.stacks)
    events.push({ type: 'STATUS_APPLIED', target: effect.params.target, status: effect.params.status, stacks: effect.params.stacks })
  }
  if (extraHitOccurred) {
    for (const effect of effects.filter((candidate) => candidate.type === 'combat.extra_hit.status_apply')) {
      addStatus(statuses[effect.params.target], effect.params.status, effect.params.stacks)
      events.push({ type: 'STATUS_APPLIED', target: effect.params.target, status: effect.params.status, stacks: effect.params.stacks })
    }
  }

  const baseCurseGain = getCurseGain(state, effectiveSlotResult, effects, context)
  let curseGain = context.originTrait === 'priest' && (effectiveSlotResult.action === 'shield' || effectiveSlotResult.action === 'heart')
    ? Math.max(0, baseCurseGain - 1)
    : baseCurseGain
  const guard = fullBlock
    ? effects.find((effect) => effect.type === 'combat.full_block.curse_prevent' && !effectUses.includes(effect.id))
    : undefined
  const safety = (statusConsumed || blockDepleted)
    ? effects.find((effect) => effect.type === 'combat.curse_gain.prevent_once' && !effectUses.includes(effect.id))
    : undefined
  const prevention = guard ?? safety
  if (prevention && curseGain > 0) {
    curseGain = 0
    effectUses.push(prevention.id)
    events.push({ type: 'CURSE_PREVENTED', effectId: prevention.id })
  }
  const jackpotCurseReduction = context.originTrait === 'gambler' && effectiveSlotResult.modifier === 'x3' ? 1 : 0
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
    statuses,
    effectUses,
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
  context: CombatEffectContext,
): number {
  const multiplier = MODIFIER_MULTIPLIER[slotResult.modifier]
  const base = getBaseSlotAmount(slotResult) * multiplier
  const flatBonus = effects
    .filter((effect) => effect.type === 'combat.action_amount.add')
    .filter((effect) => effect.params.action === slotResult.action)
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state, context))
    .reduce((sum, effect) => sum + effect.params.amount, 0)
  const percentBonus = effects
    .filter((effect) => effect.type === 'combat.action_amount.add_pct')
    .filter((effect) => effect.params.action === slotResult.action)
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state, context))
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
  context: CombatEffectContext,
): number[] {
  return effects
    .filter((effect) => effect.type === 'combat.bullet.extra_hit')
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state, context))
    .slice(0, 2)
    .map((effect) => Math.floor((amount * effect.params.percent) / 100))
    .filter((extraHitAmount) => extraHitAmount > 0)
}

function getCurseGain(
  state: CombatState,
  slotResult: CombatSlotResult,
  effects: EffectDefinition[],
  context: CombatEffectContext,
): number {
  const adjustment = effects
    .filter((effect) => effect.type === 'combat.curse_gain.add')
    .filter((effect) => conditionsMatch(effect.conditions ?? [], slotResult, state, context))
    .reduce((sum, effect) => sum + effect.params.amount, 0)

  return clamp(1 + adjustment, 0, 3)
}

function conditionsMatch(
  conditions: EffectCondition[],
  slotResult: CombatSlotResult,
  state: CombatState,
  context: CombatEffectContext,
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

    if (condition.type === 'slot.locked_reels_at_least') {
      const locks = context.lockedReels ?? {}
      return [locks.action, locks.target, locks.modifier].filter(Boolean).length >= condition.params.count
    }

    return false
  })
}

function applyModifierSteps(
  slotResult: CombatSlotResult,
  state: CombatState,
  effects: EffectDefinition[],
  statuses: CombatState['statuses'],
  context: CombatEffectContext,
  events: CombatEvent[],
): CombatSlotResult {
  let modifier = slotResult.modifier

  if (slotResult.action === 'bullet' && getStatusStacks(statuses.enemy, 'exposed') > 0) {
    modifier = stepModifier(modifier)
    consumeStatus(statuses.enemy, 'exposed', 1)
    events.push({ type: 'STATUS_CONSUMED', target: 'enemy', status: 'exposed', stacks: 1 })
  }

  for (const effect of effects.filter((candidate) => candidate.type === 'combat.modifier.step_up')) {
    const candidate = { ...slotResult, modifier }
    if (modifier !== effect.params.from || !conditionsMatch(effect.conditions ?? [], candidate, state, context)) continue
    modifier = effect.params.to
  }

  return { ...slotResult, modifier }
}

function stepModifier(modifier: CombatSlotResult['modifier']): CombatSlotResult['modifier'] {
  if (modifier === 'x1') return 'x2'
  return 'x3'
}

function cloneStatuses(statuses: CombatState['statuses']): CombatState['statuses'] {
  return {
    player: statuses.player.map((status) => ({ ...status })),
    enemy: statuses.enemy.map((status) => ({ ...status })),
  }
}

function getStatusStacks(statuses: CombatStatusStack[], id: CombatStatusId): number {
  return statuses.find((status) => status.id === id)?.stacks ?? 0
}

function addStatus(statuses: CombatStatusStack[], id: CombatStatusId, stacks: number): void {
  const existing = statuses.find((status) => status.id === id)
  if (existing) {
    existing.stacks += stacks
  } else {
    statuses.push({ id, stacks })
  }
}

function consumeStatus(statuses: CombatStatusStack[], id: CombatStatusId, stacks: number): void {
  const existing = statuses.find((status) => status.id === id)
  if (!existing) return
  existing.stacks -= stacks
  if (existing.stacks <= 0) statuses.splice(statuses.indexOf(existing), 1)
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
