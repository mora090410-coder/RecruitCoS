import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import CelebrationModal from './CelebrationModal'
import UnlockScreen from './UnlockScreen'
import { resolveActionHref } from '../lib/actionRouting'
import { supabase } from '../lib/supabase'
import { unlockDashboard } from '../lib/recruitingData'
import { track } from '../lib/analytics'

const WEEK_1_NUMBER = 1

const ACTION_CONTENT = {
    1: {
        icon: '📋',
        title: "Update your athlete's current stats",
        description: 'Add their latest speed/strength/performance numbers so we can track progress.',
        minutes: 5,
        fallbackRoute: '/actions/update-stats'
    },
    2: {
        icon: '🎯',
        title: 'Research 3 schools in your target division',
        description: "Find schools that match your athlete's level and academic profile.",
        minutes: 15,
        fallbackRoute: '/actions/research-schools'
    },
    3: {
        icon: '💰',
        title: "Log this month's recruiting expenses",
        description: "Track showcase fees, camp costs, and travel to see where your money is going.",
        minutes: 10,
        fallbackRoute: '/actions/log-expenses'
    }
}

function buildUnlockSeenStorageKey(athleteId, weekStartDate) {
    if (!athleteId || !weekStartDate) return null
    return `rc_week1_unlock_seen:${athleteId}:${weekStartDate}`
}

function getActionNumber(item) {
    const byPriority = Number(item?.priority_rank)
    if (Number.isInteger(byPriority) && byPriority >= 1 && byPriority <= 3) return byPriority

    const typeMap = { gap: 1, strength: 2, phase: 3 }
    const byType = typeMap[String(item?.item_type || '').toLowerCase()]
    return byType || null
}

function resolveActionLink(actionNumber, actionItem, weekStartDate) {
    if (actionItem) return resolveActionHref(actionItem, weekStartDate)

    const baseRoute = ACTION_CONTENT[actionNumber].fallbackRoute
    const params = new URLSearchParams({ action: String(actionNumber) })
    if (weekStartDate) params.set('weekStart', weekStartDate)
    return `${baseRoute}?${params.toString()}`
}

function LoadingCard() {
    return (
        <div className="animate-pulse rounded-xl border-2 border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 h-5 w-1/3 rounded bg-gray-200" />
            <div className="h-6 w-2/3 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
            <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
            <div className="mt-5 h-11 w-full rounded bg-gray-200" />
        </div>
    )
}

export default function WeekOnePlanView({
    athlete,
    actions,
    loading,
    error,
    targetAthleteId,
    weekStartDate,
    onRetry
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [showUnlockScreen, setShowUnlockScreen] = useState(false)
    const [isCheckingUnlock, setIsCheckingUnlock] = useState(false)

    const actionByNumber = useMemo(() => {
        const map = new Map()
        for (const item of actions || []) {
            const number = getActionNumber(item)
            if (!number || map.has(number)) continue
            map.set(number, item)
        }
        return map
    }, [actions])

    const completedCount = useMemo(() => {
        return [1, 2, 3].filter((actionNumber) => actionByNumber.get(actionNumber)?.status === 'done').length
    }, [actionByNumber])

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

    const maybeShowUnlockScreen = async () => {
        if (isCheckingUnlock) return
        if (!targetAthleteId || !weekStartDate || !unlockSeenStorageKey) return
        if (completedActionNumber !== 3) return

        try {
            if (window.localStorage.getItem(unlockSeenStorageKey) === 'true') {
                return
            }
        } catch {
            // no-op
        }

        setIsCheckingUnlock(true)
        try {
            const { data, error: queryError } = await supabase
                .from('athlete_weekly_plan_items')
                .select('status')
                .eq('athlete_id', targetAthleteId)
                .eq('week_start_date', weekStartDate)
                .order('priority_rank', { ascending: true })
                .limit(3)

            if (queryError) return

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
            } catch {
                // no-op
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

    return (
        <div className="mx-auto w-full max-w-3xl space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to Week 1, {athlete?.name || 'Athlete'}</h1>
                <p className="mt-2 text-xl text-gray-600">Here&apos;s your plan for this week</p>
            </header>

            <section className="space-y-4" aria-label="Week 1 actions">
                {loading && (
                    <>
                        <LoadingCard />
                        <LoadingCard />
                        <LoadingCard />
                    </>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p>{error}</p>
                        {typeof onRetry === 'function' && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && [1, 2, 3].map((actionNumber) => {
                    const item = actionByNumber.get(actionNumber)
                    const content = ACTION_CONTENT[actionNumber]
                    const isDone = item?.status === 'done'

                    return (
                        <article
                            key={actionNumber}
                            className={`rounded-xl border-2 bg-white p-6 transition-all ${isDone ? 'border-[#D1D5DB] bg-gray-50/70 opacity-80' : 'border-[#E5E7EB] hover:border-[#6C2EB9] hover:shadow-[0_8px_24px_rgba(108,46,185,0.15)]'}`}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl" aria-hidden="true">{content.icon}</span>
                                    <div className={`flex h-6 w-6 items-center justify-center rounded border-2 ${isDone ? 'border-[#6C2EB9] bg-[#6C2EB9] text-white' : 'border-[#9CA3AF]'}`}>
                                        {isDone ? '✓' : ''}
                                    </div>
                                </div>
                                <span className={`text-sm font-semibold ${isDone ? 'text-[#6C2EB9]' : 'text-gray-600'}`}>
                                    {isDone ? 'Done' : 'Not Done'}
                                </span>
                            </div>

                            <h2 className="text-[22px] font-bold leading-tight text-gray-900">{content.title}</h2>
                            <p className="mt-2 text-base text-gray-600">{content.description}</p>
                            <p className="mt-3 text-sm font-medium text-gray-500">⏱ {content.minutes} minutes</p>

                            <button
                                type="button"
                                className={`mt-5 h-12 w-full rounded-lg px-6 text-sm font-semibold transition ${isDone
                                    ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                                    : 'bg-[#6C2EB9] text-white hover:bg-[#5B25A0] hover:shadow-md active:scale-[0.99]'
                                }`}
                                onClick={() => navigate(resolveActionLink(actionNumber, item, weekStartDate))}
                                disabled={isDone}
                            >
                                {isDone ? 'Completed' : 'Start This Action'}
                            </button>
                        </article>
                    )
                })}
            </section>

            {!loading && !error && (
                <section className="rounded-xl border-2 border-[rgba(108,46,185,0.14)] bg-gradient-to-br from-[rgba(108,46,185,0.08)] to-[rgba(108,46,185,0.03)] p-7 text-center">
                    <div className="mb-2 text-3xl" aria-hidden="true">📊</div>
                    <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
                    <p className="mt-1 text-base text-gray-700">Week 1 of 4 • <span className="font-semibold">{completedCount}/3</span> actions completed</p>
                    <p className="mt-2 text-sm text-gray-600">Complete 2+ actions this week to stay on track</p>
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
