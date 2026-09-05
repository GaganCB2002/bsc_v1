import { useEffect, useState, useCallback } from 'react'
import { ShieldAlert, X } from 'lucide-react'

export default function DevToolsGuard() {
  const [blocked, setBlocked] = useState(false)
  const [count, setCount] = useState(0)

  const showWarning = useCallback(() => {
    setBlocked(true)
    setCount((c) => c + 1)
    setTimeout(() => setBlocked(false), 3000)
  }, [])

  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost) return

    // Block right-click
    const onContext = (e: MouseEvent) => {
      e.preventDefault()
      showWarning()
    }
    document.addEventListener('contextmenu', onContext)

    // Block keyboard shortcuts that open dev tools
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      // F12
      if (key === 'f12') { e.preventDefault(); showWarning(); return }
      // F2
      if (key === 'f2') { e.preventDefault(); showWarning(); return }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+U
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) { e.preventDefault(); showWarning(); return }
      if (e.ctrlKey && key === 'u') { e.preventDefault(); showWarning(); return }
      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && key === 'i') { e.preventDefault(); showWarning(); return }
    }
    document.addEventListener('keydown', onKey)

    // DevTools detection via window size monitoring
    const devtoolsOpen = { value: false }
    const threshold = 160
    const widthCheck = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      if ((widthThreshold || heightThreshold) && !devtoolsOpen.value) {
        devtoolsOpen.value = true
        showWarning()
      } else if (!widthThreshold && !heightThreshold) {
        devtoolsOpen.value = false
      }
    }

    const devtoolsInterval = setInterval(widthCheck, 1000)

    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('keydown', onKey)
      clearInterval(devtoolsInterval)
    }
  }, [showWarning])

  if (!blocked) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Developer tools and right-click are disabled on this platform for security reasons.
          Unauthorized inspection of this application is prohibited.
        </p>
        <div className="mt-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs text-red-600 font-medium">
            Violation #{count} — This activity has been logged.
          </p>
        </div>
        <button
          onClick={() => setBlocked(false)}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" /> Understood
        </button>
      </div>
    </div>
  )
}
