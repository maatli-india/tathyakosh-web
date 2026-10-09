import { useEffect, useState } from 'react'
import { followLink } from '../path'
import { extendAdminSession, readAdminSession } from '../session'
import Coming from './Coming'
import Tenant from './Tenant'
import TenantNew from './TenantNew'
import Tenants from './Tenants'
import './Admin.css'
import './Tenants.css'

const TITLES = {
  dashboard: 'Dashboard',
  files: 'Files',
  missing: 'Missing',
  'tenant-new': 'New tenant',
  tenant: 'Tenant',
  tenants: 'Tenants',
}

export default function Admin({ adminKey, expiresAt, onLeave, route }) {
  useEffect(() => {
    if (route.page === 'tenant') return undefined
    document.title = `${TITLES[route.page] || 'Tathyakosh'} · Tathyakosh`
    return undefined
  }, [route.page])

  const [left, setLeft] = useState(() => Math.max(0, expiresAt - Date.now()))
  const [askExtend, setAskExtend] = useState(() => expiresAt - Date.now() <= 15000)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = readAdminSession()
      if (!current) {
        onLeave()
        return
      }
      const remaining = current.expiresAt - Date.now()
      setLeft(Math.max(0, remaining))
      if (remaining <= 15000) setAskExtend(true)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [onLeave])

  const tenantsOn = route.page === 'tenants' || route.page === 'tenant' || route.page === 'tenant-new'

  function stay() {
    const next = extendAdminSession()
    if (!next) return
    setLeft(Math.max(0, next - Date.now()))
    setAskExtend(false)
  }

  return (
    <div className="shell">
      <aside className="rail">
        <p className="mark">Tathyakosh</p>
        <nav>
          <a href="/dashboard" aria-current={route.page === 'dashboard' ? 'page' : undefined} onClick={(event) => followLink(event, '/dashboard')}>
            Dashboard
          </a>
          <a href="/tenants" aria-current={tenantsOn ? 'page' : undefined} onClick={(event) => followLink(event, '/tenants')}>
            Tenants
          </a>
          <a href="/files" aria-current={route.page === 'files' ? 'page' : undefined} onClick={(event) => followLink(event, '/files')}>
            Files
          </a>
        </nav>
        <p className="session">
          <span>Session</span>
          <strong>{formatLeft(left)}</strong>
        </p>
        <button type="button" className="leave" onClick={onLeave}>Sign out</button>
      </aside>
      <main>
        {route.page === 'dashboard' ? <Coming title="Dashboard" /> : null}
        {route.page === 'tenants' ? <Tenants adminKey={adminKey} onUnauthorized={onLeave} pageNo={route.pageNo} /> : null}
        {route.page === 'tenant-new' ? <TenantNew adminKey={adminKey} onUnauthorized={onLeave} /> : null}
        {route.page === 'tenant' ? <Tenant key={route.id} adminKey={adminKey} id={route.id} onUnauthorized={onLeave} /> : null}
        {route.page === 'files' ? <Coming title="Files" /> : null}
        {route.page === 'missing' ? (
          <section className="page">
            <h1 className="page-title">Missing</h1>
            <p className="lede">This address is not a page.</p>
          </section>
        ) : null}
      </main>
      {askExtend ? (
        <div className="veil" role="presentation">
          <div className="viewer session-ask" role="dialog" aria-label="Session ending">
            <h2>This session is about to end.</h2>
            <p className="lede">Extend it for another 30 minutes, or sign out.</p>
            <div className="row-actions">
              <button type="button" className="btn-accent" onClick={stay}>Yes, extend</button>
              <button type="button" className="btn" onClick={onLeave}>Sign out</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatLeft(ms) {
  const total = Math.ceil(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
