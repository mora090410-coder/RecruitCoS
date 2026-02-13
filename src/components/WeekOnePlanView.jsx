import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import CelebrationModal from './CelebrationModal'
import { resolveActionHref } from '../lib/actionRouting'
import { getWeeklyActionsForWeek } from '../utils/weeklyPlanGenerator'

const WEEK_ICON_BY_TYPE = {
    update_stats: '📋',
    research_schools: '🎯',
    log_expenses: '💰',
    recruiting_timeline: '📅',
    coach_interaction: '📞',
    refine_school_list: '🤖',
    analyze_expenses: '📈',
    expand_school_list: '🧭'
}

function getActionNumber(item) {
    const byActionNumber = Number.parseInt(item?.action_number, 10)
    if (Number.isInteger(byActionNumber) && byActionNumber >= 1 && byActionNumber <= 3) return byActionNumber

    const byPriority = Number(item?.priority_rank)
    if (Number.isInteger(byPriority) && byPriority >= 1 && byPriority <= 3) return byPriority

    const typeMap = {
        gap: 1,
        strength: 2,
        phase: 3,
        timeline: 1,
        interaction: 2,
        budget: 3,
        recommendations: 1,
        roi: 2,
        expansion: 3
    }
    const byType = typeMap[String(item?.item_type || '').toLowerCase()]
    return byType || null
}

function resolveActionTemplate(weekNumber, actionNumber) {
    const templates = getWeeklyActionsForWeek(weekNumber) || []
    const match = templates.find((template) => Number(template.action_number) === Number(actionNumber))
    return match || null
}

function resolveActionLink(weekNumber, actionNumber, actionItem, weekStartDate) {
    if (actionItem) return resolveActionHref(actionItem, weekStartDate)

    const template = resolveActionTemplate(weekNumber, actionNumber)
    const baseRoute = template?.route || '/weekly-plan'
    const params = new URLSearchParams({ action: String(actionNumber) })
    if (weekStartDate) params.set('weekStart', weekStartDate)
    return `${baseRoute}?${params.toString()}`
}

function resolveActionContent(weekNumber, actionNumber, item) {
    const template = resolveActionTemplate(weekNumber, actionNumber)
    const actionType = String(item?.action_type || template?.action_type || '').toLowerCase()

    return {
        icon: WEEK_ICON_BY_TYPE[actionType] || '✅',
        title: item?.action_title || item?.title || template?.title || `Action ${actionNumber}`,
        description: item?.action_description || item?.why || template?.description || 'Complete this weekly action.',
        minutes: Number(item?.estimated_minutes || template?.estimated_minutes || 10)
    }
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
    onRetry,
    weekStartDate,
    weekNumber = 1,
    availableWeekNumbers = [1],
    onSelectWeek
}) {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()

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

    const closeCelebrationModal = () => {
        navigate(location.pathname, { replace: true })
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Week {weekNumber} Plan{athlete?.name ? `, ${athlete.name}` : ''}</h1>
                <p className="mt-2 text-xl text-gray-600">Focused actions to move recruiting forward this week</p>
            </header>

            {!loading && !error && availableWeekNumbers.length > 1 && (
                <section className="flex flex-wrap items-center justify-center gap-2" aria-label="Week selector">
                    {availableWeekNumbers.map((availableWeek) => {
                        const isActiveWeek = Number(availableWeek) === Number(weekNumber)
                        return (
                            <button
                                key={availableWeek}
                                type="button"
                                onClick={() => onSelectWeek?.(availableWeek)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActiveWeek
                                    ? 'bg-[#6C2EB9] text-white'
                                    : 'border border-[#D1D5DB] bg-white text-gray-700 hover:border-[#6C2EB9] hover:text-[#6C2EB9]'
                                }`}
                            >
                                Week {availableWeek}
                            </button>
                        )
                    })}
                </section>
            )}

            <section className="space-y-4" aria-label={`Week ${weekNumber} actions`}>
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
                    const isDone = item?.status === 'done'
                    const content = resolveActionContent(weekNumber, actionNumber, item)

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
                                onClick={() => navigate(resolveActionLink(weekNumber, actionNumber, item, weekStartDate || item?.week_start_date || null))}
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
                    <p className="mt-1 text-base text-gray-700">Week {weekNumber} of 4 • <span className="font-semibold">{completedCount}/3</span> actions completed</p>
                    <p className="mt-2 text-sm text-gray-600">Finish all 3 actions to unlock next steps</p>
                </section>
            )}

            {completedActionNumber && (
                <CelebrationModal
                    actionNumber={completedActionNumber}
                    onClose={closeCelebrationModal}
                />
            )}
        </div>
    )
}
