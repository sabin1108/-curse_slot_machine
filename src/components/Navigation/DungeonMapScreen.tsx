import React, { useState } from 'react'
import { getAsset } from '../../assets/assetHelper'
import { MVP_ROUTE } from '../../game/run/RunSystem'
import type { RunStageDefinition, RunStageType } from '../../game/run/RunTypes'
import type { GameCommand } from '../../types/game'
import { soundManager } from '../../utils/soundManager'

interface DungeonMapScreenProps {
  completedStageIds: number[]
  currentStage: RunStageDefinition | null
  onDispatch: (command: GameCommand) => void
}

const LABELS: Record<RunStageType, string> = {
  combat: '전투', elite: '정예', rest: '휴식', shop: '상점', event: '이벤트', gate: '관문', boss: '보스',
}

function getNodeIcon(type: RunStageType): string {
  if (type === 'shop') return getAsset('dg_coin_anim_f0')
  if (type === 'rest') return getAsset('rest_campfire')
  if (type === 'event') return getAsset('dg_crate')
  if (type === 'boss') return getAsset('skull_red')
  if (type === 'elite' || type === 'gate') return getAsset('ogre')
  return getAsset('skull_white')
}

export const DungeonMapScreen: React.FC<DungeonMapScreenProps> = ({ completedStageIds, currentStage, onDispatch }) => {
  const [hoveredStage, setHoveredStage] = useState<RunStageDefinition | null>(null)
  const nextStage = MVP_ROUTE[completedStageIds.length] ?? null
  const activeStage = currentStage ?? nextStage

  const enterNextStage = () => {
    soundManager.playClick()
    onDispatch({ type: 'ENTER_NEXT_STAGE' })
  }

  const resolveEvent = (choice: 'reward' | 'gold' | 'rest' | 'skip') => {
    soundManager.playClick()
    onDispatch({ type: 'RESOLVE_EVENT', choice })
  }

  return (
    <div id="frame-map" className="frame map-screen" style={{ ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})` }}>
      <div className="map-floor-texture" />
      <div className="map-boss-goal-banner">고정 경로 · 동일한 시드와 명령 순서는 항상 동일한 결과를 만듭니다.</div>
      <div className="map-header-banner">
        <div className="map-chapter-title">저주받은 성채 · {activeStage?.id ?? 15} / 15 스테이지</div>
        <div className="map-chapter-sub">분기 선택 없이 코어가 정의한 순서대로 진행합니다.</div>
      </div>

      <div className="map-path-container route-15">
        <svg className="map-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {MVP_ROUTE.slice(0, -1).map((stage, index) => {
            const next = MVP_ROUTE[index + 1]
            const cleared = completedStageIds.includes(stage.id) && completedStageIds.includes(next.id)
            return <line key={`${stage.id}-${next.id}`} x1={5 + ((stage.id - 1) / 14) * 90} y1={50} x2={5 + ((next.id - 1) / 14) * 90} y2={50} stroke={cleared ? '#ffb703' : '#3a2a1b'} strokeWidth={cleared ? '1.8' : '0.7'} />
          })}
        </svg>

        {MVP_ROUTE.map((stage) => {
          const completed = completedStageIds.includes(stage.id)
          const available = !currentStage && nextStage?.id === stage.id
          const current = currentStage?.id === stage.id
          return (
            <button key={stage.id} className={`map-node-card ${completed ? 'cleared' : ''} ${current ? 'current' : ''} ${available ? 'avail' : 'locked'} type-${stage.type}`} style={{ left: `${5 + ((stage.id - 1) / 14) * 90}%`, top: '50%' }} onMouseEnter={() => setHoveredStage(stage)} onMouseLeave={() => setHoveredStage(null)} onClick={() => available && enterNextStage()} disabled={!available} type="button" aria-label={`Stage ${stage.id} ${LABELS[stage.type]}`}>
              <img src={getNodeIcon(stage.type)} alt="" className="node-icon-img" />
              <div className="node-name-badge">{completed ? 'Clear' : current ? 'Here' : `S${stage.id}`}</div>
            </button>
          )
        })}
      </div>

      {currentStage?.type === 'event' && (
        <div className="reward-modal-backdrop"><div className="reward-modal-content">
          <div className="reward-header"><h2>Stage {currentStage.id} · 깊은 밤의 제단</h2><p>보상, 골드, 회복 중 하나를 택하거나 지나칩니다.</p></div>
          <div className="event-choices-grid" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '20px 0' }}>
            <button data-event-choice="reward" className="k-btn primary big" onClick={() => resolveEvent('reward')} type="button">보상 탐색</button>
            <button data-event-choice="gold" className="k-btn big" onClick={() => resolveEvent('gold')} type="button">골드 +50</button>
            <button data-event-choice="rest" className="k-btn warning big" onClick={() => resolveEvent('rest')} type="button">HP +15</button>
            <button data-event-choice="skip" className="k-btn big" onClick={() => resolveEvent('skip')} type="button">지나치기</button>
          </div>
        </div></div>
      )}

      <div className="map-hover-info-box">
        {hoveredStage ? <><div className="hover-title">Stage {hoveredStage.id} · {LABELS[hoveredStage.type]}</div><div className="hover-desc">보상 정책: {hoveredStage.rewardPolicy}</div></> : <div className="hover-hint">파란색으로 표시된 다음 방만 진입할 수 있습니다.</div>}
      </div>
      <div className="vignette" />
    </div>
  )
}
