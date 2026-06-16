import type { Card, Set } from '../api/types'
import { fetchJson, getUrl } from '../utils/api'

async function getSets(page = 1, sort = 'release_date_desc') {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('sort', sort)

  const { json } = await fetchJson<any>(
    getUrl(`cards/cardSet/?${params.toString()}`),
  )

  return {
    sets: json.results ?? [],
    page: json.meta?.pagination?.page ?? page,
    pages: json.meta?.pagination?.pages ?? 1,
  }
}

async function getSet(setId: string): Promise<Set | undefined> {
  const { json } = await fetchJson<Set>(getUrl(`cards/cardSet/${setId}`))
  return json
}

async function getCardsBySet(setId: string, page = 1, sort = 'number_asc') {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('sort', sort)

  const { json } = await fetchJson<any>(
    getUrl(`cards/cardSet/${setId}/cards/?${params.toString()}`),
  )

  return {
    cards: json.results ?? [],
    page: json.meta?.pagination?.page ?? page,
    pages: json.meta?.pagination?.pages ?? 1,
  }
}

async function searchCards(query: string, page = 1, sort = 'number_asc'): Promise<{ cards: Card[]; pages: number }> {
  const normalized = query.trim()
  if (!normalized) return { cards: [], pages: 1 }

  const params = new URLSearchParams()
  params.set('search', normalized)
  params.set('page', String(page))
  params.set('sort', sort)

  const { json } = await fetchJson<any>(
    getUrl(`cards/card/?${params.toString()}`),
  )

  return {
    cards: json.results ?? [],
    pages: json.meta?.pagination?.pages ?? 1,
  }
}

async function getCard(cardId: string): Promise<Card | undefined> {
  const { json } = await fetchJson<Card>(getUrl(`cards/card/${cardId}/`))
  return json
}

export const dataProvider = {
  getSets,
  getSet,
  getCardsBySet,
  searchCards,
  getCard,
}

export type DataProvider = typeof dataProvider