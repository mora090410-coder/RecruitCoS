import { calculateSchoolMatch } from './insightCalculations'

const PRO_BUTTON_CLASS = 'inline-flex w-full items-center justify-center rounded-lg border-2 border-[#8B2635] bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#8B2635] transition hover:bg-[#7D2230] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2'

function getCategoryBadgeClass(category) {
    if (category === 'SAFETY') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (category === 'TARGET') return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-rose-100 text-rose-700 border-rose-200'
}

function Stars({ count }) {
    const safeCount = Math.max(0, Math.min(5, Number(count || 0)))
    return (
        <span className="tracking-wide text-[#8B2635]" aria-label={`${safeCount} out of 5 stars`}>
            {'★'.repeat(safeCount)}
            <span className="text-gray-300">{'★'.repeat(5 - safeCount)}</span>
        </span>
    )
}

function getSchoolLocation(school) {
    return school.school_location || school.location || 'Location unavailable'
}

export default function SchoolFitCard({ schools, athleteStats, onUpgradeSchools, onUpgradeContacts }) {
    const cappedSchools = (schools || []).slice(0, 3)
    const fitRows = cappedSchools.map((school) => ({
        school,
        fit: calculateSchoolMatch(school, athleteStats)
    }))

    const mix = fitRows.reduce((accumulator, row) => {
        const category = row.fit.category
        accumulator[category] = (accumulator[category] || 0) + 1
        return accumulator
    }, { REACH: 0, TARGET: 0, SAFETY: 0 })

    const isBalanced = mix.REACH > 0 && mix.TARGET > 0 && mix.SAFETY > 0

    return (
        <article className="rounded-xl border-2 border-[#2C2C2C1A] bg-white p-8 transition-shadow hover:shadow-lg">
            <header className="mb-5 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">🎯</span>
                <h2 className="text-xl font-bold text-gray-900">Target Schools ({cappedSchools.length})</h2>
            </header>

            <div className="space-y-3">
                {fitRows.length === 0 && (
                    <div className="rounded-lg border border-dashed border-[#2C2C2C1A] bg-[#F5F1E8] p-4 text-sm text-gray-600">
                        No schools saved yet. Add schools in Week 1 Action 2 to see fit analysis.
                    </div>
                )}

                {fitRows.map(({ school, fit }) => (
                    <article key={school.id || school.school_name} className="rounded-lg border border-[#2C2C2C1A] bg-white p-4">
                        <h3 className="text-base font-semibold text-gray-900">{school.school_name}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            {(school.division || 'D3').toUpperCase()} • {getSchoolLocation(school)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">Match Score: {fit.matchScore}/100</span>
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeClass(fit.category)}`}>
                                {fit.category}
                            </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm text-gray-700">
                            <div className="flex items-center justify-between gap-3">
                                <span>Athletic fit:</span>
                                <Stars count={fit.athleticFit} />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span>Academic fit:</span>
                                <Stars count={fit.academicFit} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <p className="mt-5 rounded-lg bg-[#F5F1E8] px-4 py-3 text-sm text-gray-700">
                💡 Your target mix: {mix.REACH} reach, {mix.TARGET} target, {mix.SAFETY} safety
                {fitRows.length > 0 ? (isBalanced ? ' ✓' : ' - Consider adding more variety') : ''}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" className={PRO_BUTTON_CLASS} onClick={onUpgradeSchools}>
                    Add More Schools → PRO
                </button>
                <button type="button" className={PRO_BUTTON_CLASS} onClick={onUpgradeContacts}>
                    See Coach Contacts → PRO
                </button>
            </div>
        </article>
    )
}
