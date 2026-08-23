import React, { useState } from 'react';
import { GameCommand } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface TitleScreenProps {
  onDispatch: (cmd: GameCommand) => void;
  onOpenCurseLog?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onDispatch, onOpenCurseLog }) => {
  const [seed, setSeed] = useState('curse_slot_demo_2026');

  const handleStartNormal = () => {
    soundManager.playClick();
    onDispatch({ type: 'START_RUN', seed: seed.trim() || undefined, mode: 'NORMAL' });
  };

  const handleOpenCurseLog = () => {
    soundManager.playClick();
    if (onOpenCurseLog) {
      onOpenCurseLog();
    }
  };

  const handleStartShowcase = () => {
    soundManager.playClick();
    onDispatch({ type: 'START_SHOWCASE' });
  };

  return (
    <div
      className="frame title-screen"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`,
        ['--wall-tile' as string]: `url(${getAsset('dg_wall_top_mid')})`,
        ['--banner-tile' as string]: `url(${getAsset('dg_wall_banner_red')})`
      }}
    >
      <div className="dungeon-floor" />
      <div className="dungeon-wall-top" style={{ height: '180px' }} />
      <div className="wall-base-shadow" style={{ top: '180px' }} />

      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '290px', top: '50px', height: '160px' }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '290px', top: '50px', height: '160px' }} alt="pillar" />

      <div className="banner-l" style={{ backgroundImage: `url(${getAsset('dg_wall_banner_red')})` }} />
      <div className="banner-r" style={{ backgroundImage: `url(${getAsset('dg_wall_banner_red')})` }} />

      <div className="door-wrap">
        <img src={getAsset('dg_doors_frame_left')} style={{ width: '40px', height: '80px' }} alt="door frame" />
        <img src={getAsset('dg_doors_leaf_closed')} style={{ width: '80px', height: '80px' }} alt="door leaf" />
        <img src={getAsset('dg_doors_frame_right')} style={{ width: '40px', height: '80px' }} alt="door frame" />
      </div>

      <img className="torch torch-l fx-glow" src={getAsset('fx_campfire_strip_f0')} alt="torch" />
      <img className="torch torch-r fx-glow" src={getAsset('fx_campfire_strip_f0')} alt="torch" />

      <div className="title-slot-altar compact-title-altar" aria-hidden="true">
        <div className="title-slot-window">777</div>
        <img src={getAsset('dg_lever_right')} alt="" />
      </div>

      <div className="room-environment title-environment" aria-hidden="true">
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
        <img className="dungeon-ground-prop prop-chest prop-c" src={getAsset('dg_chest_empty_open_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-hole prop-d" src={getAsset('dg_wall_hole_1')} alt="" />
        <img className="dungeon-ground-prop prop-fountain prop-e" src={getAsset('dg_wall_fountain_basin_blue_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-ladder prop-f" src={getAsset('dg_floor_ladder')} alt="" />
      </div>

      <div className="warm-glow" />

      <div className="logo-wrap">
        <div className="logo-title">SLOT ROGUE</div>
        <div className="logo-sub">룬을 뽑고 던전을 돌파하라 - 저주받은 슬롯머신</div>
      </div>

      <div className="title-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <label className="seed-field">
          RUN SEED
          <input
            aria-label="Run seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
        </label>
        <div className="k-btn big primary glow-pulse" onClick={handleStartNormal}>
          던전 탐사 시작
        </div>
        <button className="k-btn big showcase glow-pulse" onClick={handleStartShowcase} type="button">
          Showcase Mode
        </button>
        <div className="k-btn sub-btn" onClick={handleOpenCurseLog} style={{ cursor: 'pointer', padding: '6px 16px', background: 'rgba(0,0,0,0.6)', border: '1px solid #7c6f50', borderRadius: '4px', color: '#e2d3a8', fontSize: '13px' }}>
          저주 일지
        </div>
      </div>

      <div className="vignette" />
    </div>
  );
};
