import { useState, useMemo } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameCommand } from '../types/game';

import { TitleScreen } from '../components/Title/TitleScreen';
import { BattleScreen } from '../components/Battle/BattleScreen';
import { RewardModal } from '../components/Reward/RewardModal';
import { DungeonMapScreen } from '../components/Navigation/DungeonMapScreen';
import { ShopScreen } from '../components/Navigation/ShopScreen';
import { RestScreen } from '../components/Navigation/RestScreen';
import { GameOverVictoryModal } from '../components/Navigation/GameOverVictoryModal';

import '../styles.css';

export function App() {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());

  const handleDispatch = (command: GameCommand) => {
    const updatedState = engine.dispatch(command);
    // Clone state object to force React state trigger
    setGameState({ ...updatedState, lockedReels: new Set(updatedState.lockedReels) });
  };

  return (
    <main className="app-shell">
      {/* Top Navigation Bar */}
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
        </div>
      </nav>

      {/* Main View Area */}
      <div className="view-stage">
        {gameState.screen === 'TITLE' && <TitleScreen onDispatch={handleDispatch} />}

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
            combatLogs={gameState.combatLogs}
            onDispatch={handleDispatch}
          />
        )}
      </div>
    </main>
  );
}

export default App;
