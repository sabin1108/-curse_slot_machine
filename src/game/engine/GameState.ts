import { createBuildState } from '../build/BuildSystem'
import type { BuildState } from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import { createCombatState } from '../combat/CombatSystem'
import type { CombatState } from '../combat/CombatTypes'
import type { AugmentSlotPresentation } from '../slot/AugmentSlotTypes'
import { createSeededRng, type RngSeed, type RngSnapshot } from './rng'

export type GamePhase = 'idle' | 'battle' | 'reward' | 'victory' | 'defeat'

export type GameState = {
  seed: RngSeed
  phase: GamePhase
  turn: number
  rng: RngSnapshot
  log: number[]
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
    combat: createCombatState(),
    build: createBuildState(),
    rewards: {
      options: [],
      augmentSlot: null,
    },
  }
}
