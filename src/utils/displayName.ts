import type { User } from '../api/types'

export function displayName(user: User): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return full || user.username
}
