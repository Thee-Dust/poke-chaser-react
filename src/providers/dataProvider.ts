import type { BinderDetail, BinderPageData, BinderSize, BinderSlotData, BinderSummary, Card, CollectionDetail, CollectionPurchase, CollectionSummary, Set } from '../api/types'
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

async function getCollectionCards(
  collectionId: number,
  page = 1,
  sort = 'name_asc',
  search = '',
): Promise<{ cards: Card[]; pages: number }> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('sort', sort)
  const normalized = search.trim()
  if (normalized) {
    params.set('search', normalized)
  }

  const { json } = await fetchJson<any>(
    getUrl(`collections/${collectionId}/cards/?${params.toString()}`),
  )

  return {
    cards: json.results ?? [],
    pages: json.meta?.pagination?.pages ?? 1,
  }
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

async function getBinderSizes(): Promise<BinderSize[]> {
  const { json } = await fetchJson<BinderSize[]>(getUrl('binders/sizes/'))
  return Array.isArray(json) ? json : []
}

async function getBinders(): Promise<BinderSummary[]> {
  const { json } = await fetchJson<BinderSummary[]>(getUrl('binders/'))
  return Array.isArray(json) ? json : []
}

async function getBinder(id: number): Promise<BinderDetail | undefined> {
  const { json } = await fetchJson<BinderDetail>(getUrl(`binders/${id}/`))
  return json
}

async function createBinder(name: string, rows: number, cols: number): Promise<BinderSummary> {
  await ensureCsrf()
  const { json } = await fetchJson<BinderSummary>(getUrl('binders/'), {
    method: 'POST',
    body: JSON.stringify({ name, rows, cols }),
  })
  return json
}

async function deleteBinder(id: number): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`binders/${id}/`), { method: 'DELETE' })
}

async function updateBinder(id: number, name: string): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`binders/${id}/`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

async function addBinderPage(binderId: number): Promise<BinderPageData> {
  await ensureCsrf()
  const { json } = await fetchJson<BinderPageData>(getUrl(`binders/${binderId}/pages/`), {
    method: 'POST',
    body: JSON.stringify({}),
  })
  return json
}

async function updateBinderPage(binderId: number, pageId: number, name: string): Promise<BinderPageData> {
  await ensureCsrf()
  const { json } = await fetchJson<BinderPageData>(getUrl(`binders/${binderId}/pages/${pageId}/`), {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return json
}

async function deleteBinderPage(binderId: number, pageId: number): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`binders/${binderId}/pages/${pageId}/`), { method: 'DELETE' })
}

async function setSlotCard(
  binderId: number,
  pageId: number,
  position: number,
  cardId: string,
): Promise<BinderSlotData> {
  await ensureCsrf()
  const { json } = await fetchJson<BinderSlotData>(
    getUrl(`binders/${binderId}/pages/${pageId}/slots/${position}/`),
    { method: 'PUT', body: JSON.stringify({ card_id: cardId }) },
  )
  return json
}

async function clearSlotCard(binderId: number, pageId: number, position: number): Promise<void> {
  await ensureCsrf()
  await fetchJson(getUrl(`binders/${binderId}/pages/${pageId}/slots/${position}/`), { method: 'DELETE' })
}

export const dataProvider = {
  getSets,
  getSet,
  getCardsBySet,
  searchCards,
  getCard,
  getCollections,
  getCollection,
  getCollectionCards,
  createCollection,
  addCardToCollection,
  addPurchase,
  deletePurchase,
  updateCollection,
  deleteCollection,
  getBinderSizes,
  getBinders,
  getBinder,
  createBinder,
  deleteBinder,
  updateBinder,
  addBinderPage,
  updateBinderPage,
  deleteBinderPage,
  setSlotCard,
  clearSlotCard,
}

export type DataProvider = typeof dataProvider