import Dock from './Dock'
import SignIn from './SignIn'
import Stage from './Stage'
import Stills from './Stills'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">
      <header className="top">
        <h1>Tathyakosh</h1>
        <SignIn />
      </header>
      <main>
        <Stage />
        <Stills />
      </main>
      <Dock />
    </div>
  )
}
