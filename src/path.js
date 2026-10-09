import { useEffect, useState } from 'react'

export function parseLocation(pathname, search) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(search)
  if (path === '/') return { page: 'home' }
  if (path === '/dashboard') return { page: 'dashboard' }
  if (path === '/files') return { page: 'files' }
  if (path === '/tenants') return { page: 'tenants', pageNo: pageNumber(params.get('page')) }
  if (path === '/tenants/new') return { page: 'tenant-new' }
  const tenant = path.match(/^\/tenants\/([^/]+)$/)
  if (tenant) return { page: 'tenant', id: decodeURIComponent(tenant[1]) }
  return { page: 'missing' }
}

export function go(path, { replace = false } = {}) {
  const current = `${window.location.pathname}${window.location.search}`
  if (current !== path) {
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', path)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function followLink(event, path) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  go(path)
}

export function usePath() {
  const [route, setRoute] = useState(() => parseLocation(window.location.pathname, window.location.search))

  useEffect(() => {
    const sync = () => setRoute(parseLocation(window.location.pathname, window.location.search))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return route
}

function pageNumber(value) {
  const page = Number(value)
  if (!Number.isInteger(page) || page < 1) return 1
  return page
}
