export const CARD_SORT_OPTIONS = [
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
] as const

type SortOption = { value: string; label: string }

type SortSelectProps = {
  options: readonly SortOption[]
  value: string
  onChange: (value: string) => void
}

export function SortSelect({ options, value, onChange }: SortSelectProps) {
  return (
    <label className="page__sort">
      <span className="page__sort-label">Sort</span>
      <select
        className="page__sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
