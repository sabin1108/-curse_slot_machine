import type {
  AugmentItem,
  ReelSymbol,
  SlotResult,
  SynergyProgress as UiSynergyProgress,
} from '../../types/game'
import { ACTION_SYMBOLS, MODIFIER_SYMBOLS, TARGET_SYMBOLS } from '../data'
import type {
  BuildRewardDefinition,
  SynergyDefinition,
  SynergyProgress as StructuredSynergyProgress,
  SynergyTag,
} from '../build/BuildTypes'
import type { RewardOption } from '../build/RewardSystem'
import type { CombatSlotResult } from '../slot/CombatSlotTypes'
import { getAsset } from '../../assets/assetHelper'

export function toUiAugment(reward: BuildRewardDefinition): AugmentItem {
  const localized = localizeReward(reward)
  return {
    id: reward.id,
    name: localized.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: localized.description,
    icon: reward.kind === 'item' ? 'ITEM' : 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : undefined,
    effectValue: localized.effectLabel,
  }
}

export function toUiReward(reward: RewardOption): AugmentItem {
  const localized = localizeReward(reward)
  return {
    id: reward.id,
    name: localized.name,
    rarity: reward.rarity.toUpperCase() as AugmentItem['rarity'],
    tags: reward.tags,
    description: localized.description,
    icon: reward.kind === 'item' ? 'ITEM' : 'AUG',
    imgUrl: reward.assetKey ? getAsset(reward.assetKey) : undefined,
    effectValue: localized.effectLabel,
  }
}

type SlotProjectionOptions = {
  multiplierBonus?: number
  multiplierMax?: number
}

export function toUiSlotResult(slotResult: CombatSlotResult, options: SlotProjectionOptions = {}): SlotResult {
  const action = getUiActionSymbol(slotResult.action)
  const target = getUiTargetSymbol(slotResult.target)
  const modifier = getUiModifierSymbol(slotResult.modifier)
  const attackMultiplierValue = getUiMultiplier(
    slotResult.attackModifier ?? slotResult.modifier,
    options.multiplierBonus ?? 0,
    options.multiplierMax ?? 3,
  )
  const defenseMultiplierValue = getUiMultiplier(
    slotResult.defenseModifier ?? slotResult.modifier,
    options.multiplierBonus ?? 0,
    options.multiplierMax ?? 3,
  )
  const multiplierValue = attackMultiplierValue
  const calculatedValue = getUiSlotAmount(slotResult, 'attack', options)
  const defenseValue = typeof slotResult.defenseRoll === 'number'
    ? getUiSlotAmount(slotResult, 'defense', options)
    : undefined

  return {
    action,
    target,
    modifier,
    isMiss: false,
    calculatedValue,
    defenseValue,
    attackRoll: slotResult.attackRoll,
    defenseRoll: slotResult.defenseRoll,
    multiplierValue,
    attackMultiplierValue,
    defenseMultiplierValue,
    finalEffectText: defenseValue !== undefined
      ? `ATK ${slotResult.attackRoll} x${attackMultiplierValue} = ${calculatedValue} / DEF ${slotResult.defenseRoll} x${defenseMultiplierValue} = ${defenseValue}`
      : `${slotResult.action}/${slotResult.target}/${slotResult.modifier}: ${calculatedValue}`,
  }
}

export function getReelIndex(symbols: ReelSymbol[], id: string): number {
  return Math.max(0, symbols.findIndex((symbol) => symbol.id === id))
}

export function toUiSynergyProgress(
  synergy: SynergyDefinition,
  progress?: StructuredSynergyProgress,
): UiSynergyProgress {
  const required = progress?.required ?? getSynergyRequired(synergy)
  const current = progress?.current ?? 0
  const activeTier = [...(synergy.tiers ?? [])]
    .sort((left, right) => right.count - left.count)
    .find((tier) => current >= tier.count)

  return {
    synergyId: synergy.id,
    name: localizeSynergy(synergy).name,
    tag: synergy.tierTag ?? synergy.requiredTags[0]?.tag ?? ('COMBO' satisfies SynergyTag),
    current,
    required,
    completed: progress?.completed ?? current >= required,
    effectDescription: localizeSynergy(synergy, activeTier).description,
    tierEffects: (synergy.tiers ?? []).map((tier) => ({
      count: tier.count,
      label: localizeEffectLabel(tier.effectLabel),
      description: localizeEffectLabel(tier.description),
    })),
  }
}

export function toUiSynergyName(synergy: { id?: string; synergyId?: string; name: string }): string {
  return localizeSynergyName(synergy.id ?? synergy.synergyId ?? synergy.name, synergy.name)
}

function localizeReward(reward: Pick<BuildRewardDefinition, 'id' | 'name' | 'description' | 'effectLabel' | 'effectId'>): {
  name: string
  description: string
  effectLabel: string
} {
  const fallback = {
    name: reward.name,
    description: reward.description,
    effectLabel: reward.effectLabel ?? reward.effectId ?? '효과',
  }
  const localized: Record<string, Partial<typeof fallback>> = {
    combo_starter: { name: '연계 시동기', description: '연계 빌드의 시작점입니다. 공격 피해를 안정적으로 키웁니다.', effectLabel: '공격 +20%' },
    combo_finisher: { name: '연계 마무리', description: '높은 배수 공격을 강한 마무리 타격으로 바꿉니다.', effectLabel: 'x2/x3 공격 +35%' },
    multi_hit_charm: { name: '다단 타격 부적', description: '공격 뒤에 작은 추가 타격을 붙입니다.', effectLabel: '추가타 35%' },
    split_blade: { name: '분열 칼날', description: '공격형 연계 빌드에 강한 두 번째 타격을 추가합니다.', effectLabel: '추가타 45%' },
    echo_trigger: { name: '메아리 방아쇠', description: 'x3 잭팟 공격을 한 번 더 울리게 만드는 전설 아이템입니다.', effectLabel: 'x3 추가타 75%' },
    ember_edge: { name: '잿불 칼날', description: '화상 루트를 여는 기본 공격 강화 증강입니다.', effectLabel: '공격 +3' },
    ash_powder: { name: '재가루', description: '화상 피해를 밀어주면서 자원 루트도 열어둡니다.', effectLabel: '공격 +15%' },
    furnace_heart: { name: '화로 심장', description: '저주가 쌓일수록 화상 공격이 크게 강해집니다.', effectLabel: '저주 4+ 공격 +40%' },
    wildfire_contract: { name: '들불 계약서', description: '피해를 크게 올리지만 저주도 함께 끌어올리는 위험한 계약입니다.', effectLabel: '공격 +55%, 저주 +1' },
    guard_core: { name: '수호 코어', description: '수비 룰렛의 방어막 획득량을 올리는 기본 방어 증강입니다.', effectLabel: '수비 +4' },
    mirror_buckler: { name: '거울 버클러', description: '방어막을 키우고 치명 루트와도 맞물립니다.', effectLabel: '수비 +25%' },
    stone_aegis: { name: '석벽 방패', description: '높은 배수 수비 결과를 큰 방어막으로 바꿉니다.', effectLabel: 'x2/x3 수비 +7' },
    fortress_oath: { name: '요새의 맹세', description: '방어형 플레이를 저주 관리로 이어주는 핵심 아이템입니다.', effectLabel: '수비 +60%, 저주 -1' },
    cursed_lens: { name: '저주 렌즈', description: '저주가 높을 때 공격 피해를 끌어올립니다.', effectLabel: '저주 5+ 공격 +50%' },
    blood_price: { name: '피의 대가', description: '체력이 낮을수록 강해지는 위험 보상 증강입니다.', effectLabel: '낮은 HP 공격 +65%' },
    hex_battery: { name: '주술 배터리', description: '저주 빌드가 무너지지 않도록 저주 증가량을 낮춥니다.', effectLabel: '저주 -1' },
    jackpot_debt: { name: '잭팟 부채', description: '강력한 추가타를 주지만 저주 부담이 붙습니다.', effectLabel: '추가타 90%, 저주 +1' },
    red_coin: { name: '붉은 동전', description: '재생 물약 계열 회복량을 올리는 기본 자원 아이템입니다.', effectLabel: '회복 +3' },
    blue_vial: { name: '푸른 재생 물약', description: '회복 룰렛이 긴 전투에서 의미 있게 작동하도록 만듭니다.', effectLabel: '회복 +30%' },
    green_vial: { name: '초록 재생 물약', description: '회복과 수비를 동시에 보강하는 안정형 아이템입니다.', effectLabel: '회복 +4, 수비 +2' },
    lucky_receipt: { name: '행운 영수증', description: '낮은 결과도 버릴 수 없게 만드는 연계형 자원 아이템입니다.', effectLabel: '낮은 배수 공격 +5' },
    crit_die: { name: '치명 주사위', description: 'x3 공격을 노리는 치명 빌드의 시작점입니다.', effectLabel: 'x3 공격 +45%' },
    loaded_multiplier: { name: '조작된 배수추', description: '공격과 수비 룰렛의 최종 배수를 1 올립니다.', effectLabel: '배수 +1' },
    limit_core: { name: '한계 증폭핵', description: '한계 돌파석과 함께 쓰면 최종 배수 상한을 10까지 엽니다.', effectLabel: '한계 시너지 핵' },
    limit_breaker: { name: '한계 돌파석', description: '배수를 2 올리고 아이템 단계 상한을 x5까지 엽니다.', effectLabel: '배수 +2, 최대 x5' },
    glass_cannon: { name: '유리 대포', description: '방어를 포기하고 공격 피해를 크게 끌어올립니다.', effectLabel: '공격 +45%' },
    royal_joker: { name: '왕실 조커', description: '치명 연계 빌드의 x3 잭팟 보상입니다.', effectLabel: 'x3 공격 +80%' },
    safe_cracker: { name: '금고 따개', description: '공격과 회복을 동시에 조금씩 보강합니다.', effectLabel: '공격 +2, 회복 +2' },
    thorn_shell: { name: '가시 껍질', description: '수비와 화상 압박을 함께 올리는 혼합 증강입니다.', effectLabel: '수비 +4, 공격 +4' },
    black_candle: { name: '검은 촛불', description: '저주가 쌓인 뒤 화상 공격을 안정적으로 강화합니다.', effectLabel: '저주 3+ 공격 +35%' },
    panic_button: { name: '비상 단추', description: '위기 상황에서 재생 물약의 회복량을 크게 올립니다.', effectLabel: '낮은 HP 회복 +80%' },
    house_mark: { name: '하우스 표식', description: 'x2 공격을 날카롭게 만들지만 저주를 함께 올립니다.', effectLabel: 'x2 공격 +40%, 저주 +1' },
  }
  const korean: Record<string, Partial<typeof fallback>> = {
    combo_starter: { name: '연계 시동기', description: '연계 빌드의 시작점입니다. 공격 피해를 안정적으로 올립니다.', effectLabel: '공격 +20%' },
    combo_finisher: { name: '연계 마무리', description: '높은 배수 공격이 강한 마무리 타격으로 바뀝니다.', effectLabel: 'x2/x3 공격 +35%' },
    multi_hit_charm: { name: '다단 타격 부적', description: '공격 뒤에 작은 추가 타격을 붙입니다.', effectLabel: '추가타 35%' },
    split_blade: { name: '분열 칼날', description: '공격과 연계 빌드에 강한 두 번째 타격을 추가합니다.', effectLabel: '추가타 45%' },
    echo_trigger: { name: '메아리 방아쇠', description: 'x3 공격을 한 번 더 울리게 만드는 전설 아이템입니다.', effectLabel: 'x3 추가타 75%' },
    ember_edge: { name: '잿불 칼날', description: '화상 루트를 여는 기본 공격 강화 증강입니다.', effectLabel: '공격 +3' },
    ash_powder: { name: '잿가루', description: '화상 피해를 보태면서 자원 루트와 이어집니다.', effectLabel: '공격 +15%' },
    furnace_heart: { name: '화로 심장', description: '저주가 높을수록 화상 공격이 크게 강해집니다.', effectLabel: '저주 4+ 공격 +40%' },
    wildfire_contract: { name: '산불 계약서', description: '피해를 크게 올리지만 저주도 함께 끌어올리는 위험한 계약입니다.', effectLabel: '공격 +55%, 저주 +1' },
    guard_core: { name: '수호 코어', description: '방어 룰렛의 방어막 획득량을 올리는 기본 방어 증강입니다.', effectLabel: '방어 +4' },
    mirror_buckler: { name: '거울 버클러', description: '방어막을 세우고 치명 루트와 맞물립니다.', effectLabel: '방어 +25%' },
    stone_aegis: { name: '석벽 방패', description: '높은 배수 방어 결과를 두꺼운 방어막으로 바꿉니다.', effectLabel: 'x2/x3 방어 +7' },
    fortress_oath: { name: '요새의 맹세', description: '방어와 저주 관리를 함께 강화하는 핵심 아이템입니다.', effectLabel: '방어 +60%, 저주 -1' },
    cursed_lens: { name: '저주 렌즈', description: '저주가 높을 때 공격 피해를 끌어올립니다.', effectLabel: '저주 5+ 공격 +50%' },
    blood_price: { name: '피의 대가', description: '체력이 낮을수록 강해지는 위험 보상 증강입니다.', effectLabel: '저체력 공격 +65%' },
    hex_battery: { name: '주술 배터리', description: '저주 빌드가 무너지지 않도록 저주 증가량을 낮춥니다.', effectLabel: '저주 -1' },
    jackpot_debt: { name: '잭팟 부채', description: '강력한 추가타를 주지만 저주 부담이 붙습니다.', effectLabel: '추가타 90%, 저주 +1' },
    red_coin: { name: '붉은 동전', description: '재생 물약 계열 회복량을 올리는 기본 자원 아이템입니다.', effectLabel: '회복 +3' },
    blue_vial: { name: '푸른 재생 물약', description: '회복 룰렛과 긴 전투에서 더 오래 버티게 해줍니다.', effectLabel: '회복 +30%' },
    green_vial: { name: '초록 재생 물약', description: '회복과 방어를 동시에 보강하는 안정형 아이템입니다.', effectLabel: '회복 +4, 방어 +2' },
    lucky_receipt: { name: '행운 영수증', description: '좋은 결과를 버리기 어렵게 만드는 연계 자원 아이템입니다.', effectLabel: '고배수 공격 +5' },
    crit_die: { name: '치명 주사위', description: 'x3 공격을 노리는 치명 빌드의 시작점입니다.', effectLabel: 'x3 공격 +45%' },
    loaded_multiplier: { name: '조작된 배수추', description: '공격과 방어 룰렛의 최종 배수를 1 올립니다.', effectLabel: '배수 +1' },
    limit_core: { name: '한계 증폭핵', description: '한계 돌파석과 함께 쓰면 최종 배수 상한을 10까지 엽니다.', effectLabel: '한계 시너지 핵' },
    limit_breaker: { name: '한계 돌파석', description: '배수를 2 올리고 아이템 단계 상한을 x5까지 엽니다.', effectLabel: '배수 +2, 최대 x5' },
    glass_cannon: { name: '유리 대포', description: '방어를 포기하고 공격 피해를 크게 끌어올립니다.', effectLabel: '공격 +45%' },
    royal_joker: { name: '왕실 조커', description: '치명 연계 빌드의 x3 잭팟 보상입니다.', effectLabel: 'x3 공격 +80%' },
    safe_cracker: { name: '금고 열쇠', description: '공격과 회복을 동시에 조금씩 보강합니다.', effectLabel: '공격 +2, 회복 +2' },
    thorn_shell: { name: '가시 껍질', description: '방어와 화상 압박을 함께 올리는 혼합 증강입니다.', effectLabel: '방어 +4, 공격 +4' },
    black_candle: { name: '검은 촛불', description: '저주가 쌓인 뒤 화상 공격을 안정적으로 강화합니다.', effectLabel: '저주 3+ 공격 +35%' },
    panic_button: { name: '비상 단추', description: '위기 상황에서 재생 물약의 회복량을 크게 올립니다.', effectLabel: '저체력 회복 +80%' },
    house_mark: { name: '하우스 표식', description: 'x2 공격을 날카롭게 만들지만 저주를 함께 올립니다.', effectLabel: 'x2 공격 +40%, 저주 +1' },
  }
  return { ...fallback, ...localized[reward.id], ...korean[reward.id] }
}

function localizeSynergy(
  synergy: SynergyDefinition,
  activeTier?: NonNullable<SynergyDefinition['tiers']>[number],
): { name: string; description: string } {
  const localized: Record<string, { name: string; description: string }> = {
    limit_break: { name: '한계 돌파', description: '한계 증폭핵과 한계 돌파석을 함께 모으면 배수 상한이 x10까지 열립니다.' },
    combo_engine: { name: '연계 엔진', description: 'COMBO 태그를 모으면 공격과 추가타가 단계적으로 강해집니다.' },
    burn_pressure: { name: '화상 압박', description: 'BURN 태그를 모으면 기본 공격에서 저주 기반 폭딜까지 성장합니다.' },
    fortress_loop: { name: '요새 순환', description: 'DEFENSE 태그를 모으면 수비와 저주 관리가 함께 강해집니다.' },
    curse_engine: { name: '저주 엔진', description: 'CURSE 태그를 모으면 위험한 저주 수치를 공격 보상으로 바꿉니다.' },
    sustain_engine: { name: '재생 엔진', description: 'RESOURCE 태그를 모으면 재생 물약과 회복 턴이 강력해집니다.' },
    jackpot_engine: { name: '잭팟 엔진', description: 'CRITICAL 태그를 모으면 x2/x3 결과가 강한 폭발력을 냅니다.' },
  }
  const korean: Record<string, { name: string; description: string }> = {
    limit_break: { name: '한계 돌파', description: '한계 증폭핵과 한계 돌파석을 함께 모으면 배수 상한이 x10까지 열립니다.' },
    combo_engine: { name: '연계 엔진', description: 'COMBO 태그를 모으면 공격과 추가타가 단계적으로 강해집니다.' },
    burn_pressure: { name: '화상 압박', description: 'BURN 태그를 모으면 기본 공격에서 저주 기반 폭발까지 성장합니다.' },
    fortress_loop: { name: '요새 순환', description: 'DEFENSE 태그를 모으면 방어와 저주 관리가 함께 강해집니다.' },
    curse_engine: { name: '저주 엔진', description: 'CURSE 태그를 모으면 위험한 저주 수치를 공격 보상으로 바꿉니다.' },
    sustain_engine: { name: '재생 엔진', description: 'RESOURCE 태그를 모으면 재생 물약과 회복 계열이 강력해집니다.' },
    jackpot_engine: { name: '잭팟 엔진', description: 'CRITICAL 태그를 모으면 x2/x3 결과가 강한 폭발력을 냅니다.' },
  }
  const base = korean[synergy.id] ?? localized[synergy.id] ?? { name: synergy.name, description: synergy.description }

  return {
    name: localizeSynergyName(synergy.id, base.name),
    description: activeTier ? `${localizeEffectLabel(activeTier.effectLabel)} / ${localizeEffectLabel(activeTier.description)}` : base.description,
  }
}

function localizeEffectLabel(value: string): string {
  return value
    .replaceAll('COMBO', '연계')
    .replaceAll('BURN', '화상')
    .replaceAll('DEFENSE', '방어')
    .replaceAll('CURSE', '저주')
    .replaceAll('RESOURCE', '자원')
    .replaceAll('CRITICAL', '치명')
    .replaceAll('LIMIT', '한계')
    .replaceAll('multiplier', '배수')
    .replaceAll('max', '최대')
    .replaceAll('bullet', '공격')
    .replaceAll('shield', '방어막')
    .replaceAll('heart', '회복')
    .replaceAll('curse', '저주')
    .replaceAll('low HP', '저체력')
    .replaceAll('extra hit', '추가타')
}

function localizeSynergyName(synergyId: string, fallback: string): string {
  const baseId = synergyId.split(':')[0]
  const names: Record<string, string> = {
    limit_break: '한계 돌파',
    combo_engine: '연계 엔진',
    burn_pressure: '화상 압박',
    fortress_loop: '요새 순환',
    curse_engine: '저주 엔진',
    sustain_engine: '재생 엔진',
    jackpot_engine: '잭팟 엔진',
  }
  const tierMatch = synergyId.match(/:(\d+)$/)
  const suffix = tierMatch ? ` ${tierMatch[1]}` : ''

  return names[baseId] ? `${names[baseId]}${suffix}` : fallback
}

function getSynergyRequired(synergy: SynergyDefinition): number {
  const tierRequired = Math.max(0, ...(synergy.tiers ?? []).map((tier) => tier.count))
  const baseRequired = synergy.requiredTags.reduce((sum, requirement) => sum + requirement.count, 0)

  return Math.max(tierRequired, baseRequired)
}

function getUiActionSymbol(action: CombatSlotResult['action']): ReelSymbol {
  return getRequiredSymbol(ACTION_SYMBOLS, action)
}

function getUiTargetSymbol(target: CombatSlotResult['target']): ReelSymbol {
  if (target === 'enemy') {
    return TARGET_SYMBOLS.find((symbol) => symbol.type === 'ENEMY') ?? createTargetSymbol('enemy', 'ENEMY')
  }

  return createTargetSymbol(target, target === 'self' ? 'SELF' : 'ALL')
}

function getUiModifierSymbol(modifier: CombatSlotResult['modifier']): ReelSymbol {
  return getRequiredSymbol(MODIFIER_SYMBOLS, modifier)
}

function getRequiredSymbol(symbols: ReelSymbol[], id: string): ReelSymbol {
  const symbol = symbols.find((candidate) => candidate.id === id)
  if (!symbol) {
    throw new Error(`Missing UI reel symbol: ${id}`)
  }
  return symbol
}

function createTargetSymbol(id: CombatSlotResult['target'], type: 'SELF' | 'ALL' | 'ENEMY'): ReelSymbol {
  return {
    id,
    name: type,
    type,
    category: 'TARGET',
    baseValue: 0,
    icon: type,
    color: '#cccccc',
    description: type,
  }
}

function getUiSlotAmount(
  slotResult: CombatSlotResult,
  lane: 'attack' | 'defense' = 'attack',
  options: SlotProjectionOptions = {},
): number {
  const base = lane === 'attack'
    ? slotResult.attackRoll ?? (slotResult.action === 'bullet' ? 5 : slotResult.action === 'shield' ? 5 : 4)
    : slotResult.defenseRoll ?? 0
  const multiplier = getUiMultiplier(
    lane === 'attack'
      ? slotResult.attackModifier ?? slotResult.modifier
      : slotResult.defenseModifier ?? slotResult.modifier,
    options.multiplierBonus ?? 0,
    options.multiplierMax ?? 3,
  )

  return base * multiplier
}

function getUiMultiplier(modifier: CombatSlotResult['modifier'], bonus: number = 0, max: number = 3): number {
  const base = modifier === 'x3' ? 3 : modifier === 'x2' ? 2 : 1
  return Math.min(max, Math.max(2, base + bonus))
}
