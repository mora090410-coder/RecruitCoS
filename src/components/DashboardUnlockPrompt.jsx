import { Link } from 'react-router-dom'
import { Button } from './ui/button'

export default function DashboardUnlockPrompt() {
    return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Your full analysis is almost ready</h2>
            <p className="mt-3 text-gray-600">Complete 2 more actions this week to unlock:</p>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>✓ Personalized gap analysis</li>
                <li>✓ Benchmark comparisons</li>
                <li>✓ Multi-week trends</li>
                <li>✓ Division fit scoring</li>
            </ul>

            <p className="mt-5 text-sm text-gray-600">Or add your first metric to unlock immediately:</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-purple-600 text-white hover:bg-purple-700 sm:min-w-[180px]">
                    <Link to="/measurables">Add Metrics Now</Link>
                </Button>
                <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 sm:min-w-[220px]">
                    <Link to="/weekly-plan">← Back to This Week&apos;s Plan</Link>
                </Button>
            </div>
        </div>
    )
}
