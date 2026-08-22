import React from 'react';
import { BuildState } from '../../types/game';

interface AugmentSidePanelProps {
  build: BuildState;
}

export const AugmentSidePanel: React.FC<AugmentSidePanelProps> = ({ build }) => {
  const ownedRewardCards = [...build.augments, ...build.items];

  return (
    <aside className="side-panel-container">
      <div className="side-panel-header">
        <h3>보유 증강/아이템</h3>
        <span className="count-badge">{ownedRewardCards.length}/12</span>
      </div>

      <div className="augment-list">
        {ownedRewardCards.map((aug) => (
          <div key={`${aug.kind}-${aug.id}`} className={`aug-row aug-row-${aug.kind} rarity-${aug.rarity.toLowerCase()}`} title={aug.description}>
            <span className="aug-icon">{aug.icon}</span>
            <div className="aug-details">
              <span className="aug-name">{aug.name}</span>
              <span className="aug-tags">{aug.tags.join(' · ')}</span>
            </div>
            <span className="aug-val">{aug.effectValue}</span>
          </div>
        ))}
      </div>

      <div className="synergy-section">
        <h4>시너지 진행도</h4>
        {build.synergyProgress.map((syn) => (
          <div key={syn.synergyId} className={`synergy-item ${syn.completed ? 'completed' : ''}`}>
            <div className="synergy-top">
              <span>{syn.name}</span>
              <strong>
                {syn.current} / {syn.required}
              </strong>
            </div>
            <div className="synergy-bar">
              <div
                className="synergy-bar-fill"
                style={{ width: `${Math.min(100, (syn.current / syn.required) * 100)}%` }}
              />
            </div>
            {syn.completed && <span className="synergy-active-badge">✨ 활성화됨</span>}
          </div>
        ))}
      </div>
    </aside>
  );
};
