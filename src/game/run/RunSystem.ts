import type { RunStageDefinition, RunState } from './RunTypes'

export const MVP_ROUTE: readonly RunStageDefinition[] = [
  { id: 1, type: 'combat', rewardPolicy: 'starter' },
  { id: 2, type: 'combat', rewardPolicy: 'support' },
  { id: 3, type: 'rest', rewardPolicy: 'none' },
  { id: 4, type: 'shop', rewardPolicy: 'none' },
  { id: 5, type: 'combat', rewardPolicy: 'finisher' },
  { id: 6, type: 'event', rewardPolicy: 'normal' },
  { id: 7, type: 'elite', rewardPolicy: 'finisher' },
  { id: 8, type: 'rest', rewardPolicy: 'none' },
  { id: 9, type: 'combat', rewardPolicy: 'normal' },
  { id: 10, type: 'shop', rewardPolicy: 'none' },
  { id: 11, type: 'elite', rewardPolicy: 'finisher' },
  { id: 12, type: 'rest', rewardPolicy: 'none' },
  { id: 13, type: 'gate', rewardPolicy: 'normal' },
  { id: 14, type: 'event', rewardPolicy: 'normal' },
  { id: 15, type: 'boss', rewardPolicy: 'none' },
]

export function createRunState(): RunState {
  return {
    status: 'not_started',
    currentStage: null,
    completedStageIds: [],
  }
}

export function enterNextStage(run: RunState): RunState {
  if (run.status === 'victory') {
    return cloneRunState(run)
  }

  if (run.currentStage) {
    throw new Error('current stage must be completed before advancing')
  }

  const nextStage = getNextStage(run)
  if (!nextStage) {
    return {
      ...cloneRunState(run),
      status: 'victory',
    }
  }

  return {
    ...cloneRunState(run),
    status: 'active',
    currentStage: { ...nextStage },
  }
}

export function completeCurrentStage(run: RunState): RunState {
  if (!run.currentStage) {
    throw new Error('no current stage to complete')
  }

  const completedStageIds = [...run.completedStageIds, run.currentStage.id]
  return {
    status: completedStageIds.length === MVP_ROUTE.length ? 'victory' : 'active',
    currentStage: null,
    completedStageIds,
  }
}

export function getNextStage(run: RunState): RunStageDefinition | null {
  if (run.currentStage || run.status === 'victory') return null
  return MVP_ROUTE[run.completedStageIds.length] ?? null
}

function cloneRunState(run: RunState): RunState {
  return {
    ...run,
    currentStage: run.currentStage ? { ...run.currentStage } : null,
    completedStageIds: [...run.completedStageIds],
  }
}
