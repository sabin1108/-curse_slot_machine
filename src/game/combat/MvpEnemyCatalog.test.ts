import { describe, expect, it } from 'vitest'

import { getMvpEnemyEncounterProfile, MVP_ENEMY_CATALOG, validateMvpEnemyCatalog } from './MvpEnemyCatalog'

describe('MVP enemy catalog', () => {
  it('validates the shipped enemy intent patterns', () => {
    expect(() => validateMvpEnemyCatalog(MVP_ENEMY_CATALOG)).not.toThrow()
  })

  it('rejects empty enemy intent patterns', () => {
    expect(() => validateMvpEnemyCatalog({
      ...MVP_ENEMY_CATALOG,
      combat: { ...MVP_ENEMY_CATALOG.combat, intentPattern: [] as never },
    })).toThrow('combat enemy intent pattern must not be empty')
  })

  it('rejects non-defense pattern amounts', () => {
    expect(() => validateMvpEnemyCatalog({
      ...MVP_ENEMY_CATALOG,
      elite: {
        ...MVP_ENEMY_CATALOG.elite,
        intentPattern: [{ type: 'attack', amount: 2 }] as never,
      },
    })).toThrow('elite enemy intent pattern step 0 cannot assign amount to attack')
  })

  it('scales later encounters around completed synergy power spikes', () => {
    expect(getMvpEnemyEncounterProfile({ id: 1, type: 'combat', rewardPolicy: 'starter' })).toMatchObject({
      maxHealth: 18,
      attack: 4,
    })
    expect(getMvpEnemyEncounterProfile({ id: 9, type: 'combat', rewardPolicy: 'normal' })).toMatchObject({
      maxHealth: 28,
      attack: 6,
      intentPattern: [{ type: 'attack' }, { type: 'defend', amount: 2 }, { type: 'attack' }, { type: 'wait' }],
    })
    expect(getMvpEnemyEncounterProfile({ id: 15, type: 'boss', rewardPolicy: 'none' })).toMatchObject({
      maxHealth: 46,
      attack: 8,
      phaseTwo: { thresholdHealth: 23, attack: 11 },
    })
  })
})
