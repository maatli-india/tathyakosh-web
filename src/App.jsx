import Landing from './landing/Landing'
import { PreferencesProvider } from './preferences'

export default function App() {
  return (
    <PreferencesProvider>
      <Landing />
    </PreferencesProvider>
  )
}
