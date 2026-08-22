import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { GameEngine } from '../engine/GameEngine'
import type { GameEvent } from '../engine/events'
import type { OriginId } from '../engine/OriginCatalog'
import { MVP_DEMO_REWARD_SETUP_COMMANDS } from './MvpDemoTrace'
import { ORIGIN_DEMO_TRACES } from './OriginDemoTraces'

describe('origin demo traces', () => {
  for (const origin of Object.keys(ORIGIN_DEMO_TRACES) as OriginId[]) {
    it(`${origin} reaches the stage 15 victory deterministically through public play commands`, () => {
      const first = replay(origin)
      const second = replay(origin)
      expect(first.digest).toBe(second.digest)
      expect(first.state).toEqual(second.state)
      expect(first.state).toMatchObject({
        phase: 'victory', selectedOrigin: origin,
        run: { completedStageIds: Array.from({ length: 15 }, (_, index) => index + 1) },
        rewards: { options: [], augmentSlot: null },
      })
      expect(ORIGIN_DEMO_TRACES[origin].commands.every((command) => command.type !== 'RESOLVE_COMBAT_SLOT')).toBe(true)
      expect(first.events).toContainEqual(expect.objectContaining({ type: 'ORIGIN_SELECTED', originId: origin }))
      expect(first.events).toContainEqual(expect.objectContaining({ type: 'BOSS_PHASE_CHANGED', phase: 2, attack: 10 }))
    })
  }

  it('exposes the MVP demo prefix that stops at the first reward choice', () => {
    const firstRewardIndex = ORIGIN_DEMO_TRACES.GAMBLER.commands.findIndex((command) => command.type === 'CHOOSE_REWARD')

    expect(firstRewardIndex).toBeGreaterThan(0)
    expect(MVP_DEMO_REWARD_SETUP_COMMANDS).toEqual(ORIGIN_DEMO_TRACES.GAMBLER.commands.slice(0, firstRewardIndex))
    expect(MVP_DEMO_REWARD_SETUP_COMMANDS.at(-1)?.type).toBe('CONFIRM_COMBAT_SLOT')
  })
})

function replay(origin: OriginId) {
  const trace = ORIGIN_DEMO_TRACES[origin]
  const engine = new GameEngine(trace.seed)
  const events: GameEvent[] = []
  for (const command of trace.commands) events.push(...engine.dispatch(command))
  const state = engine.getState()
  return { state, events, digest: createHash('sha256').update(JSON.stringify({ state, events })).digest('hex') }
}
