import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { resolveActionHref } from '../lib/actionRouting'

const ITEM_ICONS = {
    gap: '⚡',
    strength: '🎯',
    phase: '📹'
}

const formatAthleteMeta = (athlete) => {
    const gradYear = athlete?.grad_year ? `Class of ${athlete.grad_year}` : null
    const position = athlete?.position || null
    return [gradYear, position].filter(Boolean).join(' • ')
}

function resolveCardTitle(item) {
    if (item?.title) return item.title

    const itemType = (item?.item_type || '').toLowerCase()
    if (itemType === 'gap') return 'Focus: Build Athletic Baseline'
    if (itemType === 'strength') return 'Start: School Research'
    if (itemType === 'phase') return 'Create: Skills Highlight'
    return 'Weekly Action'
}

function resolveCardDescription(item) {
    if (item?.why) return item.why
    if (Array.isArray(item?.actions) && item.actions.length > 0) {
        return item.actions[0]
    }
    return 'Complete this action to stay on track this week.'
}

export default function SimpleWeeklyView({
    athlete,
    phaseLabel,
    actions,
    loading,
    error,
    targetAthleteId,
    engagement,
    onRetry,
    weekStartDate
}) {
    const navigate = useNavigate()
    const subtitle = formatAthleteMeta(athlete)
    const hasActions = Array.isArray(actions) && actions.length > 0

    const completedCount = useMemo(() => {
        if (!hasActions) return 0
        return actions.filter((item) => item?.status === 'done').length
    }, [actions, hasActions])

    const handleOpenAction = (item) => {
        if (!item?.id || item.status === 'done') return
        if (item.athlete_id && targetAthleteId && item.athlete_id !== targetAthleteId) return

        navigate(resolveActionHref(item, weekStartDate))
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <header className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                    {phaseLabel || 'Foundation Phase (12U)'}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">This Week&apos;s Focus</h1>
                {subtitle && (
                    <p className="text-base text-gray-600">{subtitle}</p>
                )}
                {!loading && hasActions && (
                    <p className="text-sm text-gray-600">{completedCount} of {actions.length} actions completed this week.</p>
                )}
            </header>

            <section className="space-y-4" aria-label="Weekly action cards">
                {loading && (
                    <div className="space-y-4" aria-label="Loading weekly plan">
                        {[1, 2, 3].map((row) => (
                            <div key={row} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
                                <div className="h-6 w-2/3 rounded bg-gray-200" />
                                <div className="mt-4 h-4 w-full rounded bg-gray-100" />
                                <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
                                <div className="mt-4 h-10 w-full rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p>{error}</p>
                        {typeof onRetry === 'function' && (
                            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-3">
                                Retry
                            </Button>
                        )}
                    </div>
                )}

                {!loading && !error && !hasActions && (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600">
                        No weekly plan items available yet.
                    </div>
                )}

                {!loading && !error && hasActions && actions.map((item) => {
                    const itemType = (item?.item_type || '').toLowerCase()
                    const icon = ITEM_ICONS[itemType] || '📌'
                    const isDone = item?.status === 'done'

                    return (
                        <article key={item.id} className="rounded-xl border border-[#E5E7EB] bg-white p-6 transition-shadow hover:shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                <span className="mr-2 inline-block text-2xl align-middle">{icon}</span>
                                <span className="align-middle">{resolveCardTitle(item)}</span>
                            </h2>
                            <p className="mt-3 text-base text-gray-600">{resolveCardDescription(item)}</p>

                            <Button
                                type="button"
                                className={`mt-5 h-11 w-full font-semibold ${isDone ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                onClick={() => handleOpenAction(item)}
                                disabled={isDone}
                            >
                                {isDone ? 'Completed ✓' : 'Mark Complete'}
                            </Button>
                        </article>
                    )
                })}
            </section>

            <section className="rounded-xl border border-[#E9D5FF] bg-[#F5F3FF] p-6">
                <h3 className="text-lg font-semibold text-gray-900">Want deeper insights?</h3>
                <p className="mt-2 text-base text-gray-600">Add your metrics to unlock:</p>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    <li>• Personalized gap analysis</li>
                    <li>• Benchmark comparisons</li>
                    <li>• Division fit scoring</li>
                </ul>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button
                        asChild
                        className="h-11 flex-1 bg-purple-600 font-semibold text-white hover:bg-purple-700"
                    >
                        <Link to="/measurables">Add Your First Metric →</Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="h-11 flex-1 border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                    >
                        <Link to="/dashboard">See Full Dashboard →</Link>
                    </Button>
                </div>
            </section>

            {(engagement?.weeksActive || 0) >= 2 && (
                <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-medium">You&apos;ve built consistency for 2+ weeks.</p>
                    <p className="mt-1">Your full analysis view is available now.</p>
                </section>
            )}
        </div>
    )
}
