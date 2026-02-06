import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function Upgrade() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-gray-900">Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-700">
              Premium unlock is coming soon. For now, you can earn access by completing weekly actions for 2+ weeks.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              <li>Full Dashboard (readiness score + explainability)</li>
              <li>Complete gap + strength analysis</li>
              <li>Multi-week progress tracking</li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="bg-brand-primary text-white hover:bg-brand-secondary"
                onClick={() => navigate('/weekly-plan')}
              >
                Back to Weekly Plan
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
