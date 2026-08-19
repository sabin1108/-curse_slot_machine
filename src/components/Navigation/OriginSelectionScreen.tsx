import React, { useState } from 'react';
import { GameCommand, OriginId } from '../../types/game';
import { ORIGINS } from '../../game/origins';

interface OriginSelectionScreenProps {
  onDispatch: (command: GameCommand) => void;
}

export const OriginSelectionScreen: React.FC<OriginSelectionScreenProps> = ({ onDispatch }) => {
  const [selectedOrigin, setSelectedOrigin] = useState<OriginId>('SWORDSMAN');

  const originList = Object.values(ORIGINS);

  const handleConfirm = () => {
    onDispatch({ type: 'SELECT_ORIGIN', originId: selectedOrigin });
  };

  return (
    <div className="origin-select-screen">
      <div className="origin-header-banner">
        <h2 className="origin-screen-title">운명의 기원(Origin) 선택</h2>
        <p className="origin-screen-subtitle">
          "당신은 왜 저주받은 슬롯머신에 손을 대었는가?"
        </p>
      </div>

      <div className="origin-cards-grid">
        {originList.map((orig) => {
          const isSelected = selectedOrigin === orig.id;
          return (
            <div
              key={orig.id}
              className={`origin-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedOrigin(orig.id)}
            >
              <div className="origin-card-badge">{orig.icon}</div>
              <h3 className="origin-name">{orig.name}</h3>
              <div className="origin-tagline">{orig.tagline}</div>
              <p className="origin-narrative">{orig.narrative}</p>

              <div className="origin-stats-box">
                <div className="stat-row">
                  <span>시작 골드:</span>
                  <span className="stat-val">{150 + orig.startingGoldBonus} G</span>
                </div>
                <div className="stat-row">
                  <span>최대 HP:</span>
                  <span className="stat-val">{100 + orig.startingHpBonus}</span>
                </div>
                <div className="stat-row">
                  <span>시작 수호:</span>
                  <span className="stat-val">{orig.startingShieldBonus}</span>
                </div>
              </div>

              <div className="origin-bias-tag">
                {orig.symbolBiasText}
              </div>
            </div>
          );
        })}
      </div>

      <div className="origin-confirm-bar">
        <span className="origin-guide-hint">
          💡 선택한 기원에 따라 시작 능력치와 심볼 운영 성향이 결정됩니다.
        </span>
        <button
          className="pixel-btn primary-btn confirm-btn pulse-glow"
          onClick={handleConfirm}
          type="button"
        >
          {ORIGINS[selectedOrigin].name} 기원으로 탐사 시작 ▶
        </button>
      </div>
    </div>
  );
};
