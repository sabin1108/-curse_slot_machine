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

      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />

      <div className="room-environment rest-environment" aria-hidden="true">
        <div className="dungeon-column column-left-back" />
        <div className="dungeon-column column-left-mid" />
        <div className="dungeon-column column-left-front" />
        <div className="dungeon-column column-right-back" />
        <div className="dungeon-column column-right-mid" />
        <div className="dungeon-column column-right-front" />
        <div className="dungeon-crate-stack stack-a" />
        <div className="dungeon-crate-stack stack-b" />
        <img className="dungeon-ground-prop prop-ladder prop-a" src={getAsset('dg_floor_ladder')} alt="" />
        <img className="dungeon-ground-prop prop-spikes prop-b" src={getAsset('dg_floor_spikes_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-fountain prop-c" src={getAsset('dg_wall_fountain_basin_blue_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-hole prop-d" src={getAsset('dg_wall_hole_1')} alt="" />
        <img className="dungeon-ground-prop prop-chest prop-e" src={getAsset('dg_chest_empty_open_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-spikes prop-f" src={getAsset('dg_floor_spikes_anim_f0')} alt="" />
      </div>

      <div className="rest-header-bar">
        <div className="rest-title-badge">모닥불 쉼터</div>
        <div className="rest-status-hud">
          HP {player.hp}/{player.maxHp} &nbsp;|&nbsp; 저주 {curseCurrent}
        </div>
      </div>

      <div className="campfire-center-zone">
        <div className="campfire-glow-bg" />
        <img
          className="fx-glow campfire-flame-img"
          src={getAsset('fx_campfire_strip_f0')}
          alt="campfire flame"
        />
        <div className="campfire-quote">
          불빛이 낡은 기둥과 오래된 보급 상자 사이로 번진다.
        </div>
      </div>

      <div className="warm-glow" style={{ opacity: 0.7 }} />

      <div className="rest-choice-cards">
        <div
          data-rest-action="heal"
          className={`rest-option-card ${selectedAction === 'HEAL' ? 'active' : ''}`}
          onClick={() => handleRestAction('HEAL')}
        >
          <img className="rest-card-icon" src={getAsset('rest_heal')} alt="heal rest choice" />
          <div className="rest-card-title">모닥불 휴식</div>
          <div className="rest-card-desc">
            낡은 석실에서 지친 몸을 추스릅니다.<br />
            <strong>HP +35</strong> 즉시 회복합니다.
          </div>
          <button className="k-btn primary" type="button">
            {selectedAction === 'HEAL' ? '완료' : '휴식하기'}
          </button>
        </div>

        <div
          data-rest-action="purify"
          className={`rest-option-card ${selectedAction === 'UPGRADE' ? 'active' : ''}`}
          onClick={() => handleRestAction('UPGRADE')}
        >
          <img className="rest-card-icon" src={getAsset('rest_purify')} alt="purify rest choice" />
          <div className="rest-card-title">저주 정화 의식</div>
          <div className="rest-card-desc">
            오래된 제단 앞에서 정화 기도를 올립니다.<br />
            <strong>현재 저주 80%</strong>를 정화합니다.
          </div>
          <button className="k-btn warning" type="button">
            {selectedAction === 'UPGRADE' ? '완료' : '정화하기'}
          </button>
        </div>
      </div>

      <div className="rest-footer-bar">
        <button
          className="k-btn big primary glow-pulse"
          onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'MAP' })}
          type="button"
        >
          탐사 지도로 돌아가기
        </button>
      </div>

      <div className="vignette" />
    </div>
  );
};
