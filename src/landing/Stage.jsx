import { useLayoutEffect, useRef, useState } from 'react'
import './Stage.css'

const STORY = 'A product asks Kosh for an upload link. The file goes to storage. The file is marked ready. Kosh tells the product, and the product asks for a download link.'
const FILE_PATH = 'M 180 270 C 340 18, 700 18, 800 248'

export default function Stage() {
  const fitRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const node = fitRef.current
    if (!node) return undefined
    const apply = () => {
      const width = node.clientWidth
      if (width <= 0) return
      const next = width / 1000
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="stage" aria-label={STORY}>
      <div className="stage-fit" ref={fitRef}>
        <div className="stage-canvas" style={{ transform: `scale(${scale})` }} aria-hidden="true">
          <svg className="stage-route" viewBox="0 0 1000 440" width="1000" height="440">
            <path d={FILE_PATH} />
          </svg>

          <div className="product">
            <div className="product-bar">
              <i /><i /><i />
            </div>
          </div>
          <p className="actor-name actor-product">Product</p>

          <div className="kosh">Kosh</div>

          <div className="storage">
            <i /><i /><i />
          </div>
          <p className="actor-name actor-storage">Storage</p>

          <div className="pulse pulse-ask" />
          <div className="link link-back"><span /></div>
          <div className="file">
            <svg viewBox="0 0 32 40">
              <path className="file-body" d="M1.5 1.5 H20 L30.5 12 V38.5 H1.5 Z" />
              <path className="file-fold" d="M20 1.5 V12 H30.5" />
            </svg>
          </div>
          <div className="worker"><span /><span /></div>
          <div className="stamp">
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 6.2 L5 8.6 L9.5 3.4" />
            </svg>
          </div>
          <div className="pulse pulse-tell" />
          <div className="pulse pulse-down" />
          <div className="link link-down"><span /></div>
        </div>
      </div>
      <p className="beat" aria-hidden="true">
        <span className="beat-ask">Ask</span>
        <span className="beat-ready">Ready</span>
        <span className="beat-tell">Tell</span>
      </p>
    </section>
  )
}
