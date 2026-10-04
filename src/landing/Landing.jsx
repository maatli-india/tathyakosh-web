import Dock from './Dock'
import Login from './Login'
import Stage from './Stage'
import Stills from './Stills'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">
      <div className="split">
        <section className="story">
          <div className="story-top">
            <h1>Tathyakosh</h1>
            <Stage />
          </div>
          <Stills />
        </section>
        <Login />
      </div>
      <Dock />
    </div>
  )
}
