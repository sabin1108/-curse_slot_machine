import React, { useMemo, useState } from 'react';
import { GameCommand, MapNodeType } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

interface MapNodeData {
  id: number;
  stage: number;
  lane: number;
  name: string;
  type: MapNodeType;
  icon: string;
  x: number;
  y: number;
  description: string;
}

interface DungeonMapScreenProps {
  currentWave: number;
  totalWaves: number;
  visitedNodePath: number[];
  onDispatch: (cmd: GameCommand) => void;
}

const STAGE_LANES: Record<number, number[]> = {
  1: [2],
  2: [2],
  3: [1, 2, 3],
  4: [1, 2, 3, 4],
  5: [1, 2, 3],
  6: [1, 3],
  7: [1, 2, 3, 4],
  8: [1, 2, 3],
  9: [1, 2, 3, 4],
  10: [1, 3],
  11: [1, 2, 3],
  12: [1, 2, 3],
  13: [2],
  14: [2],
  15: [2],
};

function getNodeId(stage: number, lane: number): number {
  return stage * 100 + lane;
}

function getNodeType(stage: number, lane: number): MapNodeType {
  if (stage === 13) return 'SHOP';
  if (stage === 14) return 'REST';
  if (stage === 15) return 'BOSS';
  if ((stage === 6 || stage === 10 || stage === 12) && lane !== 2) return 'ELITE';
  if (stage === 5 || stage === 8 || stage === 11) return 'EVENT';
  return 'BATTLE';
}

function getNodeMeta(type: MapNodeType) {
  if (type === 'SHOP') {
    return { icon: getAsset('dg_coin_anim_f0'), label: 'Shop', description: 'Final route shop. Buy before the boss climb.' };
  }
  if (type === 'REST') {
    return { icon: getAsset('rest_campfire'), label: 'Rest', description: 'Last shelter. Heal or purify before the final boss.' };
  }
  if (type === 'BOSS') {
    return { icon: getAsset('skull_red'), label: 'Boss', description: 'Stage 15 final boss room.' };
  }
  if (type === 'ELITE') {
    return { icon: getAsset('ogre'), label: 'Elite', description: 'Hard fight with stronger rewards and route pressure.' };
  }
  if (type === 'EVENT') {
    return { icon: getAsset('dg_crate'), label: 'Event', description: 'A risky detour with a chance for gold, recovery, or nothing.' };
  }
  return { icon: getAsset('skull_white'), label: 'Battle', description: 'A standard combat room.' };
}

function buildNodes(): MapNodeData[] {
  return Object.entries(STAGE_LANES).flatMap(([stageKey, lanes]) => {
    const stage = Number(stageKey);
    return lanes.map((lane) => {
      const type = getNodeType(stage, lane);
      const meta = getNodeMeta(type);
      return {
        id: getNodeId(stage, lane),
        stage,
        lane,
        name: `Stage ${stage} ${meta.label}`,
        type,
        icon: meta.icon,
        x: 5 + ((stage - 1) / 14) * 90,
        y: 18 + (lane - 1) * 21,
        description: meta.description,
      };
    });
  });
}

function canConnect(from: MapNodeData, to: MapNodeData): boolean {
  if (to.stage !== from.stage + 1) {
    return false;
  }
  if (to.stage <= 2 || to.stage >= 13) {
    return true;
  }

  const distance = Math.abs(from.lane - to.lane);
  if (distance > 1) {
    return false;
  }

  const blockedEdges = new Set([
    `${getNodeId(4, 4)}>${getNodeId(5, 3)}`,
    `${getNodeId(7, 1)}>${getNodeId(8, 1)}`,
    `${getNodeId(9, 4)}>${getNodeId(10, 3)}`,
    `${getNodeId(11, 1)}>${getNodeId(12, 1)}`,
  ]);

  return !blockedEdges.has(`${from.id}>${to.id}`);
}

function buildConnections(nodes: MapNodeData[]): [number, number][] {
  const result: [number, number][] = [];
  for (const from of nodes) {
    for (const to of nodes) {
      if (canConnect(from, to)) {
        result.push([from.id, to.id]);
      }
    }
  }
  return result;
}

export const DungeonMapScreen: React.FC<DungeonMapScreenProps> = ({
  currentWave,
  totalWaves,
  visitedNodePath = [],
  onDispatch,
}) => {
  const [hoveredNode, setHoveredNode] = useState<MapNodeData | null>(null);
  const [activeEventNode, setActiveEventNode] = useState<MapNodeData | null>(null);
  const nodes = useMemo(buildNodes, []);
  const connections = useMemo(() => buildConnections(nodes), [nodes]);

  const getNodeById = (id: number) => nodes.find((node) => node.id === id);
  const lastVisitedId = visitedNodePath.length > 0 ? visitedNodePath[visitedNodePath.length - 1] : null;
  const lastVisitedNode = lastVisitedId ? getNodeById(lastVisitedId) : null;
  const activeStage = lastVisitedNode ? Math.min(totalWaves, lastVisitedNode.stage + 1) : currentWave;

  const isVisitedSegment = (fromId: number, toId: number) => (
    visitedNodePath.some((id, index) => id === fromId && visitedNodePath[index + 1] === toId)
  );

  const isAvailableNode = (node: MapNodeData) => {
    if (visitedNodePath.includes(node.id)) {
      return false;
    }
    if (!lastVisitedId) {
      return node.stage === 1;
    }
    return node.stage === activeStage && connections.some(([fromId, toId]) => fromId === lastVisitedId && toId === node.id);
  };

  const handleSelectNode = (node: MapNodeData) => {
    soundManager.playClick();
    onDispatch({ type: 'SELECT_MAP_NODE', nodeId: node.id, nodeType: node.type });
    if (node.type === 'EVENT') {
      setActiveEventNode(node);
    }
  };

  const handleEventChoice = (action: 'OPEN' | 'REST' | 'SKIP') => {
    soundManager.playClick();
    onDispatch({ type: 'RESOLVE_EVENT_CHOICE', choice: action });
    setActiveEventNode(null);
  };

  return (
    <div
      id="frame-map"
      className="frame map-screen"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`,
      }}
    >
      <div className="map-floor-texture" />

      <div className="map-boss-goal-banner">
        Route rule: Stage 1 starts narrow, 3-12 branch heavily, 13 Shop, 14 Rest, 15 Boss.
      </div>
      <div className="map-header-banner">
        <div className="map-chapter-title">Cursed Castle Route - Stage {activeStage} / {totalWaves}</div>
        <div className="map-chapter-sub">
          {visitedNodePath.length === 0
            ? 'Enter the only first room. Later branches lock off unreachable routes.'
            : `Cleared rooms: ${visitedNodePath.length}. Pick one connected node for Stage ${activeStage}.`}
        </div>
      </div>

      <div className="map-path-container route-15">
        <svg className="map-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(([fromId, toId]) => {
            const fromNode = getNodeById(fromId);
            const toNode = getNodeById(toId);
            if (!fromNode || !toNode) return null;

            const goldTrail = isVisitedSegment(fromId, toId);
            const nextLine = lastVisitedId === fromId && toNode.stage === activeStage;
            const startLine = visitedNodePath.length === 0 && fromNode.stage === 1;

            return (
              <line
                key={`${fromId}-${toId}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={goldTrail ? '#ffb703' : nextLine || startLine ? '#7fd8ff' : '#3a2a1b'}
                strokeWidth={goldTrail ? '1.8' : nextLine || startLine ? '0.9' : '0.35'}
                strokeDasharray={goldTrail ? 'none' : '1.2 1.4'}
                opacity={goldTrail ? 1 : nextLine || startLine ? 0.95 : 0.22}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isVisited = visitedNodePath.includes(node.id);
          const isCurrent = lastVisitedId === node.id;
          const isClearedPast = isVisited && !isCurrent;
          const isAvailable = isAvailableNode(node);
          const isLockedOrPassed = !isAvailable && !isVisited;

          return (
            <button
              key={node.id}
              className={`map-node-card ${isCurrent ? 'current' : ''} ${isClearedPast ? 'cleared' : ''} ${
                isAvailable ? 'avail' : 'locked'
              } ${isLockedOrPassed ? 'passed' : ''} type-${node.type.toLowerCase()}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => isAvailable && handleSelectNode(node)}
              disabled={!isAvailable}
              type="button"
            >
              <img src={node.icon} alt="" className="node-icon-img" />
              <div className="node-name-badge">
                {isCurrent ? 'Here' : isClearedPast ? 'Cleared' : isAvailable ? `S${node.stage}` : node.name}
              </div>
            </button>
          );
        })}
      </div>

      {activeEventNode && (
        <div className="reward-modal-backdrop">
          <div className="reward-modal-content">
            <div className="reward-header">
              <h2>{activeEventNode.name}</h2>
              <p>{activeEventNode.description}</p>
            </div>

            <div className="event-choices-grid" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '20px 0' }}>
              <button className="k-btn primary big" onClick={() => handleEventChoice('OPEN')} type="button">
                Open cache
              </button>
              <button className="k-btn warning big" onClick={() => handleEventChoice('REST')} type="button">
                Take shelter
              </button>
              <button className="k-btn big" onClick={() => handleEventChoice('SKIP')} type="button">
                Push onward
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="map-hover-info-box">
        {hoveredNode ? (
          <>
            <div className="hover-title">
              [{hoveredNode.type}] {hoveredNode.name}
            </div>
            <div className="hover-desc">{hoveredNode.description}</div>
          </>
        ) : (
          <div className="hover-hint">Hover a room to inspect it. Unconnected rooms are locked out by your route.</div>
        )}
      </div>

      <div className="vignette" />
    </div>
  );
};
