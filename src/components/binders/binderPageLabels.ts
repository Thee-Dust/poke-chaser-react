import type { BinderPageData } from '../../api/types'

export function getPageNumber(page: BinderPageData, pages: BinderPageData[]): number {
  return pages.findIndex((p) => p.id === page.id) + 1
}

export function getPageDisplayName(page: BinderPageData, pages: BinderPageData[]): string {
  const trimmed = page.name.trim()
  return trimmed || `Page ${getPageNumber(page, pages)}`
}
