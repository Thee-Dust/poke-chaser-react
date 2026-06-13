import { mockCards, mockSets } from '../api/mockData'
import type { Card, Set } from '../api/types'
import { fetchJson, getUrl } from '../utils/api'

function isMockMode(): boolean {
  return !import.meta.env.VITE_API_BASE_URL
}

async function getSets(page = 1) {
  const { json } = await fetchJson<any>(getUrl(`cards/cardSet/?page=${page}`))
  console.log(json)
  return {
    sets: json.results ?? [],
    page: json.meta?.pagination?.page ?? page,
    pages: json.meta?.pagination?.pages ?? 1,
  }
}

async function getSet(setId: string): Promise<Set | undefined> {
  if (isMockMode()) {
    return mockSets.find((set) => set.id === setId)
  }

  const { json } = await fetchJson<Set>(getUrl(`sets/${setId}`))
  return json
}

async function getCardsBySet(setId: string): Promise<Card[]> {
  if (isMockMode()) {
    return mockCards.filter((card) => card.setId === setId)
  }

  const { json } = await fetchJson<Card[]>(getUrl(`sets/${setId}/cards`))
  return json
}

async function searchCards(query: string): Promise<Card[]> {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return []
  }

  if (isMockMode()) {
    return mockCards.filter((card) => card.name.toLowerCase().includes(normalized))
  }

  const { json } = await fetchJson<Card[]>(
    getUrl(`cards?q=${encodeURIComponent(normalized)}`),
  )
  return json
}

async function getCard(cardId: string): Promise<Card | undefined> {
  if (isMockMode()) {
    return mockCards.find((card) => card.id === cardId)
  }

  const { json } = await fetchJson<Card>(getUrl(`cards/${cardId}`))
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