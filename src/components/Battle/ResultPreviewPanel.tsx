import React from 'react';
import { SlotResult, EnemyState } from '../../types/game';

interface ResultPreviewPanelProps {
  result: SlotResult | null;
  enemy: EnemyState;
  combatLogs: string[];
  lastDamagePop: { value: number; type: 'PLAYER_DMG' | 'ENEMY_DMG' | 'HEAL' | 'SHIELD'; id: number } | null;
}

export const ResultPreviewPanel: React.FC<ResultPreviewPanelProps> = ({
  result,
  enemy,
  combatLogs,
  lastDamagePop
}) => {
  return (
    <aside className="run-panel-container">
      {/* Floating Damage Popup Notification */}
      {lastDamagePop && (
        <div key={lastDamagePop.id} className={`dmg-pop-bubble ${lastDamagePop.type.toLowerCase()}`}>
          {lastDamagePop.type === 'ENEMY_DMG' && `💥 -${lastDamagePop.value}`}
          {lastDamagePop.type === 'PLAYER_DMG' && `💔 -${lastDamagePop.value}`}
          {lastDamagePop.type === 'HEAL' && `💖 +${lastDamagePop.value}`}
          {lastDamagePop.type === 'SHIELD' && `🛡️ +${lastDamagePop.value}`}
        </div>
      )}

      {/* Target Enemy Intent Card */}
      <div className="enemy-preview-card">
        <div className="enemy-header">
          {enemy.spriteUrl ? (
            <img className="enemy-sprite-img" src={enemy.spriteUrl} alt={enemy.name} />
          ) : (
            <span className="enemy-avatar">💀</span>
          )}
          <div className="enemy-title-box">
            <h4>{enemy.name}</h4>
            <div className="enemy-hp-outer">
              <div
                className="enemy-hp-inner"
                style={{ width: `${Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100))}%` }}
              />
              <span className="enemy-hp-text">
                {enemy.hp} / {enemy.maxHp}
              </span>
            </div>
          </div>
        </div>

        <div className="enemy-intent-box">
          <span className="intent-icon">{enemy.intent.icon}</span>
          <div className="intent-desc">
            <strong>{enemy.intent.name}</strong>
            <p>{enemy.intent.description}</p>
          </div>
        </div>
      </div>

      {/* Current Turn Result Sentence Preview */}
      <div className="sentence-preview-box">
        <h4>턴 예상 결과</h4>
        {result ? (
          <div className={`sentence-content ${result.isMiss ? 'is-miss' : ''}`}>
            <div className="sentence-symbols">
              <span className="sym">{result.action.name}</span>
              <span className="sym-sep">+</span>
              <span className="sym">{result.target.name}</span>
              <span className="sym-sep">+</span>
              <span className="sym">{result.modifier.name}</span>
            </div>

            <div className="sentence-result-text">
              {result.isMiss ? (
                <span className="miss-text">⚠️ MISS: {result.missReason}</span>
              ) : (
                <span className="effect-text">➡️ {result.finalEffectText}</span>
              )}
            </div>
          </div>
        ) : (
          <p className="no-result-text">레버를 당겨 슬롯 릴을 스핀하세요.</p>
        )}
      </div>

      {/* Combat Activity Stream Logs */}
      <div className="combat-log-stream">
        <h4>전투 로그</h4>
        <div className="log-list">
          {combatLogs.slice(-6).map((log, idx) => (
            <p key={idx} className="log-line">
              {log}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
};
