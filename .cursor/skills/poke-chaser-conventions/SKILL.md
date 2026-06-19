---
name: poke-chaser-conventions
description: Poke Chaser React app conventions for data fetching, components, routing, and styling. Use when adding pages, components, dataProvider methods, or API integration in this repo.
disable-model-invocation: true
---

# Poke Chaser Conventions

## Architecture

```
src/
  pages/          # Route screens (DashboardPage, SetDetailPage, CardDetailPage, ...)
  components/     # Presentational, each with colocated .css file
    cards/        # CardGrid, CardTile
    sets/         # SetGrid, SetTile
    ui/           # Shared UI (Pagination)
    layout/       # AppShell, AppHeader, Breadcrumb
  providers/      # dataProvider.ts + DataProviderContext.tsx (useData())
  context/        # AuthContext.tsx (useAuth())
  utils/          # api.tsx: getUrl, fetchJson, buildQuery
  api/            # types.ts, mockData.ts
  routes/         # AppRoutes.tsx
```

## Adding a dataProvider method

```ts
async function getThings(page = 1, sort = 'default') {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('sort', sort)

  const { json } = await fetchJson<any>(
    getUrl(`cards/theEndpoint/?${params.toString()}`),
  )

  return {
    items: json.results ?? [],
    page: json.meta?.pagination?.page ?? page,
    pages: json.meta?.pagination?.pages ?? 1,
  }
}
```

No mock mode. No client-side sorting. Export from `dataProvider` object at the bottom.

## Page data pattern

```ts
const [items, setItems] = useState([])
const [page, setPage] = useState(1)
const [pages, setPages] = useState(1)
const [sort, setSort] = useState('default_value')
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  let cancelled = false

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await data.getThings(page, sort)
      if (!cancelled) {
        setItems(result.items)
        setPages(result.pages)
      }
    } catch {
      if (!cancelled) setError('Failed to load.')
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  load()
  return () => { cancelled = true }
}, [data, page, sort])
```

Always include all query inputs in deps. Reset `page` to 1 when `sort` changes.

## Types

```ts
// src/api/types.ts — mirror API JSON exactly, snake_case, no aliases
export type Card = {
  id: string
  name: string
  number?: string
  rarity?: string
  images?: { large?: string; small?: string }
  set_id?: string
  set_name?: string
}
```

## Styling conventions

- BEM-style: `block__element--modifier` (e.g. `card-tile__name`, `set-detail__header`)
- Reuse CSS vars: `var(--accent)`, `var(--border)`, `var(--text-h)`, `var(--bg)`, `var(--code-bg)`
- Colocate styles with components; global layout styles in `AppShell.css`
- Page-specific classes (prefix with page name) to avoid collisions with shared classes

## Routing

Routes are nested under `AppShell` in `src/routes/AppRoutes.tsx`:

```tsx
<Route element={<AppShell />}>
  <Route index element={<DashboardPage />} />
  <Route path="sets/:setId" element={<SetDetailPage />} />
  <Route path="cards/:cardId" element={<CardDetailPage />} />
  ...
</Route>
```

## Sort dropdown pattern (inline, no util file)

```tsx
const SORT_OPTIONS = [
  { value: 'default_val', label: 'Default' },
  { value: 'name_asc', label: 'A–Z' },
] as const

// In JSX — reuse page__header / page__sort / page__sort-select classes
<div className="page__header">
  <h1>Page Title</h1>
  <label className="page__sort">
    <span className="page__sort-label">Sort</span>
    <select className="page__sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>
      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
</div>
```
