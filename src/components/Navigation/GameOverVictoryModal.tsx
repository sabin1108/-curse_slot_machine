import React, { useEffect } from 'react';
import { GameScreen, GameCommand } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface GameOverVictoryModalProps {
  screen: GameScreen;
  wave: number;
  combatLogs: string[];
  onDispatch: (cmd: GameCommand) => void;
}

export const GameOverVictoryModal: React.FC<GameOverVictoryModalProps> = ({
  screen,
  wave,
  combatLogs,
  onDispatch
}) => {
  const isVictory = screen === 'VICTORY';

  useEffect(() => {
    if (isVictory) {
      soundManager.playJackpotSound();
    }
  }, [isVictory]);

  const handleRestart = () => {
    soundManager.playClick();
    onDispatch({ type: 'START_RUN' });
  };

  return (
    <div className="reward-modal-backdrop">
      <div className={`reward-modal-content ${isVictory ? 'victory-glow' : 'gameover-glow'}`}>
        <div className="reward-header">
          <span className="card-pixel-rarity" style={{ fontSize: '13px', background: isVictory ? '#ffb703' : '#ff4444', color: '#000', fontWeight: 'bold' }}>
            {isVictory ? '🏆 S-RANK DUNGEON CHAMPION' : '☠️ RUN FAILED'}
          </span>
          <h2 style={{ fontSize: '26px', marginTop: '10px', color: isVictory ? '#ffd25a' : '#ff5b5b' }}>
            {isVictory ? '🏰 저주받은 성채 완벽 정복!' : '☠️ 저주의 성채에서 쓰러졌습니다...'}
          </h2>
          <p style={{ fontSize: '14px', color: '#ccc' }}>
            {isVictory
              ? '하우스 딜러를 상대로 잭팟 5연타 폭격을 적중시키고 성채를 탈출했습니다!'
              : `Stage ${wave} / 7에서 마물과의 슬롯 대결 중 체력이 다했습니다.`}
          </p>
        </div>

        <div className="aug-slot-presentation-box" style={{ textAlign: 'left', padding: '16px 20px', margin: '20px 0' }}>
          <div className="aug-slot-topper" style={{ fontSize: '15px', color: '#ffd25a' }}>
            📜 런 탐사 최종 기록
          </div>
          <div style={{ fontSize: '13.5px', color: '#eee', lineHeight: '1.6' }}>
            • 최종 도달 층: <strong>{wave} / 7 Floors</strong><br />
            • 탐사 종합 평가: <strong style={{ color: isVictory ? '#ffb703' : '#ff5b5b' }}>{isVictory ? 'S-RANK CHAMPION' : 'B-RANK EXPLORER'}</strong><br />
            • 전투 기록 요약: <em>{combatLogs[combatLogs.length - 1] || '전투 기록 없음'}</em>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center' }}>
          <button className="k-btn primary big glow-pulse" onClick={handleRestart} type="button">
            🔄 새로운 런 도전하기
          </button>
          <button
            className="k-btn big"
            onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'TITLE' })}
            type="button"
          >
            🏠 타이틀로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
