import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider, useProfile } from './hooks/useProfile'
import AppLoading from './components/AppLoading'

// Pages
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import EventLogger from './pages/EventLogger'
import ProfileSetup from './pages/ProfileSetup'
import RecruitingCompass from './pages/RecruitingCompass'

// --- TRAFFIC CONTROLLER ---
function MainNavigator() {
  const { user, loading: authLoading } = useAuth()
  const { hasProfile, isProfileLoading } = useProfile()

  // 1. GLOBAL LOADING SHIELD
  // Wait for auth to settle. If user exists, also wait for profile to settle.
  if (authLoading || (user && isProfileLoading)) {
    return <AppLoading message={authLoading ? "Initializing..." : "Loading Profile..."} />
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
      <Route path="/log-event" element={<EventLogger />} />

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
        </Router>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
