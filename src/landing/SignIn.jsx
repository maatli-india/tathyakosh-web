import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './SignIn.css'

const ROLES = [
  { id: 'operator', label: 'Operator' },
  { id: 'tenant', label: 'Tenant' },
]

export default function SignIn() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('operator')
  const [secret, setSecret] = useState('')
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const secretRef = useRef(null)
  const labelId = useId()
  const panelId = useId()

  function close({ focusButton = false } = {}) {
    setOpen(false)
    setSecret('')
    if (focusButton) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return undefined
    secretRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        setSecret('')
        buttonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = [...panel.querySelectorAll('button, input')]
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function onRoleKeyDown(event) {
    const index = ROLES.findIndex((item) => item.id === role)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setRole(ROLES[(index + 1) % ROLES.length].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setRole(ROLES[(index - 1 + ROLES.length) % ROLES.length].id)
    }
  }

  function onSecretKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    close({ focusButton: true })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="sign-button"
        aria-label="Sign in"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
      >
        <SignInIcon />
        <span className="sign-tip" aria-hidden="true">Sign in</span>
      </button>
      {createPortal(
        <>
          <div
            className="sign-backdrop"
            data-open={open}
            onMouseDown={() => {
              if (open) close()
            }}
          />
          <div
            ref={panelRef}
            id={panelId}
            className="sign-panel"
            role="dialog"
            aria-label="Sign in"
            aria-hidden={!open}
            inert={!open}
            data-open={open}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div
              className="sign-role"
              role="radiogroup"
              aria-label="Sign in as"
              onKeyDown={onRoleKeyDown}
            >
              {ROLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={role === item.id}
                  onClick={() => setRole(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="sign-field">
              <label id={labelId} htmlFor={`${labelId}-key`}>Key</label>
              <input
                ref={secretRef}
                id={`${labelId}-key`}
                className="sign-secret"
                type="text"
                name="kosh-lookalike-key"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={secret}
                aria-labelledby={labelId}
                onChange={(event) => setSecret(event.target.value)}
                onKeyDown={onSecretKeyDown}
              />
            </div>
            <button type="button" className="sign-submit" onClick={() => close({ focusButton: true })}>
              Submit
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

function SignInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5 H19 a2 2 0 0 1 2 2 V17 a2 2 0 0 1 -2 2 H14" />
      <path d="M3 12 H14" />
      <path d="M10 8 L14 12 L10 16" />
    </svg>
  )
}
