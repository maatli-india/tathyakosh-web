import { useEffect, useState } from 'react'
import Admin from './admin/Admin'
import Landing from './landing/Landing'
import { go, parseLocation, usePath } from './path'
import { PreferencesProvider } from './preferences'
import { clearAdminKey, readAdminSession, saveAdminKey } from './session'

export default function App() {
  const [session, setSession] = useState(() => readAdminSession())
  const route = usePath()

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = readAdminSession()
      setSession((previous) => {
        if (!current && previous) return null
        if (current && !previous) return current
        return previous
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (session && route.page === 'home') go('/dashboard', { replace: true })
  }, [route.page, session])

  function signIn(key) {
    saveAdminKey(key)
    const next = readAdminSession()
    setSession(next)
    const here = parseLocation(window.location.pathname, window.location.search)
    if (here.page === 'home' || here.page === 'missing') go('/dashboard')
  }

  function leave() {
    clearAdminKey()
    setSession(null)
    go('/', { replace: true })
  }

  return (
    <PreferencesProvider>
      {session ? (
        <Admin adminKey={session.key} expiresAt={session.expiresAt} onLeave={leave} route={route} />
      ) : (
        <Landing onSignIn={signIn} />
      )}
    </PreferencesProvider>
  )
}
