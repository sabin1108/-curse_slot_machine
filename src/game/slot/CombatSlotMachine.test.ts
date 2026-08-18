import { describe, expect, it } from 'vitest'
import type { SeededRng } from '../engine/rng'
import { createSeededRng } from '../engine/rng'
import {
  getCombatRerollCurseCost,
  rerollCombatSlot,
  spinCombatSlot,
} from './CombatSlotMachine'
import { pickWeightedSymbol } from './ReelPool'

describe('pickWeightedSymbol', () => {
  it('picks weighted symbols from the provided reel pool', () => {
    const pool = [
      { symbol: 'bullet', weight: 3 },
      { symbol: 'shield', weight: 2 },
      { symbol: 'heart', weight: 1 },
    ] as const

    expect(pickWeightedSymbol(pool, createFixedIntRng(0))).toBe('bullet')
    expect(pickWeightedSymbol(pool, createFixedIntRng(2))).toBe('bullet')
    expect(pickWeightedSymbol(pool, createFixedIntRng(3))).toBe('shield')
    expect(pickWeightedSymbol(pool, createFixedIntRng(4))).toBe('shield')
    expect(pickWeightedSymbol(pool, createFixedIntRng(5))).toBe('heart')
  })
})

function createFixedIntRng(value: number): SeededRng {
  return {
    next() {
      return value
    },
    nextInt() {
      return value
    },
    snapshot() {
      return {
        seed: 'fixed-int',
        state: value,
      }
    },
  }
}

describe('CombatSlotMachine', () => {
  it('produces one payline with action, target, and modifier symbols', () => {
    const result = spinCombatSlot(createSeededRng('first-spin'))

    expect(['bullet', 'shield', 'heart']).toContain(result.action)
    expect(['enemy', 'self', 'all']).toContain(result.target)
    expect(['x1', 'x2', 'x3']).toContain(result.modifier)
  })

  it('keeps locked reels and rerolls unlocked reels', () => {
    const previous = { action: 'bullet', target: 'enemy', modifier: 'x1' } as const

    const result = rerollCombatSlot(
      previous,
      { action: true, target: false, modifier: true },
      createSeededRng('reroll-locks'),
    )

    expect(result.action).toBe(previous.action)
    expect(result.modifier).toBe(previous.modifier)
    expect(['enemy', 'self', 'all']).toContain(result.target)
  })

  it('produces the same spin sequence for the same seed', () => {
    const first = createSeededRng('combat-seed')
    const second = createSeededRng('combat-seed')

    expect([
      spinCombatSlot(first),
      spinCombatSlot(first),
      rerollCombatSlot(
        { action: 'heart', target: 'self', modifier: 'x2' },
        { target: true },
        first,
      ),
    ]).toEqual([
      spinCombatSlot(second),
      spinCombatSlot(second),
      rerollCombatSlot(
        { action: 'heart', target: 'self', modifier: 'x2' },
        { target: true },
        second,
      ),
    ])
  })

  it('charges curse based on the number of locked reels', () => {
    expect(getCombatRerollCurseCost({})).toBe(1)
    expect(getCombatRerollCurseCost({ action: true })).toBe(2)
    expect(getCombatRerollCurseCost({ action: true, target: true })).toBe(3)
  })
})
