import type { GameCommand } from './commands'
import type { GameEvent } from './events'
import { createInitialGameState, type GameState } from './GameState'
import { createSeededRngFromSnapshot, type RngSeed, type SeededRng } from './rng'

export class GameEngine {
  private state: GameState

  private rng: SeededRng

  constructor(seed: RngSeed) {
    this.state = createInitialGameState(seed)
    this.rng = createSeededRngFromSnapshot(this.state.rng)
  }

  dispatch(command: GameCommand): GameEvent[] {
    switch (command.type) {
      case 'START_RUN':
        return this.startRun()
      case 'ADVANCE_TURN':
        return this.advanceTurn()
    }
  }

  getState(): GameState {
    return structuredClone(this.state)
  }

  private startRun(): GameEvent[] {
    const roll = this.consumeRoll()

    this.state = {
      ...this.state,
      phase: 'battle',
      rng: this.rng.snapshot(),
      log: [...this.state.log, roll],
    }

    return [
      {
        type: 'RUN_STARTED',
        turn: this.state.turn,
        roll,
      },
    ]
  }

  private advanceTurn(): GameEvent[] {
    const roll = this.consumeRoll()
    const turn = this.state.turn + 1

    this.state = {
      ...this.state,
      turn,
      rng: this.rng.snapshot(),
      log: [...this.state.log, roll],
    }

    return [
      {
        type: 'TURN_ADVANCED',
        turn,
        roll,
      },
    ]
  }

  private consumeRoll(): number {
    return this.rng.nextInt(100)
  }
}
