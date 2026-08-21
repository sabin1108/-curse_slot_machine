import type { SeededRng } from '../engine/rng'
import type {
  CombatActionSymbol,
  CombatModifierSymbol,
  CombatSlotLocks,
  CombatSlotResult,
  CombatTargetSymbol,
} from './CombatSlotTypes'
import { pickWeightedSymbol, type WeightedReelEntry } from './ReelPool'

export const COMBAT_ACTION_REEL: readonly WeightedReelEntry<CombatActionSymbol>[] = [
  { symbol: 'bullet', weight: 3 },
  { symbol: 'shield', weight: 2 },
  { symbol: 'heart', weight: 1 },
]

export const COMBAT_TARGET_REEL: readonly WeightedReelEntry<CombatTargetSymbol>[] = [
  { symbol: 'enemy', weight: 3 },
  { symbol: 'self', weight: 2 },
  { symbol: 'all', weight: 1 },
]

export const COMBAT_MODIFIER_REEL: readonly WeightedReelEntry<CombatModifierSymbol>[] = [
  { symbol: 'x2', weight: 2 },
  { symbol: 'x3', weight: 1 },
]

export function spinCombatSlot(rng: SeededRng): CombatSlotResult {
  const attackModifier = pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng)
  const defenseModifier = pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng)
  return {
    action: 'bullet',
    target: 'enemy',
    modifier: attackModifier,
    attackRoll: rng.nextInt(10) + 1,
    defenseRoll: rng.nextInt(10) + 1,
    attackModifier,
    defenseModifier,
  }
}

export function rerollCombatSlot(
  previous: CombatSlotResult,
  locks: CombatSlotLocks,
  rng: SeededRng,
): CombatSlotResult {
  const attackModifier = locks.modifier
    ? previous.attackModifier ?? previous.modifier
    : pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng)
  const defenseModifier = locks.modifier
    ? previous.defenseModifier ?? previous.modifier
    : pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng)

  return {
    action: 'bullet',
    target: 'enemy',
    modifier: attackModifier,
    attackRoll: locks.action ? previous.attackRoll : rng.nextInt(10) + 1,
    defenseRoll: locks.target ? previous.defenseRoll : rng.nextInt(10) + 1,
    attackModifier,
    defenseModifier,
  }
}

export function getCombatRerollCurseCost(locks: CombatSlotLocks): number {
  return countLockedReels(locks) + 1
}

function countLockedReels(locks: CombatSlotLocks): number {
  return [locks.action, locks.target, locks.modifier].filter(Boolean).length
}
