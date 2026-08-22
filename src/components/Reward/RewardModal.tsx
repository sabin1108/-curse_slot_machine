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
    onDispatch({ type: 'CHOOSE_REWARD', rewardId: augment.id });
  };

  const getCardFrame = (rarity: string) => {
    if (rarity === 'LEGENDARY') return getAsset('card_red_r0');
    if (rarity === 'RARE') return getAsset('card_teal_r0');
    if (rarity === 'CURSED') return getAsset('card_purple_r0');
    return getAsset('card_green_r0');
  };

  const getRarityLabel = (rarity: string) => {
    const labels: Record<string, string> = {
      COMMON: '일반',
      UNCOMMON: '고급',
      RARE: '희귀',
      CURSED: '저주',
      LEGENDARY: '전설',
    };
    return labels[rarity] ?? rarity;
  };

  const getTagLabel = (tag: string) => {
    const labels: Record<string, string> = {
      COMBO: '연계',
      MULTI_HIT: '다단타',
      CRITICAL: '치명',
      BURN: '화상',
      DEFENSE: '방어',
      CURSE: '저주',
      RESOURCE: '자원',
      RISK: '위험',
    };
    return labels[tag] ?? tag;
  };

  const getKindLabel = (augment: AugmentItem) => {
    if (augment.kind === 'item') return '아이템';
    if (augment.rarity === 'CURSED') return '저주 증강';
    return '증강';
  };

  return (
    <div className="reward-modal-backdrop">
      <div className="reward-modal-content">
        <div className="reward-header">
          <span className="reward-badge">전투 보상</span>
          <h2>승리 보상: 증강 카드 선택</h2>
          <p>이번 전투에서 얻을 증강 또는 아이템을 하나 선택하세요.</p>
        </div>

        {augSlotPresentation && (
          <div className="aug-slot-presentation-box">
            <div className="aug-slot-topper">증강 공개 슬롯</div>
            <div className="aug-slot-reels">
              <div className="aug-reel-cell">{getTagLabel(augSlotPresentation.reels[0])}</div>
              <div className="aug-reel-cell">{getRarityLabel(augSlotPresentation.reels[1])}</div>
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
                data-reward-id={aug.id}
                className={`reward-card-pixel ${isSelected ? 'selected' : ''}`}
                style={{ backgroundImage: `url(${getCardFrame(aug.rarity)})` }}
                type="button"
                aria-label={`${aug.name} 선택`}
                aria-pressed={isSelected}
                onClick={() => handleSelectReward(aug)}
              >
                <div className="card-pixel-rarity">{getRarityLabel(aug.rarity)}</div>
                <img className="card-pixel-icon" src={aug.imgUrl || getAsset('sword_gold')} alt={aug.name} />
                <h3 className="card-pixel-title">{aug.name}</h3>
                <div className="card-info-panel">
                  <div className="card-kind-row">
                    <span>{getKindLabel(aug)}</span>
                    <strong>{aug.tags.map(getTagLabel).join(' / ')}</strong>
                  </div>
                  <p className="card-pixel-desc">{aug.description}</p>
                  <div className="card-pixel-val">효과: {aug.effectValue}</div>
                </div>
                <span className="k-btn card-select-btn">선택하기</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
