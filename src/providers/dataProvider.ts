import type { Card, CollectionDetail, CollectionPurchase, CollectionSummary, Set } from '../api/types'
import { ensureCsrf, fetchJson, getUrl } from '../utils/api'

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

async function getCollections(): Promise<CollectionSummary[]> {
  const { json } = await fetchJson<CollectionSummary[]>(getUrl('collections/'))
  return Array.isArray(json) ? json : []
}

async function getCollection(id: number, sort = 'number_asc'): Promise<CollectionDetail | undefined> {
  const params = new URLSearchParams()
  params.set('sort', sort)
  const { json } = await fetchJson<CollectionDetail>(getUrl(`collections/${id}/?${params.toString()}`))
  return json
}

async function createCollection(name: string): Promise<CollectionSummary> {
  await ensureCsrf()
  const { json } = await fetchJson<{ id: number; name: string; is_default: boolean }>(
    getUrl('collections/'),
    { method: 'POST', body: JSON.stringify({ name }) },
  )
  return { ...json, card_count: 0, total_market_value: '0.00' }
}

async function addCardToCollection(collectionId: number, cardId: string, quantity = 1): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`collections/${collectionId}/items/`), {
    method: 'POST',
    body: JSON.stringify({ card_id: cardId, quantity }),
  })
}

async function addPurchase(
  collectionId: number,
  itemId: number,
  purchasePrice: string,
  acquiredDate: string,
): Promise<CollectionPurchase> {
  await ensureCsrf()
  const { json } = await fetchJson<CollectionPurchase>(
    getUrl(`collections/${collectionId}/items/${itemId}/purchases/`),
    { method: 'POST', body: JSON.stringify({ purchase_price: purchasePrice, acquired_date: acquiredDate }) },
  )
  return json
}

async function deletePurchase(
  collectionId: number,
  itemId: number,
  purchaseId: number,
): Promise<void> {
  await ensureCsrf()
  await fetchJson(
    getUrl(`collections/${collectionId}/items/${itemId}/purchases/${purchaseId}/`),
    { method: 'DELETE' },
  )
}

async function deleteCollection(id: number): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`collections/${id}/`), { method: 'DELETE' })
}

async function updateCollection(id: number, name: string): Promise<CollectionDetail> {
  await ensureCsrf()
  const { json } = await fetchJson<CollectionDetail>(getUrl(`collections/${id}/`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return json
}

export const dataProvider = {
  getSets,
  getSet,
  getCardsBySet,
  searchCards,
  getCard,
  getCollections,
  getCollection,
  createCollection,
  addCardToCollection,
  addPurchase,
  deletePurchase,
  updateCollection,
  deleteCollection,
}

export type DataProvider = typeof dataProvider