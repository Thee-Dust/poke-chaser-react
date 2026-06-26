export type Set = {
  id: string
  name: string
  release_date?: string
  printed_total?: number
  total?: number
  series?: string
  ptcgo_code?: string
  images?: {
    logo?: string
    symbol?: string
  }
  legalities?: {
    expanded?: string
    standard?: string
    unlimited?: string
  }
}

export type Card = {
  id: string
  name: string
  number?: string
  rarity?: string
  artist?: string
  flavor_text?: string
  hp?: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  level?: string
  evolves_from?: string
  abilities?: { name: string; text: string; type: string }[]
  attacks?: {
    name: string
    cost?: string[]
    convertedEnergyCost?: number
    damage?: string
    text?: string
  }[]
  weaknesses?: { type: string; value: string }[]
  resistances?: { type: string; value: string }[]
  retreat_cost?: string[]
  converted_retreat_cost?: number
  images?: {
    large?: string
    small?: string
  }
  tcgplayer?: {
    url?: string
    updatedAt?: string
    prices?: Record<
      string,
      {
        low?: number | null
        mid?: number | null
        high?: number | null
        market?: number | null
        directLow?: number | null
      }
    >
  }
  set_id?: string
  set_name?: string
}

export type User = {
  id: string
  username: string
  email: string
}

export type CollectionSummary = {
  id: number
  name: string
  is_default: boolean
  card_count: number
  total_market_value: string
}

export type CollectionPurchase = {
  id: number
  acquired_date: string
  purchase_price: string
}

export type CollectionItem = {
  id: number
  card: Card
  purchases: CollectionPurchase[]
  market_value: string | null
  market_price?: string | null
  total_spent: string
  gain_loss: string | null
  quantity?: number
}

export type CollectionDetail = CollectionSummary & {
  purchased_market_value: string
  total_spent: string
  gain_loss: string
  items: CollectionItem[]
}
