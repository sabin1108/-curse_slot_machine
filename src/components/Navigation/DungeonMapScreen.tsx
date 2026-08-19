import React, { useState } from 'react';
import { GameCommand } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface MapNodeData {
  id: number;
  floor: number;
  name: string;
  type: 'BATTLE' | 'ELITE' | 'SHOP' | 'REST' | 'EVENT' | 'BOSS';
  icon: string;
  x: number; // 0..100 Percentage X
  y: number; // 0..100 Percentage Y
  description: string;
}

interface DungeonMapScreenProps {
  currentWave: number;
  totalWaves: number;
  visitedNodePath: number[];
  onDispatch: (cmd: GameCommand) => void;
}

export const DungeonMapScreen: React.FC<DungeonMapScreenProps> = ({
  currentWave,
  totalWaves,
  visitedNodePath = [],
  onDispatch
}) => {
  const [hoveredNode, setHoveredNode] = useState<MapNodeData | null>(null);
  const [activeEventNode, setActiveEventNode] = useState<MapNodeData | null>(null);

  // 16 Nodes positioned in normalized 0..100 percentage coordinates
  const nodes: MapNodeData[] = [
    // Floor 1 (x: 8%) - 3 Starting Choice Nodes
    { id: 1, floor: 1, name: '1-A: 초소 전투', type: 'BATTLE', icon: getAsset('skull_white'), x: 8, y: 20, description: '초소 파수꾼 해골과 전투합니다.' },
    { id: 2, floor: 1, name: '1-B: 서쪽 습격', type: 'BATTLE', icon: getAsset('skull_white'), x: 8, y: 50, description: '서쪽 회랑의 기습 몬스터와 전투합니다.' },
    { id: 3, floor: 1, name: '1-C: 감옥 전투', type: 'BATTLE', icon: getAsset('skull_white'), x: 8, y: 80, description: '지하 감옥 파수꾼과 슬롯 대결합니다.' },

    // Floor 2 (x: 23%)
    { id: 4, floor: 2, name: '2-A: 암시장 상점', type: 'SHOP', icon: getAsset('dg_coin_anim_f0'), x: 23, y: 20, description: '희귀 무기와 물약을 구매합니다.' },
    { id: 5, floor: 2, name: '2-B: 모닥불 쉼터', type: 'REST', icon: getAsset('fx_campfire_strip_f0'), x: 23, y: 50, description: 'HP 회복 또는 저주 정화 의식을 진행합니다.' },
    { id: 6, floor: 2, name: '2-C: 비밀 궤짝', type: 'EVENT', icon: getAsset('dg_crate'), x: 23, y: 80, description: '저주받은 보물상자를 엽니다.' },

    // Floor 3 (x: 38%)
    { id: 7, floor: 3, name: '3-A: 고블린 군단', type: 'BATTLE', icon: getAsset('skull_white'), x: 38, y: 20, description: '그림자 고블린 전사들과 슬롯 전투!' },
    { id: 8, floor: 3, name: '3-B: 중간 쉼터', type: 'REST', icon: getAsset('fx_campfire_strip_f0'), x: 38, y: 50, description: '엘리트전에 대비하여 체력을 정비합니다.' },
    { id: 9, floor: 3, name: '3-C: 수금원 기습', type: 'BATTLE', icon: getAsset('skull_white'), x: 38, y: 80, description: '저주 수금원 해골들과 대결합니다.' },

    // Floor 4 (x: 53% - Elites)
    { id: 10, floor: 4, name: '4-A: 엘리트 오우거', type: 'ELITE', icon: getAsset('ogre'), x: 53, y: 35, description: '👹 묵직한 오우거 집행관! 희귀 증강 보상 획득 가능!' },
    { id: 11, floor: 4, name: '4-B: 엘리트 기사', type: 'ELITE', icon: getAsset('shield_blue'), x: 53, y: 65, description: '👹 저주받은 흑기사! 거대 골드 및 전설 보상!' },

    // Floor 5 (x: 68%)
    { id: 12, floor: 5, name: '5-A: 비밀 암시장', type: 'SHOP', icon: getAsset('dg_coin_anim_f0'), x: 68, y: 20, description: '최종 보스 대비 고급 장비를 세팅합니다.' },
    { id: 13, floor: 5, name: '5-B: 대형 모닥불', type: 'REST', icon: getAsset('fx_campfire_strip_f0'), x: 68, y: 50, description: '체력 +35 대량 회복!' },
    { id: 14, floor: 5, name: '5-C: 행운의 기계', type: 'EVENT', icon: getAsset('orb_gold'), x: 68, y: 80, description: '골드를 넣고 무작위 잭팟 아이템을 뽑습니다.' },

    // Floor 6 (x: 82% - Gate)
    { id: 15, floor: 6, name: '6-A: 성채 관문', type: 'BATTLE', icon: getAsset('skull_white'), x: 82, y: 50, description: '보스 방문을 지키는 최후의 성채 문지기!' },

    // Floor 7 (x: 94% - Boss)
    { id: 16, floor: 7, name: '7-A: 하우스 딜러 (BOSS)', type: 'BOSS', icon: getAsset('skull_red'), x: 94, y: 50, description: '💀 최종 보스 하우스 딜러! 슬롯머신 잭팟으로 분쇄하세요!' }
  ];

  // Connection Pairs
  const connections: [number, number][] = [
    // Floor 1 -> Floor 2
    [1, 4], [1, 5],
    [2, 4], [2, 5], [2, 6],
    [3, 5], [3, 6],

    // Floor 2 -> Floor 3
    [4, 7], [4, 8],
    [5, 7], [5, 8], [5, 9],
    [6, 8], [6, 9],

    // Floor 3 -> Floor 4 (Elites)
    [7, 10], [8, 10], [8, 11], [9, 11],

    // Floor 4 -> Floor 5
    [10, 12], [10, 13],
    [11, 13], [11, 14],

    // Floor 5 -> Floor 6
    [12, 15], [13, 15], [14, 15],

    // Floor 6 -> Floor 7 Boss
    [15, 16]
  ];

  const getNodeById = (id: number) => nodes.find((n) => n.id === id);

  const lastVisitedId = visitedNodePath.length > 0 ? visitedNodePath[visitedNodePath.length - 1] : null;
  const lastVisitedNode = lastVisitedId ? getNodeById(lastVisitedId) : null;

  // Active Floor is dynamically derived from last visited node's floor + 1!
  const activeFloor = lastVisitedNode ? Math.min(totalWaves, lastVisitedNode.floor + 1) : 1;

  // Helper: check if pair (fromId, toId) is a consecutive segment in visitedNodePath
  const isVisitedSegment = (fromId: number, toId: number) => {
    for (let i = 0; i < visitedNodePath.length - 1; i++) {
      if (visitedNodePath[i] === fromId && visitedNodePath[i + 1] === toId) {
        return true;
      }
    }
    return false;
  };

  const handleSelectNode = (node: MapNodeData) => {
    soundManager.playClick();
    onDispatch({ type: 'SELECT_MAP_NODE', nodeId: node.id });

    if (node.type === 'SHOP') {
      onDispatch({ type: 'NAVIGATE', screen: 'SHOP' });
    } else if (node.type === 'REST') {
      onDispatch({ type: 'NAVIGATE', screen: 'REST' });
    } else if (node.type === 'EVENT') {
      setActiveEventNode(node);
    } else {
      onDispatch({ type: 'NAVIGATE', screen: 'BATTLE' });
    }
  };

  const handleEventChoice = (action: 'OPEN' | 'REST' | 'SKIP') => {
    soundManager.playClick();
    if (action === 'OPEN') {
      onDispatch({ type: 'BUY_SHOP_ITEM', itemId: '보물상자 획득', price: 0 });
    } else if (action === 'REST') {
      onDispatch({ type: 'REST_ACTION', actionType: 'HEAL' });
    } else {
      onDispatch({ type: 'NAVIGATE', screen: 'BATTLE' });
    }
    setActiveEventNode(null);
  };

  return (
    <div
      id="frame-map"
      className="frame map-screen"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`
      }}
    >
      <div className="map-floor-texture" />

      {/* Map Header Banner */}
      <div className="map-boss-goal-banner">
        🎯 런 최종 목표: 3층 (3-7) 보스 '하우스 딜러'를 처치하고 저주의 족쇄에서 해방되세요!
      </div>
      <div className="map-header-banner">
        <div className="map-chapter-title">
          🏰 저주받은 성채 탐사 지도 — Stage {activeFloor} / {totalWaves}
        </div>
        <div className="map-chapter-sub">
          {visitedNodePath.length === 0
            ? '1층의 3개 선택지 중 하나를 선택하여 탐사를 출발하세요'
            : `지난 탐사 경로 (총 ${visitedNodePath.length}개 방 정복) ➡️ 현재 ${activeFloor}층 선택 진행 중`}
        </div>
      </div>

      {/* Interactive 7-Floor 16-Node Branching Map */}
      <div className="map-path-container">
        {/* SVG lines using exact 0..100 percentage viewport matching node positions */}
        <svg className="map-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(([fromId, toId], idx) => {
            const nFrom = getNodeById(fromId);
            const nTo = getNodeById(toId);
            if (!nFrom || !nTo) return null;

            const isGoldTrail = isVisitedSegment(fromId, toId);
            const isNextAvailableLine =
              lastVisitedId === fromId &&
              nTo.floor === activeFloor &&
              connections.some(([f, t]) => f === lastVisitedId && t === toId);

            const isStartingLine = visitedNodePath.length === 0 && nFrom.floor === 1;

            return (
              <line
                key={idx}
                x1={nFrom.x}
                y1={nFrom.y}
                x2={nTo.x}
                y2={nTo.y}
                stroke={isGoldTrail ? '#ffb703' : isNextAvailableLine || isStartingLine ? '#7fd8ff' : '#3a2a1b'}
                strokeWidth={isGoldTrail ? '1.8' : isNextAvailableLine || isStartingLine ? '1.0' : '0.4'}
                strokeDasharray={isGoldTrail ? 'none' : '1.5 1.5'}
                opacity={isGoldTrail ? 1 : isNextAvailableLine || isStartingLine ? 0.95 : 0.25}
              />
            );
          })}
        </svg>

        {/* Render 16 Map Nodes in % position */}
        {nodes.map((node) => {
          const isVisited = visitedNodePath.includes(node.id);
          const isCurrent = lastVisitedId === node.id;
          const isClearedPast = isVisited && !isCurrent;

          let isAvailable = false;

          if (visitedNodePath.length === 0 && node.floor === 1) {
            // At start: all Floor 1 nodes are available
            isAvailable = true;
          } else if (node.floor === activeFloor && lastVisitedId !== null) {
            // Check if connected from lastVisitedId
            const isConnected = connections.some(([f, t]) => f === lastVisitedId && t === node.id);
            if (isConnected) {
              isAvailable = true;
            }
          }

          const isLockedOrPassed = !isAvailable && !isVisited;

          return (
            <div
              key={node.id}
              className={`map-node-card ${isCurrent ? 'current' : ''} ${isClearedPast ? 'cleared' : ''} ${
                isAvailable ? 'avail' : 'locked'
              } ${isLockedOrPassed ? 'passed' : ''} type-${node.type.toLowerCase()}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => isAvailable && handleSelectNode(node)}
            >
              <img src={node.icon} alt={node.name} className="node-icon-img" />
              <div className="node-name-badge">
                {isCurrent
                  ? '📍 현재 위치'
                  : isClearedPast
                  ? '✅ 정복 완료'
                  : isAvailable
                  ? '✨ 선택 가능'
                  : node.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Event Mystery Choice Modal */}
      {activeEventNode && (
        <div className="reward-modal-backdrop">
          <div className="reward-modal-content">
            <div className="reward-header">
              <h2>🎁 [{activeEventNode.name}] 인카운터 발동</h2>
              <p>{activeEventNode.description}</p>
            </div>

            <div className="event-choices-grid" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '20px 0' }}>
              <button className="k-btn primary big" onClick={() => handleEventChoice('OPEN')} type="button">
                🪙 보물상자 개봉 (+60 골드)
              </button>
              <button className="k-btn warning big" onClick={() => handleEventChoice('REST')} type="button">
                🔮 마법 샘물 (HP +35 회복)
              </button>
              <button className="k-btn big" onClick={() => handleEventChoice('SKIP')} type="button">
                🏃 지나치기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Room Info Banner Below Map */}
      <div className="map-hover-info-box">
        {hoveredNode ? (
          <>
            <div className="hover-title">
              [{hoveredNode.type}] {hoveredNode.name}
            </div>
            <div className="hover-desc">{hoveredNode.description}</div>
          </>
        ) : (
          <div className="hover-hint">💡 마우스를 노드 위에 올리면 해당 방의 수문장 및 이벤트 정보가 나타납니다</div>
        )}
      </div>

      <div className="vignette" />
    </div>
  );
};
