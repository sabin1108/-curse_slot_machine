import { describe, expect, it } from 'vitest'

import { createCombatState, resolveCombatSlot } from './CombatSystem'
import type { EffectDefinition } from '../effects/EffectTypes'

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

  it('keeps modifier steps ordered before modifier-conditioned amount bonuses', () => {
    const result = resolveCombatSlot(
      createCombatState({ enemy: { health: 60, maxHealth: 60 }, enemyIntent: { amount: 0 } }),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
      {
        effects: [
          {
            id: 'step_to_x2',
            type: 'combat.modifier.step_up',
            params: { from: 'x1', to: 'x2' },
          },
          {
            id: 'x2_bonus',
            type: 'combat.action_amount.add_pct',
            params: { action: 'bullet', percent: 50 },
            conditions: [{ type: 'slot.modifier_is', params: { modifier: 'x2' } }],
          },
        ],
      },
    )

    expect(result.enemy.health).toBe(42)
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 18 }),
    )
  })

  it('keeps chained modifier steps in combat resolution order', () => {
    const result = resolveCombatSlot(
      createCombatState({ enemy: { health: 60, maxHealth: 60 }, enemyIntent: { amount: 0 } }),
      {
        action: 'bullet',
        target: 'enemy',
        modifier: 'x1',
      },
      {
        effects: [
          {
            id: 'step_to_x2',
            type: 'combat.modifier.step_up',
            params: { from: 'x1', to: 'x2' },
          },
          {
            id: 'step_to_x3',
            type: 'combat.modifier.step_up',
            params: { from: 'x2', to: 'x3' },
          },
        ],
      },
    )

    expect(result.enemy.health).toBe(42)
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 18 }),
    )
  })

  it('filters non-aggregated status effects through shared combat conditions', () => {
    const state = createCombatState()
    const effect = {
      id: 'locked_primer',
      type: 'combat.status.apply' as const,
      params: { status: 'primer' as const, stacks: 1, target: 'enemy' as const },
      conditions: [{ type: 'slot.locked_reels_at_least' as const, params: { count: 1 as const } }],
    }

    const withoutLock = resolveCombatSlot(
      state,
      { action: 'bullet', target: 'enemy', modifier: 'x1' },
      { effects: [effect], lockedReels: {} },
    )
    const withLock = resolveCombatSlot(
      state,
      { action: 'bullet', target: 'enemy', modifier: 'x1' },
      { effects: [effect], lockedReels: { action: true } },
    )

    expect(withoutLock.statuses.enemy).toEqual([])
    expect(withLock.statuses.enemy).toEqual([{ id: 'primer', stacks: 1 }])
  })

  it('filters full-block retaliation through shared combat conditions', () => {
    const effects: EffectDefinition[] = [
      {
        id: 'bullet_retaliate',
        type: 'combat.full_block.retaliate',
        params: { amount: 6 },
        conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
      },
    ]

    const result = resolveCombatSlot(
      createCombatState({ enemy: { health: 40, maxHealth: 40 } }),
      { action: 'shield', target: 'self', modifier: 'x1' },
      { effects },
    )

    expect(result.enemy.health).toBe(40)
    expect(result.events).not.toContainEqual(
      expect.objectContaining({ type: 'DAMAGE_APPLIED', amount: 6 }),
    )
  })

  it('filters extra-hit status application through shared combat conditions', () => {
    const effects: EffectDefinition[] = [
      {
        id: 'extra_hit',
        type: 'combat.bullet.extra_hit',
        params: { percent: 50 },
      },
      {
        id: 'x3_burn',
        type: 'combat.extra_hit.status_apply',
        params: { status: 'burn', stacks: 1, target: 'enemy' },
        conditions: [{ type: 'slot.modifier_is', params: { modifier: 'x3' } }],
      },
    ]

    const result = resolveCombatSlot(
      createCombatState({ enemy: { health: 40, maxHealth: 40 }, enemyIntent: { amount: 0 } }),
      { action: 'bullet', target: 'enemy', modifier: 'x1' },
      { effects },
    )

    expect(result.statuses.enemy).toEqual([])
  })

  it('filters full-block curse prevention through shared combat conditions', () => {
    const effects: EffectDefinition[] = [
      {
        id: 'bullet_guard',
        type: 'combat.full_block.curse_prevent',
        params: { uses: 1 },
        conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
      },
    ]

    const result = resolveCombatSlot(
      createCombatState(),
      { action: 'shield', target: 'self', modifier: 'x1' },
      { effects },
    )

    expect(result.curse.value).toBe(1)
    expect(result.events).not.toContainEqual(
      expect.objectContaining({ type: 'CURSE_PREVENTED', effectId: 'bullet_guard' }),
    )
  })

  it('filters safety curse prevention through shared combat conditions', () => {
    const effects: EffectDefinition[] = [
      {
        id: 'consume_debt',
        type: 'combat.status.consume_extra_hit',
        params: { status: 'debt', percent: 50, target: 'player' },
        conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
      },
      {
        id: 'shield_safety',
        type: 'combat.curse_gain.prevent_once',
        params: { trigger: 'block_depleted_or_status_consumed' },
        conditions: [{ type: 'slot.action_is', params: { action: 'shield' } }],
      },
    ]

    const result = resolveCombatSlot(
      createCombatState({
        enemy: { health: 40, maxHealth: 40 },
        enemyIntent: { amount: 0 },
        statuses: { player: [{ id: 'debt', stacks: 1 }] },
      }),
      { action: 'bullet', target: 'enemy', modifier: 'x1' },
      { effects },
    )

    expect(result.curse.value).toBe(1)
    expect(result.events).not.toContainEqual(
      expect.objectContaining({ type: 'CURSE_PREVENTED', effectId: 'shield_safety' }),
    )
  })
})
