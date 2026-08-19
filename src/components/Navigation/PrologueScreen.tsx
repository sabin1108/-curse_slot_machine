import React, { useState, useEffect } from 'react';
import { GameCommand } from '../../types/game';

interface PrologueScreenProps {
  onDispatch: (command: GameCommand) => void;
}

const PROLOGUE_LINES = [
  '소문을 듣고 찾아간 폐성의 지하...',
  '그곳엔 낡고 기묘한 슬롯머신 하나가 홀로 웅웅거리고 있었다.',
  '이끌리듯 손을 대는 순간 — 릴의 톱니바퀴가 저절로 돌기 시작했다.',
  '이제 돌이킬 수 없다. 이 기계가 멈추는 곳까지, 깊은 심연으로 나아가는 수밖에.'
];

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onDispatch }) => {
  const [visibleLines, setVisibleLines] = useState<number>(1);

  useEffect(() => {
    if (visibleLines < PROLOGUE_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
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
          {PROLOGUE_LINES.slice(0, visibleLines).map((line, idx) => (
            <p key={idx} className="prologue-text-line fade-in-line">
              {line}
            </p>
          ))}
        </div>

        <div className="prologue-action-bar">
          <button className="pixel-btn secondary-btn" onClick={handleSkip} type="button">
            건너뛰기 (Skip)
          </button>
          <button className="pixel-btn primary-btn pulse-glow" onClick={handleNext} type="button">
            {visibleLines < PROLOGUE_LINES.length ? '다음 문장 보기 ▶' : '손을 뻗는다 (기원 선택) ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};
