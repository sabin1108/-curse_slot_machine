import { describe, expect, it } from 'vitest'

import { createCombatState, resolveCombatSlot } from './CombatSystem'

describe('CombatSystem', () => {
  it('damages an enemy from a bullet result without raising curse by default', () => {
    const state = createCombatState()

    const result = resolveCombatSlot(state, {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x2',
    })

    expect(result.enemy.health).toBe(6)
    expect(result.player.health).toBe(26)
    expect(result.curse.value).toBe(0)
    expect(result.events.map((event) => event.type)).toEqual([
      'DAMAGE_APPLIED',
      'ENEMY_ATTACKED',
      'CURSE_INCREASED',
    ])
  })

  it('uses player block to absorb the surviving enemy attack', () => {
    const result = resolveCombatSlot(createCombatState(), {
      action: 'shield',
      target: 'self',
      modifier: 'x3',
    })

    expect(result.player.health).toBe(30)
    expect(result.player.block).toBe(11)
    expect(result.events.map((event) => event.type)).toEqual([
      'BLOCK_GAINED',
      'ENEMY_ATTACKED',
      'CURSE_INCREASED',
    ])
  })

  it('heals all targeted actors up to max health before enemy attack', () => {
    const damagedState = createCombatState({
      player: { health: 20 },
      enemy: { health: 12 },
    })

    const result = resolveCombatSlot(damagedState, {
      action: 'heart',
      target: 'all',
      modifier: 'x2',
    })

    expect(result.player.health).toBe(24)
    expect(result.enemy.health).toBe(18)
    expect(result.events.map((event) => event.type)).toEqual([
      'HEAL_APPLIED',
      'HEAL_APPLIED',
      'ENEMY_ATTACKED',
      'CURSE_INCREASED',
    ])
  })

  it('does not resolve an enemy attack after lethal enemy damage', () => {
    const nearlyDeadEnemy = createCombatState({
      enemy: { health: 10 },
    })

    const result = resolveCombatSlot(nearlyDeadEnemy, {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x2',
    })

    expect(result.enemy.health).toBe(0)
    expect(result.player.health).toBe(30)
    expect(result.outcome).toBe('victory')
    expect(result.events.map((event) => event.type)).toEqual([
      'DAMAGE_APPLIED',
      'CURSE_INCREASED',
      'COMBAT_ENDED',
    ])
  })

  it('applies a matching percentage damage effect before enemy response', () => {
    const result = resolveCombatSlot(
      createCombatState(),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
      {
        effects: [
          {
            id: 'bullet_boost',
            type: 'combat.action_amount.add_pct',
            params: { action: 'bullet', percent: 50 },
          },
        ],
      },
    )

    expect(result.enemy.health).toBe(9)
    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: 'DAMAGE_APPLIED',
        target: 'enemy',
        amount: 9,
        healthLost: 9,
      }),
    )
  })

  it('applies one non-recursive bullet extra hit before enemy response', () => {
    const result = resolveCombatSlot(
      createCombatState(),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
      {
        effects: [
          {
            id: 'extra_hit',
            type: 'combat.bullet.extra_hit',
            params: { percent: 50 },
          },
        ],
      },
    )

    expect(result.enemy.health).toBe(9)
    expect(
      result.events.filter((event) => event.type === 'DAMAGE_APPLIED'),
    ).toEqual([
      expect.objectContaining({ amount: 6, healthLost: 6 }),
      expect.objectContaining({ amount: 3, healthLost: 3 }),
    ])
  })

  it('clamps curse gain after curse gain effects', () => {
    const result = resolveCombatSlot(
      createCombatState(),
      {
        action: 'shield',
        target: 'self',
        modifier: 'x1',
      },
      {
        effects: [
          {
            id: 'curse_relief',
            type: 'combat.curse_gain.add',
            params: { amount: -1 },
          },
        ],
      },
    )

    expect(result.curse.value).toBe(0)
    expect(result.events).toContainEqual({
      type: 'CURSE_INCREASED',
      amount: 0,
      value: 0,
    })
  })

  it('raises curse only when a matching curse gain effect exists', () => {
    const result = resolveCombatSlot(
      createCombatState(),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x2',
      },
      {
        effects: [
          {
            id: 'curse_contract',
            type: 'combat.curse_gain.add',
            params: { amount: 1 },
          },
        ],
      },
    )

    expect(result.curse.value).toBe(1)
    expect(result.events).toContainEqual({
      type: 'CURSE_INCREASED',
      amount: 1,
      value: 1,
    })
  })

  it('increases enemy attack by 10 percent per curse point before block mitigation', () => {
    const result = resolveCombatSlot(
      createCombatState({
        player: { block: 10 },
        enemy: { health: 100, maxHealth: 100 },
        enemyIntent: { amount: 20 },
        curse: { value: 5 },
      }),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
    )

    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: 'ENEMY_ATTACKED',
        amount: 30,
        blocked: 10,
        healthLost: 20,
      }),
    )
  })

  it('cycles enemy attack, wait, and low defense intents', () => {
    const attack = resolveCombatSlot(
      createCombatState({ enemy: { health: 100, maxHealth: 100 } }),
      { action: 'shield', target: 'self', modifier: 'x1' },
    )

    expect(attack.events).toContainEqual(expect.objectContaining({ type: 'ENEMY_ATTACKED' }))
    expect(attack.enemyIntent).toEqual({ type: 'wait', baseAmount: 4, amount: 0 })

    const wait = resolveCombatSlot(attack, { action: 'shield', target: 'self', modifier: 'x1' })

    expect(wait.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(wait.events.some((event) => event.type === 'ENEMY_ATTACKED')).toBe(false)
    expect(wait.enemyIntent).toEqual({ type: 'defend', baseAmount: 4, amount: 1 })

    const defend = resolveCombatSlot(wait, { action: 'shield', target: 'self', modifier: 'x1' })

    expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(defend.enemy.block).toBe(1)
    expect(defend.enemyIntent).toEqual({ type: 'attack', baseAmount: 4, amount: 4 })
  })

  it('uses wait and defense intents for dual-roll combat without skipping the cycle', () => {
    const dualRoll = {
      action: 'bullet' as const,
      target: 'enemy' as const,
      modifier: 'x2' as const,
      attackRoll: 1,
      defenseRoll: 1,
      attackModifier: 'x2' as const,
      defenseModifier: 'x2' as const,
    }
    const waitState = createCombatState({
      enemy: { health: 100, maxHealth: 100 },
      enemyIntent: { type: 'wait', baseAmount: 4, amount: 0 },
    })

    const wait = resolveCombatSlot(waitState, dualRoll)

    expect(wait.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(wait.events.some((event) => event.type === 'ENEMY_ATTACKED')).toBe(false)
    expect(wait.enemyIntent.type).toBe('defend')

    const defend = resolveCombatSlot(wait, dualRoll)

    expect(defend.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(defend.enemy.block).toBe(1)
    expect(defend.enemyIntent.type).toBe('attack')
  })

  it('uses more aggressive intent cadence and stronger defense for elite and boss enemies', () => {
    const defensiveSpin = { action: 'shield', target: 'self', modifier: 'x1' } as const
    let elite = resolveCombatSlot(
      createCombatState({
        enemy: { health: 100, maxHealth: 100 },
        enemyIntent: { baseAmount: 1, amount: 1 },
        enemyBehavior: { rank: 'elite' },
      }),
      defensiveSpin,
    )
    expect(elite.enemyIntent.type).toBe('defend')

    elite = resolveCombatSlot(elite, defensiveSpin)
    expect(elite.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 2 })
    expect(elite.enemy.block).toBe(2)
    expect(elite.enemyIntent.type).toBe('attack')

    elite = resolveCombatSlot(elite, defensiveSpin)
    expect(elite.enemyIntent.type).toBe('wait')

    let boss = resolveCombatSlot(
      createCombatState({
        enemy: { health: 100, maxHealth: 100 },
        enemyIntent: { baseAmount: 1, amount: 1 },
        enemyBehavior: { rank: 'boss' },
      }),
      defensiveSpin,
    )
    expect(boss.enemyIntent.type).toBe('attack')

    boss = resolveCombatSlot(boss, defensiveSpin)
    expect(boss.enemyIntent.type).toBe('defend')

    boss = resolveCombatSlot(boss, defensiveSpin)
    expect(boss.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 3 })
    expect(boss.enemy.block).toBe(3)
    expect(boss.enemyIntent.type).toBe('attack')

    boss = resolveCombatSlot(boss, defensiveSpin)
    expect(boss.enemyIntent.type).toBe('wait')
  })

  it('caps elite and boss defense at their profile limits', () => {
    const defensiveSpin = { action: 'shield', target: 'self', modifier: 'x1' } as const
    const elite = resolveCombatSlot(
      createCombatState({
        enemy: { health: 100, maxHealth: 100, block: 49 },
        enemyIntent: { type: 'defend', baseAmount: 1, amount: 2 },
        enemyBehavior: { rank: 'elite', patternIndex: 1 },
      }),
      defensiveSpin,
    )
    const boss = resolveCombatSlot(
      createCombatState({
        enemy: { health: 100, maxHealth: 100, block: 79 },
        enemyIntent: { type: 'defend', baseAmount: 1, amount: 3 },
        enemyBehavior: { rank: 'boss', patternIndex: 2 },
      }),
      defensiveSpin,
    )

    expect(elite.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(elite.enemy.block).toBe(50)
    expect(boss.events).toContainEqual({ type: 'ENEMY_DEFENDED', amount: 1 })
    expect(boss.enemy.block).toBe(80)
  })
})
