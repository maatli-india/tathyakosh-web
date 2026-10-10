// Browser calls same-origin /kosh. Vite (local) and Netlify (kosh-dev) forward that to the dev API.
const API_ORIGIN = 'https://api-dev.kosh.maatli.com'

export async function kosh(path, { adminKey, body, method = 'GET' } = {}) {
  const url = `/kosh${path}`
  const headers = { 'X-Admin-Key': adminKey }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  let response
  try {
    response = await fetch(url, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    })
  } catch {
    const error = new Error(`Could not reach ${API_ORIGIN}.`)
    error.status = 0
    throw error
  }
  if (response.status === 204) return null
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!response.ok) {
    const detail = data?.message || text.trim().slice(0, 180)
    const error = new Error(detail || `Kosh returned ${response.status} for ${url}`)
    error.status = response.status
    throw error
  }
  return data
}

export function downloadFileURL(adminKey, id) {
  return kosh(`/v1/files/${id}/download-url`, { adminKey })
}

export function listFiles(adminKey, tenantId, page = 1, limit = 100) {
  const query = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    tenantId,
  })
  return kosh(`/v1/files?${query}`, { adminKey })
}

export function listTenants(adminKey, page, limit = 10) {
  const query = new URLSearchParams({ limit: String(limit), page: String(page) })
  return kosh(`/v1/tenants?${query}`, { adminKey })
}

export function getTenant(adminKey, id) {
  return kosh(`/v1/tenants/${id}`, { adminKey })
}

export function createTenant(adminKey, body) {
  return kosh('/v1/tenants', { adminKey, body, method: 'POST' })
}

export function patchTenant(adminKey, id, body) {
  return kosh(`/v1/tenants/${id}`, { adminKey, body, method: 'PATCH' })
}

export function deleteTenant(adminKey, id) {
  return kosh(`/v1/tenants/${id}`, { adminKey, method: 'DELETE' })
}

export function issueAPIKey(adminKey, id) {
  return kosh(`/v1/tenants/${id}/api-keys`, { adminKey, method: 'POST' })
}

export function revokeAPIKey(adminKey, id, keyID) {
  return kosh(`/v1/tenants/${id}/api-keys/${keyID}`, { adminKey, method: 'DELETE' })
}

export function rotateWebhookSecret(adminKey, id) {
  return kosh(`/v1/tenants/${id}/webhook-secret/rotate`, { adminKey, method: 'POST' })
}
