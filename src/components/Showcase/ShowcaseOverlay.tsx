import React from 'react';
import { ShowcaseStep, GameCommand } from '../../types/game';
import { soundManager } from '../../utils/soundManager';

interface ShowcaseOverlayProps {
  currentStepIndex: number;
  steps: ShowcaseStep[];
  onDispatch: (cmd: GameCommand) => void;
}

export const ShowcaseOverlay: React.FC<ShowcaseOverlayProps> = ({ currentStepIndex, steps, onDispatch }) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  const handleNextStep = () => {
    soundManager.playClick();
    onDispatch({ type: 'NEXT_SHOWCASE_STEP' });
  };

  return (
    <div className="showcase-overlay-bar">
      <div className="showcase-badge">🏆 3분 대회 시연 모드 (SHOWCASE MODE)</div>

      <div className="showcase-step-info">
        <div className="showcase-step-heading">
          <span className="step-num">STEP {currentStep.stepIndex} / {steps.length}</span>
          <span className="step-separator" aria-hidden="true">•</span>
          <strong className="step-title">{currentStep.title}</strong>
        </div>
        <p>{currentStep.instruction}</p>
        <div className="highlight-callout">⚡ {currentStep.highlightMessage}</div>
      </div>

      <div className="showcase-actions">
        <button className="k-btn showcase big glow-pulse" onClick={handleNextStep} type="button">
          ▶️ 다음 시연 단계 (NEXT STEP)
        </button>
        <button
          className="k-btn primary"
          onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'TITLE' })}
          type="button"
        >
          🏠 타이틀로
        </button>
      </div>
    </div>
  );
};
