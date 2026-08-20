import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AugmentItem } from '../../types/game'
import { RewardModal } from './RewardModal'

describe('RewardModal', () => {
  it('renders item reward cards with an item kind label', () => {
    const itemReward = {
      id: 'multi_hit_charm',
      name: 'Multi-Hit Charm',
      rarity: 'UNCOMMON',
      tags: ['MULTI_HIT'],
      description: 'Adds multi-hit support.',
      icon: 'ITEM',
      effectValue: 'score 14',
      kind: 'item',
      kindLabel: '아이템',
    } satisfies AugmentItem & { kind: 'item'; kindLabel: '아이템' }

    render(
      <RewardModal
        candidates={[itemReward]}
        augSlotPresentation={null}
        onDispatch={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Multi-Hit Charm/ })).toBeInTheDocument()
    expect(screen.getByText('아이템')).toBeInTheDocument()
  })
})
