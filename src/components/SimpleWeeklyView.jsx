import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from './ui/button'
import { resolveActionHref } from '../lib/actionRouting'
import CelebrationModal from './CelebrationModal'
import UnlockScreen from './UnlockScreen'
import { supabase } from '../lib/supabase'
import { unlockDashboard } from '../lib/recruitingData'
import { track } from '../lib/analytics'

const ITEM_ICONS = {
    gap: '⚡',
    strength: '🎯',
    phase: '📹'
}

const WEEK_1_NUMBER = 1

function buildUnlockSeenStorageKey(athleteId, weekStartDate) {
    if (!athleteId || !weekStartDate) return null
    return `rc_week1_unlock_seen:${athleteId}:${weekStartDate}`
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
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [showUnlockScreen, setShowUnlockScreen] = useState(false)
    const [isCheckingUnlock, setIsCheckingUnlock] = useState(false)
    const subtitle = formatAthleteMeta(athlete)
    const hasActions = Array.isArray(actions) && actions.length > 0
    const completedCount = useMemo(() => {
        if (!hasActions) return 0
        return actions.filter((item) => item?.status === 'done').length
    }, [actions, hasActions])
    const totalActions = hasActions ? actions.length : 0
    const completionRate = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0
    const streakWeeks = Math.max(0, Number(engagement?.weeksActive || 0))
    const completedParam = searchParams.get('completed')
    const actionParam = Number.parseInt(searchParams.get('action') || '', 10)
    const completedActionNumber = (
        completedParam === 'true'
        && Number.isInteger(actionParam)
        && actionParam >= 1
        && actionParam <= 3
    )
        ? actionParam
        : null
    const unlockSeenStorageKey = useMemo(
        () => buildUnlockSeenStorageKey(targetAthleteId, weekStartDate),
        [targetAthleteId, weekStartDate]
    )
    const isFirstWeekAthlete = (engagement?.weeksActive || 0) <= 1

    const maybeShowUnlockScreen = async () => {
        if (isCheckingUnlock) return
        if (!targetAthleteId || !weekStartDate || !unlockSeenStorageKey) return
        if (completedActionNumber !== 3 || completedCount !== 3 || !isFirstWeekAthlete) return

        try {
            if (window.localStorage.getItem(unlockSeenStorageKey) === 'true') {
                return
            }
        } catch {
            // no-op
        }

        setIsCheckingUnlock(true)
        try {
            const { data, error } = await supabase
                .from('athlete_weekly_plan_items')
                .select('status')
                .eq('athlete_id', targetAthleteId)
                .eq('week_start_date', weekStartDate)
                .order('priority_rank', { ascending: true })
                .limit(3)

            if (error) return

            const hasAllActionsDone = Array.isArray(data)
                && data.length === 3
                && data.every((item) => item.status === 'done')

            if (!hasAllActionsDone) return

            try {
                window.localStorage.setItem(unlockSeenStorageKey, 'true')
            } catch {
                // no-op
            }

            let unlockedNow = false
            try {
                const unlockResult = await unlockDashboard(targetAthleteId)
                unlockedNow = Boolean(unlockResult?.unlockedNow)
            } catch (unlockError) {
                if (import.meta.env.DEV) {
                    console.warn('[SimpleWeeklyView] Dashboard unlock update failed:', unlockError)
                }
            }

            track('dashboard_unlocked', {
                week_number: WEEK_1_NUMBER,
                completed_actions: 3,
                unlock_reason: 'completed_week_1',
                unlocked_now: unlockedNow
            })

            setShowUnlockScreen(true)
        } finally {
            setIsCheckingUnlock(false)
        }
    }

    const closeCelebrationModal = () => {
        navigate(location.pathname, { replace: true })
        void maybeShowUnlockScreen()
    }

    const closeUnlockScreen = () => {
        setShowUnlockScreen(false)
    }

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
                                className={`mt-5 h-11 w-full font-semibold ${isDone ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-100' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                onClick={() => handleOpenAction(item)}
                                disabled={isDone}
                            >
                                {isDone ? 'Completed' : 'Start This Action'}
                            </Button>
                        </article>
                    )
                })}
            </section>

            {!loading && !error && hasActions && (
                <section className="rounded-xl border-2 border-[#E5E7EB] bg-white p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Progress This Week</h3>
                        <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6C2EB9]">
                            {completedCount}/{totalActions} Complete
                        </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6C2EB9] to-[#8B5FD8] transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Completion</p>
                            <p className="mt-1 text-xl font-semibold text-gray-900">{completionRate}%</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Current Streak</p>
                            <p className="mt-1 text-xl font-semibold text-gray-900">{streakWeeks} week{streakWeeks === 1 ? '' : 's'}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total Actions</p>
                            <p className="mt-1 text-xl font-semibold text-gray-900">{engagement?.actionsCompleted || 0}</p>
                        </div>
                    </div>
                </section>
            )}

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

            {completedActionNumber && (
                <CelebrationModal
                    actionNumber={completedActionNumber}
                    onClose={closeCelebrationModal}
                />
            )}

            {showUnlockScreen && (
                <UnlockScreen
                    athleteId={targetAthleteId}
                    weekNumber={WEEK_1_NUMBER}
                    onClose={closeUnlockScreen}
                />
            )}
        </div>
    )
}
