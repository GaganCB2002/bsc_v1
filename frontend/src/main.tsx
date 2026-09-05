import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { TrackingProvider } from './lib/tracking'
import DevToolsGuard from './components/DevToolsGuard'
import ConsentGate from './components/ConsentGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConsentGate>
      <BrowserRouter>
        <AuthProvider>
          <TrackingProvider>
            <DevToolsGuard />
            <App />
          </TrackingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConsentGate>
  </StrictMode>
)
