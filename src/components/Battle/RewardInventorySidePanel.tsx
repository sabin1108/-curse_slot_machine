import React from 'react';
import { BuildState } from '../../types/game';

interface RewardInventorySidePanelProps {
  build: BuildState;
}

export const RewardInventorySidePanel: React.FC<RewardInventorySidePanelProps> = ({ build }) => {
  const ownedRewardCards = [...build.augments, ...build.items];

  return (
    <aside className="side-panel-container">
      <div className="side-panel-header">
        <h3>보유 증강/아이템</h3>
        <span className="count-badge">{ownedRewardCards.length}/12</span>
      </div>

      <div className="reward-card-list">
        {ownedRewardCards.map((rewardCard) => (
          <div key={`${rewardCard.kind}-${rewardCard.id}`} className={`reward-card-row reward-card-row-${rewardCard.kind} rarity-${rewardCard.rarity.toLowerCase()}`} title={rewardCard.description}>
            <span className="reward-card-icon">{rewardCard.icon}</span>
            <div className="reward-card-details">
              <span className="reward-card-name">{rewardCard.name}</span>
              <span className="reward-card-tags">{rewardCard.tags.join(' · ')}</span>
            </div>
            <span className="reward-card-value">{rewardCard.effectValue}</span>
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
