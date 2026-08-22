import { describe, expect, it } from 'vitest'

import { MVP_ENEMY_CATALOG, validateMvpEnemyCatalog } from './MvpEnemyCatalog'

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
})
