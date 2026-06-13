import './Pagination.css'

type PaginationItem =
  | { type: 'page'; value: number }
  | { type: 'ellipsis' }

export function getPaginationItems(page: number, pages: number): PaginationItem[] {
  const pageNumbers = new Set<number>([1, pages])

  for (let i = page - 2; i <= page + 2; i += 1) {
    if (i >= 1 && i <= pages) {
      pageNumbers.add(i)
    }
  }

  const sorted = [...pageNumbers].sort((a, b) => a - b)
  const items: PaginationItem[] = []

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i]
    const previous = sorted[i - 1]

    if (previous !== undefined && current - previous > 1) {
      items.push({ type: 'ellipsis' })
    }

    items.push({ type: 'page', value: current })
  }

  return items
}

type PaginationProps = {
  page: number
  pages: number
  onPageChange: (page: number) => void
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M10 3L5 8l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6 3l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) {
    return null
  }

  const items = getPaginationItems(page, pages)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__button pagination__button--arrow"
        disabled={page <= 1}
        aria-label="Previous page"
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </button>

      {items.map((item, index) => {
        if (item.type === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="pagination__ellipsis" aria-hidden="true">
              …
            </span>
          )
        }

        const isCurrent = item.value === page

        return (
          <button
            key={item.value}
            type="button"
            className={`pagination__button pagination__button--page${isCurrent ? ' pagination__button--current' : ''}`}
            aria-label={`Page ${item.value}`}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => onPageChange(item.value)}
          >
            {item.value}
          </button>
        )
      })}

      <button
        type="button"
        className="pagination__button pagination__button--arrow"
        disabled={page >= pages}
        aria-label="Next page"
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </button>
    </nav>
  )
}
