import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { generateAndPersistWeeklyPlan } from './services/weeklyPlanService'

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.testPersistPlan = (athleteId) => generateAndPersistWeeklyPlan(athleteId)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
