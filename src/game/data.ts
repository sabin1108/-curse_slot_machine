import { ReelSymbol, RewardCard, SynergyProgress, EnemyState, ShowcaseStep } from '../types/game';
import { getAsset } from '../assets/assetHelper';
import { DEFAULT_BUILD_CATALOG } from './build/BuildCatalog';

export const ACTION_SYMBOLS: ReelSymbol[] = [
  {
    id: 'bullet',
    name: '화염검',
    type: 'BULLET',
    category: 'ACTION',
    baseValue: 6,
    icon: '🗡️',
    imgUrl: getAsset('sword_gold'),
    color: '#ffb703',
    description: '화염검 기본 6 타격'
  },
  {
    id: 'shield',
    name: '수호 방벽',
    type: 'SHIELD',
    category: 'ACTION',
    baseValue: 5,
    icon: '🛡️',
    imgUrl: getAsset('shield_blue'),
    color: '#7fd8ff',
    description: '기본 5 방호벽'
  },
  {
    id: 'heart',
    name: '재생 물약',
    type: 'HEART',
    category: 'ACTION',
    baseValue: 4,
    icon: '🧪',
    imgUrl: getAsset('potion_red'),
    color: '#ff66b2',
    description: '체력 기본 4 회복'
  },
  {
    id: 'dagger',
    name: '홍염 단검',
    type: 'DAGGER',
    category: 'ACTION',
    baseValue: 8,
    icon: '🗡️',
    imgUrl: getAsset('sword_red'),
    color: '#ff4d4d',
    description: '8 피해 단검'
  },
  {
    id: 'bomb',
    name: '폭주 코어',
    type: 'BOMB',
    category: 'ACTION',
    baseValue: 12,
    icon: '🔮',
    imgUrl: getAsset('orb_purple'),
    color: '#aa33ff',
    description: '12 폭주 대폭발'
  }
];

export const TARGET_SYMBOLS: ReelSymbol[] = [
  {
    id: 'pow_6',
    name: '위력 +6',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 6,
    icon: '⚡',
    imgUrl: getAsset('orb_blue'),
    color: '#7fd8ff',
    description: '위력 수치 +6 추가'
  },
  {
    id: 'pow_8',
    name: '위력 +8',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 8,
    icon: '⚡',
    imgUrl: getAsset('ring_gray'),
    color: '#aaaaaa',
    description: '위력 수치 +8 추가'
  },
  {
    id: 'pow_10',
    name: '위력 +10',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 10,
    icon: '⚡',
    imgUrl: getAsset('orb_green'),
    color: '#33cc33',
    description: '위력 수치 +10 추가'
  },
  {
    id: 'pow_12',
    name: '위력 +12',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 12,
    icon: '⚡',
    imgUrl: getAsset('orb_gold'),
    color: '#ffb703',
    description: '위력 수치 +12 추가'
  },
  {
    id: 'pow_15',
    name: '위력 +15',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 15,
    icon: '⚡',
    imgUrl: getAsset('ring_gold'),
    color: '#ff8800',
    description: '위력 수치 +15 대형 추가'
  },
  {
    id: 'pow_20',
    name: '위력 +20',
    type: 'ENEMY',
    category: 'TARGET',
    baseValue: 20,
    icon: '🔥',
    imgUrl: getAsset('orb_purple'),
    color: '#ff00ff',
    description: '위력 수치 +20 극대 추가'
  }
];

export const MODIFIER_SYMBOLS: ReelSymbol[] = [
  {
    id: 'x1',
    name: 'x1 배수',
    type: 'X1',
    category: 'MODIFIER',
    baseValue: 1,
    icon: '⚡',
    imgUrl: getAsset('ring_gray'),
    color: '#cccccc',
    description: '기본 효과 1배 (단타)'
  },
  {
    id: 'x2',
    name: 'x2 배수',
    type: 'X2',
    category: 'MODIFIER',
    baseValue: 2,
    icon: '💥',
    imgUrl: getAsset('ring_gold'),
    color: '#ffb300',
    description: '효과 2배 증폭 (2연타)'
  },
  {
    id: 'x3',
    name: 'x3 (저주)',
    type: 'X3',
    category: 'MODIFIER',
    baseValue: 3,
    icon: '🔥',
    imgUrl: getAsset('orb_gold'),
    color: '#ff3300',
    description: '효과 3배 증폭 (3연타, 저주 +1)'
  },
  {
    id: 'x5',
    name: 'x5 (잭팟)',
    type: 'X3',
    category: 'MODIFIER',
    baseValue: 5,
    icon: '🌟',
    imgUrl: getAsset('orb_purple'),
    color: '#ff00ff',
    description: '효과 5배 대증폭! (5연타 폭격)'
  },
  {
    id: 'crit',
    name: '크리티컬',
    type: 'CRIT',
    category: 'MODIFIER',
    baseValue: 2.5,
    icon: '✨',
    imgUrl: getAsset('orb_green'),
    color: '#00ffcc',
    description: '2.5배 치명타 연타'
  }
];

export const ALL_AUGMENTS: RewardCard[] = [
  {
    id: 'aug_fire_sword',
    kind: 'augment',
    name: '화염검 강결',
    rarity: 'RARE',
    tags: ['RISK', 'CRITICAL'],
    description: '공격 슬롯 데미지 +6 증가, 화상 확률 +15%',
    icon: '🗡️',
    imgUrl: getAsset('sword_gold'),
    effectValue: '+6'
  },
  {
    id: 'aug_barrier',
    kind: 'augment',
    name: '방벽 코어',
    rarity: 'COMMON',
    tags: ['DEFENSE'],
    description: '턴 시작 시 보호막 +3 상시 유지',
    icon: '🛡️',
    imgUrl: getAsset('shield_blue'),
    effectValue: '+3'
  },
  {
    id: 'aug_regen',
    kind: 'augment',
    name: '재생 물약',
    rarity: 'COMMON',
    tags: ['RESOURCE'],
    description: '턴 종료 시 체력 +2 회복',
    icon: '🧪',
    imgUrl: getAsset('potion_red'),
    effectValue: '+2'
  },
  {
    id: 'aug_frenzy_core',
    kind: 'augment',
    name: '폭주 코어',
    rarity: 'LEGENDARY',
    tags: ['BURN', 'MULTI_HIT'],
    description: '크리티컬 발생 시 슬롯 추가 스핀 기회 획득',
    icon: '🔮',
    imgUrl: getAsset('orb_purple'),
    effectValue: 'NEW'
  },
  ...DEFAULT_BUILD_CATALOG.rewards.map((reward): RewardCard => ({
    id: reward.id,
    kind: reward.kind,
    name: reward.name,
    rarity: reward.rarity.toUpperCase() as RewardCard['rarity'],
    tags: reward.tags,
    description: reward.description,
    icon: reward.kind === 'item' ? 'ITEM' : 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : getAsset('sword_gold'),
    effectValue: reward.effectLabel ?? reward.effectId ?? 'EFFECT'
  }))
];

export const INITIAL_SYNERGIES: SynergyProgress[] = [
  ...DEFAULT_BUILD_CATALOG.synergies.map((synergy): SynergyProgress => ({
    synergyId: synergy.id,
    name: synergy.name,
    tag: synergy.requiredTags[0]?.tag ?? 'COMBO',
    current: 0,
    required: synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0),
    completed: false,
    effectDescription: synergy.description
  }))
];

export const DEFAULT_ENEMIES: EnemyState[] = [
  // Stage 1 Base Monster
  {
    id: 'skull_sentinel',
    name: '1층: 해골 수금원',
    hp: 75,
    maxHp: 75,
    shield: 0,
    statuses: [],
    intent: {
      id: 'hook',
      name: '저주 갈고리',
      type: 'ATTACK',
      value: 11,
      icon: '⚓',
      description: '다음 턴 11 갈고리 피해 예고'
    },
    spriteUrl: getAsset('enemy_skelet')
  },
  // Stage 2 Base Monster
  {
    id: 'shadow_goblin',
    name: '2층: 그림자 고블린',
    hp: 85,
    maxHp: 85,
    shield: 5,
    statuses: [],
    intent: {
      id: 'curse_strik',
      name: '저주 단검',
      type: 'CURSE',
      value: 12,
      icon: '☠️',
      description: '다음 턴 12 피해 및 저주 +1'
    },
    spriteUrl: getAsset('enemy_goblin')
  },
  // Stage 3 Base Monster
  {
    id: 'mummy_sorcerer',
    name: '3층: 미라 주술사',
    hp: 95,
    maxHp: 95,
    shield: 8,
    statuses: [{ type: '중독', duration: 2, value: 2 }],
    intent: {
      id: 'curse_spell',
      name: '저주 주술',
      type: 'CURSE',
      value: 13,
      icon: '🔮',
      description: '다음 턴 13 독주술 피해'
    },
    spriteUrl: getAsset('enemy_necromancer')
  },
  // Stage 4 Elite
  {
    id: 'ogre_chief',
    name: '4층: 오우거 집행관 (ELITE)',
    hp: 125,
    maxHp: 125,
    shield: 12,
    statuses: [{ type: '화상', duration: 2, value: 3 }],
    intent: {
      id: 'smash',
      name: '묵직한 둔기',
      type: 'ATTACK',
      value: 16,
      icon: '🔨',
      description: '다음 턴 16 강타 대형 피해'
    },
    spriteUrl: getAsset('enemy_ogre')
  },
  // Stage 5 Elite
  {
    id: 'cursed_knight',
    name: '5층: 저주받은 흑기사 (ELITE)',
    hp: 155,
    maxHp: 155,
    shield: 20,
    statuses: [],
    intent: {
      id: 'thorn_slash',
      name: '가시 수호검',
      type: 'ATTACK',
      value: 20,
      icon: '🛡️',
      description: '다음 턴 20 강철 강타 예고'
    },
    spriteUrl: getAsset('enemy_knight')
  },
  // Stage 6 Checkpoint
  {
    id: 'fortress_golem',
    name: '6층: 성채 문지기 골렘',
    hp: 195,
    maxHp: 195,
    shield: 25,
    statuses: [],
    intent: {
      id: 'rock_crush',
      name: '성채 암석',
      type: 'ATTACK',
      value: 24,
      icon: '🪨',
      description: '다음 턴 24 바위 둔기 강타'
    },
    spriteUrl: getAsset('enemy_golem')
  },
  // Stage 7 Boss
  {
    id: 'house_dealer_boss',
    name: '7층: 하우스 딜러 (FINAL BOSS)',
    hp: 380,
    maxHp: 380,
    shield: 50,
    statuses: [],
    intent: {
      id: 'jackpot_crush',
      name: '올인 분쇄 잭팟',
      type: 'ATTACK',
      value: 42,
      icon: '🎰',
      description: '다음 턴 42 보스 대형 분쇄 피해'
    },
    spriteUrl: getAsset('skull_red')
  }
];

export const SHOWCASE_STEPS: ShowcaseStep[] = [
  {
    stepIndex: 1,
    title: '1단계: 던전 슬롯머신 순차 정지 연출',
    instruction: 'PULL 레버를 당기면 1번, 2번, 3번 릴이 순차적으로 정지합니다.',
    actionScript: '전투 스핀 버튼 클릭',
    forcedResult: {
      actionId: 'bullet',
      targetId: 'pow_10',
      modifierId: 'x2'
    },
    highlightMessage: '결과확정: [화염검 6] + [위력 10] × [x2 배수] => 적 몬스터에게 32 2연타 피해!'
  },
  {
    stepIndex: 2,
    title: '2단계: 릴 잠금 & 재회전 (x5 잭팟 폭격)',
    instruction: '위험한 결과를 피하기 위해 릴을 잠그고 재회전합니다.',
    actionScript: '행동 릴 잠금 후 재회전',
    forcedResult: {
      actionId: 'bullet',
      targetId: 'pow_15',
      modifierId: 'x5'
    },
    highlightMessage: '저주 +2 상승! [화염검 6] + [위력 15] × [x5 잭팟] 105 5연타 폭격!'
  },
  {
    stepIndex: 3,
    title: '3단계: 픽셀 카드 증강 보상 선택',
    instruction: '전투 승리 보상으로 3-카드 선택 화면에서 [폭주 코어]를 획득합니다.',
    actionScript: '증강 [폭주 코어] 선택',
    highlightMessage: 'SYNERGY COMPLETE! [화속성 2종] 시너지 완성!'
  },
  {
    stepIndex: 4,
    title: '4단계: 완성된 시너지 극단 연출',
    instruction: '모은 증강과 시너지가 융합되어 보스를 한 번에 분쇄합니다.',
    actionScript: '시너지 잭팟 스핀 실행',
    forcedResult: {
      actionId: 'bomb',
      targetId: 'pow_20',
      modifierId: 'x5'
    },
    highlightMessage: 'JACKPOT BOMB! [폭주 12 + 위력 20] × 5연타 160 대폭발!'
  }
];
