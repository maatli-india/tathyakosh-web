import { useEffect, useRef, useState } from 'react'
import { bytesHint, mimeList } from './tenantForm'

const MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'video/mp4',
]

export default function TenantFields({ form, mode, onChange }) {
  function set(patch) {
    onChange({ ...form, ...patch })
  }

  function updateType(index, patch) {
    set({
      types: form.types.map((type, i) => (i === index ? { ...type, ...patch } : type)),
    })
  }

  return (
    <div className="fields">
      {mode === 'create' ? (
        <>
          <label>
            Name
            <input value={form.name} onChange={(event) => set({ name: event.target.value })} />
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(event) => set({ slug: event.target.value })} />
          </label>
        </>
      ) : null}
      <label>
        Webhook URL
        <input value={form.webhookUrl} onChange={(event) => set({ webhookUrl: event.target.value })} />
      </label>
      <label>
        Max file size, bytes
        <input
          inputMode="numeric"
          value={form.maxFileSizeBytes}
          onChange={(event) => set({ maxFileSizeBytes: event.target.value })}
        />
        {bytesHint(form.maxFileSizeBytes) ? <span className="hint">{bytesHint(form.maxFileSizeBytes)}</span> : null}
      </label>
      {mode === 'edit' ? (
        <label>
          Max storage, bytes
          <input
            inputMode="numeric"
            value={form.maxStorageBytes}
            onChange={(event) => set({ maxStorageBytes: event.target.value })}
          />
          {bytesHint(form.maxStorageBytes) ? <span className="hint">{bytesHint(form.maxStorageBytes)}</span> : null}
        </label>
      ) : null}
      <fieldset>
        <legend>File types</legend>
        {form.types.map((type, index) => (
          <div key={index} className="type-block">
            <label>
              Name
              <input
                placeholder="profile_pic"
                readOnly={type.locked}
                value={type.name}
                onChange={(event) => updateType(index, { name: event.target.value })}
              />
            </label>
            <label>
              Upload expiry
              <input
                placeholder="30m"
                value={type.upload}
                onChange={(event) => updateType(index, { upload: event.target.value })}
              />
            </label>
            <label>
              Download expiry
              <input
                placeholder="1h"
                value={type.download}
                onChange={(event) => updateType(index, { download: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="type-x"
              aria-label={`Remove ${type.name || 'file type'}`}
              onClick={() => set({ types: form.types.filter((_, i) => i !== index) })}
            >
              ×
            </button>
            <div className="mime">
              <span className="mime-label">Allowed types</span>
              <MimeField value={type.mimes} onChange={(mimes) => updateType(index, { mimes })} />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => set({ types: [...form.types, { download: '1h', mimes: [], name: '', upload: '30m' }] })}
        >
          Add type
        </button>
      </fieldset>
    </div>
  )
}

function MimeField({ onChange, value }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const selected = mimeList(value)
  const remaining = MIME_TYPES.filter((mime) => !selected.includes(mime))

  useEffect(() => {
    if (!open) return undefined
    const close = () => setOpen(false)
    if (openMenu) openMenu()
    openMenu = close
    function onPointer(event) {
      if (!root.current?.contains(event.target)) close()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      if (openMenu === close) openMenu = null
    }
  }, [open])

  function add(mime) {
    if (!mime || selected.includes(mime)) return
    onChange([...selected, mime])
    setOpen(false)
  }

  return (
    <>
      <div className="plus" ref={root}>
        <button
          type="button"
          className="plus-btn"
          aria-label="Add a type"
          aria-expanded={open}
          disabled={remaining.length === 0}
          onClick={() => setOpen((current) => !current)}
        >
          +
        </button>
        {open ? (
          <ul className="mime-menu">
            {remaining.map((mime) => (
              <li key={mime}>
                <button type="button" onClick={() => add(mime)}>{mime}</button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="chips">
        {selected.length === 0 ? <span className="hint">Any type</span> : null}
        {selected.map((mime) => (
          <span key={mime} className="chip">
            <button type="button" aria-label={`Remove ${mime}`} onClick={() => onChange(selected.filter((item) => item !== mime))}>×</button>
            <span>{mime}</span>
          </span>
        ))}
      </div>
    </>
  )
}

let openMenu = null
