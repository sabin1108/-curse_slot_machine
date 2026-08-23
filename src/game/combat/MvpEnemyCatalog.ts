import type { RunStageDefinition, RunStageType } from '../run/RunTypes'
import type { EnemyIntentPattern } from './CombatTypes'

export type MvpEnemyProfile = {
  stageType: Extract<RunStageType, 'combat' | 'elite' | 'gate' | 'boss'>
  name: string
  maxHealth: number
  attack: number
  intentPattern: EnemyIntentPattern
  phaseTwo?: {
    thresholdHealth: number
    attack: number
  }
}

export type MvpEnemyEncounterProfile = MvpEnemyProfile & {
  stageId: number
}

export const MVP_ENEMY_CATALOG: Record<MvpEnemyProfile['stageType'], MvpEnemyProfile> = {
  combat: {
    stageType: 'combat',
    name: 'Cursed Drudge',
    maxHealth: 18,
    attack: 4,
    intentPattern: [{ type: 'attack' }, { type: 'wait' }, { type: 'defend', amount: 1 }],
  },
  elite: {
    stageType: 'elite',
    name: 'Vault Enforcer',
    maxHealth: 24,
    attack: 5,
    intentPattern: [{ type: 'attack' }, { type: 'wait' }, { type: 'attack' }, { type: 'defend', amount: 1 }],
  },
  gate: {
    stageType: 'gate',
    name: 'Gate Warden',
    maxHealth: 27,
    attack: 6,
    intentPattern: [{ type: 'attack' }, { type: 'wait' }, { type: 'defend', amount: 1 }, { type: 'wait' }],
  },
  boss: {
    stageType: 'boss',
    name: 'House Sovereign',
    maxHealth: 36,
    attack: 7,
    intentPattern: [{ type: 'attack' }, { type: 'wait' }, { type: 'defend', amount: 1 }, { type: 'attack' }],
    phaseTwo: { thresholdHealth: 18, attack: 10 },
  },
}

validateMvpEnemyCatalog(MVP_ENEMY_CATALOG)

export function getMvpEnemyProfile(stageType: RunStageType): MvpEnemyProfile {
  if (stageType !== 'combat' && stageType !== 'elite' && stageType !== 'gate' && stageType !== 'boss') {
    throw new Error(`stage type ${stageType} does not have an enemy profile`)
  }
  return MVP_ENEMY_CATALOG[stageType]
}

export function getMvpEnemyEncounterProfile(stage: RunStageDefinition): MvpEnemyEncounterProfile {
  const profile = getMvpEnemyProfile(stage.type)
  const tuning = getStageTuning(stage)
  const maxHealth = profile.maxHealth + tuning.healthBonus
  const attack = profile.attack + tuning.attackBonus

  return {
    ...profile,
    stageId: stage.id,
    maxHealth,
    attack,
    intentPattern: tuning.intentPattern ?? profile.intentPattern,
    ...(profile.phaseTwo ? {
      phaseTwo: {
        thresholdHealth: Math.ceil(maxHealth / 2),
        attack: profile.phaseTwo.attack + tuning.phaseTwoAttackBonus,
      },
    } : {}),
  }
}

function getStageTuning(stage: RunStageDefinition): {
  healthBonus: number
  attackBonus: number
  phaseTwoAttackBonus: number
  intentPattern?: EnemyIntentPattern
} {
  switch (stage.id) {
    case 5:
      return {
        healthBonus: 4,
        attackBonus: 1,
        phaseTwoAttackBonus: 0,
        intentPattern: [{ type: 'attack' }, { type: 'wait' }, { type: 'attack' }, { type: 'defend', amount: 1 }],
      }
    case 7:
      return {
        healthBonus: 6,
        attackBonus: 1,
        phaseTwoAttackBonus: 0,
      }
    case 9:
      return {
        healthBonus: 10,
        attackBonus: 2,
        phaseTwoAttackBonus: 0,
        intentPattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'attack' }, { type: 'wait' }],
      }
    case 11:
      return {
        healthBonus: 12,
        attackBonus: 3,
        phaseTwoAttackBonus: 0,
        intentPattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'attack' }, { type: 'attack' }, { type: 'wait' }],
      }
    case 13:
      return {
        healthBonus: 12,
        attackBonus: 2,
        phaseTwoAttackBonus: 0,
        intentPattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'attack' }, { type: 'wait' }],
      }
    case 15:
      return {
        healthBonus: 10,
        attackBonus: 1,
        phaseTwoAttackBonus: 1,
        intentPattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'attack' }, { type: 'wait' }, { type: 'attack' }],
      }
    default:
      return { healthBonus: 0, attackBonus: 0, phaseTwoAttackBonus: 0 }
  }
}

export function validateMvpEnemyCatalog(catalog: Record<MvpEnemyProfile['stageType'], MvpEnemyProfile>): void {
  for (const profile of Object.values(catalog)) {
    if (profile.intentPattern.length === 0) {
      throw new Error(`${profile.stageType} enemy intent pattern must not be empty`)
    }

    profile.intentPattern.forEach((step, index) => {
      if (step.type !== 'defend' && 'amount' in step && step.amount !== undefined) {
        throw new Error(`${profile.stageType} enemy intent pattern step ${index} cannot assign amount to ${step.type}`)
      }

      if (step.type === 'defend' && step.amount !== undefined && (!Number.isInteger(step.amount) || step.amount <= 0)) {
        throw new Error(`${profile.stageType} enemy defend pattern step ${index} must use a positive integer amount`)
      }
    })
  }
}
