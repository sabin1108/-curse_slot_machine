import React, { useState } from 'react';
import { GameCommand, RewardCard } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface RewardModalProps {
  candidates: RewardCard[];
  augSlotPresentation: {
    reels: [string, string, string];
    targetAugment: RewardCard | null;
    isRevealed: boolean;
  } | null;
  onDispatch: (cmd: GameCommand) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ candidates, augSlotPresentation, onDispatch }) => {
  const [selectedReward, setSelectedReward] = useState<RewardCard | null>(candidates[0] || null);

  const handleSelectReward = (reward: RewardCard) => {
    setSelectedReward(reward);
    soundManager.playJackpotSound();
    onDispatch({ type: 'CHOOSE_REWARD', augmentId: reward.id });
  };

  const getCardFrame = (rarity: string) => {
    if (rarity === 'LEGENDARY') return getAsset('card_red_r0');
    if (rarity === 'RARE') return getAsset('card_teal_r0');
    if (rarity === 'CURSED') return getAsset('card_purple_r0');
    return getAsset('card_green_r0');
  };

  return (
    <div className="reward-modal-backdrop">
      <div className="reward-modal-content">
        <div className="reward-header">
          <span className="reward-badge">VICTORY REWARD</span>
          <h2>전투 승리 보상: 카드 선택</h2>
          <p>획득할 증강 또는 아이템 카드를 선택하세요. 보상 연출은 AugmentSlotMachine이 담당합니다.</p>
        </div>

        {augSlotPresentation && (
          <div className="aug-slot-presentation-box">
            <div className="aug-slot-topper">AUGMENT REVEAL SLOT</div>
            <div className="aug-slot-reels">
              <div className="aug-reel-cell">{augSlotPresentation.reels[0]}</div>
              <div className="aug-reel-cell">{augSlotPresentation.reels[1]}</div>
              <div className="aug-reel-cell highlight">{augSlotPresentation.reels[2]}</div>
            </div>
          </div>
        )}

        <div className="reward-card-grid">
          {candidates.map((reward) => {
            const isSelected = selectedReward?.id === reward.id;

            return (
              <button
                key={reward.id}
                className={`reward-card-pixel ${isSelected ? 'selected' : ''}`}
                style={{ backgroundImage: `url(${getCardFrame(reward.rarity)})` }}
                type="button"
                aria-label={`${reward.name} 선택`}
                onClick={() => handleSelectReward(reward)}
              >
                <div className="card-pixel-rarity">{reward.rarity}</div>
                <div className="card-pixel-kind">{reward.kindLabel}</div>
                <img className="card-pixel-icon" src={reward.imgUrl || getAsset('sword_gold')} alt={reward.name} />
                <h3 className="card-pixel-title">{reward.name}</h3>
                <p className="card-pixel-desc">{reward.description}</p>
                <div className="card-pixel-val">효과: {reward.effectValue}</div>
                <div className="k-btn card-select-btn">선택하기</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
