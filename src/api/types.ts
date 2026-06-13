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
  imageUrl?: string
  setId?: string
  setName?: string
}

export type User = {
  id: string
  email: string
  name: string
}
