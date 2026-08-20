import type { RewardOption } from '../build/RewardSystem'

export type AugmentSlotReelId = 'primary-tag' | 'rarity' | 'reward-name'

export type AugmentSlotReel = {
  id: AugmentSlotReelId
  label: string
}

export type AugmentSlotPresentation = {
  reels: [AugmentSlotReel, AugmentSlotReel, AugmentSlotReel]
  targetReward: RewardOption
  isRevealed: boolean
}
