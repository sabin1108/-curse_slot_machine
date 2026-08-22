import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { BattleScreen } from '../components/Battle/BattleScreen'
import { CurseLogModal } from '../components/Navigation/CurseLogModal'
import { DungeonMapScreen } from '../components/Navigation/DungeonMapScreen'
import { GameOverVictoryModal } from '../components/Navigation/GameOverVictoryModal'
import { OriginSelectionScreen } from '../components/Navigation/OriginSelectionScreen'
import { PrologueScreen } from '../components/Navigation/PrologueScreen'
import { RestScreen } from '../components/Navigation/RestScreen'
import { ScreenTransitionOverlay } from '../components/Navigation/ScreenTransitionOverlay'
import { ShopScreen } from '../components/Navigation/ShopScreen'
import { RewardModal } from '../components/Reward/RewardModal'
import { ShowcaseOverlay } from '../components/Showcase/ShowcaseOverlay'
import { TitleScreen } from '../components/Title/TitleScreen'
import { GameEngine } from '../game/engine/GameEngine'
import { MVP_DEMO_REWARD_SETUP_COMMANDS, MVP_DEMO_SEED } from '../game/demo/MvpDemoTrace'
import type { GameCommand as CoreGameCommand } from '../game/engine/commands'
import type { GameEvent } from '../game/engine/events'
import { projectUiGameState, type UiFeedback } from '../game/engine/UiProjection'
import type { GameCommand, GameScreen, ShowcaseStep } from '../types/game'
import { soundManager } from '../utils/soundManager'
import '../styles.css'

const DEFAULT_SEED = MVP_DEMO_SEED
const SHOWCASE_STEPS: ShowcaseStep[] = [
  { stepIndex: 1, title: '전투 문장', instruction: '[행동 · 대상 · 배율] 세 릴을 확인합니다.', actionScript: 'spin', highlightMessage: '표시가 아니라 코어가 결과를 결정합니다.' },
  { stepIndex: 2, title: '잠금과 리롤', instruction: '원하는 릴을 잠그고 나머지만 다시 돌립니다.', actionScript: 'reroll', highlightMessage: '리롤 저주도 코어 상태에 기록됩니다.' },
  { stepIndex: 3, title: '빌드 보상', instruction: '전투 보상으로 증강과 시너지를 완성합니다.', actionScript: 'reward', highlightMessage: '선택 가능한 보상만 엔진이 승인합니다.' },
  { stepIndex: 4, title: '15 스테이지', instruction: '고정 경로 끝에서 House Sovereign을 쓰러뜨립니다.', actionScript: 'boss', highlightMessage: 'Showcase는 normal run 계산을 우회하지 않습니다.' },
]
const SHOWCASE_REWARD_STEP_INDEX = getShowcaseRewardStepIndex()

type IntroScreen = Extract<GameScreen, 'TITLE' | 'PROLOGUE' | 'ORIGIN'> | null

function createFeedback(): UiFeedback {
  return {
    combatLogs: [], lastDamagePop: null, enemyDamagePops: [], isEnemyAttacking: false,
    showcase: { active: false, currentStep: 0, steps: SHOWCASE_STEPS },
  }
}

function getShowcaseRewardStepIndex(): number {
  const rewardStepIndex = SHOWCASE_STEPS.findIndex((step) => step.actionScript === 'reward')
  if (rewardStepIndex < 0) throw new Error('Showcase steps must include a reward action step')
  return rewardStepIndex
}

export function App() {
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const engineRef = useRef(new GameEngine(DEFAULT_SEED))
  const [coreState, setCoreState] = useState(() => engineRef.current.getState())
  const [feedback, setFeedback] = useState<UiFeedback>(createFeedback)
  const [introScreen, setIntroScreen] = useState<IntroScreen>('TITLE')
  const [isCurseLogOpen, setIsCurseLogOpen] = useState(false)
  const [musicVolume, setMusicVolume] = useState(() => soundManager.getMusicVolume())
  const [audioEnabled, setAudioEnabled] = useState(() => soundManager.isEnabled())
  const feedbackId = useRef(0)

  const projected = useMemo(() => projectUiGameState(coreState, feedback), [coreState, feedback])
  const gameState = useMemo(() => ({ ...projected, screen: introScreen ?? projected.screen }), [projected, introScreen])

  const syncMusicForState = (screen: GameScreen, wave: number) => {
    if (screen === 'TITLE' || screen === 'PROLOGUE' || screen === 'ORIGIN' || screen === 'GAMEOVER' || screen === 'VICTORY') {
      soundManager.stopMusic()
    } else if (screen === 'BATTLE' && wave === 15) {
      soundManager.startBossMusic()
    } else {
      soundManager.startBackgroundMusic()
    }
  }

  useEffect(() => {
    syncMusicForState(gameState.screen, gameState.wave)
  }, [gameState.screen, gameState.wave])

  const dispatchCore = (command: CoreGameCommand) => {
    const events = engineRef.current.dispatch(command)
    setCoreState(engineRef.current.getState())
    setFeedback((previous) => reduceFeedback(previous, events, feedbackId))
  }

  const enterShowcaseRewardStep = (stepIndex: number) => {
    const nextEngine = new GameEngine(DEFAULT_SEED)
    const events: GameEvent[] = []
    for (const command of MVP_DEMO_REWARD_SETUP_COMMANDS) {
      events.push(...nextEngine.dispatch(command))
    }
    engineRef.current = nextEngine
    setIntroScreen(null)
    setCoreState(nextEngine.getState())
    setFeedback((previous) => reduceFeedback({
      ...previous,
      showcase: {
        ...previous.showcase,
        active: true,
        currentStep: stepIndex,
      },
    }, events, feedbackId))
  }

  const handleDispatch = (command: GameCommand) => {
    soundManager.unlockAudio()
    if (command.type === 'START_RUN') {
      setIntroScreen('PROLOGUE')
      setFeedback(createFeedback())
      return
    }
    if (command.type === 'NAVIGATE') {
      if (command.screen === 'TITLE') {
        setIntroScreen('TITLE')
        setFeedback(createFeedback())
      } else if (command.screen === 'ORIGIN') {
        setIntroScreen('ORIGIN')
      }
      return
    }
    if (command.type === 'START_SHOWCASE') {
      const nextEngine = new GameEngine(DEFAULT_SEED)
      engineRef.current = nextEngine
      setIntroScreen('TITLE')
      setCoreState(nextEngine.getState())
      setFeedback((previous) => ({ ...previous, showcase: { ...previous.showcase, active: true, currentStep: 0 } }))
      return
    }
    if (command.type === 'NEXT_SHOWCASE_STEP') {
      const nextStep = Math.min(gameState.showcase.currentStep + 1, gameState.showcase.steps.length - 1)
      if (nextStep === SHOWCASE_REWARD_STEP_INDEX && gameState.screen !== 'REWARD') {
        enterShowcaseRewardStep(nextStep)
        return
      }
      setFeedback((previous) => ({ ...previous, showcase: { ...previous.showcase, currentStep: nextStep } }))
      return
    }
    if (command.type === 'SELECT_ORIGIN') {
      const nextEngine = new GameEngine(seed.trim() || DEFAULT_SEED)
      engineRef.current = nextEngine
      const selected = nextEngine.dispatch({ type: 'SELECT_ORIGIN', originId: command.originId })
      const started = nextEngine.dispatch({ type: 'START_RUN' })
      setCoreState(nextEngine.getState())
      setFeedback((previous) => reduceFeedback(previous, [...selected, ...started], feedbackId))
      setIntroScreen(null)
      return
    }
    dispatchCore(command as CoreGameCommand)
  }

  const handleMusicVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMusicVolume(soundManager.setMusicVolume(Number(event.target.value)))
  }

  return (
    <main className="app-shell">
      <nav className="global-nav-bar">
        <div className="nav-brand"><span className="brand-tag">Deterministic MVP</span><span className="brand-title">저주받은 슬롯머신</span></div>
        <div className="nav-screen-tabs"><button className="tab-btn" onClick={() => handleDispatch({ type: 'NAVIGATE', screen: 'TITLE' })} type="button">타이틀</button></div>
        <div className="music-control" aria-label="music volume control">
          <button className="music-toggle-btn" onClick={() => { soundManager.unlockAudio(); const enabled = soundManager.toggleSound(); setAudioEnabled(enabled); syncMusicForState(gameState.screen, gameState.wave) }} type="button">{audioEnabled ? 'Audio' : 'Muted'}</button>
          <input aria-label="Music volume" className="music-volume-slider" max="1" min="0" onChange={handleMusicVolumeChange} step="0.05" type="range" value={musicVolume} />
        </div>
      </nav>

      {gameState.showcase.active && gameState.screen !== 'REWARD' && <ShowcaseOverlay currentStepIndex={gameState.showcase.currentStep} steps={gameState.showcase.steps} onDispatch={handleDispatch} />}
      <ScreenTransitionOverlay screen={gameState.screen}><div className="view-stage">
        {gameState.screen === 'TITLE' && <TitleScreen seed={seed} onSeedChange={setSeed} onDispatch={handleDispatch} onOpenCurseLog={() => setIsCurseLogOpen(true)} />}
        {gameState.screen === 'PROLOGUE' && <PrologueScreen onDispatch={handleDispatch} />}
        {gameState.screen === 'ORIGIN' && <OriginSelectionScreen onDispatch={handleDispatch} />}
        {gameState.screen === 'BATTLE' && <BattleScreen state={gameState} onDispatch={handleDispatch} />}
        {gameState.screen === 'MAP' && <DungeonMapScreen completedStageIds={coreState.run.completedStageIds} currentStage={coreState.run.currentStage} onDispatch={handleDispatch} />}
        {gameState.screen === 'SHOP' && <ShopScreen gold={coreState.economy.gold} purchases={coreState.economy.shopPurchases} offers={coreState.shop.offers} onDispatch={handleDispatch} />}
        {gameState.screen === 'REST' && <RestScreen player={gameState.player} curseCurrent={gameState.curse.current} onDispatch={handleDispatch} />}
        {gameState.screen === 'REWARD' && <RewardModal candidates={gameState.rewardCandidates} augSlotPresentation={gameState.augSlotPresentation} onDispatch={handleDispatch} />}
        {(gameState.screen === 'GAMEOVER' || gameState.screen === 'VICTORY') && <GameOverVictoryModal screen={gameState.screen} wave={gameState.wave} combatLogs={gameState.combatLogs} onDispatch={handleDispatch} />}
        {isCurseLogOpen && <CurseLogModal unlockedLogs={gameState.curseLogsUnlocked} onClose={() => setIsCurseLogOpen(false)} />}
      </div></ScreenTransitionOverlay>
    </main>
  )
}

function reduceFeedback(previous: UiFeedback, events: GameEvent[], idRef: { current: number }): UiFeedback {
  const combatEvents = events.flatMap((event) => event.type === 'COMBAT_SLOT_RESOLVED' ? event.combatEvents : [])
  const supportLogs = combatEvents.flatMap((event) => {
    if (event.type === 'ENEMY_WAITED') return ['적이 숨을 고릅니다.']
    if (event.type === 'ENEMY_DEFENDED') return [`적이 방어 ${event.amount}을 얻습니다.`]
    return []
  })
  const enemyDamagePops: UiFeedback['enemyDamagePops'] = []
  let lastDamagePop: UiFeedback['lastDamagePop'] = null
  let isEnemyAttacking = false
  for (const event of combatEvents) {
    if (event.type === 'DAMAGE_APPLIED' && event.target === 'enemy' && event.amount > 0) {
      enemyDamagePops.push({ value: event.amount, id: ++idRef.current })
    } else if (event.type === 'ENEMY_ATTACKED') {
      isEnemyAttacking = true
      if (event.healthLost > 0) lastDamagePop = { value: event.healthLost, type: 'PLAYER_DMG', id: ++idRef.current }
    } else if (event.type === 'BLOCK_GAINED' && event.target === 'player') {
      lastDamagePop = { value: event.amount, type: 'SHIELD', id: ++idRef.current }
    } else if (event.type === 'HEAL_APPLIED' && event.target === 'player') {
      lastDamagePop = { value: event.effectiveAmount, type: 'HEAL', id: ++idRef.current }
    }
  }
  return {
    ...previous,
    combatLogs: [...previous.combatLogs, ...events.map(formatEvent), ...supportLogs].slice(-40),
    enemyDamagePops,
    lastDamagePop,
    isEnemyAttacking,
  }
}

function formatEvent(event: GameEvent): string {
  switch (event.type) {
    case 'RUN_STARTED': return `Run started · roll ${event.roll}`
    case 'STAGE_ENTERED': return `Stage ${event.stage.id} entered · ${event.stage.type}`
    case 'STAGE_COMPLETED': return `Stage ${event.stage.id} cleared`
    case 'COMBAT_SLOT_SPUN': return `Spin · ${event.result.action}/${event.result.target}/${event.result.modifier}`
    case 'COMBAT_SLOT_REROLLED': return `Reroll · ${event.result.action}/${event.result.target}/${event.result.modifier}`
    case 'COMBAT_SLOT_RESOLVED': return `Combat sentence resolved · ${event.outcome}`
    case 'REWARD_CHOSEN': return `Reward · ${event.reward.id}`
    case 'SHOP_ITEM_PURCHASED': return `Shop · ${event.reward.id} (${event.price}G)`
    case 'REST_RESOLVED': return `Rest · ${event.action} ${event.amount}`
    case 'EVENT_RESOLVED': return `Event · ${event.choice}`
    case 'COMMAND_REJECTED': return `Rejected · ${event.reason}`
    case 'CURSE_THRESHOLD_REACHED': return `Curse ${event.threshold} · enemy attack +${event.attackBonus}`
    case 'CURSE_DEFEAT': return 'Curse 10 · run defeated'
    case 'BOSS_PHASE_CHANGED': return `Boss phase ${event.phase} · attack ${event.attack}`
    case 'ORIGIN_SELECTED': return `Origin · ${event.originId}`
    case 'ORIGIN_TRAIT_TRIGGERED': return `Origin trait · ${event.originId} (${event.effect})`
    default: return event.type.replaceAll('_', ' ').toLowerCase()
  }
}

export default App
