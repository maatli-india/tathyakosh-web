import { useState } from 'react'
import Board from './Board'
import Dock from './Dock'
import Login from './Login'
import Stage from './Stage'
import Stills from './Stills'
import './Landing.css'

export default function Landing({ onSignIn }) {
  const [picture, setPicture] = useState('diagram')
  const year = new Date().getFullYear()

  return (
    <div className="landing">
      <section className="story">
        <div className="story-top">
          <div className="story-head">
            <h1>Tathyakosh</h1>
            <div className="picture-switch" role="group" aria-label="Picture">
              <button type="button" aria-pressed={picture === 'diagram'} onClick={() => setPicture('diagram')}>
                Diagram
              </button>
              <button type="button" aria-pressed={picture === 'board'} onClick={() => setPicture('board')}>
                Board
              </button>
            </div>
          </div>
          {picture === 'diagram' ? <Stage /> : <Board />}
        </div>
        <Stills />
      </section>
        <Login onSignIn={onSignIn} />
      <Dock />
      <p className="copyright">© {year} Maatli</p>
    </div>
  )
}
