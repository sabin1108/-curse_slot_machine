import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GameEngine } from '../../game/engine/GameEngine'
import { projectUiGameState, type UiFeedback } from '../../game/engine/UiProjection'
import type { ItemCard } from '../../types/game'
import { RewardInventorySidePanel } from './RewardInventorySidePanel'
import { BattleScreen } from './BattleScreen'

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

describe('BattleScreen build inventory', () => {
  it('renders owned augments and items from projected UI cards', () => {
    const engine = new GameEngine('battle-owned-cards', {
      startingRewards: [
        { kind: 'augment', id: 'combo_starter' },
        { kind: 'item', id: 'multi_hit_charm' },
      ],
    })
    const state = projectUiGameState(engine.getState(), emptyFeedback)
    const { container } = render(<BattleScreen state={state} onDispatch={() => undefined} />)
    const inventory = container.querySelector('.reward-card-list')

    expect(inventory).toBeInTheDocument()
    expect(container.querySelector('.reward-card-row-augment')).toBeInTheDocument()
    expect(container.querySelector('.reward-card-row-item')).toBeInTheDocument()
    expect(within(inventory as HTMLElement).getByText('Combo Starter')).toBeInTheDocument()
    expect(within(inventory as HTMLElement).getByText('Multi-Hit Charm')).toBeInTheDocument()
    expect(screen.getByText('2/12')).toBeInTheDocument()
    expect(screen.getAllByText('AUG').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ITEM').length).toBeGreaterThan(0)
  })

  it('uses item card IDs for display-only multiplier limits', () => {
    const engine = new GameEngine('battle-item-id-multiplier', {
      startingRewards: [{ kind: 'item', id: 'multi_hit_charm' }],
    })
    const projected = projectUiGameState(engine.getState(), emptyFeedback)
    const limitBreaker = {
      ...projected.build.items[0],
      id: 'limit_breaker',
      name: 'Limit Breaker',
    } satisfies ItemCard
    const state = {
      ...projected,
      build: {
        ...projected.build,
        items: [limitBreaker],
      },
    }
    const { container } = render(<BattleScreen state={state} onDispatch={() => undefined} />)

    expect(container.querySelector('.cabinet-wrap')).toHaveAttribute('data-multiplier-max', '5')
  })

  it('keeps the reward inventory side panel aligned with the projected card model', () => {
    const engine = new GameEngine('augment-side-panel-owned-cards', {
      startingRewards: [
        { kind: 'augment', id: 'combo_starter' },
        { kind: 'item', id: 'multi_hit_charm' },
      ],
    })
    const state = projectUiGameState(engine.getState(), emptyFeedback)
    render(<RewardInventorySidePanel build={state.build} />)

    expect(screen.getByText('2/12')).toBeInTheDocument()
    expect(screen.getByText('Combo Starter')).toBeInTheDocument()
    expect(screen.getByText('Multi-Hit Charm')).toBeInTheDocument()
    expect(screen.getAllByText('AUG').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ITEM').length).toBeGreaterThan(0)
  })
})
