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
})
