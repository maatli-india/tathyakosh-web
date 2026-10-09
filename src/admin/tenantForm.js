export const emptyForm = {
  maxFileSizeBytes: '',
  maxStorageBytes: '',
  name: '',
  slug: '',
  types: [{ download: '1h', mimes: [], name: '', upload: '30m' }],
  webhookUrl: '',
}

export function mimeList(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split('\n')
  return raw.map((item) => item.trim()).filter((item) => item && item.toLowerCase() !== 'any')
}

export function formSnapshot(form) {
  return JSON.stringify({
    maxFileSizeBytes: String(form.maxFileSizeBytes ?? ''),
    maxStorageBytes: String(form.maxStorageBytes ?? ''),
    types: (form.types || []).map((type) => ({
      download: type.download.trim(),
      mimes: mimeList(type.mimes),
      name: type.name.trim(),
      upload: type.upload.trim(),
    })),
    webhookUrl: form.webhookUrl.trim(),
  })
}

export function formFromTenant(tenant) {
  const types = Object.entries(tenant.fileTypes || {}).map(([name, config]) => ({
    download: config.downloadUrlExpiry || '',
    mimes: mimeList(config.allowedMimeTypes),
    name,
    locked: true,
    upload: config.uploadUrlExpiry || '',
  }))
  return {
    maxFileSizeBytes: String(tenant.maxFileSizeBytes ?? ''),
    maxStorageBytes: tenant.maxStorageBytes == null ? '' : String(tenant.maxStorageBytes),
    name: tenant.name || '',
    slug: tenant.slug || '',
    types: types.length ? types : emptyForm.types,
    webhookUrl: tenant.webhookUrl || '',
  }
}

export function fileTypesFromForm(types) {
  const map = {}
  for (const type of types) {
    const name = type.name.trim()
    const mimes = mimeList(type.mimes)
    if (!name) {
      if (mimes.length || types.length === 1) return null
      continue
    }
    map[name] = {
      allowedMimeTypes: mimes,
      downloadUrlExpiry: type.download.trim(),
      uploadUrlExpiry: type.upload.trim(),
    }
  }
  return map
}

export function patchBody(form, fileTypes) {
  const body = {
    fileTypes,
    maxFileSizeBytes: Number(form.maxFileSizeBytes) || 0,
    webhookUrl: form.webhookUrl.trim(),
  }
  if (form.maxStorageBytes !== '') body.maxStorageBytes = Number(form.maxStorageBytes)
  return body
}

export function formatWhen(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function bytesHint(value) {
  const size = Number(value)
  if (!value || !Number.isFinite(size) || size < 0) return ''
  if (size < 1024) return `${size} bytes`
  const units = ['KB', 'MB', 'GB', 'TB']
  let next = size / 1024
  let unit = 0
  while (next >= 1024 && unit < units.length - 1) {
    next /= 1024
    unit += 1
  }
  const rounded = next >= 10 ? Math.round(next) : Math.round(next * 10) / 10
  return `${rounded} ${units[unit]}`
}
