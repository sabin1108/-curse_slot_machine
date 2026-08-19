import { describe, expect, it, vi } from 'vitest'
import type { RewardOption } from '../build/RewardSystem'
import {
  createAugmentSlotPresentation,
  revealAugmentSlotPresentation,
} from './AugmentSlotMachine'

describe('AugmentSlotMachine', () => {
  it('builds a hidden three-reel presentation from a preselected reward', () => {
    const reward = createRewardOption({
      id: 'combo_finisher',
      name: 'Combo Finisher',
      rarity: 'rare',
      tags: ['COMBO', 'CRITICAL'],
    })

    const presentation = createAugmentSlotPresentation(reward)

    expect(presentation).toEqual({
      reels: [
        { id: 'primary-tag', label: 'COMBO' },
        { id: 'rarity', label: 'RARE' },
        { id: 'reward-name', label: 'Combo Finisher' },
      ],
      targetReward: reward,
      isRevealed: false,
    })
  })

  it('reveals the same target reward without changing reel results', () => {
    const reward = createRewardOption({ id: 'guard_core', name: 'Guard Core', tags: ['DEFENSE'] })
    const presentation = createAugmentSlotPresentation(reward)

    const revealed = revealAugmentSlotPresentation(presentation)

    expect(revealed).toEqual({
      ...presentation,
      isRevealed: true,
    })
    expect(presentation.isRevealed).toBe(false)
  })

  it('does not use random APIs while creating or revealing presentations', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    const reward = createRewardOption({ id: 'cursed_lens', name: 'Cursed Lens', rarity: 'cursed' })

    const presentation = createAugmentSlotPresentation(reward)
    revealAugmentSlotPresentation(presentation)

    expect(randomSpy).not.toHaveBeenCalled()
    randomSpy.mockRestore()
  })
})

function createRewardOption(overrides: Partial<RewardOption> = {}): RewardOption {
  return {
    kind: 'augment',
    id: 'combo_starter',
    name: 'Combo Starter',
    rarity: 'common',
    tags: ['COMBO'],
    description: 'Starts a combo-oriented build.',
    score: {
      immediatePower: 1,
      synergyValue: 0,
      completionValue: 0,
      futureValue: 2,
      total: 3,
    },
    ...overrides,
  }
}
