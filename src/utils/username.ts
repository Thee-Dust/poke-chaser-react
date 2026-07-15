const USERNAME_PATTERN = /^[\w.@+-]+$/

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username.trim())
}

export const USERNAME_INVALID_MESSAGE =
  'This value may contain only letters, numbers, and @/./+/-/_ characters.'
