import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameCommand, ReelId } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { CombatSlotMachineView } from './CombatSlotMachineView';
import { soundManager } from '../../utils/soundManager';

interface BattleScreenProps {
  state: GameState;
  onDispatch: (cmd: GameCommand) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ state, onDispatch }) => {
  const [selectedTarget, setSelectedTarget] = useState<'ENEMY' | 'SELF'>('ENEMY');
  const [hitBurstCount, setHitBurstCount] = useState(0);
  const lastHandledPopIdRef = useRef<number | null>(null);

  const hpPercent = Math.max(0, Math.min(100, Math.round((state.player.hp / state.player.maxHp) * 100)));
  const mobHpPercent = Math.max(0, Math.min(100, Math.round((state.enemy.hp / state.enemy.maxHp) * 100)));

  // Dynamic Theme Customization per Stage Wave
  const stageThemes: Record<number, { name: string; floorTile: string; wallTile: string; glowColor: string }> = {
    1: { name: '1층: 해골 지하 감옥', floorTile: getAsset('dg_floor_1'), wallTile: getAsset('dg_wall_top_mid'), glowColor: 'rgba(255, 170, 50, 0.25)' },
    2: { name: '2층: 암시장 회랑', floorTile: getAsset('dg_floor_2'), wallTile: getAsset('dg_wall_top_mid'), glowColor: 'rgba(255, 210, 90, 0.35)' },
    3: { name: '3층: 고블린 카타콤', floorTile: getAsset('dg_floor_1'), wallTile: getAsset('dg_column_wall'), glowColor: 'rgba(50, 220, 100, 0.25)' },
    4: { name: '4층: 오우거 요새 (ELITE)', floorTile: getAsset('dg_floor_2'), wallTile: getAsset('dg_wall_top_mid'), glowColor: 'rgba(255, 70, 30, 0.35)' },
    5: { name: '5층: 저주 연금술실 (ELITE)', floorTile: getAsset('dg_floor_1'), wallTile: getAsset('dg_column_wall'), glowColor: 'rgba(180, 70, 255, 0.35)' },
    6: { name: '6층: 성채 관문', floorTile: getAsset('dg_floor_2'), wallTile: getAsset('dg_wall_top_mid'), glowColor: 'rgba(70, 180, 255, 0.35)' },
    7: { name: '7층: 하우스 딜러 알현실 (BOSS)', floorTile: getAsset('dg_floor_1'), wallTile: getAsset('dg_column_wall'), glowColor: 'rgba(255, 215, 0, 0.45)' }
  };

  const theme = stageThemes[state.wave] || stageThemes[1];

  // Trigger Multi-hit sound & burst animation ONLY when a NEW turn damage pop is produced
  useEffect(() => {
    if (state.lastDamagePop && state.currentResult && state.lastDamagePop.id !== lastHandledPopIdRef.current) {
      lastHandledPopIdRef.current = state.lastDamagePop.id;

      const hits = Math.max(1, Math.min(5, Math.round(state.currentResult.modifier.baseValue)));
      setHitBurstCount(hits);

      if (state.currentResult.action.type === 'SHIELD') {
        soundManager.playDefense();
      } else if (state.currentResult.action.type === 'BULLET' || state.currentResult.action.type === 'DAGGER') {
        soundManager.playSlashAttack();
      } else if (state.currentResult.action.type === 'BOMB') {
        soundManager.playBombExplosion();
      } else {
        soundManager.playHeavyPunch();
      }

      // Play N sequential hit SFX ticks ONLY during real turn execution
      for (let i = 0; i < hits; i++) {
        setTimeout(() => {
          soundManager.playHitImpact();
        }, i * 120);
      }
    }
  }, [state.lastDamagePop, state.currentResult]);

  const handleSelectEnemyTarget = () => {
    soundManager.playClick();
    setSelectedTarget('ENEMY');
  };

  const handleSelectSelfTarget = () => {
    soundManager.playClick();
    setSelectedTarget('SELF');
  };

  return (
    <div
      id="frame-battle"
      className={`frame battle-screen ${state.lastDamagePop ? 'screen-shake' : ''}`}
      style={{
        ['--floor-tile' as string]: `url(${theme.floorTile})`,
        ['--wall-tile' as string]: `url(${theme.wallTile})`
      }}
    >
      <div className="dungeon-floor" />
      <div className="dungeon-wall-top" />
      <div className="wall-base-shadow" />
      <div className="warm-glow" style={{ background: `radial-gradient(ellipse at 50% 30%, ${theme.glowColor} 0%, rgba(0, 0, 0, 0) 75%)` }} />

      <div className="battle-screen-content">
        {/* Top HUD Bar */}
        <div className="hud-bar">
          <div className="hud-group" onClick={handleSelectSelfTarget} style={{ cursor: 'pointer' }}>
            <span className="hud-label">HP {selectedTarget === 'SELF' ? '🎯' : ''}</span>
            <div className="hp-bar-outer" style={{ position: 'relative' }}>
              <div className="hp-bar-ghost" style={{ width: `${hpPercent}%` }} />
              <div className="hp-bar-inner" style={{ width: `${hpPercent}%` }} />
              {state.player.shield > 0 && (
                <div
                  className="shield-bar-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(100, Math.round((state.player.shield / state.player.maxHp) * 100))}%`,
                    background: 'linear-gradient(90deg, rgba(50, 200, 255, 0.7), rgba(0, 150, 255, 0.9))',
                    borderRight: '2px solid #7fd8ff',
                    boxShadow: '0 0 10px #7fd8ff',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                  title={`수호 방벽: ${state.player.shield}`}
                />
              )}
              <div className="hp-text" style={{ zIndex: 3 }}>
                {state.player.hp} / {state.player.maxHp} {state.player.shield > 0 ? `(+${state.player.shield} 🛡️)` : ''}
              </div>
            </div>
          </div>

          <div className="hud-group stage-theme-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>🏰 Stage {state.floor || 1}-{state.wave} ({theme.name})</span>
            {state.narrativeMicrocopy && (
              <span className="hud-narrative-tag" style={{ fontSize: '11px', color: '#e2d3a8', fontStyle: 'italic', marginTop: '2px' }}>
                📜 {state.narrativeMicrocopy}
              </span>
            )}
          </div>

          <div className="wave-dots">
            {Array.from({ length: state.totalWaves }).map((_, idx) => (
              <span key={idx} className={idx < state.wave ? 'on' : ''} />
            ))}
          </div>

          <div className="hud-group curse-badge">
            <span>☠️ 저주 {state.curse.current}/{state.curse.max}</span>
          </div>

          <div className="hud-group gold-count">
            🪙 <span>{state.player.gold}</span>
          </div>
        </div>

        {/* 3-Column Main Battle Body */}
        <div className="battle-main-row">
          {/* Left Column: Side Panel */}
          <div className="side-panel">
            <div className="side-panel-title">
              <span>보유 증강</span>
              <span>{state.build.augments.length}/12</span>
            </div>

            <div className="aug-list">
              {state.build.augments.map((aug) => (
                <div key={aug.id} className="aug-row">
                  <img src={aug.imgUrl || getAsset('sword_gold')} alt={aug.name} />
                  <span className="aug-name" title={aug.name}>{aug.name}</span>
                  <span className="aug-val">{aug.effectValue}</span>
                </div>
              ))}
            </div>

            <div className="synergy-box">
              {state.build.activeSynergies.length > 0 ? (
                <>
                  <strong>시너지 활성:</strong>
                  <br />
                  {state.build.activeSynergies.join(', ')}
                </>
              ) : (
                <>
                  시너지 조율 중<br />
                  동일 태그 증강 수집 필요
                </>
              )}
            </div>
          </div>

          {/* Center Column: Monster Stage + Formula Banner + Slot Cabinet */}
          <div className="center-battle-stage">
            {/* High Threat Red Warning Banner above Monster */}
            <div className="mob-intent-threat-banner">
              <div className="threat-title-row">
                <span className="threat-warning-tag">⚠️ 몬스터 공격 예고</span>
                <span className="threat-intent-name">{state.enemy.intent.name}</span>
              </div>
              <div className="threat-damage-display">
                <span className="threat-icon">{state.enemy.intent.icon}</span>
                <span className="threat-damage-val">{state.enemy.intent.value}</span>
                <span className="threat-damage-unit">피해 예상!</span>
              </div>
            </div>

            {/* Interactive Monster Target Zone */}
            <div
              className={`mob-zone ${selectedTarget === 'ENEMY' ? 'target-selected' : ''} ${state.isEnemyAttacking ? 'mob-lunge-attack' : ''} ${state.enemy.hp <= 0 || state.isEnemyDefeated ? 'mob-defeat-collapse' : ''}`}
              onClick={handleSelectEnemyTarget}
              title="클릭하여 공격 타겟 지정"
            >
              <div className="target-indicator">
                {selectedTarget === 'ENEMY' ? '🎯 타겟 지정됨 (CLICK)' : '👆 클릭하여 대상 선택'}
              </div>

              <div className={`impact-burst ${state.lastDamagePop ? 'play' : ''}`} />
              <img className={`elem-icon-onmob ${state.lastDamagePop ? 'play' : ''}`} src={getAsset('fx_fire_strip_f0')} alt="element fx" />

              <img className="mob-sprite" src={state.enemy.spriteUrl || getAsset('ogre')} alt={state.enemy.name} />

              <div className="mob-hpbar-outer">
                <div className="mob-hpbar-inner" style={{ width: `${mobHpPercent}%` }} />
                <div className="mob-hp-text">
                  {state.enemy.hp} / {state.enemy.maxHp}
                </div>
              </div>
            </div>

            {/* Dedicated Formula Display Banner */}
            {state.currentResult && (
              <div className="sentence-display-banner">
                <span className="sentence-formula">
                  [ {state.currentResult.action.name} ] + [ {state.currentResult.target.name} ] × [ {state.currentResult.modifier.name} ]
                </span>
                <strong className={state.currentResult.isMiss ? 'miss' : 'effect'}>
                  ➡️ {state.currentResult.finalEffectText}
                </strong>
              </div>
            )}

            {/* Center Slot Machine Cabinet */}
            <CombatSlotMachineView
              reels={state.reels}
              reelIndexes={state.reelIndexes}
              lockedReels={state.lockedReels}
              isSpinning={state.isSpinning}
              hasSpunThisTurn={state.hasSpunThisTurn}
              onSpin={() => onDispatch({ type: 'SPIN_COMBAT_SLOT' })}
              onToggleLock={(reelId: ReelId) => onDispatch({ type: 'TOGGLE_LOCK_REEL', reelId })}
              onReroll={() => onDispatch({ type: 'REROLL_UNLOCKED' })}
              onConfirm={() => onDispatch({ type: 'CONFIRM_SLOT_RESULT' })}
            />
          </div>
        </div>
      </div>

      {/* Floating Damage Popup Text */}
      {state.lastDamagePop && (
        <div className="dmg-pop show">
          {state.lastDamagePop.type === 'ENEMY_DMG' ? `-${state.lastDamagePop.value}` : `+${state.lastDamagePop.value}`}
        </div>
      )}

      <div className="vignette" />
    </div>
  );
};
