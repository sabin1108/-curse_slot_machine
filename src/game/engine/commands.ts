export type GameCommand =
  | {
      type: 'START_RUN'
    }
  | {
      type: 'ADVANCE_TURN'
    }
