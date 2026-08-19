export type SynergyTag =
  | 'COMBO'
  | 'MULTI_HIT'
  | 'CRITICAL'
  | 'BURN'
  | 'DEFENSE'
  | 'CURSE'
  | 'RISK'
  | 'RESOURCE'

export type RewardKind = 'augment' | 'item'

export type RewardRef = {
  kind: RewardKind
  id: string
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'cursed' | 'legendary'

export type BuildRewardDefinition = {
  id: string
  kind: RewardKind
  name: string
  rarity: Rarity
  tags: SynergyTag[]
  effectId: string
  description: string
}

export type SynergyRequirement = {
  tag: SynergyTag
  count: number
  source?: RewardKind | 'any'
}

export type SynergyDefinition = {
  id: string
  name: string
  description: string
  requiredTags: SynergyRequirement[]
  effectId: string
}

export type SynergyProgress = {
  synergyId: string
  current: number
  required: number
  completed: boolean
}

export type ActiveSynergy = {
  synergyId: string
  name: string
  effectId: string
}

export type SynergyState = {
  active: ActiveSynergy[]
  progress: SynergyProgress[]
  completed: string[]
}

export type BuildState = {
  augments: string[]
  items: string[]
  synergies: SynergyState
}

export type BuildCatalog = {
  rewards: BuildRewardDefinition[]
  synergies: SynergyDefinition[]
}

export type BuildStateOverrides = {
  augments?: string[]
  items?: string[]
  synergies?: Partial<SynergyState>
}

export type BuildEvent =
  | {
      type: 'REWARD_ADDED'
      reward: RewardRef
    }
  | {
      type: 'REWARD_ALREADY_OWNED'
      reward: RewardRef
    }
  | {
      type: 'SYNERGY_COMPLETED'
      synergyId: string
    }

export type ApplyRewardResult = {
  build: BuildState
  events: BuildEvent[]
}
