import { describe, expect, it } from 'vitest'

import { GameEngine } from './GameEngine'
import { createInitialGameState } from './GameState'
import { projectUiGameState, toUiEnemyIntent, toUiReward, toUiRewardCard, type UiFeedback } from './UiProjection'
import { completeCurrentStage, enterNextStage, getNextStage } from '../run/RunSystem'

const emptyFeedback: UiFeedback = {
  combatLogs: [],
  lastDamagePop: null,
  enemyDamagePops: [],
  isEnemyAttacking: false,
  showcase: {
    active: false,
    currentStep: 0,
    steps: [],
  },
}

const emptyScore = {
  immediatePower: 0,
  synergyValue: 0,
  completionValue: 0,
  futureValue: 0,
  contentValue: 0,
  total: 0,
}

describe('UiProjection enemy intent', () => {
  it('projects attack damage', () => {
    expect(toUiEnemyIntent({ type: 'attack', baseAmount: 7, amount: 8 })).toMatchObject({
      id: 'attack',
      type: 'ATTACK',
      value: 8,
    })
  })

  it('projects a harmless wait', () => {
    expect(toUiEnemyIntent({ type: 'wait', baseAmount: 7, amount: 0 })).toMatchObject({
      id: 'wait',
      type: 'WAIT',
      value: 0,
    })
  })

  it('projects a low defense intent', () => {
    expect(toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 1 })).toMatchObject({
      id: 'defend',
      type: 'DEFEND',
      value: 1,
    })
  })

  it('projects defense intent descriptions from the intent amount', () => {
    const intent = toUiEnemyIntent({ type: 'defend', baseAmount: 7, amount: 2 })

    expect(intent.description).toContain('2')
    expect(intent.description).not.toContain('1 ')
  })
})

describe('UiProjection reward cards', () => {
  it('projects owned augments and items as separate UI card arrays', () => {
    const engine = new GameEngine('owned-card-projection', {
      startingRewards: [
        { kind: 'augment', id: 'combo_starter' },
        { kind: 'item', id: 'multi_hit_charm' },
      ],
    })

    const projected = projectUiGameState(engine.getState(), emptyFeedback)

    expect(projected.build.augments).toEqual([
      expect.objectContaining({
        id: 'combo_starter',
        kind: 'augment',
        icon: 'AUG',
      }),
    ])
    expect(projected.build.items).toEqual([
      expect.objectContaining({
        id: 'multi_hit_charm',
        kind: 'item',
        icon: 'ITEM',
      }),
    ])
  })

  it('rejects owned reward IDs stored under the wrong core kind', () => {
    const state = createInitialGameState('wrong-owned-kind')
    state.build = {
      ...state.build,
      augments: ['multi_hit_charm'],
    }

    expect(() => projectUiGameState(state, emptyFeedback)).toThrow(
      'Reward kind mismatch for multi_hit_charm: expected augment, found item',
    )
  })

  it('projects items with explicit item kind and item label fields', () => {
    expect(toUiRewardCard({
      id: 'multi_hit_charm',
      kind: 'item',
      name: 'Multi-Hit Charm',
      rarity: 'uncommon',
      tags: ['MULTI_HIT'],
      description: 'Bullets add a 35% extra hit.',
      effectLabel: 'Bullets add a 35% extra hit.',
    })).toMatchObject({
      id: 'multi_hit_charm',
      kind: 'item',
      icon: 'ITEM',
      effectValue: 'Bullets add a 35% extra hit.',
    })
  })

  it('projects augments with explicit augment kind', () => {
    expect(toUiRewardCard({
      id: 'combo_starter',
      kind: 'augment',
      name: 'Combo Starter',
      rarity: 'common',
      tags: ['COMBO'],
      description: 'Locked bullets apply Primer.',
      effectLabel: 'Locked bullets apply Primer.',
    })).toMatchObject({
      id: 'combo_starter',
      kind: 'augment',
      icon: 'AUG',
    })
  })

  it('keeps the reward-option adapter on the neutral reward card shape', () => {
    expect(toUiReward({
      id: 'black_market_stamp',
      kind: 'item',
      name: 'Black-Market Stamp',
      rarity: 'rare',
      tags: ['CURSE', 'RESOURCE'],
      description: 'Purify arms a 25% discount and purchase cleanse.',
      effectLabel: 'Purify arms a 25% discount and purchase cleanse.',
      score: emptyScore,
    })).toMatchObject({
      id: 'black_market_stamp',
      kind: 'item',
      icon: 'ITEM',
      rarity: 'RARE',
    })
  })
})

describe('UiProjection map state', () => {
  it('projects the initial route with stage 1 available on a started run', () => {
    const state = createInitialGameState('map-projection-start')
    state.phase = 'map'
    state.run = {
      status: 'active',
      currentStage: null,
      completedStageIds: [],
    }

    const projected = projectUiGameState(state, emptyFeedback)

    expect(projected.map.completedStageIds).toEqual([])
    expect(projected.map.nodes).toHaveLength(15)
    expect(projected.map.nodes[0]).toMatchObject({
      id: 1,
      type: 'combat',
      rewardPolicy: 'starter',
      status: 'available',
      positionPct: 5,
    })
    expect(projected.map.activeNode).toMatchObject({ id: 1, type: 'combat' })
    expect(projected.map.nextAvailableNode).toMatchObject({ id: 1, type: 'combat' })
    expect(projected.map.currentNode).toBeNull()
  })

  it('projects completed stages and the next available route node', () => {
    const state = createInitialGameState('map-projection-progress')
    state.phase = 'map'
    state.run = {
      status: 'active',
      currentStage: null,
      completedStageIds: [1, 2],
    }

    const projected = projectUiGameState(state, emptyFeedback)

    expect(projected.map.nodes.slice(0, 3).map((node) => [node.id, node.status])).toEqual([
      [1, 'completed'],
      [2, 'completed'],
      [3, 'available'],
    ])
    expect(projected.map.activeNode).toMatchObject({ id: 3, type: 'rest' })
    expect(projected.map.nextAvailableNode).toMatchObject({ id: 3, type: 'rest' })
    expect(projected.map.currentNode).toBeNull()
  })

  it('projects the same next available route node selected by RunSystem', () => {
    const state = createInitialGameState('map-projection-selector')
    state.phase = 'map'
    const stageOne = enterNextStage(state.run)
    const afterStageOne = completeCurrentStage(stageOne)
    state.run = afterStageOne
    const nextStage = getNextStage(state.run)

    const projected = projectUiGameState(state, emptyFeedback)

    expect(projected.map.completedStageIds).toEqual([1])
    expect(projected.map.nextAvailableNode).toMatchObject({
      id: nextStage?.id,
      type: nextStage?.type,
      rewardPolicy: nextStage?.rewardPolicy,
      status: 'available',
    })
  })

  it('projects an entered event stage as current without exposing a next available node', () => {
    const state = createInitialGameState('map-projection-event')
    state.phase = 'event'
    state.run = {
      status: 'active',
      currentStage: { id: 6, type: 'event', rewardPolicy: 'normal' },
      completedStageIds: [1, 2, 3, 4, 5],
    }

    const projected = projectUiGameState(state, emptyFeedback)

    expect(projected.screen).toBe('MAP')
    expect(projected.map.currentNode).toMatchObject({ id: 6, type: 'event', status: 'current' })
    expect(projected.map.activeNode).toMatchObject({ id: 6, type: 'event', status: 'current' })
    expect(projected.map.nextAvailableNode).toBeNull()
  })
})
