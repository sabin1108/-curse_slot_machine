import type { EnemyBehaviorState, EnemyIntentType, EnemyRank } from './CombatTypes'

type EnemyIntentProfile = {
  rank: EnemyRank
  pattern: readonly EnemyIntentType[]
  defenseAmount: number
  blockCap: number
}

export const ENEMY_INTENT_PROFILES = {
  normal: {
    rank: 'normal',
    pattern: ['attack', 'wait', 'defend'],
    defenseAmount: 1,
    blockCap: 30,
  },
  elite: {
    rank: 'elite',
    pattern: ['attack', 'defend', 'attack', 'wait'],
    defenseAmount: 2,
    blockCap: 50,
  },
  boss: {
    rank: 'boss',
    pattern: ['attack', 'attack', 'defend', 'attack', 'wait'],
    defenseAmount: 3,
    blockCap: 80,
  },
} as const satisfies Record<EnemyRank, EnemyIntentProfile>

const ENEMY_RANK_BY_ID: Readonly<Record<string, EnemyRank>> = {
  skull_sentinel: 'normal',
  shadow_goblin: 'normal',
  mummy_sorcerer: 'normal',
  ogre_chief: 'elite',
  cursed_knight: 'elite',
  fortress_golem: 'elite',
  house_dealer_boss: 'boss',
}

export function getEnemyIntentProfile(enemyId: string): EnemyIntentProfile {
  return ENEMY_INTENT_PROFILES[ENEMY_RANK_BY_ID[enemyId] ?? 'normal']
}

export function createEnemyBehaviorState(
  rank: EnemyRank = 'normal',
  overrides: Partial<EnemyBehaviorState> = {},
): EnemyBehaviorState {
  const profile = ENEMY_INTENT_PROFILES[rank]
  const requestedPattern = overrides.pattern ?? profile.pattern
  const pattern = requestedPattern.length > 0 ? [...requestedPattern] : [...profile.pattern]

  return {
    rank,
    pattern,
    patternIndex: Math.max(0, Math.min(pattern.length - 1, overrides.patternIndex ?? 0)),
    defenseAmount: Math.max(0, overrides.defenseAmount ?? profile.defenseAmount),
    blockCap: Math.max(0, overrides.blockCap ?? profile.blockCap),
  }
}
