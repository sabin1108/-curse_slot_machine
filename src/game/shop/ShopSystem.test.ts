import { describe, expect, it } from 'vitest'
import { createBuildState } from '../build/BuildSystem'
import { createSeededRng } from '../engine/rng'
import { generateShopOffers } from './ShopSystem'

describe('ShopSystem', () => {
  it('generates stable unique offers for the same seed', () => {
    const firstRng = createSeededRng('shop-seed:shop')
    const secondRng = createSeededRng('shop-seed:shop')

    const first = generateShopOffers(createBuildState(), (maxExclusive) => firstRng.nextInt(maxExclusive))
    const second = generateShopOffers(createBuildState(), (maxExclusive) => secondRng.nextInt(maxExclusive))

    expect(first).toEqual(second)
    expect(first).toHaveLength(4)
    expect(new Set(first.map((offer) => offer.id)).size).toBe(4)
    expect(first.every((offer) => offer.price > 0 && offer.purchased === false)).toBe(true)
  })

  it('does not offer items that the build already owns', () => {
    const rng = createSeededRng('owned-shop:shop')
    const offers = generateShopOffers(
      createBuildState({ items: ['multi_hit_charm', 'echo_trigger'] }),
      (maxExclusive) => rng.nextInt(maxExclusive),
    )

    expect(offers.map((offer) => offer.id)).not.toContain('multi_hit_charm')
    expect(offers.map((offer) => offer.id)).not.toContain('echo_trigger')
  })
})
