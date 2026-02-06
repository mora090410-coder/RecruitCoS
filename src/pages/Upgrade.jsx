import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { track } from '../lib/analytics'

export default function Upgrade() {
  const navigate = useNavigate()

  useEffect(() => {
    track('upgrade_viewed', { source: 'dashboard_gate' })
  }, [])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl py-10">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-serif text-[var(--rc-ink)]">Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-[var(--rc-muted)]">
              Premium unlock is coming soon. For now, you can earn access by completing weekly actions for 2+ weeks.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--rc-muted)]">
              <li>Full Dashboard (readiness score + explainability)</li>
              <li>Complete gap + strength analysis</li>
              <li>Multi-week progress tracking</li>
            </ul>
            <div className="rc-surface rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[var(--rc-ink)]">FAQ</h2>
              <div className="mt-3 space-y-3 text-sm text-[var(--rc-muted)]">
                <p><span className="font-medium text-[var(--rc-ink)]">How do I earn free access?</span> Complete weekly actions for at least 2 weeks.</p>
                <p><span className="font-medium text-[var(--rc-ink)]">What do I get with Pro?</span> Full dashboard insights, gap and strength analysis, and multi-week tracking.</p>
                <p><span className="font-medium text-[var(--rc-ink)]">Can I cancel?</span> Yes. You can cancel anytime once subscriptions are available.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="rc-btn-primary sm:min-w-[220px]"
                onClick={() => navigate('/weekly-plan')}
              >
                Keep using Weekly Plan
              </Button>
              <Button type="button" variant="outline" className="rc-btn-secondary sm:min-w-[140px]" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
