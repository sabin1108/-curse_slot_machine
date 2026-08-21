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
  { symbol: 'x1', weight: 3 },
  { symbol: 'x2', weight: 2 },
  { symbol: 'x3', weight: 1 },
]

export function spinCombatSlot(rng: SeededRng): CombatSlotResult {
  return {
    action: pickWeightedSymbol(COMBAT_ACTION_REEL, rng),
    target: pickWeightedSymbol(COMBAT_TARGET_REEL, rng),
    modifier: pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng),
  }
}

export function rerollCombatSlot(
  previous: CombatSlotResult,
  locks: CombatSlotLocks,
  rng: SeededRng,
): CombatSlotResult {
  return {
    action: locks.action
      ? previous.action
      : pickWeightedSymbol(COMBAT_ACTION_REEL, rng),
    target: locks.target
      ? previous.target
      : pickWeightedSymbol(COMBAT_TARGET_REEL, rng),
    modifier: locks.modifier
      ? previous.modifier
      : pickWeightedSymbol(COMBAT_MODIFIER_REEL, rng),
  }
}

export function getCombatRerollCurseCost(locks: CombatSlotLocks): number {
  return countLockedReels(locks) + 1
}

function countLockedReels(locks: CombatSlotLocks): number {
  return [locks.action, locks.target, locks.modifier].filter(Boolean).length
}
