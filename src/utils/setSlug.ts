export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function setPath(set: { id: string; name: string; series?: string }): string {
  const nameSlug = slugify(set.name)
  const seriesSlug = set.series?.trim() ? slugify(set.series) : ''
  const parts =
    seriesSlug && nameSlug && !nameSlug.startsWith(seriesSlug)
      ? [seriesSlug, nameSlug]
      : [nameSlug || seriesSlug].filter(Boolean)
  const slug = parts.join('-')
  return slug ? `/sets/${slug}-${set.id}` : `/sets/${set.id}`
}

export function parseSetIdFromParam(param: string): string {
  const i = param.lastIndexOf('-')
  if (i === -1) return param
  return param.slice(i + 1)
}
