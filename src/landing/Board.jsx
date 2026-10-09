import { useLayoutEffect, useRef, useState } from 'react'
import './Board.css'

const STORY = 'A product asks Kosh for an upload link. The file runs the trace around Kosh and into storage. The file is marked ready.'
const ROUTE = 'M 170 360 V 470 H 850 V 360'

export default function Board() {
  const stageRef = useRef(null)
  const fitRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const fit = fitRef.current
    if (!stage || !fit) return undefined
    const apply = () => {
      const maxWidth = stage.clientWidth
      const maxHeight = stage.clientHeight
      if (maxWidth <= 0 || maxHeight <= 0) return
      const width = Math.min(maxWidth, maxHeight * (1000 / 560))
      fit.style.width = `${width}px`
      const next = width / 1000
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="pcb-stage" aria-label={STORY} ref={stageRef}>
      <div className="pcb-fit" ref={fitRef}>
        <div className="pcb-canvas" style={{ transform: `scale(${scale})` }} aria-hidden="true">
          <svg className="pcb-art" viewBox="0 0 1000 560" width="1000" height="560">
            <rect className="pcb-mask" width="1000" height="560" />
            <path className="pcb-route" d={ROUTE} />
            <path className="pcb-flow" d={ROUTE} pathLength="100" />
            <line className="pcb-ask-flow" x1="270" y1="285" x2="385" y2="285" pathLength="100" />
            <Bus y={250} />
            <Bus y={285} />
            <Bus y={320} />
            <Legs />
            <Caps />
            <Stubs />
            <Die />
          </svg>
          <div className="pcb-pack pcb-product"><strong>PRODUCT</strong></div>
          <div className="pcb-pack pcb-kosh"><strong>KOSH</strong></div>
          <div className="pcb-pack pcb-storage"><strong>STORAGE</strong></div>
          <div className="pcb-ask" />
          <div className="pcb-signal" />
          <div className="pcb-tick">
            <svg viewBox="0 0 12 12">
              <path d="M2.5 6.2 L5 8.6 L9.5 3.4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bus({ y }) {
  return (
    <g>
      <line className="pcb-wire" x1="270" y1={y} x2="385" y2={y} />
      <line className="pcb-wire" x1="625" y1={y} x2="760" y2={y} />
    </g>
  )
}

function Legs() {
  const product = [248, 268, 288, 308, 328, 348]
  const kosh = [230, 255, 280, 305, 330, 355]
  return (
    <g className="pcb-legs">
      {product.map((y) => <rect key={`p-${y}`} x="262" y={y} width="10" height="3" />)}
      {kosh.map((y) => <rect key={`kl-${y}`} x="375" y={y} width="12" height="3" />)}
      {kosh.map((y) => <rect key={`kr-${y}`} x="623" y={y} width="12" height="3" />)}
      {product.map((y) => <rect key={`s-${y}`} x="748" y={y} width="14" height="3" />)}
    </g>
  )
}

function Caps() {
  const spots = [400, 430, 460, 500, 530, 560, 590]
  return (
    <g>
      {spots.map((x) => (
        <g key={x}>
          <rect className="pcb-cap" x={x} y="108" width="18" height="8" rx="1" />
          <rect className="pcb-cap-end" x={x} y="108" width="3" height="8" />
          <rect className="pcb-cap-end" x={x + 15} y="108" width="3" height="8" />
        </g>
      ))}
    </g>
  )
}

function Stubs() {
  const tops = [420, 455, 490, 525, 560]
  return (
    <g>
      {tops.map((x) => (
        <g key={x}>
          <line className="pcb-wire" x1={x} y1="145" x2={x} y2="100" />
          <circle className="pcb-node" cx={x} cy="100" r="3.5" />
          <line className="pcb-wire" x1={x} y1="405" x2={x} y2="450" />
          <circle className="pcb-node" cx={x} cy="450" r="3.5" />
        </g>
      ))}
    </g>
  )
}

function Die() {
  return (
    <g className="pcb-die">
      <rect x="430" y="185" width="150" height="150" />
      <rect x="438" y="193" width="78" height="52" />
      <rect x="522" y="193" width="50" height="28" />
      <rect x="522" y="227" width="50" height="18" />
      <rect x="438" y="251" width="46" height="36" />
      <rect x="490" y="251" width="82" height="36" />
      <rect x="438" y="293" width="134" height="34" />
    </g>
  )
}
