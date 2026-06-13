export const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const AUTH_STORAGE_KEY = 'poke-chaser-auth'

export const getToken = (): string | undefined => {
    try {
        const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}')
        return auth?.token
    } catch {
        return undefined
    }
}

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

export const fetchJson = async <T = unknown>(
    url: string,
    options: RequestInit = {},
) => {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    const token = getToken()
    if (token) {
        headers.set('Authorization', `Token ${token}`)
    }
    const response = await fetch(url, { ...options, headers })
    const body = await response.text()
    const json = body ? JSON.parse(body) : {}
    if (!response.ok) {
        throw new Error(json.detail ?? response.statusText)
    }
    return { status: response.status, headers: response.headers, body, json: json as T }
}