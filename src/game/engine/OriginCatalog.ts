export const ORIGIN_IDS = ['SWORDSMAN', 'GAMBLER', 'PRIEST'] as const

export type OriginId = (typeof ORIGIN_IDS)[number]

export type OriginDefinition = {
  id: OriginId
  maxHealth: number
  gold: number
  initialBlock: number
  startingRewardId: 'combo_starter' | 'hexed_clutch' | 'guard_core'
}

export const ORIGIN_CATALOG: Record<OriginId, OriginDefinition> = {
  SWORDSMAN: {
    id: 'SWORDSMAN',
    maxHealth: 32,
    gold: 150,
    initialBlock: 3,
    startingRewardId: 'combo_starter',
  },
  GAMBLER: {
    id: 'GAMBLER',
    maxHealth: 26,
    gold: 200,
    initialBlock: 0,
    startingRewardId: 'hexed_clutch',
  },
  PRIEST: {
    id: 'PRIEST',
    maxHealth: 36,
    gold: 160,
    initialBlock: 5,
    startingRewardId: 'guard_core',
  },
}

export function getOriginDefinition(origin: OriginId): OriginDefinition {
  return ORIGIN_CATALOG[origin]
}

export function getOriginTrait(origin: OriginId): 'swordsman' | 'gambler' | 'priest' {
  return origin.toLowerCase() as 'swordsman' | 'gambler' | 'priest'
}
