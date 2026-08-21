import { describe, expect, it } from 'vitest'
import { MVP_ROUTE, completeCurrentStage, createRunState, enterNextStage } from './RunSystem'

describe('RunSystem', () => {
  it('defines the approved fixed fifteen-stage MVP route', () => {
    expect(MVP_ROUTE.map((stage) => stage.type)).toEqual([
      'combat',
      'combat',
      'rest',
      'shop',
      'combat',
      'event',
      'elite',
      'rest',
      'combat',
      'shop',
      'elite',
      'rest',
      'gate',
      'event',
      'boss',
    ])
  })

  it('enters and completes stages sequentially before ending in victory', () => {
    let run = createRunState()

    for (const expectedStage of MVP_ROUTE) {
      run = enterNextStage(run)
      expect(run.currentStage?.id).toBe(expectedStage.id)
      expect(run.status).toBe('active')
      run = completeCurrentStage(run)
    }

    expect(run.status).toBe('victory')
    expect(run.currentStage).toBeNull()
    expect(run.completedStageIds).toEqual(MVP_ROUTE.map((stage) => stage.id))
  })

  it('does not advance while the current stage is incomplete', () => {
    const entered = enterNextStage(createRunState())

    expect(() => enterNextStage(entered)).toThrow('current stage must be completed before advancing')
  })
})
