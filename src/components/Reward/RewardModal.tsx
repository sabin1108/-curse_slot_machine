import React, { useState } from 'react';
import { AugmentItem, GameCommand } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface RewardModalProps {
  candidates: AugmentItem[];
  augSlotPresentation: {
    reels: [string, string, string];
    targetAugment: AugmentItem | null;
    isRevealed: boolean;
  } | null;
  onDispatch: (cmd: GameCommand) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ candidates, augSlotPresentation, onDispatch }) => {
  const [selectedAug, setSelectedAug] = useState<AugmentItem | null>(candidates[0] || null);

  const handleSelectReward = (augment: AugmentItem) => {
    setSelectedAug(augment);
    soundManager.playJackpotSound();
    onDispatch({ type: 'CHOOSE_REWARD', augmentId: augment.id });
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
          <h2>?꾪닾 ?밸━ 蹂댁긽: 利앷컯 移대뱶 ?좏깮</h2>
          <p>?띾뱷??利앷컯 移대뱶瑜??좏깮?섏꽭??(AugmentSlotMachine ?곗텧)</p>
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
          {candidates.map((aug) => {
            const isSelected = selectedAug?.id === aug.id;
            return (
              <button
                key={aug.id}
                className={`reward-card-pixel ${isSelected ? 'selected' : ''}`}
                style={{ backgroundImage: `url(${getCardFrame(aug.rarity)})` }}
                type="button"
                aria-label={`${aug.name} 선택`}
                aria-pressed={isSelected}
                onClick={() => handleSelectReward(aug)}
              >
                <div className="card-pixel-rarity">{aug.rarity}</div>
                <img className="card-pixel-icon" src={aug.imgUrl || getAsset('sword_gold')} alt={aug.name} />
                <h3 className="card-pixel-title">{aug.name}</h3>
                <p className="card-pixel-desc">{aug.description}</p>
                <div className="card-pixel-val">효과: {aug.effectValue}</div>
                <span className="k-btn card-select-btn">선택하기</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
