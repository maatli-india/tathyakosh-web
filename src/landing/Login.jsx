import { useEffect, useId, useRef, useState } from 'react'
import './Login.css'

export default function Login({ onSignIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [incomplete, setIncomplete] = useState(false)
  const [raised, setRaised] = useState(false)
  const panelRef = useRef(null)
  const usernameId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (!raised) return undefined
    function onPointerDown(event) {
      if (!panelRef.current?.contains(event.target)) setRaised(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [raised])

  function onSubmit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setIncomplete(true)
      return
    }
    const key = username.trim()
    setPassword('')
    setUsername('')
    onSignIn(key)
  }

  return (
    <section
      ref={panelRef}
      className={raised ? 'login is-raised' : 'login'}
      aria-label="Sign in"
      onPointerDown={() => setRaised(true)}
    >
      <form className="login-form" autoComplete="off" onSubmit={onSubmit}>
        <h2>Sign in</h2>
        <label htmlFor={usernameId}>Username</label>
        <input
          id={usernameId}
          name="username"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
            setIncomplete(false)
          }}
        />
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setIncomplete(false)
          }}
        />
        <button type="submit">Sign in</button>
        {incomplete ? <p className="login-hint">Enter username and password</p> : null}
      </form>
    </section>
  )
}
