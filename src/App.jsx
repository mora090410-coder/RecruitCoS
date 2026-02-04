import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
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
  const { athleteProfile, loading: profileLoading } = useProfile()
  const location = useLocation()

  // 1. GLOBAL LOADING SHIELD
  // Wait for BOTH auth and profile to settle before showing anything.
  // This prevents flashing "Login" then "Dashboard" or vice versa.
  if (authLoading || (user && profileLoading)) {
    return <AppLoading message={authLoading ? "Verifying..." : "Loading Profile..."} />
  }

  // --- ROUTE GUARDS ---

  // Guard: Protected Routes
  // Enforces: User must be logged in AND have a profile.
  // Redirects: To /login if no user, to /setup if no profile.
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />
    if (!athleteProfile) return <Navigate to="/setup" replace />
    return children
  }

  // Guard: Public Only Routes (Login, Signup, Landing)
  // Enforces: Logged in users shouldn't see these.
  // Redirects: To /dashboard if user has profile, or /setup if proper user but no profile.
  const PublicRoute = ({ children }) => {
    if (user) {
      return athleteProfile ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />
    }
    return children
  }

  // Guard: Setup Route
  // Enforces: User must be logged in. Should NOT have a profile (unless editing? logic can vary).
  // For now: If profile exists, kick to dashboard. If not logged in, kick to login.
  const SetupRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />
    if (athleteProfile) return <Navigate to="/dashboard" replace />
    return children
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

      {/* ONBOARDING */}
      <Route path="/setup" element={<SetupRoute><ProfileSetup /></SetupRoute>} />

      {/* PROTECTED APP ROUTES */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/compass" element={<ProtectedRoute><RecruitingCompass /></ProtectedRoute>} />
      <Route path="/log-event" element={<ProtectedRoute><EventLogger /></ProtectedRoute>} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
