import { build } from 'esbuild'

async function loadCatalogApi() {
  const source = [
    'export { MVP_BUILD_CATALOG, MVP_REWARD_IDS } from "./src/game/build/MvpBuildCatalog.ts"',
    'export { generateMvpRewardOptions } from "./src/game/build/MvpRewardSystem.ts"',
    'export { createBuildState, applyReward } from "./src/game/build/BuildSystem.ts"',
  ].join(';')
  const result = await build({
    stdin: { contents: source, resolveDir: process.cwd(), sourcefile: 'catalog-lint-entry.ts' },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  })
  const encoded = Buffer.from(result.outputFiles[0].text).toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

function addRewards(api, mask) {
  let state = api.createBuildState({}, api.MVP_BUILD_CATALOG)
  for (let index = 0; index < api.MVP_REWARD_IDS.length; index += 1) {
    if ((mask & (1 << index)) === 0) continue
    const definition = api.MVP_BUILD_CATALOG.rewards.find(
      (reward) => reward.id === api.MVP_REWARD_IDS[index],
    )
    state = api.applyReward(
      state,
      { kind: definition.kind, id: definition.id },
      api.MVP_BUILD_CATALOG,
    ).build
  }
  return state
}

function getShopOffers(catalog, state) {
  return catalog.rewards
    .filter((reward) => !state[`${reward.kind}s`].includes(reward.id))
    .slice(0, 6)
}

const api = await loadCatalogApi()
const policies = ['starter', 'support', 'normal', 'finisher']
const reached = Object.fromEntries([...policies, 'shop'].map((channel) => [channel, new Set()]))
const minimumOptions = Object.fromEntries([...policies, 'shop'].map((channel) => [channel, Infinity]))
const minimumOptionsWithThreeUnowned = Object.fromEntries(
  [...policies, 'shop'].map((channel) => [channel, Infinity]),
)
const buildCount = 1 << api.MVP_REWARD_IDS.length

for (let mask = 0; mask < buildCount; mask += 1) {
  const state = addRewards(api, mask)
  const unownedCount = api.MVP_REWARD_IDS.length - state.augments.length - state.items.length
  for (const policy of policies) {
    const options = api.generateMvpRewardOptions(state, policy)
    minimumOptions[policy] = Math.min(minimumOptions[policy], options.length)
    if (unownedCount >= 3) {
      minimumOptionsWithThreeUnowned[policy] = Math.min(
        minimumOptionsWithThreeUnowned[policy],
        options.length,
      )
    }
    options.forEach((reward) => reached[policy].add(reward.id))
  }
  const shop = getShopOffers(api.MVP_BUILD_CATALOG, state)
  minimumOptions.shop = Math.min(minimumOptions.shop, shop.length)
  if (unownedCount >= 3) {
    minimumOptionsWithThreeUnowned.shop = Math.min(minimumOptionsWithThreeUnowned.shop, shop.length)
  }
  shop.forEach((reward) => reached.shop.add(reward.id))
}

const synergyRequirements = api.MVP_BUILD_CATALOG.synergies.flatMap((synergy) =>
  synergy.requiredTags.map((requirement) => {
    const available = api.MVP_BUILD_CATALOG.rewards.filter(
      (reward) => reward.tags.includes(requirement.tag)
        && (requirement.source === 'any' || reward.kind === requirement.source),
    ).length
    return {
      synergyId: synergy.id,
      tag: requirement.tag,
      source: requirement.source ?? 'any',
      required: requirement.count,
      available,
      satisfiable: available >= requirement.count,
    }
  }),
)

const allReached = new Set(Object.values(reached).flatMap((ids) => [...ids]))
const unreachableRewardIds = api.MVP_REWARD_IDS.filter((id) => !allReached.has(id))
const unsatisfiedSynergies = synergyRequirements.filter((requirement) => !requirement.satisfiable)
const output = {
  schemaVersion: 1,
  catalog: {
    rewards: api.MVP_BUILD_CATALOG.rewards.length,
    synergies: api.MVP_BUILD_CATALOG.synergies.length,
    ownershipSubsetsChecked: buildCount,
  },
  reachableByChannel: Object.fromEntries(
    Object.entries(reached).map(([channel, ids]) => [channel, [...ids].sort()]),
  ),
  minimumOptions,
  minimumOptionsWithThreeUnowned,
  unreachableRewardIds,
  synergyRequirements,
  reachabilityValid: unreachableRewardIds.length === 0 && unsatisfiedSynergies.length === 0,
  limitations: [
    'Description accuracy, engine content-ID branches, and validator/schema parity require manual inspection.',
    'Minimum option counts include complete builds where no unowned reward remains.',
    'Ownership-subset reachability does not prove acquisition through the ordered 15-stage route.',
  ],
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
if (!output.reachabilityValid) process.exitCode = 2
