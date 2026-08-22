export type ReelId = 'action' | 'target' | 'modifier';

export type ActionType = 'BULLET' | 'SHIELD' | 'HEART' | 'DAGGER' | 'POISON' | 'BOMB';
export type TargetType = 'ENEMY' | 'SELF' | 'ALL';
export type ModifierType = 'X1' | 'X2' | 'X3' | 'CRIT' | 'VAMP';

export interface ReelSymbol {
  id: string;
  name: string;
  type: ActionType | TargetType | ModifierType;
  category: 'ACTION' | 'TARGET' | 'MODIFIER';
  baseValue: number;
  icon: string;
  imgUrl?: string;
  color: string;
  description: string;
}

export interface SlotResult {
  action: ReelSymbol;
  target: ReelSymbol;
  modifier: ReelSymbol;
  isMiss: boolean;
  missReason?: string;
  calculatedValue: number;
  defenseValue?: number;
  attackRoll?: number;
  defenseRoll?: number;
  multiplierValue?: number;
  attackMultiplierValue?: number;
  defenseMultiplierValue?: number;
  finalEffectText: string;
}

export type SynergyTag =
  | 'COMBO'
  | 'MULTI_HIT'
  | 'CRITICAL'
  | 'BURN'
  | 'DEFENSE'
  | 'CURSE'
  | 'RISK'
  | 'RESOURCE'
  | 'LIMIT';

export interface AugmentItem {
  id: string;
  kind: 'augment' | 'item';
  name: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'CURSED' | 'LEGENDARY';
  tags: SynergyTag[];
  description: string;
  icon: string;
  imgUrl?: string;
  effectValue: string;
}

export interface SynergyProgress {
  synergyId: string;
  name: string;
  tag: SynergyTag;
  current: number;
  required: number;
  completed: boolean;
  effectDescription: string;
  tierEffects?: { count: number; label: string; description: string }[];
}

export interface BuildState {
  augments: AugmentItem[];
  items: string[];
  activeSynergies: string[];
  synergyProgress: SynergyProgress[];
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  shield: number;
  gold: number;
}

export interface EnemyIntent {
  id: string;
  name: string;
  type: 'ATTACK' | 'WAIT' | 'DEFEND' | 'CURSE' | 'HEAL';
  value: number;
  icon: string;
  description: string;
}

export interface EnemyState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  statuses: { type: string; duration: number; value: number }[];
  intent: EnemyIntent;
  spriteUrl?: string;
}

export interface CurseState {
  current: number;
  max: number;
  threshold1Triggered: boolean;
  threshold2Triggered: boolean;
}

export type OriginId = 'SWORDSMAN' | 'GAMBLER' | 'PRIEST';

export interface OriginData {
  id: OriginId;
  name: string;
  title: string;
  tagline: string;
  narrative: string;
  startingGoldBonus: number;
  startingHpBonus: number;
  startingShieldBonus: number;
  startingAugmentId: string;
  icon: string;
  symbolBiasText: string;
  rouletteTraitText: string;
}

export interface OriginTraitState {
  freeRerollAvailable: boolean;
}

export type GameScreen = 'TITLE' | 'PROLOGUE' | 'ORIGIN' | 'BATTLE' | 'REWARD' | 'MAP' | 'SHOP' | 'REST' | 'GAMEOVER' | 'VICTORY';

export type GameMode = 'NORMAL' | 'SHOWCASE';

export type MapNodeType = 'BATTLE' | 'ELITE' | 'SHOP' | 'REST' | 'EVENT' | 'BOSS';

export type EventChoice = 'OPEN' | 'REST' | 'SKIP';

export interface ShowcaseStep {
  stepIndex: number;
  title: string;
  instruction: string;
  actionScript: string;
  forcedResult?: {
    actionId: string;
    targetId: string;
    modifierId: string;
  };
  highlightMessage: string;
}

export interface GameState {
  mode: GameMode;
  screen: GameScreen;
  seed: string;
  turn: number;
  wave: number;
  totalWaves: number;
  floor: number;
  totalFloors: number;
  player: PlayerState;
  enemy: EnemyState;
  curse: CurseState;
  build: BuildState;
  visitedNodePath: number[]; // Persistent visited map node IDs
  
  // Narrative & Origin State
  selectedOrigin?: OriginId;
  originTraitState: OriginTraitState;
  narrativeMicrocopy?: string;
  curseLogsUnlocked?: string[];

  // Combat Motion Flags
  isEnemyAttacking?: boolean;
  isEnemyDefeated?: boolean;
  
  // Combat Slot Machine State
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
  currentResult: SlotResult | null;
  hasSpunThisTurn: boolean;
  isSpinning: boolean;
  
  // Augment Slot Machine Presentation State (Reward reveal)
  rewardCandidates: AugmentItem[];
  augSlotPresentation: {
    reels: [string, string, string];
    targetAugment: AugmentItem | null;
    isRevealed: boolean;
  } | null;

  // Combat Log & Floating Feedback
  combatLogs: string[];
  lastDamagePop: { value: number; type: 'PLAYER_DMG' | 'ENEMY_DMG' | 'HEAL' | 'SHIELD'; id: number } | null;
  lastEnemyDamagePop: { value: number; id: number } | null;
  enemyDamagePops: { value: number; id: number }[];
  
  // Showcase State
  showcase: {
    active: boolean;
    currentStep: number;
    steps: ShowcaseStep[];
  };
}

export type GameCommand =
  | { type: 'START_RUN'; seed?: string }
  | { type: 'SELECT_ORIGIN'; originId: OriginId }
  | { type: 'ENTER_NEXT_STAGE' }
  | { type: 'SPIN_COMBAT_SLOT' }
  | { type: 'TOGGLE_REEL_LOCK'; reel: ReelId }
  | { type: 'REROLL_UNLOCKED' }
  | { type: 'CONFIRM_COMBAT_SLOT' }
  | { type: 'CHOOSE_REWARD'; rewardId: string }
  | { type: 'RESOLVE_EVENT'; choice: 'reward' | 'gold' | 'rest' | 'skip' }
  | { type: 'BUY_SHOP_ITEM'; rewardId: string }
  | { type: 'LEAVE_SHOP' }
  | { type: 'RESOLVE_REST'; action: 'heal' | 'purify' }
  | { type: 'NAVIGATE'; screen: GameScreen }
  | { type: 'START_SHOWCASE'; scenarioId?: string }
  | { type: 'NEXT_SHOWCASE_STEP' };

