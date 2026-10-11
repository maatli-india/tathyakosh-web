import { useEffect, useState } from 'react'
import './Stills.css'

const STILLS = [
  { name: 'Ask', line: 'Product asks Kosh for an upload link.', Still: AskStill },
  { name: 'Pass', line: 'The file takes a road Kosh does not walk.', Still: PassStill },
  { name: 'Ready', line: 'The file is marked ready.', Still: ReadyStill },
  { name: 'Tell', line: 'Kosh tells the product the file is ready.', Still: TellStill },
  { name: 'Link', line: 'The product asks for a download link.', Still: LinkStill },
]

const SHIFT_AT = STILLS.map((_, index) => (index + 1) / (STILLS.length + 1))
const LOOP_MS = 16000
const SLIDE_MS = 700

export default function Stills() {
  const [order, setOrder] = useState(STILLS)
  const [sliding, setSliding] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined
    const start = performance.now()
    const fired = Array(STILLS.length).fill(false)
    let frame = 0
    let timer = 0

    const tick = (now) => {
      const progress = ((now - start) % LOOP_MS) / LOOP_MS
      if (progress < 0.04) fired.fill(false)
      SHIFT_AT.forEach((mark, index) => {
        if (fired[index] || progress < mark) return
        fired[index] = true
        setSliding(true)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          setOrder((current) => [...current.slice(1), current[0]])
          setSliding(false)
        }, SLIDE_MS)
      })
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [])

  const shown = sliding ? [...order, order[0]] : order

  return (
    <section className="reel" aria-label="Ask, pass, ready, tell, link">
      <div className="reel-window">
        <div className={sliding ? 'reel-track is-sliding' : 'reel-track'}>
          {shown.map((card, index) => (
            <figure key={`${card.name}-${index}`} aria-hidden={index > 2 ? true : undefined}>
              <card.Still />
              <figcaption>
                <strong>{card.name}</strong>
                <span>{card.line}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function AskStill() {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true">
      <rect className="still-panel" x="36" y="58" width="90" height="58" rx="8" />
      <line className="still-line" x1="36" y1="76" x2="126" y2="76" />
      <text className="still-name" x="81" y="146" textAnchor="middle">Product</text>
      <rect className="still-link" x="148" y="78" width="28" height="16" rx="3" />
      <circle className="still-hole" cx="156" cy="86" r="2.2" />
      <path className="still-route" d="M176 86 H210" />
      <rect className="still-kosh" x="214" y="52" width="70" height="70" rx="8" />
      <text className="still-word" x="249" y="92" textAnchor="middle">Kosh</text>
    </svg>
  )
}

function PassStill() {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true">
      <path className="still-route" d="M36 40 C 90 40, 120 130, 190 118" />
      <path className="still-file" d="M48 24 H64 L74 34 V54 H48 Z" />
      <path className="still-fold" d="M64 24 V34 H74" />
      <rect className="still-shelf" x="196" y="78" width="88" height="16" rx="3" />
      <rect className="still-shelf" x="196" y="102" width="88" height="16" rx="3" />
      <rect className="still-shelf" x="196" y="126" width="88" height="16" rx="3" />
      <text className="still-name" x="240" y="164" textAnchor="middle">Storage</text>
    </svg>
  )
}

function ReadyStill() {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true">
      <rect className="still-shelf" x="78" y="78" width="164" height="16" rx="3" />
      <rect className="still-shelf" x="78" y="102" width="164" height="16" rx="3" />
      <rect className="still-shelf" x="78" y="126" width="164" height="16" rx="3" />
      <path className="still-file" d="M108 50 H124 L134 60 V84 H108 Z" />
      <path className="still-fold" d="M124 50 V60 H134" />
      <path className="still-bracket" d="M100 64 V46 H116" />
      <path className="still-bracket" d="M142 70 V88 H126" />
      <circle className="still-stamp" cx="132" cy="54" r="8" />
      <path className="still-check" d="M128 54.2 L131 57.2 L137 51" />
      <text className="still-name" x="160" y="164" textAnchor="middle">Storage</text>
    </svg>
  )
}

function TellStill() {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true">
      <rect className="still-kosh" x="48" y="52" width="70" height="70" rx="8" />
      <text className="still-word" x="83" y="92" textAnchor="middle">Kosh</text>
      <path className="still-route" d="M122 86 H190" />
      <circle className="still-stamp" cx="156" cy="86" r="7" />
      <rect className="still-panel" x="196" y="58" width="84" height="56" rx="8" />
      <line className="still-line" x1="196" y1="74" x2="280" y2="74" />
      <text className="still-name" x="238" y="146" textAnchor="middle">Product</text>
    </svg>
  )
}

function LinkStill() {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true">
      <rect className="still-panel" x="48" y="56" width="96" height="60" rx="8" />
      <line className="still-line" x1="48" y1="74" x2="144" y2="74" />
      <text className="still-name" x="96" y="146" textAnchor="middle">Product</text>
      <rect className="still-link" x="176" y="74" width="36" height="20" rx="3" />
      <circle className="still-hole" cx="186" cy="84" r="2.4" />
      <path className="still-route" d="M148 86 H176" />
    </svg>
  )
}
