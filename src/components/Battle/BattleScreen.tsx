import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameCommand, ReelId } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { CombatSlotMachineView } from './CombatSlotMachineView';
import { soundManager } from '../../utils/soundManager';

interface BattleScreenProps {
  state: GameState;
  onDispatch: (cmd: GameCommand) => void;
}

const TAG_LABELS: Record<string, string> = {
  COMBO: '연계',
  MULTI_HIT: '다단타',
  CRITICAL: '치명',
  BURN: '화상',
  DEFENSE: '방어',
  CURSE: '저주',
  RISK: '위험',
  RESOURCE: '자원',
  LIMIT: '한계',
};

function getTagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}

function getEnemyDamageTone(value: number): 'low' | 'mid' | 'high' {
  if (value <= 10) return 'low';
  if (value <= 30) return 'mid';
  return 'high';
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ state, onDispatch }) => {
  const [hitBurstCount, setHitBurstCount] = useState(0);
  const [showBossEntrance, setShowBossEntrance] = useState(false);
  const lastHandledPopIdRef = useRef<number | null>(null);
  const lastHandledEnemyPopBatchRef = useRef<string>('');

  const hpPercent = Math.max(0, Math.min(100, Math.round((state.player.hp / state.player.maxHp) * 100)));
  const mobHpPercent = Math.max(0, Math.min(100, Math.round((state.enemy.hp / state.enemy.maxHp) * 100)));
  const mobShieldPercent = Math.max(0, Math.min(100, Math.round((state.enemy.shield / state.enemy.maxHp) * 100)));
  const ownedRewardCards = [...state.build.augments, ...state.build.items];
  const buildRewardIds = new Set(ownedRewardCards.map((reward) => reward.id));
  const currentMultiplierMax = Math.max(
    state.build.activeSynergies.includes('한계 돌파') || (buildRewardIds.has('limit_core') && buildRewardIds.has('limit_breaker')) ? 10 : 3,
    buildRewardIds.has('limit_breaker') ? 5 : 3,
    state.currentResult?.attackMultiplierValue ?? 0,
    state.currentResult?.defenseMultiplierValue ?? 0,
  );

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
  const isBoss = state.wave >= 15 || state.enemy.id === 'house_dealer_boss';
  const bossSprite = state.isEnemyAttacking
    ? getAsset('boss_act')
    : showBossEntrance
      ? getAsset('boss_appeared')
      : getAsset('boss_common');
  const enemySprite = isBoss ? bossSprite : state.enemy.spriteUrl || getAsset('ogre');
  useEffect(() => {
    if (!isBoss) {
      setShowBossEntrance(false);
      return;
    }

    setShowBossEntrance(true);
    const timer = window.setTimeout(() => setShowBossEntrance(false), 1400);
    return () => window.clearTimeout(timer);
  }, [isBoss, state.enemy.id]);

  // Trigger impact sound immediately when a new resolved combat pop is produced.
  useEffect(() => {
    if (state.lastDamagePop && state.lastDamagePop.id !== lastHandledPopIdRef.current) {
      lastHandledPopIdRef.current = state.lastDamagePop.id;

      if (state.lastDamagePop.type === 'PLAYER_DMG') {
        soundManager.playHeavyPunch();
      } else if (state.lastDamagePop.type === 'SHIELD') {
        soundManager.playDefense();
      } else if (state.lastDamagePop.type === 'HEAL') {
        soundManager.playHitImpact();
      }
    }
  }, [state.lastDamagePop, state.currentResult]);

  useEffect(() => {
    if (state.enemyDamagePops.length === 0) {
      return;
    }

    const batchId = state.enemyDamagePops.map((pop) => pop.id).join(':');
    if (batchId === lastHandledEnemyPopBatchRef.current) {
      return;
    }

    lastHandledEnemyPopBatchRef.current = batchId;
    const hits = Math.max(1, Math.min(8, state.enemyDamagePops.length));
    setHitBurstCount(hits);
    soundManager.playSlashAttack();

    for (let i = 0; i < hits; i++) {
      setTimeout(() => {
        soundManager.playHitImpact();
      }, i * 120);
    }
  }, [state.enemyDamagePops]);

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
          <div className="hud-group">
            <span className="hud-label">HP</span>
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
            <span>☠️ 저주 {state.curse.current}</span>
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
              <span>보유 증강/아이템</span>
              <span>{ownedRewardCards.length}/12</span>
            </div>

            <div className="reward-card-list">
              {ownedRewardCards.map((aug) => (
                <div key={`${aug.kind}-${aug.id}`} className={`reward-card-row reward-card-row-${aug.kind}`}>
                  <img src={aug.imgUrl || getAsset('sword_gold')} alt={aug.name} />
                  <span className="reward-card-name" title={`${aug.name} · ${aug.tags.map(getTagLabel).join(' / ')}`}>
                    {aug.name}
                    <small>{aug.tags.map(getTagLabel).join(' / ')}</small>
                  </span>
                  <span className="reward-card-kind">{aug.kind === 'item' ? 'ITEM' : 'AUG'}</span>
                  <span className="reward-card-value">{aug.effectValue}</span>
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
                  같은 태그의 증강/아이템 필요
                </>
              )}
            </div>

            <div className="synergy-progress-list">
              <div className="side-panel-title">
                <span>활성화 가능 시너지</span>
                <span>{state.build.synergyProgress.filter((synergy) => synergy.completed).length}/{state.build.synergyProgress.length}</span>
              </div>
              {state.build.synergyProgress.map((synergy) => {
                const percent = Math.max(0, Math.min(100, Math.round((synergy.current / synergy.required) * 100)));
                return (
                  <div key={synergy.synergyId} className={`synergy-progress-row ${synergy.completed ? 'active' : ''}`}>
                    <div className="synergy-progress-head">
                      <span>{synergy.name} <em>{getTagLabel(synergy.tag)}</em></span>
                      <strong>{synergy.current}/{synergy.required}</strong>
                    </div>
                    <div className="synergy-progress-track">
                      <div className="synergy-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="synergy-progress-desc">{synergy.effectDescription}</div>
                    {synergy.tierEffects && synergy.tierEffects.length > 0 && (
                      <div className="synergy-hover-card">
                        <strong>{synergy.name} 효과 미리보기</strong>
                        {synergy.tierEffects.map((tier) => (
                          <div
                            key={`${synergy.synergyId}-${tier.count}`}
                            className={synergy.current >= tier.count ? 'unlocked' : ''}
                          >
                            <span>{tier.count}개</span>
                            <p>{tier.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

            {/* Monster Zone */}
            <div
              className={`mob-zone ${state.isEnemyAttacking ? 'mob-lunge-attack' : ''} ${state.enemy.hp <= 0 || state.isEnemyDefeated ? 'mob-defeat-collapse' : ''}`}
            >
              <div className={`impact-burst ${state.enemyDamagePops.length > 0 ? 'play' : ''}`} />
              {state.enemyDamagePops.map((pop, index) => (
                <div
                  key={pop.id}
                  className={`mob-damage-pop ${getEnemyDamageTone(pop.value)}`}
                  style={{
                    '--pop-delay': `${index * 0.16}s`,
                    '--pop-x': `${(index % 3 - 1) * 18}px`,
                    '--pop-y': `${Math.min(index, 4) * -8}px`,
                    '--pop-scale': `${Math.max(0.82, 1 - index * 0.035)}`,
                  } as React.CSSProperties}
                >
                  {pop.value}
                </div>
              ))}

              <img
                className={`mob-sprite ${isBoss ? 'boss-sprite' : ''} ${isBoss && showBossEntrance ? 'boss-entrance-sprite' : ''} ${isBoss && state.isEnemyAttacking ? 'boss-attack-sprite' : ''}`}
                src={enemySprite}
                alt={state.enemy.name}
              />

              <div className="mob-hpbar-outer">
                <div className="mob-hpbar-inner" style={{ width: `${mobHpPercent}%` }} />
                {state.enemy.shield > 0 && (
                  <div className="mob-shieldbar-inner" style={{ width: `${mobShieldPercent}%` }} />
                )}
                <div className="mob-hp-text">
                  {state.enemy.hp} / {state.enemy.maxHp}
                  {state.enemy.shield > 0 ? `  보호막 ${state.enemy.shield}` : ''}
                </div>
              </div>
            </div>

            {/* Center Slot Machine Cabinet */}
            <CombatSlotMachineView
              reels={state.reels}
              reelIndexes={state.reelIndexes}
              lockedReels={state.lockedReels}
              isSpinning={state.isSpinning}
              hasSpunThisTurn={state.hasSpunThisTurn}
              currentResult={state.currentResult}
              onSpin={() => onDispatch({ type: 'SPIN_COMBAT_SLOT' })}
              onToggleLock={(reel: ReelId) => onDispatch({ type: 'TOGGLE_REEL_LOCK', reel })}
              onReroll={() => onDispatch({ type: 'REROLL_UNLOCKED' })}
              onConfirm={() => onDispatch({ type: 'CONFIRM_COMBAT_SLOT' })}
              isFreeRerollAvailable={state.originTraitState.freeRerollAvailable}
              multiplierMax={currentMultiplierMax}
            />

            <div className="roulette-player-hp">
              <div className="roulette-player-hp-head">
                <span>HP</span>
                <strong>
                  {state.player.hp} / {state.player.maxHp}
                  {state.player.shield > 0 ? `  보호막 ${state.player.shield}` : ''}
                </strong>
              </div>
              <div className="roulette-player-hp-track">
                <div className="roulette-player-hp-fill" style={{ width: `${hpPercent}%` }} />
                {state.player.shield > 0 && (
                  <div
                    className="roulette-player-shield-fill"
                    style={{ width: `${Math.min(100, Math.round((state.player.shield / state.player.maxHp) * 100))}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          <aside className="battle-log-panel" aria-label="전투 로그">
            <div className="battle-log-title">전투 로그</div>
            <div className="battle-log-list">
              {state.combatLogs.slice(-8).map((log, index) => (
                <div className="battle-log-row" key={`${log}-${index}`}>
                  <img
                    src={log.includes('방어막') ? getAsset('shield_blue') : log.includes('적에게') ? getAsset('sword_gold') : getAsset('skull_red')}
                    alt=""
                  />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Damage Popup Text */}
      {state.lastDamagePop && state.lastDamagePop.type !== 'ENEMY_DMG' && (
        <div className="dmg-pop show">
          {state.lastDamagePop.type === 'PLAYER_DMG' ? `-${state.lastDamagePop.value}` : `+${state.lastDamagePop.value}`}
        </div>
      )}

      <div className="vignette" />
    </div>
  );
};
