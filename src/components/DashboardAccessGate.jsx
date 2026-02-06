import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { track } from '../lib/analytics'

export default function DashboardAccessGate() {
    const navigate = useNavigate()

    return (
        <div className="mx-auto max-w-3xl py-10">
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-serif text-gray-900">Unlock Full Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                        <li>Readiness score with explainability</li>
                        <li>Complete gap and strength analysis</li>
                        <li>Multi-week progress tracking</li>
                    </ul>
                    <p className="text-sm text-zinc-600">
                        You can earn free access by completing weekly actions for 2+ weeks.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="bg-brand-primary text-white hover:bg-brand-secondary sm:min-w-[220px]">
                            <Link to="/weekly-plan">Keep using Weekly Plan</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="sm:min-w-[140px]"
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
