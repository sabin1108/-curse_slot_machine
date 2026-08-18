import type { SeededRng } from '../engine/rng'

export type WeightedReelEntry<T extends string> = {
  symbol: T
  weight: number
}

export function pickWeightedSymbol<T extends string>(
  pool: readonly WeightedReelEntry<T>[],
  rng: SeededRng,
): T {
  if (pool.length === 0) {
    throw new Error('reel pool must include at least one symbol')
  }

  const totalWeight = pool.reduce((sum, entry) => {
    if (!Number.isInteger(entry.weight) || entry.weight <= 0) {
      throw new Error('reel weights must be positive integers')
    }

    return sum + entry.weight
  }, 0)

  let roll = rng.nextInt(totalWeight)

  for (const entry of pool) {
    roll -= entry.weight
    if (roll < 0) {
      return entry.symbol
    }
  }

  return pool[pool.length - 1].symbol
}
