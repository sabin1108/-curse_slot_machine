export type GameEvent =
  | {
      type: 'RUN_STARTED'
      turn: number
      roll: number
    }
  | {
      type: 'TURN_ADVANCED'
      turn: number
      roll: number
    }
