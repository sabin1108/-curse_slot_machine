import { describe, expect, it } from 'vitest'

import { ALL_REWARD_CARDS } from './data'

describe('display reward card catalog', () => {
  it('exports reward cards with explicit augment and item kinds', () => {
    const kinds = new Set(ALL_REWARD_CARDS.map((rewardCard) => rewardCard.kind))

    expect(kinds.has('augment')).toBe(true)
    expect(kinds.has('item')).toBe(true)
  })
})
