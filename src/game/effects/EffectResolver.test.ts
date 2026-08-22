import { describe, expect, it } from 'vitest'

import { effectConditionsMatch } from './EffectResolver'
import type { EffectDefinition } from './EffectTypes'

describe('EffectResolver', () => {
  it.each([
    {
      name: 'slot action',
      effect: {
        id: 'bullet_only',
        type: 'combat.bullet.extra_hit',
        params: { percent: 50 },
        conditions: [{ type: 'slot.action_is', params: { action: 'bullet' } }],
      } satisfies EffectDefinition,
      matching: { action: 'bullet', target: 'enemy', modifier: 'x1' } as const,
      mismatching: { action: 'shield', target: 'enemy', modifier: 'x1' } as const,
    },
    {
      name: 'slot target',
      effect: {
        id: 'enemy_only',
        type: 'combat.bullet.extra_hit',
        params: { percent: 50 },
        conditions: [{ type: 'slot.target_is', params: { target: 'enemy' } }],
      } satisfies EffectDefinition,
      matching: { action: 'bullet', target: 'enemy', modifier: 'x1' } as const,
      mismatching: { action: 'bullet', target: 'self', modifier: 'x1' } as const,
    },
    {
      name: 'slot modifier',
      effect: {
        id: 'x2_only',
        type: 'combat.bullet.extra_hit',
        params: { percent: 50 },
        conditions: [{ type: 'slot.modifier_is', params: { modifier: 'x2' } }],
      } satisfies EffectDefinition,
      matching: { action: 'bullet', target: 'enemy', modifier: 'x2' } as const,
      mismatching: { action: 'bullet', target: 'enemy', modifier: 'x1' } as const,
    },
  ])('matches and rejects $name conditions independently', ({ effect, matching, mismatching }) => {
    expect(effectConditionsMatch(effect, { slotResult: matching })).toBe(true)
    expect(effectConditionsMatch(effect, { slotResult: mismatching })).toBe(false)
  })

  it('matches and rejects locked reel count conditions independently', () => {
    const effect: EffectDefinition = {
      id: 'locked_only',
      type: 'combat.bullet.extra_hit',
      params: { percent: 50 },
      conditions: [{ type: 'slot.locked_reels_at_least', params: { count: 2 } }],
    }
    const context = {
      slotResult: { action: 'bullet', target: 'enemy', modifier: 'x1' } as const,
    }

    expect(effectConditionsMatch(effect, { ...context, lockedReelCount: 2 })).toBe(true)
    expect(effectConditionsMatch(effect, { ...context, lockedReelCount: 1 })).toBe(false)
  })

  it('matches and rejects curse threshold conditions independently', () => {
    const effect: EffectDefinition = {
      id: 'curse_only',
      type: 'combat.bullet.extra_hit',
      params: { percent: 50 },
      conditions: [{ type: 'combat.curse_at_least', params: { value: 5 } }],
    }
    const slotResult = { action: 'bullet', target: 'enemy', modifier: 'x1' } as const

    expect(effectConditionsMatch(effect, {
      slotResult,
      curseValue: 5,
    })).toBe(true)
    expect(effectConditionsMatch(effect, {
      slotResult,
      curseValue: 4,
    })).toBe(false)
  })

  it('matches and rejects player health percentage conditions independently', () => {
    const effect: EffectDefinition = {
      id: 'bloodied_only',
      type: 'combat.bullet.extra_hit',
      params: { percent: 50 },
      conditions: [{ type: 'combat.player_health_pct_at_most', params: { percent: 50 } }],
    }
    const slotResult = { action: 'bullet', target: 'enemy', modifier: 'x1' } as const

    expect(effectConditionsMatch(effect, {
      slotResult,
      playerHealthPct: 50,
    })).toBe(true)
    expect(effectConditionsMatch(effect, {
      slotResult,
      playerHealthPct: 53.34,
    })).toBe(false)
  })

  it('requires every combat condition to match', () => {
    const effect: EffectDefinition = {
      id: 'locked_bloodied_bullet',
      type: 'combat.bullet.extra_hit',
      params: { percent: 50 },
      conditions: [
        { type: 'slot.action_is', params: { action: 'bullet' } },
        { type: 'slot.target_is', params: { target: 'enemy' } },
        { type: 'slot.modifier_is', params: { modifier: 'x2' } },
        { type: 'slot.locked_reels_at_least', params: { count: 1 } },
        { type: 'combat.curse_at_least', params: { value: 5 } },
        { type: 'combat.player_health_pct_at_most', params: { percent: 50 } },
      ],
    }
    expect(effectConditionsMatch(effect, {
      slotResult: { action: 'bullet', target: 'enemy', modifier: 'x2' },
      curseValue: 5,
      playerHealthPct: 50,
      lockedReelCount: 1,
    })).toBe(true)
    expect(effectConditionsMatch(effect, {
      slotResult: { action: 'bullet', target: 'enemy', modifier: 'x2' },
      curseValue: 5,
      playerHealthPct: 50,
      lockedReelCount: 0,
    })).toBe(false)
  })

  it('does not match reward and active synergy conditions in combat-only context', () => {
    const effect: EffectDefinition = {
      id: 'combo_item_score',
      type: 'reward.score.add',
      params: { amount: 10 },
      conditions: [
        { type: 'reward.kind_is', params: { kind: 'item' } },
        { type: 'reward.rarity_is', params: { rarity: 'rare' } },
        { type: 'reward.has_tag', params: { tag: 'COMBO' } },
        { type: 'build.synergy_active', params: { synergyId: 'clockwork_barrage' } },
      ],
    }

    expect(effectConditionsMatch(effect, {
      slotResult: { action: 'bullet', target: 'enemy', modifier: 'x1' },
      lockedReelCount: 1,
    })).toBe(false)
  })
})
