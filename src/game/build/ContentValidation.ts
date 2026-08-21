import type { EffectDefinition } from '../effects/EffectTypes'
import type { BuildCatalog } from './BuildTypes'

const CONTENT_ID = /^[a-z][a-z0-9_]{1,47}$/

function assertRange(label: string, value: number, minimum: number, maximum: number): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}`)
  }
}

function validateEffect(effect: EffectDefinition): void {
  if (!CONTENT_ID.test(effect.id)) throw new Error(`invalid effect id: ${effect.id}`)
  if ((effect.conditions?.length ?? 0) > 3) throw new Error(`${effect.id}: effects support at most 3 conditions`)

  switch (effect.type) {
    case 'combat.action_amount.add':
    case 'combat.full_block.retaliate':
      assertRange(`${effect.id}: amount`, effect.params.amount, 1, 20)
      break
    case 'combat.action_amount.add_pct':
      assertRange(`${effect.id}: percent`, effect.params.percent, 5, 200)
      break
    case 'combat.bullet.extra_hit':
    case 'combat.status.consume_extra_hit':
      assertRange(`${effect.id}: percent`, effect.params.percent, 25, 100)
      break
    case 'combat.curse_gain.add':
    case 'reward.score.add':
      assertRange(`${effect.id}: amount`, effect.params.amount, -50, 50)
      break
    case 'combat.status.apply':
    case 'combat.extra_hit.status_apply':
    case 'combat.retaliation.status_apply':
    case 'reroll.status.add':
      assertRange(`${effect.id}: stacks`, effect.params.stacks, 1, 3)
      break
    case 'rest.purify.arm_shop_discount':
      assertRange(`${effect.id}: discountPercent`, effect.params.discountPercent, 0, 50)
      assertRange(`${effect.id}: purchaseCurseReduction`, effect.params.purchaseCurseReduction, 0, 3)
      break
    case 'combat.full_block.curse_prevent':
    case 'combat.modifier.step_up':
    case 'combat.curse_gain.prevent_once':
      break
  }
}

function assertUniqueIds(kind: string, ids: string[]): void {
  const seen = new Set<string>()
  for (const id of ids) {
    if (!CONTENT_ID.test(id)) throw new Error(`invalid ${kind} id: ${id}`)
    if (seen.has(id)) throw new Error(`duplicate ${kind} id: ${id}`)
    seen.add(id)
  }
}

export function validateBuildCatalog(catalog: BuildCatalog): void {
  assertUniqueIds('reward', catalog.rewards.map((reward) => reward.id))
  assertUniqueIds('synergy', catalog.synergies.map((synergy) => synergy.id))

  for (const reward of catalog.rewards) {
    if (new Set(reward.tags).size !== reward.tags.length) throw new Error(`${reward.id}: duplicate tag`)
    const effects = reward.effects ?? []
    if (effects.length < 1 || effects.length > 3) throw new Error(`${reward.id}: rewards require 1 to 3 effects`)
    assertUniqueIds('effect', effects.map((effect) => effect.id))
    effects.forEach(validateEffect)
  }

  for (const synergy of catalog.synergies) {
    if (synergy.requiredTags.length < 1 || synergy.requiredTags.length > 3) {
      throw new Error(`${synergy.id}: synergies require 1 to 3 tag requirements`)
    }
    const requirements = synergy.requiredTags.map(({ tag, source = 'any' }) => `${tag}:${source}`)
    if (new Set(requirements).size !== requirements.length) throw new Error(`${synergy.id}: duplicate tag requirement`)
    synergy.requiredTags.forEach((requirement) => assertRange(`${synergy.id}: count`, requirement.count, 1, 3))
    const effects = [...(synergy.effects ?? []), ...(synergy.tiers ?? []).flatMap((tier) => tier.effects)]
    assertUniqueIds('effect', effects.map((effect) => effect.id))
    effects.forEach(validateEffect)
  }
}
