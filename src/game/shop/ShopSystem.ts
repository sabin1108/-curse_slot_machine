import { DEFAULT_BUILD_CATALOG } from '../build/BuildCatalog'
import type { BuildState } from '../build/BuildTypes'
import type { ShopOffer, ShopState } from './ShopTypes'

const SHOP_ITEM_IDS = new Set([
  'multi_hit_charm',
  'echo_trigger',
  'ash_powder',
  'wildfire_contract',
  'mirror_buckler',
  'fortress_oath',
  'cursed_lens',
  'hex_battery',
  'red_coin',
  'green_vial',
  'lucky_receipt',
  'loaded_multiplier',
  'limit_breaker',
  'royal_joker',
  'black_candle',
  'panic_button',
])

export function createShopState(): ShopState {
  return { offers: [] }
}

export function generateShopOffers(
  build: Pick<BuildState, 'items'>,
  nextInt: (maxExclusive: number) => number,
  count = 4,
): ShopOffer[] {
  const candidates = DEFAULT_BUILD_CATALOG.rewards
    .filter((reward) => reward.kind === 'item' && SHOP_ITEM_IDS.has(reward.id) && !build.items.includes(reward.id))
    .map((reward) => ({
      id: reward.id,
      price: getShopPrice(reward.rarity),
      purchased: false,
    }))

  const offerCount = Math.min(count, candidates.length)
  for (let index = 0; index < offerCount; index += 1) {
    const remaining = candidates.length - index
    const offset = nextInt(remaining)
    if (!Number.isInteger(offset) || offset < 0 || offset >= remaining) {
      throw new Error('nextInt returned an out-of-range shop index')
    }
    const selectedIndex = index + offset
    ;[candidates[index], candidates[selectedIndex]] = [candidates[selectedIndex], candidates[index]]
  }

  return candidates.slice(0, offerCount)
}

function getShopPrice(rarity: string): number {
  if (rarity === 'legendary' || rarity === 'cursed') return 220
  if (rarity === 'rare') return 160
  if (rarity === 'uncommon') return 120
  return 90
}
