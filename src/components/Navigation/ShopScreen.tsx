import React, { useState } from 'react';
import { GameCommand, PlayerState } from '../../types/game';
import { getAsset } from '../../assets/assetHelper';
import { soundManager } from '../../utils/soundManager';

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

export const ShopScreen: React.FC<ShopScreenProps> = ({ player, onDispatch }) => {
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  const shopItems: ShopItem[] = [
    {
      id: 'item_dagger',
      name: '홍염의 단검',
      rarity: 'RARE',
      desc: '슬롯 타격 시 15% 화상 2턴 부여',
      effect: '공격력 +4',
      price: 120,
      icon: getAsset('sword_red')
    },
    {
      id: 'item_shield',
      name: '수호자의 방패',
      rarity: 'COMMON',
      desc: '턴 시작 시 보호막 +5 상시 유지',
      effect: '보호막 +5',
      price: 90,
      icon: getAsset('shield_green')
    },
    {
      id: 'item_core',
      name: '폭주 마법 구체',
      rarity: 'LEGENDARY',
      desc: '크리티컬 적중 시 저주 게이지 -1 감소',
      effect: '저주 정화',
      price: 220,
      icon: getAsset('orb_purple')
    },
    {
      id: 'item_ring',
      name: '행운의 황금 반지',
      rarity: 'RARE',
      desc: '슬롯 회전 시 골드 획득량 +20% 증가',
      effect: '골드 +20%',
      price: 150,
      icon: getAsset('ring_gold')
    }
  ];

  const handleBuy = (item: ShopItem) => {
    if (purchasedIds.has(item.id) || player.gold < item.price) return;

    soundManager.playJackpotSound();
    setPurchasedIds((prev) => new Set(prev).add(item.id));
    onDispatch({ type: 'BUY_SHOP_ITEM', itemId: item.name, price: item.price });
  };

  return (
    <div
      id="frame-shop"
      className="frame shop-screen-viewport"
      style={{
        ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`,
        ['--wall-tile' as string]: `url(${getAsset('dg_wall_top_mid')})`
      }}
    >
      <div className="dungeon-floor" />
      <div className="dungeon-wall-top" />
      <div className="wall-base-shadow" style={{ top: '160px' }} />

      {/* Pillars & Merchant Decor */}
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <div className="warm-glow" style={{ opacity: 0.4 }} />

      <img className="deco" src={getAsset('dg_crate')} style={{ left: '46px', top: '400px', width: '42px', height: '60px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_crate')} style={{ left: '95px', top: '420px', width: '42px', height: '60px' }} alt="crate" />
      <img className="deco" src={getAsset('dg_chest_full_open_anim_f2')} style={{ right: '50px', top: '410px', width: '54px', height: '54px' }} alt="chest" />

      {/* Header Info */}
      <div className="shop-header-bar">
        <div className="shop-title-badge">🪙 떠돌이 암시장 상점</div>
        <div className="shop-gold-display">
          보유 골드: <span>🪙 {player.gold}</span>
        </div>
      </div>

      {/* Merchant Speech Bubble & NPC */}
      <div className="merchant-npc-section">
        <div className="merchant-avatar-wrap">
          <img src={getAsset('goblin')} className="merchant-npc-img" alt="merchant npc" />
          <div className="merchant-name">암시장 상인 고블린</div>
        </div>
        <div className="merchant-speech-bubble">
          💬 "어서오게 방랑자여! 저주받은 성채를 탈출하려면 강한 무기와 보석 반지가 필수지... 마음에 드는 비수를 골라보게!"
        </div>
      </div>

      {/* 4 Pixel Goods Cards Grid */}
      <div className="shop-goods-grid">
        {shopItems.map((item) => {
          const isPurchased = purchasedIds.has(item.id);
          const canAfford = player.gold >= item.price && !isPurchased;

          return (
            <div
              key={item.id}
              className={`shop-card-pixel rarity-${item.rarity.toLowerCase()} ${isPurchased ? 'purchased' : ''}`}
            >
              <div className="card-rarity-badge">{item.rarity}</div>
              <img className="card-item-icon" src={item.icon} alt={item.name} />
              <div className="card-item-name">{item.name}</div>
              <div className="card-item-desc">{item.desc}</div>
              <div className="card-item-effect">{item.effect}</div>

              <div className="card-item-footer">
                <div className="card-price-tag">🪙 {item.price}</div>
                {isPurchased ? (
                  <div className="purchased-stamp">✅ 구매완료</div>
                ) : (
                  <button
                    className={`k-btn ${canAfford ? 'primary' : 'disabled'}`}
                    onClick={() => handleBuy(item)}
                    type="button"
                  >
                    구매하기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to Map Navigation Button */}
      <div className="shop-footer-bar">
        <button
          className="k-btn big primary glow-pulse"
          onClick={() => onDispatch({ type: 'NAVIGATE', screen: 'MAP' })}
          type="button"
        >
          🗺️ 탐사 지도로 돌아가기
        </button>
      </div>

      <div className="vignette" />
    </div>
  );
};
