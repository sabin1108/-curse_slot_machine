import type { RewardOption } from '../build/RewardSystem'
import type { AugmentSlotPresentation } from './AugmentSlotTypes'

export function createAugmentSlotPresentation(
  targetReward: RewardOption,
): AugmentSlotPresentation {
  return {
    reels: [
      {
        id: 'primary-tag',
        label: targetReward.tags[0] ?? targetReward.kind.toUpperCase(),
      },
      {
        id: 'rarity',
        label: targetReward.rarity.toUpperCase(),
      },
      {
        id: 'reward-name',
        label: targetReward.name,
      },
    ],
    targetReward: structuredClone(targetReward),
    isRevealed: false,
  }
}

export function revealAugmentSlotPresentation(
  presentation: AugmentSlotPresentation,
): AugmentSlotPresentation {
  return {
    reels: structuredClone(presentation.reels),
    targetReward: structuredClone(presentation.targetReward),
    isRevealed: true,
  }
}
