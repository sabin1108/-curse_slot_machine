import { createSeededRng, type RngSeed, type RngSnapshot } from './rng'

export type GamePhase = 'idle' | 'battle'

export type GameState = {
  seed: RngSeed
  phase: GamePhase
  turn: number
  rng: RngSnapshot
  log: number[]
}

export function createInitialGameState(seed: RngSeed): GameState {
  return {
    seed,
    phase: 'idle',
    turn: 0,
    rng: createSeededRng(seed).snapshot(),
    log: [],
  }
}
