import { createCombatState } from '../combat/CombatSystem'
import type { CombatState } from '../combat/CombatTypes'
import { createSeededRng, type RngSeed, type RngSnapshot } from './rng'

export type GamePhase = 'idle' | 'battle' | 'victory' | 'defeat'

export type GameState = {
  seed: RngSeed
  phase: GamePhase
  turn: number
  rng: RngSnapshot
  log: number[]
  combat: CombatState
}

export function createInitialGameState(seed: RngSeed): GameState {
  return {
    seed,
    phase: 'idle',
    turn: 0,
    rng: createSeededRng(seed).snapshot(),
    log: [],
    combat: createCombatState(),
  }
}
