import React, { useMemo, useState } from 'react';
import { GameCommand, PlayerState } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';
import { DEFAULT_BUILD_CATALOG } from '../../game/build/BuildCatalog';
import type { BuildRewardDefinition } from '../../game/build/BuildTypes';

interface ShopItem {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  desc: string;
  effect: string;
  price: number;
  icon: string;
}

interface ShopScreenProps {
  player: PlayerState;
  onDispatch: (cmd: GameCommand) => void;
}

const SHOP_TEXT: Record<string, { name: string; desc: string; effect: string }> = {
  multi_hit_charm: { name: '연속 타격 부적', desc: '총알 공격 뒤에 작은 추가타를 불러냅니다.', effect: '추가타 +35%' },
  echo_trigger: { name: '메아리 방아쇠', desc: 'x3 공격이 가끔 한 번 더 울려 퍼집니다.', effect: 'x3 추가타 +75%' },
  ash_powder: { name: '잿빛 화약 주머니', desc: '화상 빌드와 회복 경로를 동시에 열어둡니다.', effect: '총알 +15%' },
  wildfire_contract: { name: '들불 계약서', desc: '강한 화력을 얻는 대신 저주 부담을 감수합니다.', effect: '총알 +55%, 저주 +1' },
  mirror_buckler: { name: '거울 버클러', desc: '방어 룰렛의 보호막 효율을 높입니다.', effect: '보호막 +25%' },
  fortress_oath: { name: '요새의 맹세', desc: '큰 보호막과 저주 완화를 동시에 얻습니다.', effect: '보호막 +60%, 저주 -1' },
  cursed_lens: { name: '저주받은 렌즈', desc: '저주가 깊을수록 총알 피해가 강해집니다.', effect: '저주 5+ 총알 +50%' },
  hex_battery: { name: '주술 배터리', desc: '저주 빌드를 안정화해 일반 저주 증가를 낮춥니다.', effect: '저주 -1' },
  red_coin: { name: '붉은 동전', desc: '회복 룰렛을 조금 더 든든하게 만듭니다.', effect: '회복 +3' },
  green_vial: { name: '초록 유리병', desc: '회복과 보호막을 동시에 보강합니다.', effect: '회복 +4, 보호막 +2' },
  lucky_receipt: { name: '행운 영수증', desc: '낮은 배수 공격에도 보너스를 줍니다.', effect: 'x1 총알 +5' },
  loaded_multiplier: { name: '조작된 배수추', desc: '배수 룰렛의 평균값을 끌어올립니다.', effect: '배수 +1' },
  limit_breaker: { name: '한계 파괴기', desc: '배수 상한을 열어 더 큰 한 방을 노립니다.', effect: '배수 +2, 최대 x5' },
  royal_joker: { name: '왕실 조커', desc: '위험한 x3 공격을 폭발적으로 강화합니다.', effect: 'x3 총알 +80%' },
  black_candle: { name: '검은 양초', desc: '저주가 쌓이면 화상 피해가 안정적으로 강해집니다.', effect: '저주 3+ 총알 +35%' },
  panic_button: { name: '비상 탈출 버튼', desc: '체력이 낮을 때 회복 룰렛을 크게 바꿉니다.', effect: '저체력 회복 +80%' },
};

const SHOP_ITEM_IDS = [
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
];

function toShopRarity(rarity: BuildRewardDefinition['rarity']): ShopItem['rarity'] {
  if (rarity === 'legendary' || rarity === 'cursed') return 'LEGENDARY';
  if (rarity === 'rare' || rarity === 'uncommon') return 'RARE';
  return 'COMMON';
}

function getShopPrice(reward: BuildRewardDefinition): number {
  if (reward.rarity === 'legendary' || reward.rarity === 'cursed') return 220;
  if (reward.rarity === 'rare') return 160;
  if (reward.rarity === 'uncommon') return 120;
  return 90;
}

function getRandomShopItems(): ShopItem[] {
  return [...DEFAULT_BUILD_CATALOG.rewards]
    .filter((reward) => reward.kind === 'item' && SHOP_ITEM_IDS.includes(reward.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((reward) => ({
      id: reward.id,
      name: SHOP_TEXT[reward.id]?.name ?? reward.name,
      rarity: toShopRarity(reward.rarity),
      desc: SHOP_TEXT[reward.id]?.desc ?? reward.description,
      effect: SHOP_TEXT[reward.id]?.effect ?? reward.effectLabel ?? '빌드 효과',
      price: getShopPrice(reward),
      icon: getAsset(reward.assetKey ?? 'item_lucky_receipt'),
    }));
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ player, onDispatch }) => {
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const shopItems = useMemo(getRandomShopItems, []);

  const handleBuy = (item: ShopItem) => {
    if (purchasedIds.has(item.id) || player.gold < item.price) return;

    soundManager.playJackpotSound();
    setPurchasedIds((prev) => new Set(prev).add(item.id));
    onDispatch({ type: 'BUY_SHOP_ITEM', itemId: item.id, price: item.price });
  };

  return (
    <div
      id="frame-shop"
      className="frame shop-screen-viewport"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`,
        ['--wall-tile' as string]: `url(${getAsset('dg_wall_top_mid')})`,
      }}
    >
      <div className="dungeon-floor" />
      <div className="dungeon-wall-top" />
      <div className="wall-base-shadow" style={{ top: '160px' }} />

      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <div className="warm-glow" style={{ opacity: 0.45 }} />

      <div className="room-environment shop-environment" aria-hidden="true">
        <div className="dungeon-column column-left-back" />
        <div className="dungeon-column column-left-mid" />
        <div className="dungeon-column column-left-front" />
        <div className="dungeon-column column-right-back" />
        <div className="dungeon-column column-right-mid" />
        <div className="dungeon-column column-right-front" />
        <div className="dungeon-crate-stack stack-a" />
        <div className="dungeon-crate-stack stack-b" />
        <img className="dungeon-ground-prop prop-ladder prop-a" src={getAsset('dg_floor_ladder')} alt="" />
        <img className="dungeon-ground-prop prop-spikes prop-b" src={getAsset('dg_floor_spikes_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-fountain prop-c" src={getAsset('dg_wall_fountain_basin_blue_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-chest prop-d" src={getAsset('dg_chest_empty_open_anim_f0')} alt="" />
        <img className="dungeon-ground-prop prop-hole prop-e" src={getAsset('dg_wall_hole_1')} alt="" />
        <img className="dungeon-ground-prop prop-spikes prop-f" src={getAsset('dg_floor_spikes_anim_f0')} alt="" />
      </div>

      <div className="shop-header-bar">
        <div className="shop-title-badge">던전 암시장</div>
        <div className="shop-gold-display">
          보유 골드: <span>{player.gold}</span>
        </div>
      </div>

      <div className="merchant-npc-section">
        <div className="merchant-avatar-wrap">
          <img src={getAsset('goblin')} className="merchant-npc-img" alt="merchant" />
          <div className="merchant-name">수상한 상인</div>
        </div>
        <div className="merchant-speech-bubble">
          오늘 들여온 물건은 전부 슬롯머신 증강품이야. 필요한 조각만 골라. 저주는 덤으로 따라올 수도 있지.
        </div>
      </div>

      <div className="shop-room-details" aria-hidden="true">
        <span>잠긴 서랍장</span>
        <span>증강품 진열대</span>
        <span>거래 장부</span>
      </div>

      <div className="shop-goods-grid">
        {shopItems.map((item) => {
          const isPurchased = purchasedIds.has(item.id);
          const canAfford = player.gold >= item.price && !isPurchased;

          return (
            <div
              key={item.id}
              data-shop-reward-id={item.id}
              className={`shop-card-pixel rarity-${item.rarity.toLowerCase()} ${isPurchased ? 'purchased' : ''}`}
            >
              <div className="card-rarity-badge">{item.rarity}</div>
              <img className="card-item-icon" src={item.icon} alt={item.name} />
              <div className="card-item-name">{item.name}</div>
              <div className="card-item-desc">{item.desc}</div>
              <div className="card-item-effect">{item.effect}</div>

              <div className="card-item-footer">
                <div className="card-price-tag">{item.price}G</div>
                {isPurchased ? (
                  <div className="purchased-stamp">구매 완료</div>
                ) : (
                  <button
                    className={`k-btn ${canAfford ? 'primary' : 'disabled'}`}
                    onClick={() => handleBuy(item)}
                    type="button"
                  >
                    구매
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="shop-footer-bar">
        <button
          className="k-btn big primary glow-pulse"
          onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'MAP' })}
          type="button"
        >
          경로 맵으로 돌아가기
        </button>
      </div>

      <div className="vignette" />
    </div>
  );
};
