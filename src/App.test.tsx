import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the prototype environment screen', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /curse slot machine/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start run/i })).toBeInTheDocument()
  })
})
