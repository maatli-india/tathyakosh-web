import { useEffect, useState } from 'react'
import { deleteTenant, getTenant, issueAPIKey, patchTenant, revokeAPIKey, rotateWebhookSecret } from '../kosh'
import { followLink, go } from '../path'
import { Notice, Once } from './feedback'
import TenantFields from './TenantFields'
import { fileTypesFromForm, formFromTenant, formSnapshot, patchBody } from './tenantForm'
import TenantFiles from './TenantFiles'
import { useKosh } from './useKosh'

const ISSUED_KEY = 'kosh.issuedKeys'

export default function Tenant({ adminKey, id, onUnauthorized }) {
  const [tenant, setTenant] = useState(null)
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState(null)
  const [secret, setSecret] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [issued, setIssued] = useState(() => readIssued(id))
  const [missing, setMissing] = useState('')
  const [tab, setTab] = useState('details')
  const [panel, setPanel] = useState('policy')
  const { busy, error, run, setError } = useKosh(onUnauthorized)

  useEffect(() => {
    document.title = 'Tenant · Tathyakosh'
    let gone = false
    setTenant(null)
    setForm(null)
    setMissing('')
    getTenant(adminKey, id)
      .then((data) => {
        if (gone) return
        setTenant(data)
        setForm(formFromTenant(data))
        document.title = `${data.name} · Tathyakosh`
      })
      .catch((err) => {
        if (gone) return
        if (err.status === 401) onUnauthorized()
        else setMissing(err.message)
      })
    return () => {
      gone = true
    }
  }, [adminKey, id, onUnauthorized])

  async function onSave(event) {
    event.preventDefault()
    const fileTypes = fileTypesFromForm(form.types)
    if (!fileTypes || Object.keys(fileTypes).length === 0) {
      setError(fileTypes ? 'Add at least one file type.' : 'Each file type needs a name.')
      return
    }
    const updated = await run(() => patchTenant(adminKey, id, patchBody(form, fileTypes)))
    if (!updated.ok) return
    setTenant(updated.data)
    setForm(formFromTenant(updated.data))
    setNotice({ tone: 'ok', text: 'Tenant updated' })
  }

  async function onIssue() {
    const created = await run(() => issueAPIKey(adminKey, id))
    if (!created.ok) return
    rememberIssued(id, created.data)
    setIssued(readIssued(id))
    setSecret({
      lines: [['API key', created.data.apiKey], ['Key id', created.data.id]],
      note: 'This key is not stored. It cannot be retrieved later. Copy it and keep it somewhere secure.',
      revokeId: created.data.id,
      title: 'API key, shown once',
    })
    setPanel('credentials')
  }

  async function onRevoke(key) {
    const result = await run(() => revokeAPIKey(adminKey, id, key))
    if (!result.ok) return
    forgetIssued(id, key)
    setIssued(readIssued(id))
    setSecret((current) => (current?.revokeId === key ? null : current))
    setNotice({ tone: 'ok', text: 'API key revoked' })
  }

  async function onRotate() {
    const rotated = await run(() => rotateWebhookSecret(adminKey, id))
    if (!rotated.ok) return
    setSecret({
      lines: [['Webhook secret', rotated.data.webhookSecret]],
      note: 'This secret is not stored. It cannot be retrieved later. Copy it and keep it somewhere secure.',
      title: 'Webhook secret, shown once',
    })
    setPanel('credentials')
  }

  async function onDelete() {
    const result = await run(() => deleteTenant(adminKey, id))
    if (!result.ok) return
    go('/tenants')
  }

  if (missing) {
    return (
      <section className="page">
        <Back />
        <h1 className="page-title">Tenant</h1>
        <p className="note bad"><span>{missing}</span></p>
      </section>
    )
  }

  return (
    <section className="page">
      <Back />
      <header className="page-head">
        <div>
          <h1 className="page-title">{tenant?.name || 'Tenant'}</h1>
          {tenant ? (
            <dl className="facts">
              <div>
                <dt>Status</dt>
                <dd>{tenant.status}</dd>
              </div>
              <div>
                <dt>Slug</dt>
                <dd>{tenant.slug}</dd>
              </div>
              {tenant.mainBucket ? (
                <div>
                  <dt>Bucket</dt>
                  <dd>{tenant.mainBucket}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="lede">Loading</p>
          )}
        </div>
      </header>
      <div className="tabs" role="tablist">
        <button type="button" aria-pressed={tab === 'details'} onClick={() => setTab('details')}>Details</button>
        <button type="button" aria-pressed={tab === 'files'} onClick={() => setTab('files')}>Files</button>
      </div>
      {notice ? <Notice notice={notice} onClose={() => setNotice(null)} /> : null}
      {tab === 'files' && tenant ? <TenantFiles adminKey={adminKey} id={id} onUnauthorized={onUnauthorized} /> : null}
      {tab === 'details' && form ? (
        <section className="fold">
          <button type="button" className="fold-head" aria-expanded={panel === 'policy'} onClick={() => setPanel(panel === 'policy' ? '' : 'policy')}>
            Policy
          </button>
          {panel === 'policy' ? (
            <form onSubmit={onSave}>
              {error ? <p className="note bad"><span>{error}</span></p> : null}
              <TenantFields form={form} mode="edit" onChange={setForm} />
              <button type="submit" className="btn-accent" disabled={busy || !dirty(tenant, form)}>Save</button>
            </form>
          ) : null}
        </section>
      ) : null}
      {tab === 'details' && tenant ? (
        <section className="fold">
          <button type="button" className="fold-head" aria-expanded={panel === 'credentials'} onClick={() => setPanel(panel === 'credentials' ? '' : 'credentials')}>
            Credentials
          </button>
          {panel === 'credentials' ? (
            <div className="fold-body">
              {secret ? (
                <Once
                  secret={secret}
                  onClose={() => setSecret(null)}
                  onRevoke={secret.revokeId ? () => onRevoke(secret.revokeId) : undefined}
                />
              ) : null}
              <div className="row-actions">
                <button type="button" className="btn" disabled={busy} onClick={onIssue}>Issue API key</button>
                <button type="button" className="btn" disabled={busy} onClick={onRotate}>Rotate webhook secret</button>
              </div>
              {issued.length ? (
                <ul className="issued">
                  {issued.map((key) => (
                    <li key={key.id}>
                      <code>{key.id}</code>
                      <button type="button" className="text-btn" onClick={() => onRevoke(key.id)}>Revoke</button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
      {tab === 'details' && tenant ? (
        <section className="fold">
          <button type="button" className="fold-head" aria-expanded={panel === 'delete'} onClick={() => setPanel(panel === 'delete' ? '' : 'delete')}>
            Delete
          </button>
          {panel === 'delete' ? (
            <div className="fold-body">
              <p className="hint">Deletes the bucket, the files, and the keys.</p>
              {confirmDelete ? (
                <div className="row-actions">
                  <button type="button" className="btn-danger" disabled={busy} onClick={onDelete}>Delete now</button>
                  <button type="button" className="btn" disabled={busy} onClick={() => setConfirmDelete(false)}>Keep</button>
                </div>
              ) : (
                <button type="button" className="btn-danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
                  Delete tenant
                </button>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}

function Back() {
  return (
    <a className="back" href="/tenants" onClick={(event) => followLink(event, '/tenants')}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 5 L8 12 L15 19" />
      </svg>
      Tenants
    </a>
  )
}

function dirty(tenant, form) {
  if (!tenant || !form) return false
  return formSnapshot(form) !== formSnapshot(formFromTenant(tenant))
}

function readIssued(tenantID) {
  if (!tenantID) return []
  try {
    const all = JSON.parse(sessionStorage.getItem(ISSUED_KEY) || '{}')
    return all[tenantID] || []
  } catch {
    return []
  }
}

function rememberIssued(tenantID, created) {
  if (!tenantID || !created?.id) return
  try {
    const all = JSON.parse(sessionStorage.getItem(ISSUED_KEY) || '{}')
    const rows = all[tenantID] || []
    all[tenantID] = [{ id: created.id }, ...rows.filter((row) => row.id !== created.id)]
    sessionStorage.setItem(ISSUED_KEY, JSON.stringify(all))
  } catch {
    sessionStorage.removeItem(ISSUED_KEY)
  }
}

function forgetIssued(tenantID, id) {
  try {
    const all = JSON.parse(sessionStorage.getItem(ISSUED_KEY) || '{}')
    all[tenantID] = (all[tenantID] || []).filter((row) => row.id !== id)
    sessionStorage.setItem(ISSUED_KEY, JSON.stringify(all))
  } catch {
    sessionStorage.removeItem(ISSUED_KEY)
  }
}
