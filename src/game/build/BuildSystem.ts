import { DEFAULT_BUILD_CATALOG } from './BuildCatalog'
import type {
  ActiveSynergy,
  ApplyRewardResult,
  BuildCatalog,
  BuildEvent,
  BuildRewardDefinition,
  BuildState,
  BuildStateOverrides,
  RewardKind,
  RewardRef,
  SynergyDefinition,
  SynergyRequirement,
  SynergyState,
  SynergyTag,
} from './BuildTypes'
import type { EffectDefinition } from '../effects/EffectTypes'

export function createBuildState(overrides: BuildStateOverrides = {}): BuildState {
  const rewards = {
    augments: [...(overrides.augments ?? [])],
    items: [...(overrides.items ?? [])],
  }
  const synergies = evaluateSynergies(rewards, DEFAULT_BUILD_CATALOG)

  return {
    augments: [...rewards.augments],
    items: [...rewards.items],
    synergies: overrides.synergies
      ? {
          active: overrides.synergies.active ?? synergies.active,
          progress: overrides.synergies.progress ?? synergies.progress,
          completed: overrides.synergies.completed ?? synergies.completed,
        }
      : synergies,
  }
}

export function evaluateSynergies(
  build: Pick<BuildState, 'augments' | 'items'>,
  catalog: BuildCatalog = DEFAULT_BUILD_CATALOG,
): SynergyState {
  const active: ActiveSynergy[] = []
  const progress = catalog.synergies.map((synergy) => {
    const requirementProgress = synergy.requiredTags.map((requirement) =>
      getRequirementProgress(requirement, build, catalog),
    )
    const current = requirementProgress.reduce((sum, value) => sum + value, 0)
    const required = synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0)
    const completed = requirementProgress.every(
      (value, index) => value >= synergy.requiredTags[index].count,
    )

    if (completed) {
      active.push({
        synergyId: synergy.id,
        name: synergy.name,
        effectId: synergy.effectId ?? '',
      })
    }

    const tierProgress = getTierProgress(synergy, build, catalog)
    for (const tier of synergy.tiers ?? []) {
      if (tierProgress >= tier.count) {
        active.push({
          synergyId: `${synergy.id}:${tier.id}`,
          name: `${synergy.name} ${tier.name}`,
          effectId: tier.effectLabel,
          tier: tier.count,
        })
      }
    }

    return {
      synergyId: synergy.id,
      current,
      required,
      completed,
    }
  })

  return {
    active,
    progress,
    completed: progress
      .filter((synergy) => synergy.completed)
      .map((synergy) => synergy.synergyId),
  }
}

export function applyReward(
  build: BuildState,
  reward: RewardRef,
  catalog: BuildCatalog = DEFAULT_BUILD_CATALOG,
): ApplyRewardResult {
  if (hasReward(build, reward)) {
    return {
      build: cloneBuildState(build),
      events: [
        {
          type: 'REWARD_ALREADY_OWNED',
          reward,
        },
      ],
    }
  }

  const nextBuild = {
    augments: reward.kind === 'augment' ? [...build.augments, reward.id] : [...build.augments],
    items: reward.kind === 'item' ? [...build.items, reward.id] : [...build.items],
    synergies: createEmptySynergyState(),
  }
  const synergies = evaluateSynergies(nextBuild, catalog)
  const evaluated = {
    ...nextBuild,
    synergies,
  }
  const previousCompleted = new Set(build.synergies.completed)
  const events: BuildEvent[] = [
    {
      type: 'REWARD_ADDED',
      reward,
    },
  ]

  for (const synergyId of synergies.completed) {
    if (!previousCompleted.has(synergyId)) {
      events.push({
        type: 'SYNERGY_COMPLETED',
        synergyId,
      })
    }
  }

  return {
    build: evaluated,
    events,
  }
}

export function getRewardDefinition(
  catalog: BuildCatalog,
  reward: RewardRef,
): BuildRewardDefinition | undefined {
  return catalog.rewards.find((definition) => definition.id === reward.id && definition.kind === reward.kind)
}

export function hasReward(build: Pick<BuildState, 'augments' | 'items'>, reward: RewardRef): boolean {
  return reward.kind === 'augment'
    ? build.augments.includes(reward.id)
    : build.items.includes(reward.id)
}

export function getActiveEffects(
  build: Pick<BuildState, 'augments' | 'items'>,
  catalog: BuildCatalog = DEFAULT_BUILD_CATALOG,
): EffectDefinition[] {
  const ownedRewardEffects = getOwnedRewardDefinitions(build, catalog).flatMap(
    (reward) => reward.effects ?? [],
  )
  const synergies = evaluateSynergies(build, catalog)
  const completedSynergyEffects = catalog.synergies
    .filter((synergy) => synergies.completed.includes(synergy.id))
    .flatMap((synergy) => synergy.effects ?? [])
  const tierSynergyEffects = catalog.synergies.flatMap((synergy) => {
    const tierProgress = getTierProgress(synergy, build, catalog)

    return (synergy.tiers ?? [])
      .filter((tier) => tierProgress >= tier.count)
      .flatMap((tier) => tier.effects)
  })

  return [...ownedRewardEffects, ...completedSynergyEffects, ...tierSynergyEffects]
}

function getRequirementProgress(
  requirement: SynergyRequirement,
  build: Pick<BuildState, 'augments' | 'items'>,
  catalog: BuildCatalog,
): number {
  const matchingRewards = getOwnedRewardDefinitions(build, catalog).filter((reward) => {
    const source = requirement.source ?? 'any'

    return (source === 'any' || reward.kind === source) && reward.tags.includes(requirement.tag)
  })

  return Math.min(requirement.count, matchingRewards.length)
}

function getTierProgress(
  synergy: Pick<SynergyDefinition, 'requiredTags' | 'tierTag'>,
  build: Pick<BuildState, 'augments' | 'items'>,
  catalog: BuildCatalog,
): number {
  const tierTag = synergy.tierTag ?? synergy.requiredTags[0]?.tag
  if (!tierTag) return 0

  return getOwnedRewardDefinitions(build, catalog).filter((reward) => reward.tags.includes(tierTag)).length
}

function getOwnedRewardDefinitions(
  build: Pick<BuildState, 'augments' | 'items'>,
  catalog: BuildCatalog,
): BuildRewardDefinition[] {
  const owned = [
    ...build.augments.map((id) => ({ kind: 'augment' as const, id })),
    ...build.items.map((id) => ({ kind: 'item' as const, id })),
  ]

  return owned.flatMap((reward) => {
    const definition = getRewardDefinition(catalog, reward)

    return definition ? [definition] : []
  })
}

function createEmptySynergyState(): SynergyState {
  return {
    active: [],
    progress: [],
    completed: [],
  }
}

function cloneBuildState(build: BuildState): BuildState {
  return {
    augments: [...build.augments],
    items: [...build.items],
    synergies: {
      active: build.synergies.active.map((synergy) => ({ ...synergy })),
      progress: build.synergies.progress.map((progress) => ({ ...progress })),
      completed: [...build.synergies.completed],
    },
  }
}
