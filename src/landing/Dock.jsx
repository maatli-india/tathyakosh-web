import { useState } from 'react'
import { ACCENTS, THEMES, usePreferences } from '../preferences'
import './Dock.css'

export default function Dock() {
  const { theme, accent, chooseTheme, chooseAccent } = usePreferences()
  const [tab, setTab] = useState('theme')

  return (
    <div className="dock">
      <button type="button" className="dock-icon" aria-label="Appearance">
        <AppearanceIcon />
      </button>
      <div className="dock-panel">
        <div className="dock-tabs" role="tablist" aria-label="Appearance">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'theme'}
            onClick={() => setTab('theme')}
          >
            Theme
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'colour'}
            onClick={() => setTab('colour')}
          >
            Colour
          </button>
        </div>
        {tab === 'theme' ? (
          <ChoiceGroup label="Theme" value={theme} options={THEMES} onChange={chooseTheme} />
        ) : (
          <ChoiceGroup label="Colour" value={accent} options={ACCENTS} onChange={chooseAccent} swatches />
        )}
      </div>
    </div>
  )
}

function ChoiceGroup({ label, value, options, onChange, swatches = false }) {
  function onKeyDown(event) {
    const index = options.findIndex((item) => item.id === value)
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
    else return
    event.preventDefault()
    const id = options[next].id
    onChange(id)
    event.currentTarget.querySelector(`[data-choice="${id}"]`)?.focus()
  }

  return (
    <div
      className={swatches ? 'dock-group dock-accent' : 'dock-group dock-theme'}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            data-choice={option.id}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
          >
            {swatches ? <span className="swatch" data-accent={option.id} /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function AppearanceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5 V5" />
      <path d="M12 19 V21.5" />
      <path d="M2.5 12 H5" />
      <path d="M19 12 H21.5" />
      <path d="M5.2 5.2 L7 7" />
      <path d="M17 17 L18.8 18.8" />
      <path d="M18.8 5.2 L17 7" />
      <path d="M7 17 L5.2 18.8" />
    </svg>
  )
}
