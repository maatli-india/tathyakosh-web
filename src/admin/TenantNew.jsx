import { useState } from 'react'
import { createTenant } from '../kosh'
import { followLink } from '../path'
import { Once } from './feedback'
import TenantFields from './TenantFields'
import { emptyForm, fileTypesFromForm } from './tenantForm'
import { useKosh } from './useKosh'

export default function TenantNew({ adminKey, onUnauthorized }) {
  const [form, setForm] = useState(emptyForm)
  const [secret, setSecret] = useState(null)
  const [created, setCreated] = useState(null)
  const { busy, error, run, setError } = useKosh(onUnauthorized)

  async function onSubmit(event) {
    event.preventDefault()
    const fileTypes = fileTypesFromForm(form.types)
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required.')
      return
    }
    if (!fileTypes || Object.keys(fileTypes).length === 0) {
      setError(fileTypes ? 'Add at least one file type.' : 'Each file type needs a name.')
      return
    }
    const result = await run(() => createTenant(adminKey, {
      fileTypes,
      maxFileSizeBytes: Number(form.maxFileSizeBytes) || 0,
      name: form.name.trim(),
      slug: form.slug.trim(),
      webhookUrl: form.webhookUrl.trim(),
    }))
    if (!result.ok) return
    setCreated(result.data)
    setSecret({
      lines: [
        ['API key', result.data.apiKey],
        ['Webhook secret', result.data.webhookSecret],
      ],
      title: 'Shown once',
    })
  }

  return (
    <section className="page">
      <a className="back" href="/tenants" onClick={(event) => followLink(event, '/tenants')}>Tenants</a>
      <header className="page-head">
        <h1 className="page-title">New tenant</h1>
      </header>
      {secret ? <Once secret={secret} onClose={() => setSecret(null)} /> : null}
      {created ? (
        <p className="lede">
          <a href={`/tenants/${created.id}`} onClick={(event) => followLink(event, `/tenants/${created.id}`)}>
            Open {created.name}
          </a>
        </p>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          {error ? <p className="note bad"><span>{error}</span></p> : null}
          <TenantFields form={form} mode="create" onChange={setForm} />
          <button type="submit" className="btn-accent" disabled={busy}>Create</button>
        </form>
      )}
    </section>
  )
}
