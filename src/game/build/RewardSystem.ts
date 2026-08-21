import { DEFAULT_BUILD_CATALOG } from './BuildCatalog'
import { applyReward, hasReward } from './BuildSystem'
import type {
  BuildCatalog,
  BuildRewardDefinition,
  BuildState,
  Rarity,
  RewardKind,
  RewardRef,
  SynergyTag,
} from './BuildTypes'

export type RewardScore = {
  immediatePower: number
  synergyValue: number
  completionValue: number
  futureValue: number
  contentValue: number
  total: number
}

export type RewardOption = RewardRef & {
  name: string
  rarity: Rarity
  tags: SynergyTag[]
  description: string
  effectLabel?: string
  assetKey?: string
  score: RewardScore
}

export type GenerateRewardOptionsConfig = {
  count?: number
  catalog?: BuildCatalog
}

const RARITY_VALUE = {
  common: 1,
  uncommon: 2,
  rare: 3,
  cursed: 3,
  legendary: 4,
} as const satisfies Record<Rarity, number>

export function generateRewardOptions(
  build: BuildState,
  config: GenerateRewardOptionsConfig = {},
): RewardOption[] {
  const catalog = config.catalog ?? DEFAULT_BUILD_CATALOG
  const count = config.count ?? 3

  return catalog.rewards
    .filter((reward) => !hasReward(build, { kind: reward.kind, id: reward.id }))
    .map((reward) => createRewardOption(build, reward, catalog))
    .sort(compareRewardOptions)
    .slice(0, count)
}

function createRewardOption(
  build: BuildState,
  reward: BuildRewardDefinition,
  catalog: BuildCatalog,
): RewardOption {
  const rewardRef = {
    kind: reward.kind,
    id: reward.id,
  }
  const score = scoreReward(build, rewardRef, reward, catalog)

  return {
    ...rewardRef,
    name: reward.name,
    rarity: reward.rarity,
    tags: [...reward.tags],
    description: reward.description,
    effectLabel: reward.effectLabel,
    assetKey: reward.assetKey,
    score,
  }
}

function scoreReward(
  build: BuildState,
  reward: RewardRef,
  definition: BuildRewardDefinition,
  catalog: BuildCatalog,
): RewardScore {
  const result = applyReward(build, reward, catalog)
  const completedNow = result.events.filter((event) => event.type === 'SYNERGY_COMPLETED').length
  const activeBefore = new Set(build.synergies.active.map((synergy) => synergy.synergyId))
  const tierActivatedNow = result.build.synergies.active.filter(
    (synergy) => synergy.synergyId.includes(':') && !activeBefore.has(synergy.synergyId),
  ).length
  const immediatePower = RARITY_VALUE[definition.rarity]
  const synergyValue = getSynergyValue(build, definition, catalog)
  const completionValue = completedNow * 100 + tierActivatedNow * 35
  const futureValue = getFutureValue(build, definition, catalog)
  const contentValue = getContentValue(build, definition)

  return {
    immediatePower,
    synergyValue,
    completionValue,
    futureValue,
    contentValue,
    total: immediatePower + synergyValue + completionValue + futureValue + contentValue,
  }
}

function getContentValue(build: BuildState, reward: BuildRewardDefinition): number {
  return (reward.effects ?? [])
    .filter((effect) => effect.type === 'reward.score.add')
    .filter((effect) => (effect.conditions ?? []).every((condition) => {
      if (condition.type === 'reward.kind_is') return reward.kind === condition.params.kind
      if (condition.type === 'reward.rarity_is') return reward.rarity === condition.params.rarity
      if (condition.type === 'reward.has_tag') return reward.tags.includes(condition.params.tag)
      if (condition.type === 'build.synergy_active') {
        return build.synergies.active.some((synergy) => synergy.synergyId === condition.params.synergyId)
      }
      return false
    }))
    .reduce((sum, effect) => sum + effect.params.amount, 0)
}

function getSynergyValue(
  build: BuildState,
  reward: BuildRewardDefinition,
  catalog: BuildCatalog,
): number {
  return catalog.synergies.reduce((sum, synergy) => {
    const existingProgress = build.synergies.progress.find((progress) => progress.synergyId === synergy.id)

    if (existingProgress?.completed) {
      return sum
    }

    const matchingRequirements = synergy.requiredTags.filter((requirement) => {
      const source = requirement.source ?? 'any'

      return (source === 'any' || source === reward.kind) && reward.tags.includes(requirement.tag)
    })

    if (matchingRequirements.length === 0) {
      return sum
    }

    const remaining = existingProgress
      ? Math.max(0, existingProgress.required - existingProgress.current)
      : synergy.requiredTags.reduce((total, requirement) => total + requirement.count, 0)

    return sum + Math.max(1, 20 - remaining * 4)
  }, 0)
}

function getFutureValue(
  build: BuildState,
  reward: BuildRewardDefinition,
  catalog: BuildCatalog,
): number {
  const ownedTags = new Set(getOwnedTags(build, catalog))
  const newTags = reward.tags.filter((tag) => !ownedTags.has(tag)).length

  return newTags * 2
}

function getOwnedTags(build: BuildState, catalog: BuildCatalog): SynergyTag[] {
  const owned: Array<{ kind: RewardKind; id: string }> = [
    ...build.augments.map((id) => ({ kind: 'augment' as const, id })),
    ...build.items.map((id) => ({ kind: 'item' as const, id })),
  ]

  return owned.flatMap((reward) => {
    const definition = catalog.rewards.find(
      (candidate) => candidate.kind === reward.kind && candidate.id === reward.id,
    )

    return definition?.tags ?? []
  })
}

function compareRewardOptions(a: RewardOption, b: RewardOption): number {
  const scoreDelta = b.score.total - a.score.total

  if (scoreDelta !== 0) {
    return scoreDelta
  }

  const rarityDelta = RARITY_VALUE[b.rarity] - RARITY_VALUE[a.rarity]

  if (rarityDelta !== 0) {
    return rarityDelta
  }

  return a.id.localeCompare(b.id)
}
