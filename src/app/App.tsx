import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { GameEngine } from '../game/engine/UiGameEngine';
import { GameCommand, GameState } from '../types/game';

import { TitleScreen } from '../components/Title/TitleScreen';
import { PrologueScreen } from '../components/Navigation/PrologueScreen';
import { OriginSelectionScreen } from '../components/Navigation/OriginSelectionScreen';
import { CurseLogModal } from '../components/Navigation/CurseLogModal';
import { ScreenTransitionOverlay } from '../components/Navigation/ScreenTransitionOverlay';
import { BattleScreen } from '../components/Battle/BattleScreen';
import { RewardModal } from '../components/Reward/RewardModal';
import { DungeonMapScreen } from '../components/Navigation/DungeonMapScreen';
import { ShopScreen } from '../components/Navigation/ShopScreen';
import { RestScreen } from '../components/Navigation/RestScreen';
import { GameOverVictoryModal } from '../components/Navigation/GameOverVictoryModal';
import { ShowcaseOverlay } from '../components/Showcase/ShowcaseOverlay';
import { soundManager } from '../utils/soundManager';

import '../styles.css';

export function App() {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());
  const [isCurseLogOpen, setIsCurseLogOpen] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => soundManager.getMusicVolume());
  const [sfxVolume, setSfxVolume] = useState(() => soundManager.getSfxVolume());
  const [audioEnabled, setAudioEnabled] = useState(() => soundManager.isEnabled());

  const syncMusicForState = (state: ReturnType<GameEngine['getState']>) => {
    if (state.screen === 'TITLE') {
      soundManager.startTitleMusic();
      return;
    }

    const shouldPlayMusic = !['PROLOGUE', 'ORIGIN', 'GAMEOVER', 'VICTORY'].includes(state.screen);
    if (!shouldPlayMusic) {
      soundManager.stopMusic();
      return;
    }

    const isBossBattle =
      state.screen === 'BATTLE'
      && (state.wave >= 15 || state.enemy.id === 'house_dealer_boss' || state.enemy.name.includes('보스') || state.enemy.name.includes('BOSS'));

    if (isBossBattle) {
      soundManager.startBossMusic();
      return;
    }

    soundManager.startBackgroundMusic();
  };

  const handleDispatch = (command: GameCommand) => {
    soundManager.unlockAudio();
    const previousState = engine.getState();
    const updatedState = engine.dispatch(command);
    syncMusicForState(updatedState);
    if (
      command.type === 'CONFIRM_SLOT_RESULT'
      && updatedState.isEnemyDefeated
      && (updatedState.screen === 'REWARD' || updatedState.screen === 'VICTORY')
    ) {
      const defeatState: GameState = {
        ...updatedState,
        screen: 'BATTLE',
        enemy: {
          ...previousState.enemy,
          hp: 0,
        },
        currentResult: null,
        hasSpunThisTurn: false,
        isEnemyDefeated: true,
        isEnemyAttacking: false,
        lockedReels: new Set(updatedState.lockedReels),
      };
      setGameState(defeatState);
      window.setTimeout(() => {
        syncMusicForState(updatedState);
        setGameState({ ...updatedState, lockedReels: new Set(updatedState.lockedReels) });
      }, 900);
      return;
    }
    setGameState({ ...updatedState, lockedReels: new Set(updatedState.lockedReels) });
  };

  useEffect(() => {
    syncMusicForState(gameState);
  }, [gameState.screen, gameState.wave, gameState.enemy.id]);

  const handleMusicVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = soundManager.setMusicVolume(Number(event.target.value));
    setMusicVolume(nextVolume);
  };

  const handleSfxVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = soundManager.setSfxVolume(Number(event.target.value));
    setSfxVolume(nextVolume);
  };

  return (
    <main className="app-shell">
      <nav className="global-nav-bar">
        <div className="nav-brand">
          <span className="brand-tag">OpenAI Hackathon</span>
          <span className="brand-title">저주받은 슬롯머신</span>
        </div>
        <div className="nav-screen-tabs">
          <button
            className={`tab-btn ${gameState.screen === 'TITLE' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'TITLE' })}
            type="button"
          >
            타이틀
          </button>
          <button
            className={`tab-btn ${gameState.screen === 'PROLOGUE' || gameState.screen === 'ORIGIN' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'OPEN_PROLOGUE' })}
            type="button"
          >
            프롤로그/기원
          </button>
          <button
            className={`tab-btn ${gameState.screen === 'BATTLE' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'BATTLE' })}
            type="button"
          >
            전투
          </button>
          <button
            className={`tab-btn ${gameState.screen === 'MAP' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'MAP' })}
            type="button"
          >
            경로 맵
          </button>
          <button
            className={`tab-btn ${gameState.screen === 'SHOP' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'SHOP' })}
            type="button"
          >
            암시장
          </button>
          <button
            className={`tab-btn ${gameState.screen === 'REST' ? 'active' : ''}`}
            onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'REST' })}
            type="button"
          >
            휴식처
          </button>
          <button
            className="tab-btn boss-preview-tab"
            onClick={() => handleDispatch({ type: 'SELECT_MAP_NODE', nodeId: 1502, nodeType: 'BOSS' })}
            type="button"
          >
            보스 보기
          </button>
        </div>
        <div className="music-control" aria-label="music volume control">
          <button
            className="music-toggle-btn"
            onClick={() => {
              soundManager.unlockAudio();
              const nextEnabled = soundManager.toggleSound();
              setAudioEnabled(nextEnabled);
              syncMusicForState(gameState);
            }}
            title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
            type="button"
          >
            {audioEnabled ? 'Audio' : 'Muted'}
          </button>
          <label className="audio-slider-label">
            BGM
            <input
              aria-label="Music volume"
              className="music-volume-slider"
              max="1"
              min="0"
              onChange={handleMusicVolumeChange}
              step="0.05"
              type="range"
              value={musicVolume}
            />
          </label>
          <label className="audio-slider-label">
            SFX
            <input
              aria-label="Sound effects volume"
              className="music-volume-slider sfx-volume-slider"
              max="1"
              min="0"
              onChange={handleSfxVolumeChange}
              step="0.05"
              type="range"
              value={sfxVolume}
            />
          </label>
        </div>
      </nav>

      {gameState.showcase.active && gameState.screen !== 'REWARD' && (
        <ShowcaseOverlay
          currentStepIndex={gameState.showcase.currentStep}
          steps={gameState.showcase.steps}
          onDispatch={handleDispatch}
        />
      )}

      <ScreenTransitionOverlay screen={gameState.screen}>
        <div className="view-stage">
          {gameState.screen === 'TITLE' && (
            <TitleScreen
              onDispatch={handleDispatch}
              onOpenCurseLog={() => setIsCurseLogOpen(true)}
            />
          )}

          {gameState.screen === 'PROLOGUE' && <PrologueScreen onDispatch={handleDispatch} />}

          {gameState.screen === 'ORIGIN' && <OriginSelectionScreen onDispatch={handleDispatch} />}

          {gameState.screen === 'BATTLE' && <BattleScreen state={gameState} onDispatch={handleDispatch} />}

          {gameState.screen === 'MAP' && (
            <DungeonMapScreen
              currentWave={gameState.wave}
              totalWaves={gameState.totalWaves}
              visitedNodePath={gameState.visitedNodePath}
              onDispatch={handleDispatch}
            />
          )}

          {gameState.screen === 'SHOP' && <ShopScreen player={gameState.player} onDispatch={handleDispatch} />}

          {gameState.screen === 'REST' && (
            <RestScreen
              player={gameState.player}
              curseCurrent={gameState.curse.current}
              onDispatch={handleDispatch}
            />
          )}

          {gameState.screen === 'REWARD' && (
            <RewardModal
              candidates={gameState.rewardCandidates}
              augSlotPresentation={gameState.augSlotPresentation}
              onDispatch={handleDispatch}
            />
          )}

          {(gameState.screen === 'GAMEOVER' || gameState.screen === 'VICTORY') && (
            <GameOverVictoryModal
              screen={gameState.screen}
              wave={gameState.wave}
              totalWaves={gameState.totalWaves}
              combatLogs={gameState.combatLogs}
              onDispatch={handleDispatch}
            />
          )}

          {isCurseLogOpen && (
            <CurseLogModal
              unlockedLogs={gameState.curseLogsUnlocked}
              onClose={() => setIsCurseLogOpen(false)}
            />
          )}
        </div>
      </ScreenTransitionOverlay>
    </main>
  );
}

export default App;
