import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProfileProvider, useProfile } from './hooks/useProfile'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { ensureSignupTimestamp, getSignupTimestamp, identify, markSessionStart, page } from './lib/analytics'
import { getAthletePhase } from './lib/constants'

// Pages
import Login from './pages/Login'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Dashboard from './pages/Dashboard'
import EventLogger from './pages/EventLogger'
import ProfileSetup from './pages/ProfileSetup'
import RecruitingCompass from './pages/RecruitingCompass'
import EditPost from './pages/EditPost'
import Vibes from './pages/Vibes'
import StrategyEdit from './pages/StrategyEdit'
import Measurables from './pages/Measurables'
import WeeklyPlanDebug from './pages/TestWeeklyPlan'
import WeeklyPlan from './pages/WeeklyPlan'
import Upgrade from './pages/Upgrade'
import UpdateStats from './pages/actions/UpdateStats'
import ResearchSchools from './pages/actions/ResearchSchools'
import LogExpenses from './pages/actions/LogExpenses'

// --- TRAFFIC CONTROLLER ---
function MainNavigator() {
  const { user, loading: authLoading } = useAuth()
  const { hasProfile, isProfileLoading, isInitialized, error: profileError, profile, activeAthlete, isImpersonating } = useProfile()
  const location = useLocation()

  useEffect(() => {
    page(location.pathname, { route: location.pathname })
    markSessionStart(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (!user?.id) return
    const userCreatedAt = ensureSignupTimestamp(user.created_at || getSignupTimestamp() || new Date().toISOString())
    const athletePhase = profile?.grad_year ? getAthletePhase(profile.grad_year) : null

    identify(user.id, {
      email: user.email || null,
      user_created_at: userCreatedAt,
      signup_ts: userCreatedAt,
      sport: profile?.sport || null,
      position: profile?.position || profile?.primary_position_display || null,
      grad_year: profile?.grad_year || null,
      phase: athletePhase,
      target_level: profile?.target_divisions?.[0] || null
    })
  }, [user?.id, user?.email, user?.created_at, profile?.grad_year, profile?.position, profile?.primary_position_display, profile?.sport, profile?.target_divisions])

  // 0. FATAL ERROR SHIELD
  if (profileError) {
    return (
      <div className="rc-auth-shell fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="rc-auth-card w-full max-w-md rounded-2xl border border-red-300/40 p-8">
          <h2 className="mb-2 text-xl font-bold text-red-700">Connection Error</h2>
          <p className="mb-4 text-sm text-[var(--rc-muted)]">We couldn't load your profile. This might be a temporary issue.</p>
          <pre className="mb-4 overflow-auto rounded bg-[rgba(185,28,28,0.06)] p-3 text-xs text-red-700">
            {profileError.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="rc-btn-primary w-full rounded-lg py-2 font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // 1. GLOBAL LOADING SHIELD
  if (authLoading || isProfileLoading || !isInitialized) {
    return (
      <div className="rc-auth-shell fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[var(--rc-cardinal)]"></div>
      </div>
    )
  }

  // 2. STATE A: NOT LOGGED IN
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/profile-setup" replace />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // 3. STATE B: LOGGED IN, NO PROFILE
  if (!hasProfile) {
    return (
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/profile-setup" replace />} />
      </Routes>
    )
  }

  // 4. STATE C: LOGGED IN + HAS PROFILE
  return (
    <Routes>
      {/* Redirect Public & Setup Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile-setup" element={<Navigate to="/dashboard" replace />} />

      {/* Protected App Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/compass" element={<RecruitingCompass />} />
      <Route path="/measurables" element={<Measurables />} />
      <Route path="/edit-post/:id" element={<EditPost />} />
      <Route path="/vibes" element={<Vibes />} />
      <Route path="/log-event" element={<EventLogger />} />
      <Route path="/strategy" element={<StrategyEdit />} />
      <Route path="/weekly-plan" element={<WeeklyPlan />} />
      <Route path="/actions/update-stats" element={<UpdateStats />} />
      <Route path="/actions/research-schools" element={<ResearchSchools />} />
      <Route path="/actions/log-expenses" element={<LogExpenses />} />
      <Route path="/upgrade" element={<Upgrade />} />
      {import.meta.env.DEV ? (
        <>
          <Route path="/test-weekly-plan/:athleteId" element={<WeeklyPlanDebug />} />
          <Route path="/debug/weekly-plan/:athleteId" element={<WeeklyPlanDebug />} />
        </>
      ) : (
        <Route path="/debug/weekly-plan/:athleteId" element={<Navigate to="/" replace />} />
      )}

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
