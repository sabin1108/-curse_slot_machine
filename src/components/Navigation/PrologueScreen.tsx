import React, { useEffect, useState } from 'react';
import { GameCommand } from '../../types/game';

interface PrologueScreenProps {
  onDispatch: (command: GameCommand) => void;
}

const PROLOGUE_LINES = [
  '소문을 듣고 찾아간 폐성의 지하.',
  '그곳엔 낡고 기묘한 슬롯머신 하나가 홀로 웅웅거리고 있었다.',
  '손잡이를 당긴 순간, 오래된 기계가 당신의 운명을 다시 섞기 시작했다.',
  '이제 물러날 수 없다. 기계가 멈추는 곳까지, 저주를 거슬러 내려가야 한다.',
];

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onDispatch }) => {
  const [visibleLines, setVisibleLines] = useState<number>(1);

  useEffect(() => {
    if (visibleLines < PROLOGUE_LINES.length) {
      const timer = window.setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 1800);
      return () => window.clearTimeout(timer);
    }
  }, [visibleLines]);

  const handleNext = () => {
    if (visibleLines < PROLOGUE_LINES.length) {
      setVisibleLines(PROLOGUE_LINES.length);
    } else {
      onDispatch({ type: 'NAVIGATE', screen: 'ORIGIN' });
    }
  };

  const handleSkip = () => {
    onDispatch({ type: 'NAVIGATE', screen: 'ORIGIN' });
  };

  return (
    <div className="prologue-screen-overlay">
      <div className="prologue-card-panel">
        <div className="prologue-header">
          <span className="prologue-badge">PROLOGUE</span>
          <h2 className="prologue-title">저주의 시작</h2>
        </div>

        <div className="prologue-body">
          {PROLOGUE_LINES.slice(0, visibleLines).map((line, index) => (
            <p key={index} className="prologue-text-line fade-in-line">
              {line}
            </p>
          ))}
        </div>

        <div className="prologue-action-bar">
          <button className="pixel-btn secondary-btn" onClick={handleSkip} type="button">
            건너뛰기
          </button>
          <button className="pixel-btn primary-btn pulse-glow" onClick={handleNext} type="button">
            {visibleLines < PROLOGUE_LINES.length ? '다음 문장 보기' : '기원 선택으로 이동'}
          </button>
        </div>
      </div>
    </div>
  );
};
