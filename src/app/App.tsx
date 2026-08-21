import { useState } from 'react'
import { MVP_BUILD_CATALOG } from '../game/build/MvpBuildCatalog'
import { MVP_DEMO_SEED } from '../game/demo/MvpDemoTrace'
import { GameEngine } from '../game/engine/GameEngine'
import type { GameEvent } from '../game/engine/events'
import type { GameState } from '../game/engine/GameState'
import { MVP_ROUTE } from '../game/run/RunSystem'
import '../styles.css'

const DEFAULT_SEED = MVP_DEMO_SEED
type Dispatch = (command: Parameters<GameEngine['dispatch']>[0]) => void

export function App() {
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [showcaseStep, setShowcaseStep] = useState<number | null>(null)

  const dispatch: Dispatch = (command) => {
    if (!engine) return
    const events = engine.dispatch(command)
    setState(engine.getState())
    setEventLog((previous) => [...events.map(formatEvent), ...previous].slice(0, 12))
  }

  const startRun = () => {
    const nextEngine = new GameEngine(seed.trim() || DEFAULT_SEED)
    const events = nextEngine.dispatch({ type: 'START_RUN' })
    setEngine(nextEngine)
    setState(nextEngine.getState())
    setEventLog(events.map(formatEvent))
    setShowcaseStep(null)
  }

  if (showcaseStep !== null) {
    return <Showcase step={showcaseStep} onStep={setShowcaseStep} onExit={() => setShowcaseStep(null)} />
  }

  if (!state) {
    return (
      <main className="mvp-shell mvp-title">
        <p className="mvp-kicker">DETERMINISTIC ROGUELIKE</p>
        <h1>CURSE SLOT MACHINE</h1>
        <p>세 릴로 전투 문장을 만들고, 저주를 감수해 15개 방을 돌파하세요.</p>
        <label className="seed-field">
          런 시드
          <input value={seed} onChange={(event) => setSeed(event.target.value)} aria-label="런 시드" />
        </label>
        <div className="mvp-actions">
          <button className="mvp-primary" onClick={startRun} type="button">START NORMAL RUN</button>
          <button onClick={() => setShowcaseStep(0)} type="button">SHOWCASE MODE</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mvp-shell">
      <header className="mvp-header">
        <div><span className="mvp-kicker">CURSE SLOT MACHINE</span><strong>시드 {String(state.seed)}</strong></div>
        <div className="mvp-stat"><span>HP {state.combat.player.health}/{state.combat.player.maxHealth}</span><span>저주 {state.combat.curse.value}/{state.combat.curse.max}</span><span>골드 {state.economy.gold}</span></div>
      </header>
      <div className="mvp-layout">
        <section className="mvp-stage" aria-live="polite"><PhaseView state={state} dispatch={dispatch} /></section>
        <aside className="mvp-sidebar">
          <RoutePanel state={state} />
          <BuildPanel state={state} />
          <section className="mvp-panel"><h2>최근 이벤트</h2>{eventLog.length ? eventLog.map((line, index) => <p key={`${line}-${index}`}>{line}</p>) : <p>아직 이벤트가 없습니다.</p>}</section>
        </aside>
      </div>
    </main>
  )
}

function PhaseView({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  switch (state.phase) {
    case 'map': {
      const next = MVP_ROUTE[state.run.completedStageIds.length]
      return <section className="mvp-room"><p className="mvp-kicker">ROUTE MAP</p><h1>{next ? `다음 방: ${next.id}. ${stageName(next.type)}` : '모든 방 완료'}</h1><p>고정된 15스테이지 경로입니다. 시드와 명령 순서가 결과를 결정합니다.</p><button className="mvp-primary" onClick={() => dispatch({ type: 'ENTER_NEXT_STAGE' })} type="button">{next ? `${next.id}번 방 진입` : '승리 확인'}</button></section>
    }
    case 'battle': return <Battle state={state} dispatch={dispatch} />
    case 'reward': return <Rewards state={state} dispatch={dispatch} />
    case 'shop': return <Shop state={state} dispatch={dispatch} />
    case 'rest': return <section className="mvp-room"><p className="mvp-kicker">REST</p><h1>저주받은 모닥불</h1><p>회복은 HP 15, 정화는 저주 5를 제거합니다.</p><div className="mvp-actions"><button className="mvp-primary" onClick={() => dispatch({ type: 'RESOLVE_REST', action: 'heal' })} type="button">HP 15 회복</button><button onClick={() => dispatch({ type: 'RESOLVE_REST', action: 'purify' })} type="button">저주 5 정화</button></div></section>
    case 'event': return <section className="mvp-room"><p className="mvp-kicker">EVENT</p><h1>금이 간 행운의 제단</h1><p>보상, 골드, 휴식 중 하나를 고르거나 지나칩니다.</p><div className="mvp-actions"><button onClick={() => dispatch({ type: 'RESOLVE_EVENT', choice: 'reward' })} type="button">보상 탐색</button><button onClick={() => dispatch({ type: 'RESOLVE_EVENT', choice: 'gold' })} type="button">골드 50</button><button onClick={() => dispatch({ type: 'RESOLVE_EVENT', choice: 'rest' })} type="button">HP 15 회복</button><button onClick={() => dispatch({ type: 'RESOLVE_EVENT', choice: 'skip' })} type="button">지나치기</button></div></section>
    case 'victory': return <EndScreen title="HOUSE DEFEATED" copy="15개 방을 모두 돌파했습니다. 동일 시드와 명령으로 결과를 재현할 수 있습니다." />
    case 'defeat': return <EndScreen title="THE HOUSE WINS" copy="빌드와 잠금 타이밍을 바꿔 다시 도전하세요." />
    default: return null
  }
}

function Battle({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const slot = state.slot.current
  return (
    <section className="mvp-room">
      <p className="mvp-kicker">STAGE {state.run.currentStage?.id} · {stageName(state.run.currentStage?.type)}</p>
      <div className="combatants"><div><h2>PLAYER</h2><strong>{state.combat.player.health} HP</strong><span>방어 {state.combat.player.block}</span></div><div><h2>{state.combat.enemy.name}{state.combat.enemy.phase ? ` · PHASE ${state.combat.enemy.phase}` : ''}</h2><strong>{state.combat.enemy.health} HP</strong><span>다음 공격 {state.combat.enemyIntent.amount}</span></div></div>
      {state.combat.curse.value >= 5 && <p className="mvp-warning" role="status">{state.combat.curse.value >= 8 ? '위험: 저주로 적 공격 +2 · 10에서 즉시 패배' : '주의: 저주로 적 공격 +1 · 8부터 +2'}</p>}
      <div className="slot-sentence">
        {(['action', 'target', 'modifier'] as const).map((reel) => <button key={reel} className={state.slot.locks[reel] ? 'locked' : ''} disabled={!slot} onClick={() => dispatch({ type: 'TOGGLE_REEL_LOCK', reel })} type="button"><small>{reel}</small><strong>{slot?.[reel] ?? '?'}</strong><span>{state.slot.locks[reel] ? '잠금됨' : '클릭해 잠금'}</span></button>)}
      </div>
      {state.slot.preview && <section className="mvp-preview" aria-label="결과 미리보기"><h2>결과 미리보기</h2><p>플레이어 HP {signed(state.slot.preview.playerHealthDelta)} · 방어 {signed(state.slot.preview.playerBlockDelta)}</p><p>적 HP {signed(state.slot.preview.enemyHealthDelta)} · 적 반격 {state.slot.preview.enemyAttack}</p><p>저주 {signed(state.slot.preview.curseDelta)} · 예상 {state.slot.preview.outcome}</p>{state.slot.preview.warnings.map((warning) => <strong key={warning}>{warning}</strong>)}</section>}
      <div className="mvp-actions">{!slot && <button className="mvp-primary" onClick={() => dispatch({ type: 'SPIN_COMBAT_SLOT' })} type="button">릴 돌리기</button>}{slot && <><button onClick={() => dispatch({ type: 'REROLL_UNLOCKED' })} type="button">미잠금 재굴림 (저주 +{Object.values(state.slot.locks).filter(Boolean).length + 1})</button><button className="mvp-primary" onClick={() => dispatch({ type: 'CONFIRM_COMBAT_SLOT' })} type="button">문장 실행</button></>}</div>
      <p>상태: 플레이어 {formatStatuses(state.combat.statuses.player)} · 적 {formatStatuses(state.combat.statuses.enemy)}</p>
    </section>
  )
}

function Rewards({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  return <section className="mvp-room"><p className="mvp-kicker">AUGMENT SLOT RESULT</p><h1>보상 선택</h1><p>{state.rewards.augmentSlot?.reels.map((reel) => reel.label).join(' · ')}</p><div className="reward-grid">{state.rewards.options.map((reward) => <button key={reward.id} onClick={() => dispatch({ type: 'CHOOSE_REWARD', reward: { kind: reward.kind, id: reward.id } })} type="button"><small>{reward.rarity} · {reward.kind}</small><strong>{reward.name}</strong><span>{reward.description}</span><em>{reward.tags.join(' + ')}</em></button>)}</div></section>
}

function Shop({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  return <section className="mvp-room"><p className="mvp-kicker">BLACK MARKET · {state.economy.shopPurchases}/4 PURCHASES</p><h1>저주 상점</h1><div className="reward-grid">{state.shop.offers.map((offer) => <button key={offer.reward.id} disabled={state.economy.gold < offer.price || state.economy.shopPurchases >= 4} onClick={() => dispatch({ type: 'BUY_SHOP_ITEM', rewardId: offer.reward.id })} type="button"><small>{offer.price} GOLD{offer.price < offer.basePrice ? ` · ${offer.basePrice}에서 할인` : ''}</small><strong>{offer.reward.name}</strong><span>{offer.reward.description}</span></button>)}</div><button className="mvp-primary" onClick={() => dispatch({ type: 'LEAVE_SHOP' })} type="button">상점 나가기</button></section>
}

function RoutePanel({ state }: { state: GameState }) {
  return <section className="mvp-panel"><h2>15 STAGE ROUTE</h2><ol className="route-list">{MVP_ROUTE.map((stage) => <li key={stage.id} className={state.run.completedStageIds.includes(stage.id) ? 'done' : state.run.currentStage?.id === stage.id ? 'current' : ''}><span>{stage.id}</span>{stageName(stage.type)}</li>)}</ol></section>
}

function BuildPanel({ state }: { state: GameState }) {
  const owned = [...state.build.augments, ...state.build.items]
  return <section className="mvp-panel"><h2>BUILD ({owned.length}/13)</h2>{owned.length ? owned.map((id) => <p key={id}>{MVP_BUILD_CATALOG.rewards.find((reward) => reward.id === id)?.name ?? id}</p>) : <p>보상을 획득해 빌드를 시작하세요.</p>}{state.build.synergies.active.map((synergy) => <strong key={synergy.synergyId}>{synergy.name}</strong>)}</section>
}

function Showcase({ step, onStep, onExit }: { step: number; onStep: (step: number) => void; onExit: () => void }) {
  const titles = ['전투 문장', '잠금과 위험', 'VICTORY REWARD', '시너지 완성']
  return <main className="mvp-shell mvp-title"><p className="mvp-kicker">SHOWCASE MODE</p><h1>{titles[step]}</h1><p>STEP {step + 1} / 4</p>{step === 0 && <p>[행동 · 대상 · 배수] 세 릴이 하나의 읽기 쉬운 전투 명령을 만듭니다.</p>}{step === 1 && <div className="slot-sentence"><b>BULLET</b><b>ENEMY</b><b>X3</b></div>}{step === 2 && <div className="reward-grid"><button onClick={() => onStep(3)} type="button"><strong>방벽 코어 선택</strong><span>완전 방어 시 저주를 한 번 막습니다.</span></button></div>}{step === 3 && <p>방어 태그를 조합해 Iron Refrain 시너지를 완성합니다. Showcase는 설명만 제공하며 정상 전투 계산을 우회하지 않습니다.</p>}<div className="mvp-actions">{step < 2 && <button className="mvp-primary" onClick={() => onStep(step + 1)} type="button">NEXT STEP</button>}<button onClick={onExit} type="button">타이틀로</button></div></main>
}

function EndScreen({ title, copy }: { title: string; copy: string }) {
  return <section className="mvp-room"><p className="mvp-kicker">RUN ENDED</p><h1>{title}</h1><p>{copy}</p><button onClick={() => window.location.reload()} type="button">새 런</button></section>
}

function stageName(type?: string): string { return ({ combat: '전투', elite: '엘리트', rest: '휴식', shop: '상점', event: '이벤트', gate: '관문', boss: '보스' } as Record<string, string>)[type ?? ''] ?? '완료' }
function formatStatuses(statuses: GameState['combat']['statuses']['player']): string { return statuses.length ? statuses.map((status) => `${status.id}×${status.stacks}`).join(', ') : '없음' }
function signed(value: number): string { return value > 0 ? `+${value}` : String(value) }

function formatEvent(event: GameEvent): string {
  switch (event.type) {
    case 'STAGE_ENTERED': return `방 ${event.stage.id} 진입: ${stageName(event.stage.type)}`
    case 'STAGE_COMPLETED': return `방 ${event.stage.id} 완료`
    case 'COMBAT_SLOT_SPUN': return `스핀: ${event.result.action}/${event.result.target}/${event.result.modifier}`
    case 'COMBAT_SLOT_REROLLED': return `재굴림: ${event.result.action}/${event.result.target}/${event.result.modifier}`
    case 'COMBAT_SLOT_RESOLVED': return `전투 문장 실행: ${event.outcome}`
    case 'REWARD_CHOSEN': return `보상 획득: ${event.reward.id}`
    case 'SHOP_ITEM_PURCHASED': return `상점 구매: ${event.reward.id} (${event.price}G)`
    case 'REST_RESOLVED': return `휴식: ${event.action} ${event.amount}`
    case 'EVENT_RESOLVED': return `이벤트: ${event.choice}`
    case 'COMMAND_REJECTED': return `거부됨: ${event.reason}`
    case 'CURSE_THRESHOLD_REACHED': return `저주 ${event.threshold} 도달: 다음 적 공격 +${event.attackBonus}`
    case 'CURSE_DEFEAT': return '저주 10 도달: 런 패배'
    case 'BOSS_PHASE_CHANGED': return `보스 2페이즈: 공격 ${event.attack}`
    default: return event.type.replaceAll('_', ' ').toLowerCase()
  }
}

export default App
