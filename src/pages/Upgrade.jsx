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
        <Card className="rounded-2xl border-zinc-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-serif text-gray-900">Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-gray-700">
              Premium unlock is coming soon. For now, you can earn access by completing weekly actions for 2+ weeks.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              <li>Full Dashboard (readiness score + explainability)</li>
              <li>Complete gap + strength analysis</li>
              <li>Multi-week progress tracking</li>
            </ul>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <h2 className="text-sm font-semibold text-zinc-900">FAQ</h2>
              <div className="mt-3 space-y-3 text-sm text-zinc-700">
                <p><span className="font-medium text-zinc-900">How do I earn free access?</span> Complete weekly actions for at least 2 weeks.</p>
                <p><span className="font-medium text-zinc-900">What do I get with Pro?</span> Full dashboard insights, gap and strength analysis, and multi-week tracking.</p>
                <p><span className="font-medium text-zinc-900">Can I cancel?</span> Yes. You can cancel anytime once subscriptions are available.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="bg-brand-primary text-white hover:bg-brand-secondary sm:min-w-[220px]"
                onClick={() => navigate('/weekly-plan')}
              >
                Keep using Weekly Plan
              </Button>
              <Button type="button" variant="outline" className="sm:min-w-[140px]" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
