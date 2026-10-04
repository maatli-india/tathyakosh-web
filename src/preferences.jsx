import { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'kosh.theme'
const ACCENT_KEY = 'kosh.accent'

export const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export const ACCENTS = [
  { id: 'copper', label: 'Copper' },
  { id: 'indigo', label: 'Indigo' },
  { id: 'green', label: 'Green' },
]

const PreferencesContext = createContext(null)

function readStored(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode can block storage. The choice still applies for this view.
  }
}

export function applyPreferences(theme, accent) {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.documentElement.dataset.accent = accent
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored(THEME_KEY, THEMES.map((item) => item.id), 'system'))
  const [accent, setAccent] = useState(() => readStored(ACCENT_KEY, ACCENTS.map((item) => item.id), 'copper'))

  useEffect(() => {
    applyPreferences(theme, accent)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onMedia = () => {
      if (theme === 'system') applyPreferences('system', accent)
    }
    const onStorage = (event) => {
      if (event.key === THEME_KEY && THEMES.some((item) => item.id === event.newValue)) setTheme(event.newValue)
      if (event.key === ACCENT_KEY && ACCENTS.some((item) => item.id === event.newValue)) setAccent(event.newValue)
    }
    media.addEventListener('change', onMedia)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onMedia)
      window.removeEventListener('storage', onStorage)
    }
  }, [theme, accent])

  const chooseTheme = (next) => {
    writeStored(THEME_KEY, next)
    setTheme(next)
  }

  const chooseAccent = (next) => {
    writeStored(ACCENT_KEY, next)
    setAccent(next)
  }

  return (
    <PreferencesContext.Provider value={{ theme, accent, chooseTheme, chooseAccent }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used within PreferencesProvider')
  return value
}
