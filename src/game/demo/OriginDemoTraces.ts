import type { GameCommand } from '../engine/commands'
import type { OriginId } from '../engine/OriginCatalog'

type TraceToken = string
type OriginDemoTrace = { seed: string; tokens: readonly TraceToken[]; commands: readonly GameCommand[] }

const TRACE_DATA: Record<OriginId, { seed: string; tokens: readonly TraceToken[] }> = {
  SWORDSMAN: {
    seed: 'origin-defense-demo-swordsman-6399',
    tokens: [
      'origin:SWORDSMAN','start','enter','spin','reroll','confirm','spin','reroll','reroll','confirm','reward:cursed_lens','enter','spin','confirm','spin','confirm','reward:safety_valve','enter','rest:purify','enter','leave','enter','spin','confirm','spin','reroll','confirm','reward:debt_collector','enter','event:rest','enter','spin','reroll','reroll','confirm','reward:retaliation_matrix','enter','rest:purify','enter','spin','confirm','spin','confirm','reward:mirror_buckler','enter','leave','enter','spin','confirm','reward:combo_finisher','enter','rest:purify','enter','spin','confirm','reward:hexed_clutch','enter','event:rest','enter','spin','confirm','spin','confirm','spin','reroll','reroll','confirm','spin','confirm',
    ],
  },
  GAMBLER: {
    seed: 'origin-wait-demo-gambler-457',
    tokens: [
      'origin:GAMBLER','start','enter','spin','confirm','spin','reroll','reroll','confirm','reward:cursed_lens','enter','spin','confirm','reward:safety_valve','enter','rest:purify','enter','leave','enter','spin','reroll','reroll','confirm','spin','confirm','spin','reroll','confirm','reward:debt_collector','enter','event:rest','enter','spin','reroll','reroll','confirm','spin','confirm','spin','reroll','reroll','confirm','spin','confirm','reward:retaliation_matrix','enter','rest:purify','enter','spin','confirm','spin','reroll','confirm','reward:mirror_buckler','enter','leave','enter','spin','reroll','confirm','spin','confirm','reward:combo_finisher','enter','rest:purify','enter','spin','reroll','reroll','confirm','spin','confirm','spin','confirm','spin','confirm','reward:ember_magazine','enter','event:rest','enter','spin','confirm','spin','reroll','confirm','spin','reroll','reroll','confirm',
    ],
  },
  PRIEST: {
    seed: 'origin-demo-367',
    tokens: [
      'origin:PRIEST','start','enter','spin','confirm','spin','confirm','reward:combo_starter','enter','spin','confirm','reward:ember_magazine','enter','rest:heal','enter','buy:combo_finisher','leave','enter','spin','reroll','reroll','confirm','spin','confirm','reward:debt_collector','enter','event:reward','reward:mirror_buckler','enter','spin','confirm','spin','confirm','reward:retaliation_matrix','enter','rest:purify','enter','spin','confirm','spin','reroll','confirm','reward:multi_hit_charm','enter','leave','enter','spin','reroll','confirm','reward:black_market_stamp','enter','rest:purify','enter','spin','reroll','confirm','spin','confirm','spin','confirm','spin','confirm','spin','confirm','spin','confirm','reward:safety_valve','enter','event:rest','enter','spin','reroll','confirm','spin','reroll','confirm','spin','confirm','spin','confirm','spin','confirm',
    ],
  },
}

export const ORIGIN_DEMO_TRACES: Record<OriginId, OriginDemoTrace> = {
  SWORDSMAN: createTrace('SWORDSMAN'),
  GAMBLER: createTrace('GAMBLER'),
  PRIEST: createTrace('PRIEST'),
}

function createTrace(origin: OriginId): OriginDemoTrace {
  const trace = TRACE_DATA[origin]
  return { ...trace, commands: trace.tokens.map(parseToken) }
}

function parseToken(token: TraceToken): GameCommand {
  const [kind, value] = token.split(':', 2)
  if (kind === 'origin') return { type: 'SELECT_ORIGIN', originId: value as OriginId }
  if (kind === 'lock') return { type: 'TOGGLE_REEL_LOCK', reel: value as 'action' | 'target' | 'modifier' }
  if (kind === 'reward') return { type: 'CHOOSE_REWARD', rewardId: value }
  if (kind === 'buy') return { type: 'BUY_SHOP_ITEM', rewardId: value }
  if (kind === 'rest') return { type: 'RESOLVE_REST', action: value as 'heal' | 'purify' }
  if (kind === 'event') return { type: 'RESOLVE_EVENT', choice: value as 'reward' | 'gold' | 'rest' | 'skip' }
  const commands: Record<string, GameCommand> = {
    start: { type: 'START_RUN' }, enter: { type: 'ENTER_NEXT_STAGE' }, spin: { type: 'SPIN_COMBAT_SLOT' },
    reroll: { type: 'REROLL_UNLOCKED' }, confirm: { type: 'CONFIRM_COMBAT_SLOT' }, leave: { type: 'LEAVE_SHOP' },
  }
  const command = commands[token]
  if (!command) throw new Error(`Unknown origin demo token: ${token}`)
  return command
}
