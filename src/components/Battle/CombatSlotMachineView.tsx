import React, { useState, useEffect, useRef } from 'react';
import { ReelSymbol, ReelId } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface CombatSlotMachineViewProps {
  reels: {
    action: ReelSymbol[];
    target: ReelSymbol[];
    modifier: ReelSymbol[];
  };
  reelIndexes: {
    action: number;
    target: number;
    modifier: number;
  };
  lockedReels: Set<ReelId>;
  isSpinning: boolean;
  hasSpunThisTurn: boolean;
  onSpin: () => void;
  onToggleLock: (reelId: ReelId) => void;
  onReroll: () => void;
  onConfirm: () => void;
  isFreeRerollAvailable?: boolean;
}

export const CombatSlotMachineView: React.FC<CombatSlotMachineViewProps> = ({
  reels,
  reelIndexes,
  lockedReels,
  isSpinning,
  hasSpunThisTurn,
  onSpin,
  onToggleLock,
  onReroll,
  onConfirm,
  isFreeRerollAvailable = false
}) => {
  const [leverPulled, setLeverPulled] = useState(false);
  const [reelSpinStates, setReelSpinStates] = useState({
    action: false,
    target: false,
    modifier: false
  });

  // State to hold temporary rapidly-changing display indexes ONLY during spin
  const [displayIndexes, setDisplayIndexes] = useState({
    action: reelIndexes.action,
    target: reelIndexes.target,
    modifier: reelIndexes.modifier
  });

  const intervalRef = useRef<number | null>(null);

  // Sync display indexes strictly when reels are NOT spinning
  useEffect(() => {
    if (!reelSpinStates.action && !reelSpinStates.target && !reelSpinStates.modifier) {
      setDisplayIndexes({
        action: reelIndexes.action,
        target: reelIndexes.target,
        modifier: reelIndexes.modifier
      });
    }
  }, [reelIndexes, reelSpinStates]);

  // Clean up interval & stop spin sound on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      soundManager.stopSlotSpinSound();
    };
  }, []);

  const handlePullLever = () => {
    if (isSpinning || reelSpinStates.action || reelSpinStates.target || reelSpinStates.modifier) return;

    setLeverPulled(true);
    soundManager.playLeverPull();
    setTimeout(() => setLeverPulled(false), 300);

    const spinAction = !lockedReels.has('action');
    const spinTarget = !lockedReels.has('target');
    const spinModifier = !lockedReels.has('modifier');

    setReelSpinStates({
      action: spinAction,
      target: spinTarget,
      modifier: spinModifier
    });

    if (!hasSpunThisTurn) {
      onSpin();
    } else {
      onReroll();
    }

    // Start rapid "따랄라라라" symbol flipping ONLY while spinning
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayIndexes((prev) => ({
        action: spinAction ? Math.floor(Math.random() * reels.action.length) : prev.action,
        target: spinTarget ? Math.floor(Math.random() * reels.target.length) : prev.target,
        modifier: spinModifier ? Math.floor(Math.random() * reels.modifier.length) : prev.modifier
      }));
    }, 45);

    // Reel 1 Stops at 700ms
    setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, action: false }));
      setDisplayIndexes((prev) => ({ ...prev, action: reelIndexes.action }));
      if (spinAction) soundManager.playReelLock();
    }, 700);

    // Reel 2 Stops at 1400ms
    setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, target: false }));
      setDisplayIndexes((prev) => ({ ...prev, target: reelIndexes.target }));
      if (spinTarget) soundManager.playReelLock();
    }, 1400);

    // Reel 3 Stops at 2100ms -> Synchronized stop of slot machine audio!
    setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, modifier: false }));
      setDisplayIndexes((prev) => ({ ...prev, modifier: reelIndexes.modifier }));
      if (spinModifier) soundManager.playReelLock();

      // Immediately stop slot machine audio spin sound!
      soundManager.stopSlotSpinSound();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2100);
  };

  const handleLockToggle = (id: ReelId) => {
    soundManager.playReelLock();
    onToggleLock(id);
  };

  // Safe index lookup
  const currentAction = reels.action[displayIndexes.action % reels.action.length] || reels.action[0];
  const currentTarget = reels.target[displayIndexes.target % reels.target.length] || reels.target[0];
  const currentModifier = reels.modifier[displayIndexes.modifier % reels.modifier.length] || reels.modifier[0];

  const rerollCurseCost = isFreeRerollAvailable ? 0 : lockedReels.size + 1;

  const renderReelWindow = (symbol: ReelSymbol, isSpinningReel: boolean, reelId: ReelId, label: string) => {
    const isLocked = lockedReels.has(reelId);
    return (
      <div className={`reel-col-wrap ${isLocked ? 'is-locked' : ''}`}>
        <div className="reel-col-header">{label}</div>
        <div className={`reel-window ${isSpinningReel ? 'spinning' : ''}`}>
          <div className="symbol-cell">
            <img className="symbol-img" src={symbol.imgUrl || getAsset('sword_gold')} alt={symbol.name} />
            <div className="symbol-name">{symbol.name}</div>
          </div>
        </div>
        {hasSpunThisTurn && (
          <div
            className={`lock-badge ${isLocked ? 'active' : ''}`}
            onClick={() => handleLockToggle(reelId)}
          >
            {isLocked ? '🔒 잠금' : '🔓 잠금'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cabinet-wrap">
      <div className="cabinet-row">
        <div className="cabinet">
          <div className="cabinet-topper">COMBAT SLOT MACHINE</div>

          {renderReelWindow(currentAction, reelSpinStates.action, 'action', '1. 행동 (스킬)')}
          {renderReelWindow(currentTarget, reelSpinStates.target, 'target', '2. 수치 (위력)')}
          {renderReelWindow(currentModifier, reelSpinStates.modifier, 'modifier', '3. 배수 (저주)')}

          <div className="payline" />
        </div>

        <div className={`lever-wrap ${leverPulled ? 'pulled' : ''}`} onClick={handlePullLever}>
          <div className="lever-stick" />
          <img src={getAsset('dg_lever_left')} style={{ width: '28px', height: '28px' }} alt="lever base" />
          <div className="lever-label">PULL</div>
        </div>
      </div>

      {/* Separated Slot Control Area (Zero Overlapping) */}
      <div className="slot-action-area">
        {!hasSpunThisTurn ? (
          <button className="k-btn big primary glow-pulse" onClick={handlePullLever} type="button">
            🎰 PULL LEVER (1➔2➔3 순차 회전)
          </button>
        ) : (
          <div className="reroll-bar">
            <button className="k-btn warning" onClick={handlePullLever} type="button">
              🎲 {isFreeRerollAvailable ? '무료 재회전 (저주 영향 없음)' : `재회전 (저주 +${rerollCurseCost})`}
            </button>
            <button className="k-btn success" onClick={onConfirm} type="button">
              ⚔️ 결과 확정 (EXECUTE)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
