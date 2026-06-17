export const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getUrl = (route: string) => {
  return `${apiUrl}/${route}`.replace(/([^:]\/)\/+/g, '$1')
}

export const buildQuery = (filters: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export async function ensureCsrf(): Promise<void> {
  await fetch(getUrl('auth/csrf/'), { credentials: 'include' })
}

export const fetchJson = async <T = unknown>(
  url: string,
  options: RequestInit = {},
) => {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  const method = (options.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCsrfToken()
    if (csrf) headers.set('X-CSRFToken', csrf)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' })
  const body = await response.text()
  const json = body ? JSON.parse(body) : {}
  if (!response.ok) {
    throw new Error(json.detail ?? response.statusText)
  }
  return { status: response.status, headers: response.headers, body, json: json as T }
}
