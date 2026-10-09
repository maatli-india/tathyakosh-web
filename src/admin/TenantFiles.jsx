import { useEffect, useState } from 'react'
import { downloadFileURL, listFiles } from '../kosh'
import { bytesHint, formatWhen } from './tenantForm'

const PAGE_SIZE = 100
const VIEW_KEY = 'kosh.fileViews'

export default function TenantFiles({ adminKey, id, onUnauthorized }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(() => new Set())
  const [seeded, setSeeded] = useState(false)
  const [view, setView] = useState(null)

  useEffect(() => {
    let gone = false
    setLoading(true)
    listFiles(adminKey, id, page, PAGE_SIZE)
      .then((data) => {
        if (gone) return
        setTotal(data.total || 0)
        setItems((current) => (page === 1 ? data.items || [] : [...current, ...(data.items || [])]))
      })
      .catch((err) => {
        if (gone) return
        if (err.status === 401) onUnauthorized()
        else setError(err.message)
      })
      .finally(() => {
        if (!gone) setLoading(false)
      })
    return () => {
      gone = true
    }
  }, [adminKey, id, onUnauthorized, page])

  const groups = groupFiles(items)
  const ready = items.filter((file) => file.status === 'READY').length
  const size = items.reduce((sum, file) => sum + (Number(file.sizeBytes) || 0), 0)

  useEffect(() => {
    if (seeded || groups.length === 0) return
    setOpen(new Set([groups[0][0]]))
    setSeeded(true)
  }, [groups, seeded])

  function toggle(type) {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  return (
    <section className="card">
      <h2>Files</h2>
      <dl className="facts wide">
        <div>
          <dt>Files</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{sizeLabel(size)}</dd>
        </div>
        <div>
          <dt>File types</dt>
          <dd>{groups.length}</dd>
        </div>
        <div>
          <dt>Ready</dt>
          <dd>{ready}</dd>
        </div>
      </dl>
      {items.length < total ? <p className="hint">Type counts and size are for the {items.length} files loaded.</p> : null}
      {error ? <p className="note bad"><span>{error}</span></p> : null}
      {loading && page === 1 ? <p className="lede">Loading files.</p> : null}
      {!loading && !error && items.length === 0 ? <p className="lede">No files yet.</p> : null}
      {groups.map(([type, files]) => {
        const expanded = open.has(type)
        const showOwner = files.some((file) => file.ownerRef)
        return (
          <section key={type} className="file-group">
            <button type="button" className="file-group-head" aria-expanded={expanded} onClick={() => toggle(type)}>
              <span>
                <span className="mime-label">File type</span>
                <strong>{type}</strong>
              </span>
              <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
            </button>
            {expanded ? (
              <table className="file-table">
                <thead>
                  <tr>
                    {showOwner ? <th>Owner</th> : null}
                    <th>Status</th>
                    <th>Content type</th>
                    <th>Size</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      {showOwner ? <td>{file.ownerRef || ''}</td> : null}
                      <td>{file.status}</td>
                      <td>{typeLabel(file.contentType)}</td>
                      <td>{file.sizeBytes ? bytesHint(file.sizeBytes) : '—'}</td>
                      <td>{formatWhen(file.createdAt)}</td>
                      <td>
                        {file.status === 'READY' ? (
                          <button type="button" className="btn slim" onClick={() => setView(file)}>View</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </section>
        )
      })}
      {items.length < total ? (
        <button type="button" className="btn" disabled={loading} onClick={() => setPage((current) => current + 1)}>
          More
        </button>
      ) : null}
      {view ? (
        <FileView
          adminKey={adminKey}
          file={view}
          onClose={() => setView(null)}
          onUnauthorized={onUnauthorized}
        />
      ) : null}
    </section>
  )
}

function FileView({ adminKey, file, onClose, onUnauthorized }) {
  const [url, setUrl] = useState(() => readView(file.id))
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (url) return undefined
    let gone = false
    downloadFileURL(adminKey, file.id)
      .then((data) => {
        if (gone) return
        saveView(file.id, data.downloadUrl, data.expiresInSeconds)
        setUrl(data.downloadUrl)
      })
      .catch((err) => {
        if (gone) return
        if (err.status === 401) onUnauthorized()
        else setError(err.message)
      })
    return () => {
      gone = true
    }
  }, [adminKey, file.id, onUnauthorized, url])

  const kind = previewKind(file.contentType)

  return (
    <div className="veil" onClick={onClose}>
      <div className="viewer" role="dialog" aria-label={`View ${file.ownerRef || file.id}`} onClick={(event) => event.stopPropagation()}>
        <header>
          <strong>{file.fileType}</strong>
          <button type="button" className="type-x" onClick={onClose} aria-label="Close">×</button>
        </header>
        {error ? <p className="note bad"><span>{error}</span></p> : null}
        {!url && !error ? <p className="lede">Loading preview.</p> : null}
        {url && kind === 'image' ? <img src={url} alt="" /> : null}
        {url && kind === 'video' ? <video src={url} controls /> : null}
        {url && kind === 'pdf' ? <iframe src={url} title={file.fileType} /> : null}
        {url && kind === 'other' ? <p className="lede">This file cannot be shown in the page.</p> : null}
      </div>
    </div>
  )
}

function previewKind(contentType) {
  if (typeof contentType === 'string' && contentType.startsWith('image/')) return 'image'
  if (typeof contentType === 'string' && contentType.startsWith('video/')) return 'video'
  if (contentType === 'application/pdf') return 'pdf'
  return 'other'
}

function typeLabel(contentType) {
  if (!contentType) return ''
  const subtype = String(contentType).split('/').pop().split('+')[0].split(';')[0].toLowerCase()
  const names = {
    csv: 'CSV',
    gif: 'GIF',
    jpeg: 'JPEG',
    jpg: 'JPEG',
    json: 'JSON',
    mp4: 'MP4',
    mpeg: 'MPEG',
    pdf: 'PDF',
    plain: 'TEXT',
    png: 'PNG',
    webp: 'WEBP',
    zip: 'ZIP',
  }
  return names[subtype] || subtype.toUpperCase()
}

function groupFiles(items) {
  const groups = new Map()
  for (const file of items) {
    const type = file.fileType || 'unknown'
    const rows = groups.get(type) || []
    rows.push(file)
    groups.set(type, rows)
  }
  return [...groups.entries()]
}

function sizeLabel(bytes) {
  if (!bytes) return '0 bytes'
  return bytesHint(bytes)
}

function readView(id) {
  try {
    const all = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}')
    const hit = all[id]
    if (!hit?.url || Date.now() >= hit.expiresAt) return null
    return hit.url
  } catch {
    return null
  }
}

function saveView(id, url, seconds) {
  try {
    const all = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}')
    all[id] = { expiresAt: Date.now() + Math.max(5, Number(seconds) - 30) * 1000, url }
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(all))
  } catch {
    sessionStorage.removeItem(VIEW_KEY)
  }
}
