import { describe, expect, it } from 'vitest'

import { createCombatState, resolveCombatSlot } from './CombatSystem'

describe('CombatSystem', () => {
  it('damages an enemy from a bullet result, then resolves enemy attack and curse', () => {
    const state = createCombatState()

    const result = resolveCombatSlot(state, {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x2',
    })

    expect(result.enemy.health).toBe(6)
    expect(result.player.health).toBe(26)
    expect(result.curse.value).toBe(1)
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
})
