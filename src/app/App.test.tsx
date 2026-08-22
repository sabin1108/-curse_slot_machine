import { fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('starts a seeded normal run through prologue and canonical origin selection', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Run seed'), { target: { value: 'ui-origin-seed' } })
    fireEvent.click(screen.getByText(/START GAME/i))
    fireEvent.click(screen.getByRole('button', { name: /Skip/i }))

    expect(screen.getByText('몰락한 검사')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /몰락한 검사.*시작/ }))

    expect(screen.getByText(/1 \/ 15 스테이지/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Stage 1 전투/ })).toBeEnabled()
    expect(screen.queryByText(/보스 보기/)).not.toBeInTheDocument()
  })

  it('keeps showcase as a presentation-only overlay', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }))
    expect(screen.getByText(/STEP 1 \/ 4/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))
    expect(screen.getByText(/STEP 2 \/ 4/i)).toBeInTheDocument()
    expect(screen.getByText(/START GAME/i)).toBeInTheDocument()
  })

  it('offers showcase reward choices as named buttons with selected state while hiding overlay controls', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }))

    const rewardChoice = container.querySelector<HTMLButtonElement>('button[data-reward-id]')
    const rewardChoiceName = rewardChoice?.getAttribute('aria-label') ?? ''

    expect(container.querySelector('.reward-modal-backdrop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /NEXT STEP/i })).not.toBeInTheDocument()
    expect(rewardChoice).not.toBeNull()
    if (!rewardChoice) throw new Error('Expected a reward choice button')
    expect(rewardChoiceName).toMatch(/선택/)
    expect(screen.getByRole('button', { name: rewardChoiceName })).toBe(rewardChoice)
    expect(rewardChoice).toHaveAttribute('type', 'button')
    expect(rewardChoice).toHaveAttribute('aria-pressed', 'true')

    rewardChoice?.focus()

    expect(rewardChoice).toHaveFocus()
  })

  it('accepts the next spin immediately after confirming the previous result', () => {
    const { container } = render(<App />)
    fireEvent.change(screen.getByLabelText('Run seed'), { target: { value: 'origin-demo-334' } })
    fireEvent.click(screen.getByText(/START GAME/i))
    fireEvent.click(screen.getByRole('button', { name: /Skip/i }))
    fireEvent.click(screen.getByRole('button', { name: /몰락한 검사.*시작/ }))
    fireEvent.click(container.querySelector('.map-node-card.avail')!)

    fireEvent.click(container.querySelector('.slot-action-area .k-btn.primary')!)
    fireEvent.click(container.querySelector('.slot-action-area .k-btn.success')!)

    expect(screen.getByText('숨 고르기')).toBeInTheDocument()

    fireEvent.click(container.querySelector('.slot-action-area .k-btn.primary')!)

    expect(container.querySelector('.slot-action-area .k-btn.success')).toBeInTheDocument()
  })

  it('uses local font fallbacks instead of external Google Fonts', () => {
    const css = readFileSync('src/styles.css', 'utf8')
    expect(css).not.toContain('fonts.googleapis.com')
    expect(css).toContain('--font-display')
  })
})
