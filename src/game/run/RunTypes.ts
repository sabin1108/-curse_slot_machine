export type RunStageType = 'combat' | 'elite' | 'rest' | 'shop' | 'event' | 'gate' | 'boss'

export type RewardPolicy = 'starter' | 'support' | 'normal' | 'finisher' | 'none'

export type RunStageDefinition = {
  id: number
  type: RunStageType
  rewardPolicy: RewardPolicy
}

export type RunStatus = 'not_started' | 'active' | 'victory'

export type RunState = {
  status: RunStatus
  currentStage: RunStageDefinition | null
  completedStageIds: number[]
}
