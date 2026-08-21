import type { BuildState } from './BuildTypes'
import type { RewardPolicy } from '../run/RunTypes'
import { generateRewardOptions, type RewardOption } from './RewardSystem'
import { MVP_BUILD_CATALOG } from './MvpBuildCatalog'

const STARTERS = new Set(['combo_starter', 'guard_core', 'cursed_lens'])
const FINISHERS = new Set(['combo_finisher', 'retaliation_matrix', 'debt_collector'])

export function generateMvpRewardOptions(build: BuildState, policy: RewardPolicy): RewardOption[] {
  if (policy === 'none') return []
  if (policy === 'starter') return generateFrom(build, (id) => STARTERS.has(id), 3)
  if (policy === 'support') return generateFrom(build, (id) => !FINISHERS.has(id), 3)
  if (policy === 'finisher') {
    const finisher = generateFrom(build, (id) => FINISHERS.has(id), 1)
    const support = generateFrom(build, (id) => !FINISHERS.has(id), 3)
    return [...finisher, ...support.filter((option) => !finisher.some((item) => item.id === option.id))].slice(0, 3)
  }
  return generateFrom(build, () => true, 3)
}

function generateFrom(build: BuildState, include: (id: string) => boolean, count: number): RewardOption[] {
  return generateRewardOptions(build, {
    count,
    catalog: {
      ...MVP_BUILD_CATALOG,
      rewards: MVP_BUILD_CATALOG.rewards.filter((reward) => include(reward.id)),
    },
  })
}
