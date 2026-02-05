import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider, useProfile } from './hooks/useProfile'
import AppLoading from './components/AppLoading'
import { Toaster } from 'sonner'

// Pages
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import EventLogger from './pages/EventLogger'
import ProfileSetup from './pages/ProfileSetup'
import RecruitingCompass from './pages/RecruitingCompass'
import EditPost from './pages/EditPost'
import Vibes from './pages/Vibes'
import StrategyEdit from './pages/StrategyEdit'

// --- TRAFFIC CONTROLLER ---
function MainNavigator() {
  const { user, loading: authLoading } = useAuth()
  const { hasProfile, isProfileLoading, isInitialized, error: profileError } = useProfile()

  // 0. FATAL ERROR SHIELD
  if (profileError) {
    return (
      <div className="fixed inset-0 bg-red-950 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-red-500/30 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-2">Connection Error</h2>
          <p className="text-white mb-4">We couldn't load your profile. This might be a temporary issue.</p>
          <pre className="bg-black/50 p-3 rounded text-xs text-red-300 overflow-auto mb-4">
            {profileError.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }



  // 1. GLOBAL LOADING SHIELD
  // Wait for auth to settle. If user exists, also wait for profile to settle.
  if (authLoading || isProfileLoading || !isInitialized) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // 2. STATE A: NOT LOGGED IN
  // User can only see public pages. Any other route redirects to Landing.
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // 3. STATE B: LOGGED IN, NO PROFILE
  // User MUST complete setup. No other access allowed.
  if (!hasProfile) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    )
  }

  // 4. STATE C: LOGGED IN + HAS PROFILE
  // User has full access. Public routes redirect to Dashboard.
  return (
    <Routes>
      {/* Redirect Public & Setup Routes to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile-setup" element={<Navigate to="/dashboard" replace />} />

      {/* Protected App Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/compass" element={<RecruitingCompass />} />
      <Route path="/edit-post/:id" element={<EditPost />} />
      <Route path="/vibes" element={<Vibes />} />
      <Route path="/log-event" element={<EventLogger />} />
      <Route path="/strategy" element={<StrategyEdit />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}


function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <MainNavigator />
          <Toaster position="top-center" />
        </Router>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
