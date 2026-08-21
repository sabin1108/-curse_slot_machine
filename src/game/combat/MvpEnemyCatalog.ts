import type { RunStageType } from '../run/RunTypes'

export type MvpEnemyProfile = {
  stageType: Extract<RunStageType, 'combat' | 'elite' | 'gate' | 'boss'>
  name: string
  maxHealth: number
  attack: number
  phaseTwo?: {
    thresholdHealth: number
    attack: number
  }
}

export const MVP_ENEMY_CATALOG: Record<MvpEnemyProfile['stageType'], MvpEnemyProfile> = {
  combat: { stageType: 'combat', name: 'Cursed Drudge', maxHealth: 18, attack: 4 },
  elite: { stageType: 'elite', name: 'Vault Enforcer', maxHealth: 24, attack: 5 },
  gate: { stageType: 'gate', name: 'Gate Warden', maxHealth: 27, attack: 6 },
  boss: {
    stageType: 'boss',
    name: 'House Sovereign',
    maxHealth: 36,
    attack: 7,
    phaseTwo: { thresholdHealth: 18, attack: 10 },
  },
}

export function getMvpEnemyProfile(stageType: RunStageType): MvpEnemyProfile {
  if (stageType !== 'combat' && stageType !== 'elite' && stageType !== 'gate' && stageType !== 'boss') {
    throw new Error(`stage type ${stageType} does not have an enemy profile`)
  }
  return MVP_ENEMY_CATALOG[stageType]
}
