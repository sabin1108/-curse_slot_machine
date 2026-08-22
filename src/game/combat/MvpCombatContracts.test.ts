import { describe, expect, it } from 'vitest'

import { createCombatState, previewCombatSlot, recalculateEnemyIntent, resolveCombatSlot } from './CombatSystem'

const safeShot = { action: 'bullet', target: 'enemy', modifier: 'x1' } as const

describe('MVP combat contracts', () => {
  it.each([
    [4, 7],
    [5, 8],
    [7, 8],
    [8, 9],
    [9, 9],
  ])('applies curse attack pressure at curse %i', (curse, expectedAttack) => {
    const result = resolveCombatSlot(createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      enemyIntent: { baseAmount: 7, amount: 7 },
      curse: { value: curse },
    }), safeShot)

    expect(result.events).toContainEqual(expect.objectContaining({
      type: 'ENEMY_ATTACKED',
      amount: expectedAttack,
    }))
  })

  it('ends combat through curse overload at 10 even while both actors survive', () => {
    const result = resolveCombatSlot(createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      curse: { value: 9 },
    }), safeShot)

    expect(result.curse).toMatchObject({ value: 10, max: 10, attackBonus: 2 })
    expect(result.outcome).toBe('defeat')
    expect(result.endReason).toBe('curse_overload')
    expect(result.events).toContainEqual({ type: 'CURSE_THRESHOLD_REACHED', threshold: 10, attackBonus: 2 })
    expect(result.events).toContainEqual({ type: 'COMBAT_ENDED', outcome: 'defeat', reason: 'curse_overload' })
  })

  it('previews the exact resolution deltas without mutating combat state', () => {
    const state = createCombatState({
      player: { health: 24, block: 2 },
      enemy: { health: 18 },
      curse: { value: 5 },
    })
    const before = structuredClone(state)
    const preview = previewCombatSlot(state, { action: 'shield', target: 'self', modifier: 'x2' })
    const resolved = resolveCombatSlot(state, { action: 'shield', target: 'self', modifier: 'x2' })

    expect(state).toEqual(before)
    expect(preview).toMatchObject({
      playerHealthDelta: resolved.player.health - state.player.health,
      playerBlockDelta: resolved.player.block - state.player.block,
      enemyHealthDelta: resolved.enemy.health - state.enemy.health,
      enemyBlockDelta: resolved.enemy.block - state.enemy.block,
      curseDelta: resolved.curse.value - state.curse.value,
      enemyAttack: 5,
      outcome: resolved.outcome,
      warnings: [],
    })
    expect(preview.endReason).toBe(resolved.endReason)
  })

  it('cycles enemy attack, wait, and low defense intents', () => {
    const attack = resolveCombatSlot(createCombatState({
      enemy: { maxHealth: 99, health: 99 },
    }), safeShot)
    const healthAfterAttack = attack.player.health
    const blockAfterAttack = attack.player.block

    expect(attack.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED' }))
    expect(attack.enemyIntent).toMatchObject({ type: 'wait', baseAmount: 4, amount: 0 })

    const wait = resolveCombatSlot(attack, safeShot)

    expect(wait.player).toMatchObject({ health: healthAfterAttack, block: blockAfterAttack })
    expect(wait.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(wait.events.some((event) => event.type === 'ENEMY_ATTACKED')).toBe(false)
    expect(wait.enemyIntent).toMatchObject({ type: 'defend', baseAmount: 4, amount: 1 })

    const defend = resolveCombatSlot(wait, { action: 'shield', target: 'self', modifier: 'x1' })

    expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(defend.enemy.block).toBe(1)
    expect(defend.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 4, amount: 4 })
  })

  it('previews a wait as zero enemy damage without mutating combat state', () => {
    const state = createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      enemyIntent: { type: 'wait', baseAmount: 7, amount: 0 },
      curse: { value: 5 },
    })
    const before = structuredClone(state)

    const preview = previewCombatSlot(state, safeShot)

    expect(state).toEqual(before)
    expect(preview.enemyAttack).toBe(0)
    expect(preview.playerHealthDelta).toBe(0)
  })

  it('previews low enemy defense and caps accumulated block at two', () => {
    const state = createCombatState({
      enemy: { maxHealth: 99, health: 99, block: 1 },
      enemyIntent: { type: 'defend', baseAmount: 7, amount: 1 },
    })

    const preview = previewCombatSlot(state, { action: 'shield', target: 'self', modifier: 'x1' })
    const result = resolveCombatSlot(state, { action: 'shield', target: 'self', modifier: 'x1' })

    expect(preview).toMatchObject({ enemyAttack: 0, enemyBlockDelta: 1, playerHealthDelta: 0 })
    expect(result.enemy.block).toBe(2)
    expect(result.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
  })

  it('still ends the run at curse ten during a wait', () => {
    const result = resolveCombatSlot(createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      enemyIntent: { type: 'wait', baseAmount: 7, amount: 0 },
      curse: { value: 9 },
    }), safeShot)

    expect(result.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(result.events.some((event) => event.type === 'ENEMY_ATTACKED')).toBe(false)
    expect(result).toMatchObject({ outcome: 'defeat', endReason: 'curse_overload', curse: { value: 10 } })
  })

  it('advances custom enemy intent patterns deterministically', () => {
    const state = createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      enemyIntent: {
        baseAmount: 6,
        amount: 6,
        pattern: [
          { type: 'attack' },
          { type: 'defend', amount: 2 },
          { type: 'wait' },
        ],
        patternIndex: 0,
      },
    })

    const attack = resolveCombatSlot(state, safeShot)
    expect(attack.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED', amount: 6 }))
    expect(attack.enemyIntent).toMatchObject({ type: 'defend', baseAmount: 6, amount: 2, patternIndex: 1 })

    const defend = resolveCombatSlot(attack, safeShot)
    expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 2 })
    expect(defend.enemyIntent).toMatchObject({ type: 'wait', baseAmount: 6, amount: 0, patternIndex: 2 })

    const wait = resolveCombatSlot(defend, safeShot)
    expect(wait.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(wait.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 6, amount: 6, patternIndex: 0 })
  })

  it('keeps wait and defend amounts stable when combat state is created under curse pressure', () => {
    const waiting = createCombatState({
      enemyIntent: { type: 'wait', baseAmount: 7, amount: 0 },
      curse: { value: 8 },
    })
    const defending = createCombatState({
      enemyIntent: { type: 'defend', baseAmount: 7, amount: 1 },
      curse: { value: 8 },
    })

    expect(waiting.enemyIntent).toMatchObject({ type: 'wait', amount: 0 })
    expect(defending.enemyIntent).toMatchObject({ type: 'defend', amount: 1 })
  })

  it('derives recalculated intent type and amount from the pattern index', () => {
    const intent = recalculateEnemyIntent({
      type: 'attack',
      baseAmount: 7,
      amount: 7,
      pattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'wait' }],
      patternIndex: 1,
    }, 8)

    expect(intent).toMatchObject({ type: 'defend', amount: 2, patternIndex: 1 })
  })

  it('warns that newly crossed curse pressure applies to the next enemy attack', () => {
    const state = createCombatState({
      enemy: { maxHealth: 99, health: 99 },
      enemyIntent: { baseAmount: 7, amount: 7 },
      curse: { value: 4 },
    })
    const preview = previewCombatSlot(state, safeShot)
    const resolved = resolveCombatSlot(state, safeShot)

    expect(preview.enemyAttack).toBe(7)
    expect(preview.warnings).toEqual(['저주 5: 다음 적 공격 +1'])
    expect(resolved.enemyIntent).toMatchObject({ type: 'wait', baseAmount: 7, amount: 0 })
    const waited = resolveCombatSlot(resolved, safeShot)
    expect(waited.enemyIntent).toMatchObject({ type: 'defend', baseAmount: 7, amount: 1 })
    const defended = resolveCombatSlot(waited, { action: 'shield', target: 'self', modifier: 'x1' })
    expect(defended.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 7, amount: 8 })
  })

  it('moves the boss to phase two at half health and attacks for 10 on that turn', () => {
    const result = resolveCombatSlot(createCombatState({
      enemy: {
        name: 'House Sovereign',
        maxHealth: 36,
        health: 20,
        phase: 1,
        phaseTwoThreshold: 18,
        phaseTwoAttack: 10,
      },
      enemyIntent: { baseAmount: 7, amount: 7 },
    }), safeShot)

    expect(result.enemy).toMatchObject({ health: 14, phase: 2 })
    expect(result.enemyIntent).toMatchObject({ type: 'wait', baseAmount: 10, amount: 0 })
    expect(result.events).toContainEqual({ type: 'BOSS_PHASE_CHANGED', phase: 2, attack: 10 })
    expect(result.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED', amount: 10 }))
  })

  it('keeps the boss support cycle through phase two before using the new attack', () => {
    const phaseChange = resolveCombatSlot(createCombatState({
      enemy: {
        name: 'House Sovereign',
        maxHealth: 36,
        health: 20,
        phase: 1,
        phaseTwoThreshold: 18,
        phaseTwoAttack: 10,
      },
      enemyIntent: { type: 'wait', baseAmount: 7, amount: 0 },
    }), safeShot)

    expect(phaseChange.events).toContainEqual({ type: 'BOSS_PHASE_CHANGED', phase: 2, attack: 10 })
    expect(phaseChange.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(phaseChange.enemyIntent).toMatchObject({ type: 'defend', baseAmount: 10, amount: 1 })

    const defend = resolveCombatSlot(phaseChange, { action: 'shield', target: 'self', modifier: 'x1' })
    expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(defend.enemyIntent).toMatchObject({ type: 'attack', baseAmount: 10, amount: 10 })

    const nextTurn = resolveCombatSlot(defend, safeShot)
    expect(nextTurn.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED', amount: 10 }))
  })

  it('prevents a phase-one overkill from skipping the boss second phase', () => {
    const result = resolveCombatSlot(createCombatState({
      enemy: {
        name: 'House Sovereign',
        maxHealth: 36,
        health: 18,
        phase: 1,
        phaseTwoThreshold: 18,
        phaseTwoAttack: 10,
      },
      enemyIntent: { baseAmount: 7, amount: 7 },
    }), { action: 'bullet', target: 'enemy', modifier: 'x3' })

    expect(result.enemy).toMatchObject({ health: 1, phase: 2 })
    expect(result.outcome).toBe('ongoing')
    expect(result.events).toContainEqual({ type: 'BOSS_PHASE_CHANGED', phase: 2, attack: 10 })
  })
})
