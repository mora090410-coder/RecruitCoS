import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { track } from '../lib/analytics'

function formatDateForQuery(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatCurrency(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return '$0'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    }).format(amount)
}

function resolveComingBadge() {
    const today = new Date()
    const dayOfWeek = today.getDay() // Sunday=0 ... Saturday=6
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7

    if (daysUntilMonday === 1) {
        return 'COMING TOMORROW'
    }

    return 'COMING MONDAY'
}

function FeatureCard({ icon, name, preview }) {
    return (
        <article className="group rounded-xl border-2 border-[#2C2C2C1A] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8B2635] hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className="text-[32px] leading-none" aria-hidden="true">{icon}</div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                    <p className="text-[15px] leading-relaxed text-gray-600">{preview}</p>
                </div>
            </div>
        </article>
    )
}

export default function UnlockScreen({ athleteId, onClose, weekNumber = 1 }) {
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [schoolCount, setSchoolCount] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        let active = true

        const loadStats = async () => {
            if (!athleteId) return

            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

            const [expensesResult, schoolsResult] = await Promise.all([
                supabase
                    .from('expenses')
                    .select('amount')
                    .eq('athlete_id', athleteId)
                    .gte('date', formatDateForQuery(monthStart))
                    .lt('date', formatDateForQuery(nextMonthStart)),
                supabase
                    .from('athlete_saved_schools')
                    .select('id', { count: 'exact', head: true })
                    .eq('athlete_id', athleteId)
            ])

            if (!active) return

            if (!expensesResult.error) {
                const total = (expensesResult.data || []).reduce((sum, row) => {
                    const amount = Number.parseFloat(row.amount)
                    return sum + (Number.isFinite(amount) ? amount : 0)
                }, 0)
                setTotalExpenses(total)
            }

            if (!schoolsResult.error) {
                setSchoolCount(schoolsResult.count || 0)
            }
        }

        loadStats()
        track('unlock_screen_viewed', { week_number: weekNumber })

        return () => {
            active = false
        }
    }, [athleteId, weekNumber])

    const expensesPreview = useMemo(() => {
        if (totalExpenses <= 0) {
            return '$0 logged • Start tracking to see insights'
        }
        return `${formatCurrency(totalExpenses)} logged this month • See where it's going`
    }, [totalExpenses])

    const schoolsPreview = useMemo(() => {
        if (schoolCount <= 0) {
            return 'No schools saved yet • Add schools to see fit analysis'
        }

        const noun = schoolCount === 1 ? 'school' : 'schools'
        return `${schoolCount} ${noun} saved • Get match scores for each`
    }, [schoolCount])

    const comingBadge = useMemo(() => resolveComingBadge(), [])

    const handleExploreDashboard = () => {
        track('unlock_feature_clicked', {
            week_number: weekNumber,
            feature_name: 'dashboard'
        })
        navigate('/dashboard')
    }

    const handleDoneForToday = () => {
        track('unlock_feature_clicked', {
            week_number: weekNumber,
            feature_name: 'done_for_today'
        })

        if (typeof onClose === 'function') {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4 backdrop-blur-sm animate-in fade-in duration-200"
            role="presentation"
        >
            <section
                className="rc-slide-up w-full max-w-[600px] rounded-2xl border border-[#2C2C2C1A] bg-white p-6 shadow-2xl sm:p-8"
                role="dialog"
                aria-modal="true"
                aria-labelledby="unlock-screen-title"
                aria-describedby="unlock-screen-subtitle"
            >
                <header className="text-center">
                    <div className="text-[64px] leading-none" aria-hidden="true">🔓</div>
                    <h2 id="unlock-screen-title" className="mt-3 text-[32px] font-bold leading-tight text-gray-900">
                        Dashboard Unlocked!
                    </h2>
                    <p id="unlock-screen-subtitle" className="mt-3 text-lg leading-relaxed text-gray-700">
                        You&apos;ve completed Week 1 ahead of schedule. Here&apos;s what you can explore now:
                    </p>
                </header>

                <div className="mt-6 space-y-3" aria-label="Unlocked features preview">
                    <FeatureCard
                        icon="📊"
                        name="Recruiting Readiness Score"
                        preview="See how your stats compare to committed athletes"
                    />
                    <FeatureCard
                        icon="💰"
                        name="Expense Breakdown"
                        preview={expensesPreview}
                    />
                    <FeatureCard
                        icon="🎯"
                        name="School Fit Analysis"
                        preview={schoolsPreview}
                    />
                </div>

                <section className="mt-6 rounded-xl border border-[#2C2C2C1A] bg-gradient-to-br from-[#F5F1E8] to-[#F5F1E8] p-5">
                    <span className="inline-flex rounded-full bg-[#7D2230] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {comingBadge}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-gray-900">Week 2: Coach Outreach &amp; Video Strategy</h3>
                    <p className="mt-2 text-sm text-gray-700">
                        Research D2/D3 coaches • Plan your highlight reel • Track Q1 expenses
                    </p>
                </section>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        className="h-12 w-full rounded-lg bg-[#8B2635] px-6 py-[14px] text-sm font-semibold text-white transition hover:bg-[#7D2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2 active:scale-[0.99]"
                        onClick={handleExploreDashboard}
                    >
                        Explore Dashboard
                    </button>
                    <button
                        type="button"
                        className="h-12 w-full rounded-lg border border-gray-300 bg-white px-6 py-[14px] text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:scale-[0.99]"
                        onClick={handleDoneForToday}
                    >
                        I&apos;m Done For Today
                    </button>
                </div>
            </section>
        </div>
    )
}
