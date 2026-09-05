import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { TrackingProvider } from './lib/tracking'
import { ThemeProvider } from './lib/theme'
import DevToolsGuard from './components/DevToolsGuard'
import ConsentGate from './components/ConsentGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConsentGate>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TrackingProvider>
              <DevToolsGuard />
              <App />
            </TrackingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ConsentGate>
  </StrictMode>
)
