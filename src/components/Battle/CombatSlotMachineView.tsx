import type { ReelId, ReelSymbol, SlotResult } from '../../types/game'

interface CombatSlotMachineViewProps {
  reels: Record<ReelId, ReelSymbol[]>
  reelIndexes: Record<ReelId, number>
  lockedReels: Set<ReelId>
  isSpinning: boolean
  hasSpunThisTurn: boolean
  currentResult?: SlotResult | null
  onSpin: () => void
  onToggleLock: (reelId: ReelId) => void
  onReroll: () => void
  onConfirm: () => void
  isFreeRerollAvailable?: boolean
  multiplierMax?: number
}

const REELS: Array<{ id: ReelId; label: string }> = [
  { id: 'action', label: '행동' },
  { id: 'target', label: '대상' },
  { id: 'modifier', label: '배율' },
]

function resultLabel(result: SlotResult | null | undefined, reelId: ReelId): string {
  if (!result) return '?'
  return result[reelId].name
}

export function CombatSlotMachineView({
  reels,
  reelIndexes,
  lockedReels,
  isSpinning,
  hasSpunThisTurn,
  currentResult,
  onSpin,
  onToggleLock,
  onReroll,
  onConfirm,
  isFreeRerollAvailable = false,
  multiplierMax,
}: CombatSlotMachineViewProps) {
  const rerollCost = isFreeRerollAvailable ? 0 : lockedReels.size + 1

  return (
    <div
      className="cabinet-wrap"
      data-reel-count={Object.keys(reels).length}
      data-reel-position={`${reelIndexes.action}:${reelIndexes.target}:${reelIndexes.modifier}`}
      data-multiplier-max={multiplierMax}
    >
      <div className="cabinet-row">
        <section className="cabinet" aria-label="전투 슬롯 머신">
          <div className="cabinet-topper">COMBAT SLOT</div>

          <div className="reel-bank">
            {REELS.map(({ id, label }) => {
              const isLocked = lockedReels.has(id)
              return (
                <button
                  aria-label={`${label} 릴${isLocked ? ' 잠금됨' : ''}`}
                  aria-pressed={isLocked}
                  className={`reel-window${isLocked ? ' is-locked' : ''}`}
                  disabled={!hasSpunThisTurn || isSpinning}
                  key={id}
                  onClick={() => onToggleLock(id)}
                  type="button"
                >
                  <span className="reel-label">{label}</span>
                  <strong>{resultLabel(currentResult, id)}</strong>
                  {isLocked && <span className="lock-badge">LOCK</span>}
                </button>
              )
            })}
          </div>

          <div className="slot-action-area">
            {!hasSpunThisTurn ? (
              <button
                className="k-btn big primary glow-pulse"
                disabled={isSpinning}
                onClick={onSpin}
                type="button"
              >
                {isSpinning ? '회전 중…' : '스핀'}
              </button>
            ) : (
              <div className="reroll-bar">
                <button
                  className="k-btn warning"
                  disabled={isSpinning}
                  onClick={onReroll}
                  type="button"
                >
                  리롤 ({rerollCost})
                </button>
                <button
                  className="k-btn success"
                  disabled={isSpinning}
                  onClick={onConfirm}
                  type="button"
                >
                  확정
                </button>
              </div>
            )}
          </div>
        </section>

        <button
          aria-label={hasSpunThisTurn ? '리롤' : '스핀'}
          className="lever-wrap"
          disabled={isSpinning}
          onClick={hasSpunThisTurn ? onReroll : onSpin}
          type="button"
        >
          <span className="lever-stick" />
          <span className="lever-knob" />
        </button>
      </div>
    </div>
  )
}
