import { useState } from 'react'

export function Notice({ notice, onClose }) {
  return (
    <p className={notice.tone === 'ok' ? 'note ok-note' : 'note bad'}>
      <span>{notice.text}</span>
      <button type="button" onClick={onClose}>Dismiss</button>
    </p>
  )
}

export function Once({ onClose, onRevoke, secret }) {
  const [copied, setCopied] = useState('')

  function copy(label, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label)
      window.setTimeout(() => setCopied((current) => (current === label ? '' : current)), 1600)
    })
  }

  return (
    <div className="once">
      <p className="kicker">{secret.title}</p>
      {secret.note ? <p className="once-note">{secret.note}</p> : null}
      {secret.lines.map(([label, value]) => (
        <label key={label} className="once-field">
          {label}
          <span>
            <input readOnly value={value} />
            <button type="button" onClick={() => copy(label, value)}>{copied === label ? 'Copied' : 'Copy'}</button>
          </span>
        </label>
      ))}
      <div className="row-actions">
        <button type="button" className="text-btn" onClick={onClose}>Hide</button>
        {onRevoke ? (
          <button type="button" className="text-btn" onClick={onRevoke}>Revoke</button>
        ) : null}
      </div>
    </div>
  )
}
