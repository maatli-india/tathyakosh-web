import { ACCENTS, THEMES, usePreferences } from '../preferences'
import './Dock.css'

export default function Dock() {
  const { theme, accent, chooseTheme, chooseAccent } = usePreferences()
  const year = new Date().getFullYear()

  return (
    <footer className="dock">
      <ChoiceGroup label="Theme" value={theme} options={THEMES} onChange={chooseTheme} />
      <ChoiceGroup label="Colour" value={accent} options={ACCENTS} onChange={chooseAccent} swatches />
      <p className="dock-copy">© {year} Maatli</p>
    </footer>
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
