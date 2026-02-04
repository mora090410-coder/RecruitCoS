import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EventLogger from './pages/EventLogger'
import ProfileSetup from './pages/ProfileSetup'
import RecruitingCompass from './pages/RecruitingCompass'

function PrivateRoute({ children }) {
  const { user, loading, checkingProfile } = useAuth()

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Setting up your Command Center...</p>
      </div>
    )
  }

  // Prevent redirecting to login if we are in the middle of a hash-based auth flow
  if (!user && window.location.hash.includes('access_token')) {
    return <div className="min-h-screen flex items-center justify-center">Finalizing login...</div>
  }

  return user ? children : <Navigate to="/login" />
}

// Ensure users with profiles don't see onboarding, and users without profiles are sent there
function ProfileGuard({ children, redirectToDashboard = false }) {
  const { user, athleteProfile, accessibleAthletes, loading, checkingProfile } = useAuth()

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Checking credentials...</p>
      </div>
    )
  }

  // Prevent redirecting to login if we are in the middle of a hash-based auth flow
  if (!user && window.location.hash.includes('access_token')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Finalizing login...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />

  const hasProfile = !!athleteProfile || (accessibleAthletes && accessibleAthletes.length > 0)

  if (redirectToDashboard) {
    // If we are at /setup but already have a profile, go to dashboard
    return hasProfile ? <Navigate to="/" /> : children
  } else {
    // If we are at a private route but HAVE NO profile, go to setup
    return hasProfile ? children : <Navigate to="/setup" />
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/setup"
            element={
              <ProfileGuard redirectToDashboard={true}>
                <ProfileSetup />
              </ProfileGuard>
            }
          />
          <Route
            path="/compass"
            element={
              <ProfileGuard>
                <RecruitingCompass />
              </ProfileGuard>
            }
          />
          <Route
            path="/"
            element={
              <ProfileGuard>
                <Dashboard />
              </ProfileGuard>
            }
          />
          <Route
            path="/log-event"
            element={
              <ProfileGuard>
                <EventLogger />
              </ProfileGuard>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
