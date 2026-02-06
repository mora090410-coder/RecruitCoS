import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { track } from '../lib/analytics'

export default function DashboardAccessGate() {
    const navigate = useNavigate()

    return (
        <div className="mx-auto max-w-3xl py-10">
            <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-serif text-[var(--rc-ink)]">Unlock Full Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--rc-muted)]">
                        <li>Readiness score with explainability</li>
                        <li>Complete gap and strength analysis</li>
                        <li>Multi-week progress tracking</li>
                    </ul>
                    <p className="text-sm text-[var(--rc-muted)]">
                        You can earn free access by completing weekly actions for 2+ weeks.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="rc-btn-primary sm:min-w-[220px]">
                            <Link to="/weekly-plan">Keep using Weekly Plan</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="rc-btn-secondary sm:min-w-[140px]"
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
