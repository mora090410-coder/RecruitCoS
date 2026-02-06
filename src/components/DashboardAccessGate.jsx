import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { track } from '../lib/analytics'

export default function DashboardAccessGate() {
    const navigate = useNavigate()

    return (
        <div className="mx-auto max-w-2xl py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-serif text-gray-900">Unlock Full Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                        <li>Readiness score with explainability</li>
                        <li>Complete gap and strength analysis</li>
                        <li>Multi-week progress tracking</li>
                    </ul>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="bg-brand-primary text-white hover:bg-brand-secondary">
                            <Link to="/weekly-plan">Keep using Weekly Plan</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                track('upgrade_clicked', { source: 'dashboard_gate' })
                                navigate('/upgrade')
                            }}
                        >
                            Upgrade
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
