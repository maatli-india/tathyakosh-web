import { useState } from 'react'

export function useKosh(onUnauthorized) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(work) {
    setBusy(true)
    setError('')
    try {
      const data = await work()
      return { data, ok: true }
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err.message)
      return { ok: false }
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, run, setError }
}
