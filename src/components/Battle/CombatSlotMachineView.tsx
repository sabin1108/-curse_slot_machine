import React, { useEffect, useRef, useState } from 'react';
import { ReelId, ReelSymbol, SlotResult } from '../../types/game';
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
  currentResult?: SlotResult | null;
  onSpin: () => void;
  onToggleLock: (reelId: ReelId) => void;
  onReroll: () => void;
  onConfirm: () => void;
  isFreeRerollAvailable?: boolean;
  multiplierMax?: number;
}

export const CombatSlotMachineView: React.FC<CombatSlotMachineViewProps> = ({
  reels,
  reelIndexes,
  lockedReels,
  isSpinning,
  hasSpunThisTurn,
  currentResult,
  onSpin,
  onToggleLock,
  onReroll,
  onConfirm,
  isFreeRerollAvailable = false,
  multiplierMax = 3,
}) => {
  const [leverPulled, setLeverPulled] = useState(false);
  const [reelSpinStates, setReelSpinStates] = useState({ action: false, target: false, modifier: false });
  const [displayRolls, setDisplayRolls] = useState({
    attack: currentResult?.attackRoll ?? 1,
    defense: currentResult?.defenseRoll ?? 1,
    attackMultiplier: currentResult?.attackMultiplierValue ?? currentResult?.multiplierValue ?? 2,
    defenseMultiplier: currentResult?.defenseMultiplierValue ?? currentResult?.multiplierValue ?? 2,
  });

  const intervalRef = useRef<number | null>(null);
  const tickCounterRef = useRef(0);

  useEffect(() => {
    if (reelSpinStates.action || reelSpinStates.target || reelSpinStates.modifier) return;

    setDisplayRolls((prev) => ({
      attack: currentResult?.attackRoll ?? prev.attack,
      defense: currentResult?.defenseRoll ?? prev.defense,
      attackMultiplier: currentResult?.attackMultiplierValue ?? currentResult?.multiplierValue ?? prev.attackMultiplier,
      defenseMultiplier: currentResult?.defenseMultiplierValue ?? currentResult?.multiplierValue ?? prev.defenseMultiplier,
    }));
  }, [currentResult, reelIndexes, reelSpinStates]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      soundManager.stopSlotSpinSound();
    };
  }, []);

  const handlePullLever = () => {
    if (isSpinning || reelSpinStates.action || reelSpinStates.target || reelSpinStates.modifier) return;

    setLeverPulled(true);
    tickCounterRef.current = 0;
    soundManager.playLeverPull();
    window.setTimeout(() => setLeverPulled(false), 300);

    const spinAttack = !lockedReels.has('action');
    const spinDefense = !lockedReels.has('target');
    const spinMultiplier = !lockedReels.has('modifier');

    setReelSpinStates({ action: spinAttack, target: spinDefense, modifier: spinMultiplier });

    if (!hasSpunThisTurn) onSpin();
    else onReroll();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setDisplayRolls((prev) => ({
        attack: spinAttack ? Math.floor(Math.random() * 5) + 1 : prev.attack,
        defense: spinDefense ? Math.floor(Math.random() * 5) + 1 : prev.defense,
        attackMultiplier: spinMultiplier ? Math.floor(Math.random() * Math.max(1, multiplierMax - 1)) + 2 : prev.attackMultiplier,
        defenseMultiplier: spinMultiplier ? Math.floor(Math.random() * Math.max(1, multiplierMax - 1)) + 2 : prev.defenseMultiplier,
      }));
      tickCounterRef.current += 1;
      if (tickCounterRef.current % 4 === 0) soundManager.playReelSpinTick();
    }, 45);

    window.setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, action: false }));
      setDisplayRolls((prev) => ({ ...prev, attack: currentResult?.attackRoll ?? prev.attack }));
      if (spinAttack) soundManager.playReelLock();
    }, 700);

    window.setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, target: false }));
      setDisplayRolls((prev) => ({ ...prev, defense: currentResult?.defenseRoll ?? prev.defense }));
      if (spinDefense) soundManager.playReelLock();
    }, 1400);

    window.setTimeout(() => {
      setReelSpinStates((prev) => ({ ...prev, modifier: false }));
      setDisplayRolls((prev) => ({
        ...prev,
        attackMultiplier: currentResult?.attackMultiplierValue ?? currentResult?.multiplierValue ?? prev.attackMultiplier,
        defenseMultiplier: currentResult?.defenseMultiplierValue ?? currentResult?.multiplierValue ?? prev.defenseMultiplier,
      }));
      if (spinMultiplier) soundManager.playReelLock();
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

  const rerollCurseCost = isFreeRerollAvailable ? 0 : lockedReels.size + 1;

  const renderReelWindow = (
    value: string | number,
    isSpinningReel: boolean,
    reelId: ReelId,
    label: string,
    resultLabel: string,
  ) => {
    const isLocked = lockedReels.has(reelId);
    return (
      <div className={`reel-col-wrap ${isLocked ? 'is-locked' : ''}`}>
        <div className="reel-col-header">{label}</div>
        <button
          className={`reel-window ${isSpinningReel ? 'spinning' : ''}`}
          onClick={() => hasSpunThisTurn && handleLockToggle(reelId)}
          type="button"
        >
          <span className="symbol-cell roll-symbol-cell">
            <span className="roll-result-number">{value}</span>
            <span className="symbol-name">{resultLabel}</span>
          </span>
          {hasSpunThisTurn && <span className={`lock-badge ${isLocked ? 'active' : ''}`}>{isLocked ? '잠금' : '고정'}</span>}
        </button>
      </div>
    );
  };

  const renderRouletteLane = (label: string, numberReelId: ReelId, rollValue: number, multiplierValue: number) => (
    <div className="dual-roulette-lane">
      <div className="dual-roulette-label">{label}</div>
      {renderReelWindow(rollValue, reelSpinStates[numberReelId], numberReelId, '1-5', '숫자')}
      {renderReelWindow(`x${multiplierValue}`, reelSpinStates.modifier, 'modifier', `x2-x${multiplierMax}`, '배수')}
    </div>
  );

  return (
    <div className="cabinet-wrap">
      <div className="cabinet-row">
        <div className="cabinet">
          <div className="cabinet-topper">공격 / 방어 룰렛</div>
          <div className="dual-roulette-stack">
            {renderRouletteLane('공격', 'action', displayRolls.attack, displayRolls.attackMultiplier)}
            {renderRouletteLane('방어', 'target', displayRolls.defense, displayRolls.defenseMultiplier)}
          </div>
        </div>

        <div className={`lever-wrap ${leverPulled ? 'pulled' : ''}`} onClick={handlePullLever}>
          <div className="lever-stick" />
          <img src={getAsset('dg_lever_left')} style={{ width: '28px', height: '28px' }} alt="lever base" />
          <div className="lever-label">회전</div>
        </div>
      </div>

      <div className="slot-action-area">
        {!hasSpunThisTurn ? (
          <button className="k-btn big primary glow-pulse" onClick={handlePullLever} type="button">
            룰렛 돌리기
          </button>
        ) : (
          <div className="reroll-bar">
            <button className="k-btn warning" onClick={handlePullLever} type="button">
              {isFreeRerollAvailable ? '무료 재회전' : `재회전 (저주 +${rerollCurseCost})`}
            </button>
            <button className="k-btn success" onClick={onConfirm} type="button">
              결과 확정
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
