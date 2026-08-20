import React from 'react';
import { GameCommand } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface TitleScreenProps {
  onDispatch: (cmd: GameCommand) => void;
  onOpenCurseLog?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onDispatch, onOpenCurseLog }) => {
  const handleStartNormal = () => {
    soundManager.playClick();
    onDispatch({ type: 'START_RUN', mode: 'NORMAL' });
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
      <div className="dungeon-wall-top" style={{ height: '220px' }} />
      <div className="wall-base-shadow" style={{ top: '220px' }} />

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

      <img className="deco" src={getAsset('dg_crate')} style={{ left: '40px', bottom: '20px', width: '38px', height: '56px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_crate')} style={{ left: '84px', bottom: '16px', width: '32px', height: '48px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_crate')} style={{ right: '40px', bottom: '20px', width: '38px', height: '56px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_skull_deco')} style={{ right: '96px', bottom: '24px', width: '22px', height: '22px', opacity: 0.85 }} alt="skull" />

      <div className="warm-glow" />

      <div className="logo-wrap">
        <div className="logo-title">SLOT ROGUE</div>
        <div className="logo-sub">릴을 당겨 던전을 돌파하라 — 저주받은 슬롯머신</div>
      </div>

      <div className="title-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <div className="k-btn big primary glow-pulse" onClick={handleStartNormal}>
          🎮 던전 탐사 시작 (START GAME)
        </div>
        <button className="k-btn big showcase glow-pulse" onClick={handleStartShowcase} type="button">
          Showcase Mode
        </button>
        <div className="k-btn sub-btn" onClick={handleOpenCurseLog} style={{ cursor: 'pointer', padding: '6px 16px', background: 'rgba(0,0,0,0.6)', border: '1px solid #7c6f50', borderRadius: '4px', color: '#e2d3a8', fontSize: '13px' }}>
          📜 저주 일지 (Curse Log)
        </div>
      </div>

      <div className="vignette" />
    </div>
  );
};
