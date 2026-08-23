import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TitleScreen } from './TitleScreen'

describe('TitleScreen', () => {
  it('dispatches the entered seed without changing the existing start command path', () => {
    const onDispatch = vi.fn()

    render(<TitleScreen onDispatch={onDispatch} />)

    fireEvent.change(screen.getByLabelText('Run seed'), { target: { value: 'recovery-seed' } })
    fireEvent.click(screen.getByText(/START GAME/i))

    expect(onDispatch).toHaveBeenCalledWith({
      type: 'START_RUN',
      seed: 'recovery-seed',
      mode: 'NORMAL',
    })
  })
})
