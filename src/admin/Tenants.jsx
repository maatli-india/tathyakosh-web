import { useEffect, useState } from 'react'
import { listTenants } from '../kosh'
import { followLink, go } from '../path'
import { Notice } from './feedback'
import { formatWhen } from './tenantForm'

const PAGE_SIZE = 10

export default function Tenants({ adminKey, onUnauthorized, pageNo }) {
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let gone = false
    setLoading(true)
    setList(null)
    listTenants(adminKey, pageNo, PAGE_SIZE)
      .then((data) => {
        if (!gone) setList(data)
      })
      .catch((error) => {
        if (gone) return
        if (error.status === 401) onUnauthorized()
        else setNotice({ tone: 'bad', text: error.message })
      })
      .finally(() => {
        if (!gone) setLoading(false)
      })
    return () => {
      gone = true
    }
  }, [adminKey, onUnauthorized, pageNo])

  const pages = list ? Math.max(1, Math.ceil(list.total / (list.limit || PAGE_SIZE))) : 1

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="lede">{list ? `${list.total} ${list.total === 1 ? 'tenant' : 'tenants'}` : 'Loading'}</p>
        </div>
        <a className="btn-accent" href="/tenants/new" onClick={(event) => followLink(event, '/tenants/new')}>
          New tenant
        </a>
      </header>
      {notice ? <Notice notice={notice} onClose={() => setNotice(null)} /> : null}
      {loading ? <p className="lede">Loading tenants.</p> : null}
      {!loading && list?.items?.length === 0 ? <p className="lede">No tenants yet.</p> : null}
      <ul className="tenant-list">
        {(list?.items || []).map((tenant) => (
          <li key={tenant.id}>
            <a className="tenant-card" href={`/tenants/${tenant.id}`} onClick={(event) => followLink(event, `/tenants/${tenant.id}`)}>
              <span>
                <strong>{tenant.name}</strong>
                <span className="slug">{tenant.slug}</span>
              </span>
              <span className="meta">
                <em className={tenant.status === 'ACTIVE' ? 'ok' : ''}>{tenant.status}</em>
                <time dateTime={tenant.createdAt}>{formatWhen(tenant.createdAt)}</time>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {list && pages > 1 ? (
        <nav className="pager" aria-label="Pages">
          <button type="button" disabled={pageNo <= 1} onClick={() => go(tenantPage(pageNo - 1))}>Previous</button>
          <span>{pageNo} / {pages}</span>
          <button type="button" disabled={pageNo >= pages} onClick={() => go(tenantPage(pageNo + 1))}>Next</button>
        </nav>
      ) : null}
    </section>
  )
}

function tenantPage(page) {
  return page <= 1 ? '/tenants' : `/tenants?page=${page}`
}
