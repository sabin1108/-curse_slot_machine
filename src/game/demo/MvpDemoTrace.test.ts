import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { GameEngine } from '../engine/GameEngine'
import type { GameEvent } from '../engine/events'
import { MVP_DEMO_COMMANDS, MVP_DEMO_SEED } from './MvpDemoTrace'

describe('representative MVP demo trace', () => {
  it('reaches a deterministic boss victory using public commands only', () => {
    const first = replayDemo()
    const second = replayDemo()

    expect(first.digest).toBe(second.digest)
    expect(first.state).toEqual(second.state)
    expect(MVP_DEMO_COMMANDS).toHaveLength(81)
    expect(JSON.parse(readFileSync('docs/demo/mvp-demo-commands.json', 'utf8'))).toEqual(MVP_DEMO_COMMANDS)
    expect(MVP_DEMO_COMMANDS.every((command) => command.type !== 'RESOLVE_COMBAT_SLOT')).toBe(true)
    expect(first.state).toMatchObject({
      phase: 'victory',
      run: { completedStageIds: Array.from({ length: 15 }, (_, index) => index + 1) },
      build: {
        augments: expect.arrayContaining(['combo_starter', 'combo_finisher']),
        items: expect.arrayContaining(['multi_hit_charm', 'ember_magazine']),
        synergies: { completed: expect.arrayContaining(['clockwork_barrage']) },
      },
    })
    expect(first.maxCurse).toBe(9)
    expect(first.events).toContainEqual(expect.objectContaining({ type: 'CURSE_THRESHOLD_REACHED', threshold: 5 }))
    expect(first.events).toContainEqual(expect.objectContaining({ type: 'REST_RESOLVED', action: 'purify', amount: 5 }))
    expect(first.events).toContainEqual({ type: 'BOSS_PHASE_CHANGED', phase: 2, attack: 10 })
  })
})

function replayDemo() {
  const engine = new GameEngine(MVP_DEMO_SEED)
  const events: GameEvent[] = []
  let maxCurse = 0
  for (const command of MVP_DEMO_COMMANDS) {
    events.push(...engine.dispatch(command))
    maxCurse = Math.max(maxCurse, engine.getState().combat.curse.value)
  }
  const state = engine.getState()
  return {
    state,
    events,
    maxCurse,
    digest: createHash('sha256').update(JSON.stringify({ state, events })).digest('hex'),
  }
}
