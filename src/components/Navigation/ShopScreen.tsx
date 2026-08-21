import React from 'react'
import { getAsset } from '../../assets/assetHelper'
import type { GameState as CoreGameState } from '../../game/engine/GameState'
import { toUiReward } from '../../game/engine/UiProjection'
import type { GameCommand } from '../../types/game'
import { soundManager } from '../../utils/soundManager'

interface ShopScreenProps {
  gold: number
  purchases: number
  offers: CoreGameState['shop']['offers']
  onDispatch: (command: GameCommand) => void
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ gold, purchases, offers, onDispatch }) => {
  const buy = (rewardId: string) => {
    soundManager.playJackpotSound()
    onDispatch({ type: 'BUY_SHOP_ITEM', rewardId })
  }

  return (
    <div id="frame-shop" className="frame shop-screen-viewport" style={{ ['--floor-tile' as string]: `url(${getAsset('dg_floor_1')})`, ['--wall-tile' as string]: `url(${getAsset('dg_wall_top_mid')})` }}>
      <div className="dungeon-floor" /><div className="dungeon-wall-top" /><div className="wall-base-shadow" style={{ top: '160px' }} />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ left: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <img className="wall-pillar" src={getAsset('dg_column_wall')} style={{ right: '20px', top: '0px', height: '160px', opacity: 0.85 }} alt="pillar" />
      <div className="warm-glow" style={{ opacity: 0.4 }} />
      <div className="shop-header-bar"><div className="shop-title-badge">저주받은 암시장</div><div className="shop-gold-display">보유 골드: <span>{gold} G</span> · 구매 {purchases}/4</div></div>
      <div className="merchant-npc-section"><div className="merchant-avatar-wrap"><img src={getAsset('goblin')} className="merchant-npc-img" alt="merchant npc" /><div className="merchant-name">암시장 상인</div></div><div className="merchant-speech-bubble">가격과 상품은 슬롯 코어가 정한다. 눈속임은 없어.</div></div>
      <div className="shop-goods-grid">
        {offers.map((offer) => {
          const item = toUiReward(offer.reward)
          const canBuy = gold >= offer.price && purchases < 4
          return (
            <div key={offer.reward.id} data-shop-reward-id={offer.reward.id} className={`shop-card-pixel rarity-${item.rarity.toLowerCase()}`}>
              <div className="card-rarity-badge">{item.rarity}</div>
              <img className="card-item-icon" src={item.imgUrl || getAsset('sword_gold')} alt={item.name} />
              <div className="card-item-name">{item.name}</div><div className="card-item-desc">{item.description}</div><div className="card-item-effect">{item.effectValue}</div>
              <div className="card-item-footer"><div className="card-price-tag">{offer.price} G</div><button className={`k-btn ${canBuy ? 'primary' : 'disabled'}`} disabled={!canBuy} onClick={() => buy(offer.reward.id)} type="button">구매하기</button></div>
            </div>
          )
        })}
      </div>
      <div className="shop-footer-bar"><button className="k-btn big primary glow-pulse" onClick={() => onDispatch({ type: 'LEAVE_SHOP' })} type="button">상점을 나와 경로로 돌아가기</button></div>
      <div className="vignette" />
    </div>
  )
}
