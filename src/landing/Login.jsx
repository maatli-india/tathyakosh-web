import { useId, useState } from 'react'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [incomplete, setIncomplete] = useState(false)
  const usernameId = useId()
  const passwordId = useId()

  function onSubmit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setIncomplete(true)
      return
    }
    setPassword('')
    setLoggedIn(true)
  }

  if (loggedIn) {
    return (
      <section className="login" aria-label="Signed in">
        <p className="login-status">Admin is logged in</p>
      </section>
    )
  }

  return (
    <section className="login" aria-label="Sign in">
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
