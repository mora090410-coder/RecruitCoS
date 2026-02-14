import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import ReadinessScoreCard from '../components/dashboard/ReadinessScoreCard'
import ExpenseBreakdownCard from '../components/dashboard/ExpenseBreakdownCard'
import SchoolFitCard from '../components/dashboard/SchoolFitCard'
import WeekProgressCard from '../components/dashboard/WeekProgressCard'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { getAthleteEngagement } from '../lib/getAthleteEngagement'
import { track } from '../lib/analytics'
import { isMissingTableError } from '../lib/dbResilience'

const DASHBOARD_WRAPPER_CLASS = 'mx-auto w-full max-w-[1200px] space-y-6 rounded-2xl bg-[#F5F1E8] px-6 py-6 md:px-12 md:py-12'
const DASHBOARD_BACKGROUND_CLASS = 'rounded-2xl border border-[#2C2C2C1A] bg-gradient-to-r from-white to-[#F5F1E8] p-6 sm:p-8'

function getMonthRange(now = new Date()) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return { monthStart, nextMonthStart }
}

function formatIsoDate(dateValue) {
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatMonthLabel(dateValue) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric'
    }).format(dateValue)
}

function normalizeMetricKey(metricValue) {
    const raw = String(metricValue || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
    const aliasMap = {
        '60_yard_dash': 'sixty_yard_dash',
        sixty_time: 'sixty_yard_dash',
        sixty_yard_dash: 'sixty_yard_dash',
        vertical: 'vertical_jump',
        vertical_jump: 'vertical_jump',
        recent_stats: 'recent_stats'
    }

    return aliasMap[raw] || raw
}

function getLatestStatsFromMeasurables(rows) {
    const metricMap = new Map()

    for (const row of rows || []) {
        const key = normalizeMetricKey(row.metric)
        if (!metricMap.has(key)) {
            metricMap.set(key, row)
        }
    }

    return {
        sixty_yard_dash: metricMap.has('sixty_yard_dash')
            ? Number(metricMap.get('sixty_yard_dash').value)
            : null,
        vertical_jump: metricMap.has('vertical_jump')
            ? Number(metricMap.get('vertical_jump').value)
            : null,
        recent_stats: metricMap.has('recent_stats')
    }
}

function summarizeExpenses(expenseRows) {
    const totals = { total: 0, byCategory: {} }

    for (const row of expenseRows || []) {
        const amount = Number.parseFloat(row.amount)
        if (!Number.isFinite(amount)) continue

        const category = row.category || 'Other'
        totals.total += amount
        totals.byCategory[category] = (totals.byCategory[category] || 0) + amount
    }

    return totals
}

function normalizeDivisionKey(value) {
    const normalized = String(value || 'd3').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (['d1', 'd2', 'd3', 'naia', 'juco'].includes(normalized)) return normalized
    return 'd3'
}

function getCurrentMonday() {
    const date = new Date()
    const day = date.getDay()
    const delta = day === 0 ? -6 : 1 - day
    date.setDate(date.getDate() + delta)
    date.setHours(0, 0, 0, 0)
    return date
}

function summarizeWeekProgress(weeklyRows, engagement) {
    const weeksActive = Number(engagement?.weeksActive || 0)
    const fallbackWeek = Math.max(1, weeksActive)

    if (!Array.isArray(weeklyRows) || weeklyRows.length === 0) {
        return {
            currentWeek: fallbackWeek,
            completedActions: 0,
            weekStartDate: formatIsoDate(getCurrentMonday())
        }
    }

    const latestWeek = weeklyRows[0].week_start_date
    const latestWeekRows = weeklyRows.filter((row) => row.week_start_date === latestWeek)
    const completedActions = latestWeekRows.filter((row) => row.status === 'done').length

    return {
        currentWeek: fallbackWeek,
        completedActions,
        weekStartDate: latestWeek
    }
}

function LoadingCard() {
    return (
        <div className="animate-pulse rounded-xl border-2 border-[#2C2C2C1A] bg-white p-8">
            <div className="h-6 w-1/2 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-1/3 rounded bg-gray-100" />
            <div className="mt-4 h-24 rounded bg-gray-100" />
            <div className="mt-4 h-10 rounded bg-gray-200" />
        </div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { profile, activeAthlete, isImpersonating } = useProfile()
    const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRebuildMode, setIsRebuildMode] = useState(false)
    const [dashboardData, setDashboardData] = useState({
        stats: {
            sixty_yard_dash: null,
            vertical_jump: null,
            recent_stats: false
        },
        expenses: { total: 0, byCategory: {} },
        schools: [],
        divisionKey: 'd3',
        monthLabel: formatMonthLabel(new Date()),
        progress: {
            currentWeek: 1,
            completedActions: 0,
            weekStartDate: formatIsoDate(getCurrentMonday())
        }
    })

    useEffect(() => {
        let active = true

        const loadDashboardData = async () => {
            if (!targetAthleteId) {
                if (active) {
                    setError('No athlete profile selected.')
                    setLoading(false)
                }
                return
            }

            setLoading(true)
            setError(null)

            const now = new Date()
            const { monthStart, nextMonthStart } = getMonthRange(now)
            const monthStartIso = formatIsoDate(monthStart)
            const nextMonthStartIso = formatIsoDate(nextMonthStart)

            const [
                measurablesResult,
                expensesResult,
                schoolsResult,
                weeklyResult,
                athleteDivisionResult,
                engagement
            ] = await Promise.all([
                supabase
                    .from('athlete_measurables')
                    .select('metric, value, unit, measured_at, created_at')
                    .eq('athlete_id', targetAthleteId)
                    .order('measured_at', { ascending: false })
                    .order('created_at', { ascending: false }),
                supabase
                    .from('expenses')
                    .select('category, amount, date')
                    .eq('athlete_id', targetAthleteId)
                    .gte('date', monthStartIso)
                    .lt('date', nextMonthStartIso),
                supabase
                    .from('athlete_saved_schools')
                    .select('id, school_name, school_location, division, conference, category, created_at')
                    .eq('athlete_id', targetAthleteId)
                    .order('created_at', { ascending: true }),
                supabase
                    .from('athlete_weekly_plan_items')
                    .select('week_start_date, status')
                    .eq('athlete_id', targetAthleteId)
                    .order('week_start_date', { ascending: false })
                    .limit(24),
                supabase
                    .from('athletes')
                    .select('target_divisions')
                    .eq('id', targetAthleteId)
                    .maybeSingle(),
                getAthleteEngagement(targetAthleteId)
            ])

            if (!active) return

            const hardError = [
                measurablesResult.error,
                expensesResult.error,
                schoolsResult.error,
                weeklyResult.error,
                athleteDivisionResult.error
            ].find((queryError) => queryError && !isMissingTableError(queryError))

            if (hardError) {
                setError('Unable to load your dashboard preview right now. Please retry.')
                setLoading(false)
                return
            }

            const hasMissingTable = [
                measurablesResult.error,
                expensesResult.error,
                schoolsResult.error,
                weeklyResult.error
            ].some((queryError) => isMissingTableError(queryError))
            setIsRebuildMode(hasMissingTable)

            const stats = getLatestStatsFromMeasurables(
                isMissingTableError(measurablesResult.error) ? [] : (measurablesResult.data || [])
            )
            const expenses = summarizeExpenses(
                isMissingTableError(expensesResult.error) ? [] : (expensesResult.data || [])
            )
            const schools = (isMissingTableError(schoolsResult.error) ? [] : (schoolsResult.data || [])).slice(0, 3)
            const primaryDivision = athleteDivisionResult.data?.target_divisions?.[0]
                || schools[0]?.division
                || 'D3'

            const progress = summarizeWeekProgress(
                isMissingTableError(weeklyResult.error) ? [] : (weeklyResult.data || []),
                engagement
            )

            setDashboardData({
                stats,
                expenses,
                schools,
                divisionKey: normalizeDivisionKey(primaryDivision),
                monthLabel: formatMonthLabel(now),
                progress
            })
            setLoading(false)
        }

        loadDashboardData()
        return () => {
            active = false
        }
    }, [targetAthleteId])

    const isLoaded = !loading && !error

    useEffect(() => {
        if (!isLoaded) return
        track('dashboard_preview_viewed', {
            week_number: dashboardData.progress.currentWeek,
            schools_count: dashboardData.schools.length,
            expenses_total: Number(dashboardData.expenses.total || 0)
        })
    }, [isLoaded, dashboardData])

    const pageSubtitle = useMemo(
        () => 'Based on your Week 1 actions: stats, schools, and expenses.',
        []
    )

    const handleUpgradeClick = (source) => {
        track('dashboard_pro_cta_clicked', { source })
        navigate('/pricing')
    }

    return (
        <DashboardLayout>
            <div className={DASHBOARD_WRAPPER_CLASS}>
                <section className={DASHBOARD_BACKGROUND_CLASS}>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B2635]">Recruiting Intelligence Preview</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Your Recruiting Dashboard</h1>
                    <p className="mt-2 text-base text-gray-600">{pageSubtitle}</p>
                </section>

                {loading && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <LoadingCard />
                        <LoadingCard />
                        <LoadingCard />
                        <LoadingCard />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                        <p>{error}</p>
                        <button
                            type="button"
                            className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {isRebuildMode && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                Dashboard data features are in rebuild mode while database tables are being recreated.
                            </div>
                        )}
                        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <ReadinessScoreCard
                                stats={dashboardData.stats}
                                onUpgrade={() => handleUpgradeClick('readiness_full_analysis')}
                            />

                            <ExpenseBreakdownCard
                                expenses={dashboardData.expenses}
                                division={dashboardData.divisionKey}
                                monthLabel={dashboardData.monthLabel}
                                onUpgrade={() => handleUpgradeClick('expense_roi_analysis')}
                            />

                            <SchoolFitCard
                                schools={dashboardData.schools}
                                athleteStats={dashboardData.stats}
                                onUpgradeSchools={() => handleUpgradeClick('add_more_schools')}
                                onUpgradeContacts={() => handleUpgradeClick('coach_contacts')}
                            />

                            <WeekProgressCard
                                currentWeek={dashboardData.progress.currentWeek}
                                completedActions={dashboardData.progress.completedActions}
                                weekStartDate={dashboardData.progress.weekStartDate}
                                onUpgrade={() => handleUpgradeClick('pricing')}
                            />
                        </section>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
