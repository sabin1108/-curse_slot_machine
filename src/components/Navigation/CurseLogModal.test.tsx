import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CURSE_LOGS } from '../../game/origins'
import { CurseLogModal } from './CurseLogModal'

describe('CurseLogModal', () => {
  it('shows unlocked content and keeps locked fragments hidden', () => {
    render(<CurseLogModal unlockedLogs={['log_01']} onClose={vi.fn()} />)

    expect(screen.getByText(CURSE_LOGS[0].title)).toBeInTheDocument()
    expect(screen.getByText(CURSE_LOGS[0].fragment)).toBeInTheDocument()
    expect(screen.queryByText(CURSE_LOGS[1].fragment)).not.toBeInTheDocument()
    expect(screen.getAllByText(/봉인된 기록/)).toHaveLength(CURSE_LOGS.length - 1)
  })

  it('does not reveal any fragments when no logs are unlocked', () => {
    render(<CurseLogModal unlockedLogs={[]} onClose={vi.fn()} />)

    for (const log of CURSE_LOGS) {
      expect(screen.queryByText(log.fragment)).not.toBeInTheDocument()
    }
  })

  it('reveals every catalog entry when all logs are unlocked', () => {
    render(<CurseLogModal unlockedLogs={CURSE_LOGS.map((log) => log.id)} onClose={vi.fn()} />)

    for (const log of CURSE_LOGS) {
      expect(screen.getByText(log.title)).toBeInTheDocument()
      expect(screen.getByText(log.fragment)).toBeInTheDocument()
    }
  })
})
