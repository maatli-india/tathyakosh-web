const STORAGE_KEY = 'kosh.adminSession'
const TTL_MS = 30 * 60 * 1000

export function saveAdminKey(key) {
  const session = { expiresAt: Date.now() + TTL_MS, key }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session.expiresAt
}

export function extendAdminSession() {
  const session = readAdminSession()
  if (!session?.key) return null
  session.expiresAt = Date.now() + TTL_MS
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt: session.expiresAt, key: session.key }))
  return session.expiresAt
}

export function readAdminSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.key || !session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearAdminKey() {
  localStorage.removeItem(STORAGE_KEY)
}
