import { useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  MapPin,
  CheckCircle2,
  Shield,
  ScrollText,
  Globe,
  X,
  AlertTriangle,
  Lock,
  FileText,
} from 'lucide-react'

const CONSENT_KEY = 'bsc_consent_accepted'
const LOCATION_KEY = 'bsc_location_granted'

function hasConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true'
  } catch {
    return false
  }
}

function hasLocationGranted(): boolean {
  try {
    return localStorage.getItem(LOCATION_KEY) === 'true'
  } catch {
    return false
  }
}

export default function ConsentGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending')
  const [showTermsFull, setShowTermsFull] = useState(false)
  const [showPrivacyFull, setShowPrivacyFull] = useState(false)

  useEffect(() => {
    if (hasConsented() && hasLocationGranted()) {
      setReady(true)
      return
    }
    setShowConsent(true)
  }, [])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus('granted')
        try { localStorage.setItem(LOCATION_KEY, 'true') } catch {}
      },
      () => {
        setLocationStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [])

  const handleAccept = useCallback(() => {
    try { localStorage.setItem(CONSENT_KEY, 'true') } catch {}
    if (locationStatus === 'granted') {
      try { localStorage.setItem(LOCATION_KEY, 'true') } catch {}
    }
    setShowConsent(false)
    setReady(true)
  }, [locationStatus])

  if (ready) return <>{children}</>
  if (!showConsent) return null

  const canProceed = agreedTerms && agreedPrivacy && locationStatus === 'granted'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Welcome to BSC Exclusive</h2>
              <p className="text-xs text-slate-500">Please review and accept to continue</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-bold">You must accept both the Terms & Conditions and Privacy Policy, and grant location access to use this platform.</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <ScrollText className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-bold text-slate-900">Terms & Conditions</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto mb-3 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                <p className="font-bold text-slate-800 mb-2">Key Terms:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Accounts are created exclusively by administrators.</li>
                  <li>You are responsible for the accuracy of all submissions and evidence.</li>
                  <li>GPS location data is collected during active sessions for compliance verification.</li>
                  <li>Do not share your account credentials with others.</li>
                  <li>Submitting false or misleading information may result in disciplinary action.</li>
                  <li>Your access may be suspended or terminated by your administrator at any time.</li>
                  <li>All actions are logged in an audit trail for compliance purposes.</li>
                </ul>
                <button
                  onClick={() => setShowTermsFull(true)}
                  className="text-sky-600 font-bold mt-2 hover:underline"
                >
                  Read full Terms & Conditions →
                </button>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-700 font-medium group-hover:text-sky-600 transition-colors">
                  I have read and agree to the Terms & Conditions
                </span>
              </label>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <Shield className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-bold text-slate-900">Privacy Policy</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto mb-3 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                <p className="font-bold text-slate-800 mb-2">Key Privacy Points:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>GPS location data is encrypted and stored securely.</li>
                  <li>Only authorized administrators and supervisors can view team locations.</li>
                  <li>Your data is encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
                  <li>We do not sell or share your personal data with third parties.</li>
                  <li>You have the right to access, correct, or request deletion of your data.</li>
                </ul>
                <button
                  onClick={() => setShowPrivacyFull(true)}
                  className="text-sky-600 font-bold mt-2 hover:underline"
                >
                  Read full Privacy Policy →
                </button>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedPrivacy}
                  onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-700 font-medium group-hover:text-sky-600 transition-colors">
                  I have read and agree to the Privacy Policy
                </span>
              </label>
            </div>
          </div>

          {/* Location Permission */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">Location Access</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                BSC Exclusive uses your GPS location to verify checkpoint submissions. Location is
                reported every 30 minutes during active sessions and is visible only to administrators
                and supervisors.
              </p>
              {locationStatus === 'granted' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold mb-3">
                  <CheckCircle2 className="w-4 h-4" /> Location access granted
                </div>
              )}
              {locationStatus === 'denied' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-bold mb-3">
                  <X className="w-4 h-4" /> Location access denied — you must grant location to continue
                </div>
              )}
              {locationStatus === 'unsupported' && (
                <div className="flex items-center gap-2 text-amber-600 text-sm font-bold mb-3">
                  <AlertTriangle className="w-4 h-4" /> Geolocation is not supported by your browser
                </div>
              )}
              {locationStatus !== 'granted' && locationStatus !== 'unsupported' && (
                <button
                  onClick={requestLocation}
                  className="w-full btn bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25"
                >
                  <MapPin className="w-4 h-4" /> Yep, OK — Grant Location Access
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-2xl">
          <button
            onClick={handleAccept}
            disabled={!canProceed}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canProceed ? 'Continue to BSC Exclusive' : 'Accept all terms and grant location to continue'}
          </button>
        </div>
      </div>

      {/* Full Terms Modal */}
      {showTermsFull && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowTermsFull(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <ScrollText className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Terms & Conditions</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p><strong>Last updated:</strong> September 2026</p>
              <div><h3 className="font-bold text-slate-900 mb-1">1. Acceptance of Terms</h3><p>By accessing and using BSC Exclusive, you agree to be bound by these Terms & Conditions. If you do not agree, do not use the platform.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">2. Account Usage</h3><p>Accounts are created exclusively by administrators. You are responsible for maintaining the confidentiality of your credentials. Do not share your account with others.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">3. Acceptable Use</h3><p>You may use the platform only for its intended purpose: compliance tracking, checkpoint submissions, and location verification. You may not attempt to circumvent security measures or interfere with platform operations.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">4. Location Tracking Consent</h3><p>By using this platform, you consent to periodic GPS location collection during active sessions. Location data is used for compliance verification and is handled in accordance with our Privacy Policy.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">5. Data Accuracy</h3><p>You are responsible for the accuracy of all submissions, evidence, and information provided through the platform. Submitting false or misleading information may result in disciplinary action.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">6. Intellectual Property</h3><p>The platform and its original content, features, and functionality are owned by BSC Exclusive and are protected by copyright, trademark, and other intellectual property laws.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">7. Limitation of Liability</h3><p>BSC Exclusive shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">8. Termination</h3><p>Your access may be suspended or terminated by your administrator at any time. Upon termination, your right to use the platform ceases immediately.</p></div>
            </div>
            <button onClick={() => setShowTermsFull(false)} className="btn btn-primary mt-6 w-full">Close</button>
          </div>
        </div>
      )}

      {/* Full Privacy Modal */}
      {showPrivacyFull && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowPrivacyFull(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Privacy Policy</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p><strong>Last updated:</strong> September 2026</p>
              <div><h3 className="font-bold text-slate-900 mb-1">1. Information We Collect</h3><p>We collect account information (name, email, employee code), GPS location data, submission content and evidence files, audit logs, and usage analytics.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">2. How We Use Your Information</h3><p>Your data is used for compliance tracking, location verification, submission review, and audit trail maintenance. We do not sell or share your personal data with third parties.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">3. Location Data</h3><p>GPS coordinates are collected every 30 minutes during active sessions. Location data is encrypted, stored securely, and accessible only to authorized administrators and supervisors.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">4. Data Security</h3><p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement role-based access control and maintain comprehensive audit logs.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">5. Data Retention</h3><p>Account data is retained for the duration of your employment. Location data is retained for 90 days.</p></div>
              <div><h3 className="font-bold text-slate-900 mb-1">6. Your Rights</h3><p>You have the right to access, correct, or request deletion of your personal data. Contact your administrator to exercise these rights.</p></div>
            </div>
            <button onClick={() => setShowPrivacyFull(false)} className="btn btn-primary mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
