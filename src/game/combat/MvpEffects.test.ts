import { describe, expect, it } from 'vitest'
import { applyReward, createBuildState, getActiveEffects } from '../build/BuildSystem'
import { MVP_BUILD_CATALOG } from '../build/MvpBuildCatalog'
import type { RewardRef } from '../build/BuildTypes'
import { createCombatState, resolveCombatSlot } from './CombatSystem'

describe('MVP combat effects', () => {
  it('runs the Clockwork primer, extra-hit, finisher, and burn chain without recursion', () => {
    const effects = effectsFor([
      { kind: 'augment', id: 'combo_starter' },
      { kind: 'item', id: 'multi_hit_charm' },
      { kind: 'augment', id: 'combo_finisher' },
      { kind: 'item', id: 'ember_magazine' },
    ])
    const context = { effects, lockedReels: { action: true, target: false, modifier: false } }
    const first = resolveCombatSlot(
      createCombatState({ enemy: { health: 60, maxHealth: 60 }, enemyIntent: { amount: 0 } }),
      { action: 'bullet', target: 'enemy', modifier: 'x1' },
      context,
    )

    expect(first.enemy.health).toBe(52)
    expect(first.statuses.enemy).toEqual(expect.arrayContaining([
      { id: 'primer', stacks: 1 },
      { id: 'burn', stacks: 1 },
    ]))

    const second = resolveCombatSlot(first, { action: 'bullet', target: 'enemy', modifier: 'x1' }, context)
    expect(second.enemy.health).toBe(39)
    expect(second.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'STATUS_CONSUMED', status: 'primer' }),
      expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 3 }),
    ]))
  })

  it('runs full-block effects on attacks and does not retrigger them on a wait', () => {
    const effects = effectsFor([
      { kind: 'augment', id: 'guard_core' },
      { kind: 'item', id: 'steadfast_latch' },
      { kind: 'augment', id: 'retaliation_matrix' },
      { kind: 'item', id: 'mirror_buckler' },
    ])
    const shield = resolveCombatSlot(
      createCombatState({ enemy: { health: 40, maxHealth: 40 } }),
      { action: 'shield', target: 'self', modifier: 'x1' },
      { effects, lockedReels: { action: true, target: false, modifier: false } },
    )

    expect(shield.enemy.health).toBe(34)
    expect(shield.curse.value).toBe(0)
    expect(shield.statuses.enemy).toContainEqual({ id: 'exposed', stacks: 1 })

    const attack = resolveCombatSlot(shield, { action: 'bullet', target: 'enemy', modifier: 'x1' }, { effects })
    expect(attack.enemy.health).toBe(22)
    expect(attack.events).toContainEqual(expect.objectContaining({ type: 'STATUS_CONSUMED', status: 'exposed' }))
    expect(attack.events).toContainEqual({ type: 'ENEMY_WAITED' })
    expect(attack.statuses.enemy).not.toContainEqual({ id: 'exposed', stacks: 1 })
  })

  it('steps cursed x1 bullets and consumes debt for one extra hit', () => {
    const effects = effectsFor([
      { kind: 'item', id: 'cursed_lens' },
      { kind: 'augment', id: 'debt_collector' },
    ])
    const state = createCombatState({
      enemy: { health: 40, maxHealth: 40 },
      curse: { value: 5 },
      enemyIntent: { amount: 0 },
      statuses: { player: [{ id: 'debt', stacks: 1 }] },
    })
    const result = resolveCombatSlot(state, { action: 'bullet', target: 'enemy', modifier: 'x1' }, { effects })

    expect(result.enemy.health).toBe(22)
    expect(result.statuses.player).not.toContainEqual(expect.objectContaining({ id: 'debt' }))
  })
})

function effectsFor(rewards: RewardRef[]) {
  let build = createBuildState({}, MVP_BUILD_CATALOG)
  for (const reward of rewards) build = applyReward(build, reward, MVP_BUILD_CATALOG).build
  return getActiveEffects(build, MVP_BUILD_CATALOG)
}
