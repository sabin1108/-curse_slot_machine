export interface ShopOffer {
  id: string
  price: number
  purchased: boolean
}

export interface ShopState {
  offers: ShopOffer[]
}
