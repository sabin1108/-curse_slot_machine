import React from 'react';
import { PlayerState, CurseState } from '../../types/game';
import { soundManager } from '../../utils/soundManager';

interface HUDHeaderProps {
  player: PlayerState;
  curse: CurseState;
  wave: number;
  totalWaves: number;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({ player, curse, wave, totalWaves }) => {
  const hpPercent = Math.max(0, Math.min(100, Math.round((player.hp / player.maxHp) * 100)));
  const cursePercent = Math.max(0, Math.min(100, Math.round((curse.current / curse.max) * 100)));
  const [muted, setMuted] = React.useState(!soundManager.isEnabled());

  const handleToggleMute = () => {
    const nextState = soundManager.toggleSound();
    setMuted(!nextState);
  };

  return (
    <header className="hud-bar-container">
      <div className="hud-group hp-group">
        <span className="hud-label">HP</span>
        <div className="hp-bar-outer" title={`현재 체력: ${player.hp} / ${player.maxHp}`}>
          <div className="hp-bar-ghost" style={{ width: `${hpPercent}%` }} />
          <div className="hp-bar-inner" style={{ width: `${hpPercent}%` }} />
          {player.shield > 0 && (
            <div
              className="shield-bar-overlay"
              style={{ width: `${Math.min(100, (player.shield / player.maxHp) * 100)}%` }}
            />
          )}
          <div className="hp-text">
            {player.hp} / {player.maxHp} {player.shield > 0 ? `(+${player.shield} 🛡️)` : ''}
          </div>
        </div>
      </div>

      <div className="hud-group wave-group">
        <span className="hud-label">WAVE</span>
        <div className="wave-dots" aria-label={`웨이브 ${wave} / ${totalWaves}`}>
          {Array.from({ length: totalWaves }).map((_, idx) => (
            <span key={idx} className={`wave-dot ${idx < wave ? 'on' : ''}`} />
          ))}
        </div>
      </div>

      <div className="hud-group curse-group">
        <span className="hud-label curse-label">☠️ 저주</span>
        <div className="curse-bar-outer" title={`저주 수치: ${curse.current} / ${curse.max}`}>
          <div
            className={`curse-bar-inner ${curse.current >= 5 ? 'danger-pulse' : ''}`}
            style={{ width: `${cursePercent}%` }}
          />
          <div className="curse-text">
            {curse.current} / {curse.max}
          </div>
        </div>
      </div>

      <div className="hud-group right-group">
        <div className="gold-count">🪙 {player.gold}</div>
        <button
          className="sound-toggle-btn"
          onClick={handleToggleMute}
          title={muted ? '음소거 해제' : '음소거'}
          type="button"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
};
