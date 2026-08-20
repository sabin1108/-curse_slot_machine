import React, { useState } from 'react';
import { GameCommand, PlayerState } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface RestScreenProps {
  player: PlayerState;
  curseCurrent: number;
  onDispatch: (cmd: GameCommand) => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ player, curseCurrent, onDispatch }) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleRestAction = (type: 'HEAL' | 'UPGRADE') => {
    if (selectedAction) return;

    setSelectedAction(type);
    soundManager.playClick();
    onDispatch({ type: 'REST_ACTION', actionType: type });
  };

  return (
    <div
      id="frame-rest"
      className="frame rest-screen-viewport"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`,
        ['--wall-tile' as string]: `url(${getAsset('dg_wall_top_mid')})`
      }}
    >
      <div className="dungeon-floor" style={{ opacity: 0.9 }} />
      <div className="dungeon-wall-top" />
      <div className="wall-base-shadow" style={{ top: '160px' }} />

      {/* Pillars & Campfire Sanctuary Decor */}
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />

      <img className="deco" src={getAsset('dg_crate')} style={{ left: '160px', top: '380px', width: '38px', height: '54px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_crate')} style={{ right: '160px', top: '385px', width: '36px', height: '52px' }} alt="crate" />

      {/* Rest Sanctuary Header Bar */}
      <div className="rest-header-bar">
        <div className="rest-title-badge">🔥 모닥불 쉼터 — 던전 보금자리</div>
        <div className="rest-status-hud">
          ❤️ HP {player.hp}/{player.maxHp} &nbsp;|&nbsp; ☠️ 저주 {curseCurrent}/10
        </div>
      </div>

      {/* Campfire Flame Animation & Warm Glow */}
      <div className="campfire-center-zone">
        <div className="campfire-glow-bg" />
        <img
          className="fx-glow campfire-flame-img"
          src={getAsset('fx_campfire_strip_f0')}
          alt="campfire flame"
        />
        <div className="campfire-quote">
          💬 "따스한 장작불 소리와 온기가 지친 수호자의 영혼을 감쌉니다..."
        </div>
      </div>

      <div className="warm-glow" style={{ opacity: 0.7 }} />

      {/* 3 Rest Choice Cards */}
      <div className="rest-choice-cards">
        <div
          className={`rest-option-card ${selectedAction === 'HEAL' ? 'active' : ''}`}
          onClick={() => handleRestAction('HEAL')}
        >
          <img className="rest-card-icon" src={getAsset('rest_heal')} alt="heal rest choice" />
          <div className="rest-card-title">🧪 모닥불 휴식</div>
          <div className="rest-card-desc">
            장작불 곁에서 지친 몸을 달래고<br />
            <strong>HP +35</strong> 즉시 회복합니다.
          </div>
          <button className="k-btn primary" type="button">
            {selectedAction === 'HEAL' ? '✅ 완료' : '휴식하기'}
          </button>
        </div>

        <div
          className={`rest-option-card ${selectedAction === 'UPGRADE' ? 'active' : ''}`}
          onClick={() => handleRestAction('UPGRADE')}
        >
          <img className="rest-card-icon" src={getAsset('rest_purify')} alt="purify rest choice" />
          <div className="rest-card-title">🔮 저주 정화 의식</div>
          <div className="rest-card-desc">
            신성한 정화 기도를 올려<br />
            <strong>저주 게이지 -3</strong> 정화합니다.
          </div>
          <button className="k-btn warning" type="button">
            {selectedAction === 'UPGRADE' ? '✅ 완료' : '정화하기'}
          </button>
        </div>
      </div>

      {/* Return to Map Navigation Button */}
      <div className="rest-footer-bar">
        <button
          className="k-btn big primary glow-pulse"
          onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'MAP' })}
          type="button"
        >
          🗺️ 탐사 지도로 돌아가기
        </button>
      </div>

      <div className="vignette" />
    </div>
  );
};
