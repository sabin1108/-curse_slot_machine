import React, { useEffect } from 'react';
import { GameCommand, GameScreen } from '../../types/game';
import { soundManager } from '../../utils/soundManager';

interface GameOverVictoryModalProps {
  screen: GameScreen;
  wave: number;
  totalWaves: number;
  combatLogs: string[];
  onDispatch: (cmd: GameCommand) => void;
}

function getRunSummaryLog(logs: string[]): string {
  const preferred = [...logs]
    .reverse()
    .find((log) => (
      log.includes('[Victory]')
      || log.includes('defeated')
      || log.includes('damage')
      || log.includes('Damage')
      || log.includes('HP')
    ));

  return preferred ?? logs.at(-1) ?? '기록된 전투 로그가 없습니다.';
}

export const GameOverVictoryModal: React.FC<GameOverVictoryModalProps> = ({
  screen,
  wave,
  totalWaves,
  combatLogs,
  onDispatch,
}) => {
  const isVictory = screen === 'VICTORY';
  const summaryLog = getRunSummaryLog(combatLogs);

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
          <span
            className="card-pixel-rarity"
            style={{
              fontSize: '13px',
              background: isVictory ? '#ffb703' : '#ff4444',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            {isVictory ? 'S-RANK 챔피언' : '탐사 실패'}
          </span>
          <h2 style={{ fontSize: '26px', marginTop: '10px', color: isVictory ? '#ffd25a' : '#ff5b5b' }}>
            {isVictory ? '최종 보스 처치' : '탐사 종료'}
          </h2>
          <p style={{ fontSize: '14px', color: '#ccc' }}>
            {isVictory
              ? '저주받은 슬롯머신이 부서지고, 아이템 보상 대신 엔딩으로 탐사가 마무리됩니다.'
              : `${wave} / ${totalWaves} 단계에서 쓰러졌습니다.`}
          </p>
        </div>

        <div className="aug-slot-presentation-box run-summary-box" style={{ textAlign: 'left', padding: '16px 20px', margin: '20px 0' }}>
          <div className="aug-slot-topper" style={{ fontSize: '15px', color: '#ffd25a' }}>
            탐사 최종 기록
          </div>
          <div style={{ fontSize: '13.5px', color: '#eee', lineHeight: '1.6' }}>
            최종 도달 단계: <strong>{wave} / {totalWaves}</strong><br />
            탐사 종합 평가: <strong style={{ color: isVictory ? '#ffb703' : '#ff5b5b' }}>{isVictory ? 'S-RANK 챔피언' : 'B-RANK 탐사자'}</strong><br />
            전투 기록 요약: <em>{summaryLog}</em>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center' }}>
          <button className="k-btn primary big glow-pulse" onClick={handleRestart} type="button">
            새 탐사 시작
          </button>
          <button
            className="k-btn big"
            onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'TITLE' })}
            type="button"
          >
            타이틀로
          </button>
        </div>
      </div>
    </div>
  );
};
