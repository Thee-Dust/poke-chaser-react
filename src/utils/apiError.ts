export class ApiError extends Error {
  readonly fields: Record<string, string>
  readonly status?: number

  constructor(message: string, fields: Record<string, string> = {}, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.fields = fields
    this.status = status
  }
}

function firstStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function fieldMessage(value: unknown): string | undefined {
  const parts = firstStringArray(value)
  if (parts.length === 0) return undefined
  // Join all messages (important for password validator lists)
  return parts.join(' ')
}

export function parseApiError(
  json: unknown,
  fallback: string,
  status?: number,
): ApiError {
  if (typeof json !== 'object' || json === null) {
    return new ApiError(fallback, {}, status)
  }

  const obj = json as Record<string, unknown>
  const fields: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'detail') continue
    const message = fieldMessage(value)
    if (message) fields[key] = message
  }

  let message = fallback
  if (typeof obj.detail === 'string') {
    message = obj.detail
  } else if (fields.non_field_errors) {
    message = fields.non_field_errors
  } else {
    const firstField = Object.values(fields)[0]
    if (firstField) message = firstField
  }

  return new ApiError(message, fields, status)
}
