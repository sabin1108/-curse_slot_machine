import { describe, expect, it } from 'vitest'
import { MVP_BUILD_CATALOG } from './MvpBuildCatalog'
import { validateBuildCatalog } from './ContentValidation'
import type { BuildCatalog } from './BuildTypes'

describe('ContentValidation', () => {
  it('accepts the authored MVP catalog', () => {
    expect(() => validateBuildCatalog(MVP_BUILD_CATALOG)).not.toThrow()
  })

  it('rejects duplicate reward ids and out-of-range effect values', () => {
    const duplicate: BuildCatalog = {
      rewards: [MVP_BUILD_CATALOG.rewards[0], { ...MVP_BUILD_CATALOG.rewards[0] }],
      synergies: [],
    }
    expect(() => validateBuildCatalog(duplicate)).toThrow('duplicate reward id')

    const invalid = structuredClone(MVP_BUILD_CATALOG)
    invalid.rewards[0].effects = [{
      id: 'invalid_percent',
      type: 'combat.action_amount.add_pct',
      params: { action: 'bullet', percent: 201 },
    }]
    expect(() => validateBuildCatalog(invalid)).toThrow('percent must be between 5 and 200')
  })
})
