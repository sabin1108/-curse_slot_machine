import { createBuildState } from '../build/BuildSystem'
import type { BuildState } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import { createCombatState } from '../combat/CombatSystem'
import type { CombatState } from '../combat/CombatTypes'
import type { AugmentSlotPresentation } from '../slot/AugmentSlotTypes'
import type { CombatSlotLocks, CombatSlotResult } from '../slot/CombatSlotTypes'
import { createSeededRng, type RngSeed, type RngSnapshot } from './rng'
import { createRunState } from '../run/RunSystem'
import type { RunState } from '../run/RunTypes'
import { MVP_BUILD_CATALOG } from '../build/MvpBuildCatalog'

export type GamePhase = 'idle' | 'map' | 'battle' | 'reward' | 'shop' | 'rest' | 'event' | 'victory' | 'defeat'

export type GameState = {
  seed: RngSeed
  phase: GamePhase
  turn: number
  rng: RngSnapshot
  log: number[]
  run: RunState
  economy: {
    gold: number
    shopPurchases: number
    purchasedRewardIds: string[]
    pendingShopDiscountPct: number
    pendingPurchaseCurseReduction: number
  }
  slot: {
    current: CombatSlotResult | null
    locks: Required<CombatSlotLocks>
    hasSpun: boolean
  }
  combat: CombatState
  build: BuildState
  rewards: {
    options: RewardOption[]
    augmentSlot: AugmentSlotPresentation | null
  }
}

export function createInitialGameState(seed: RngSeed): GameState {
  return {
    seed,
    phase: 'idle',
    turn: 0,
    rng: createSeededRng(seed).snapshot(),
    log: [],
    run: createRunState(),
    economy: {
      gold: 150,
      shopPurchases: 0,
      purchasedRewardIds: [],
      pendingShopDiscountPct: 0,
      pendingPurchaseCurseReduction: 0,
    },
    slot: createEmptySlotState(),
    combat: createCombatState(),
    build: createBuildState({}, MVP_BUILD_CATALOG),
    rewards: {
      options: [],
      augmentSlot: null,
    },
  }
}

export function createEmptySlotState(): GameState['slot'] {
  return {
    current: null,
    locks: { action: false, target: false, modifier: false },
    hasSpun: false,
  }
}
