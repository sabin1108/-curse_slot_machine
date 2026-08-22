import { ORIGIN_DEMO_TRACES } from './OriginDemoTraces'

export const MVP_DEMO_SEED = ORIGIN_DEMO_TRACES.GAMBLER.seed
export const MVP_DEMO_COMMANDS = ORIGIN_DEMO_TRACES.GAMBLER.commands
export const MVP_DEMO_REWARD_SETUP_COMMANDS = MVP_DEMO_COMMANDS.slice(0, getFirstRewardCommandIndex())

function getFirstRewardCommandIndex(): number {
  const rewardIndex = MVP_DEMO_COMMANDS.findIndex((command) => command.type === 'CHOOSE_REWARD')
  if (rewardIndex <= 0) throw new Error('MVP demo trace must include a reward choice after setup commands')
  return rewardIndex
}
