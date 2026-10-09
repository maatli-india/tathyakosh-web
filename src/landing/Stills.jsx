import { useEffect, useState } from 'react'
import './Stills.css'

const STILLS = [
  { name: 'Ask', line: 'Product asks Kosh for an upload link. The file takes a road Kosh does not walk.', Still: AskStill },
  { name: 'Ready', line: 'The file is marked ready.', Still: ReadyStill },
  { name: 'Tell', line: 'Kosh tells the product the file is ready. The product asks for a download link.', Still: TellStill },
]

const SHIFT_AT = [0.48, 0.64, 0.94]
const LOOP_MS = 16000
const SLIDE_MS = 700

export default function Stills() {
  const [order, setOrder] = useState(STILLS)
  const [sliding, setSliding] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined
    const start = performance.now()
    const fired = [false, false, false]
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
    <section className="reel" aria-label="Ask, ready, tell">
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
      <rect className="still-panel" x="18" y="58" width="78" height="56" rx="8" />
      <line className="still-line" x1="18" y1="74" x2="96" y2="74" />
      <circle className="still-dot" cx="32" cy="66" r="2.5" />
      <circle className="still-dot" cx="42" cy="66" r="2.5" />
      <circle className="still-dot" cx="52" cy="66" r="2.5" />
      <text className="still-name" x="57" y="138" textAnchor="middle">Product</text>

      <rect className="still-kosh" x="132" y="48" width="64" height="64" rx="8" />
      <text className="still-word" x="164" y="84" textAnchor="middle">Kosh</text>

      <rect className="still-shelf" x="230" y="62" width="72" height="14" rx="3" />
      <rect className="still-shelf" x="230" y="82" width="72" height="14" rx="3" />
      <text className="still-name" x="266" y="138" textAnchor="middle">Storage</text>

      <path className="still-route" d="M57 52 C 110 8, 210 6, 246 58" />
      <path className="still-file" d="M154 6 H166 L174 14 V26 H154 Z" />
      <path className="still-fold" d="M166 6 V14 H174" />
      <rect className="still-link" x="96" y="92" width="18" height="11" rx="2" />
      <circle className="still-hole" cx="101" cy="97.5" r="1.8" />
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
      <rect className="still-panel" x="16" y="58" width="78" height="56" rx="8" />
      <line className="still-line" x1="16" y1="74" x2="94" y2="74" />
      <text className="still-name" x="55" y="138" textAnchor="middle">Product</text>

      <rect className="still-kosh" x="128" y="50" width="64" height="64" rx="8" />
      <text className="still-word" x="160" y="86" textAnchor="middle">Kosh</text>

      <rect className="still-link" x="104" y="74" width="18" height="11" rx="2" />
      <circle className="still-hole" cx="109" cy="79.5" r="1.8" />

      <rect className="still-shelf" x="220" y="70" width="80" height="14" rx="3" />
      <rect className="still-shelf" x="220" y="90" width="80" height="14" rx="3" />
      <path className="still-file" d="M236 50 H248 L256 58 V72 H236 Z" />
      <path className="still-fold" d="M248 50 V58 H256" />
      <text className="still-name" x="260" y="138" textAnchor="middle">Storage</text>
    </svg>
  )
}
