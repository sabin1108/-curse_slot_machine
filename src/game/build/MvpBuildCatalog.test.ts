import { describe, expect, it } from 'vitest'
import { applyReward, createBuildState } from './BuildSystem'
import { MVP_BUILD_CATALOG, MVP_REWARD_IDS } from './MvpBuildCatalog'
import { generateMvpRewardOptions } from './MvpRewardSystem'

describe('MVP build catalog', () => {
  it('contains exactly the approved thirteen functional rewards', () => {
    expect(MVP_BUILD_CATALOG.rewards.map((reward) => reward.id)).toEqual(MVP_REWARD_IDS)
    expect(MVP_BUILD_CATALOG.rewards).toHaveLength(13)
    expect(MVP_BUILD_CATALOG.rewards.every((reward) => (reward.effects?.length ?? 0) > 0)).toBe(true)
  })

  it('does not complete House Credit from cursed_lens alone', () => {
    const result = applyReward(
      createBuildState(),
      { kind: 'item', id: 'cursed_lens' },
      MVP_BUILD_CATALOG,
    )

    expect(result.build.synergies.completed).not.toContain('house_credit')
  })

  it('gates starters, support pieces, and finishers by stage reward policy', () => {
    const build = createBuildState()
    const starters = generateMvpRewardOptions(build, 'starter')
    const support = generateMvpRewardOptions(build, 'support')
    const finishers = generateMvpRewardOptions(build, 'finisher')

    expect(starters.every((option) => ['combo_starter', 'guard_core', 'cursed_lens'].includes(option.id))).toBe(true)
    expect(support.some((option) => option.id === 'combo_finisher')).toBe(false)
    expect(finishers.some((option) => ['combo_finisher', 'retaliation_matrix', 'debt_collector'].includes(option.id))).toBe(true)
  })
})
