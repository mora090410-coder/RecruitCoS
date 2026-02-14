import { getBenchmarkInsight, getDivisionBenchmark } from './insightCalculations'

const PRO_BUTTON_CLASS = 'mt-5 inline-flex w-full items-center justify-center rounded-lg border-2 border-[#8B2635] bg-white px-4 py-3 text-sm font-semibold text-[#8B2635] transition hover:bg-[#8B2635] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2'

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    }).format(amount)
}

export default function ExpenseBreakdownCard({ expenses, division, monthLabel, onUpgrade }) {
    const total = Number(expenses?.total || 0)
    const byCategory = expenses?.byCategory || {}
    const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    const benchmarkInsight = getBenchmarkInsight(total, division)
    const benchmark = getDivisionBenchmark(division)

    return (
        <article className="rounded-xl border-2 border-[#2C2C2C1A] bg-white p-8 transition-shadow hover:shadow-lg">
            <header className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">💰</span>
                    <h2 className="text-xl font-bold text-gray-900">Recruiting Expenses</h2>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{monthLabel}</span>
            </header>

            <p className="text-5xl font-bold leading-none text-gray-900">{formatCurrency(total)}</p>
            <p className="mt-2 text-sm text-gray-600">Total spent this month</p>

            <div className="mt-6 space-y-3">
                {sortedCategories.length === 0 && (
                    <div className="rounded-lg border border-dashed border-[#2C2C2C1A] bg-[#F5F1E8] p-4 text-sm text-gray-600">
                        No expenses logged this month yet.
                    </div>
                )}
                {sortedCategories.map(([category, amount]) => {
                    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
                    return (
                        <div key={category} className="rounded-lg border border-[#2C2C2C1A] bg-white p-3">
                            <div className="mb-2 flex items-center justify-between text-sm text-gray-700">
                                <span className="font-semibold">{category}</span>
                                <span>{formatCurrency(amount)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#8B2635] to-[#8B2635]"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="mt-5 rounded-lg bg-[#F5F1E8] px-4 py-3 text-sm text-gray-800">
                📈 Families like yours spend: {formatCurrency(benchmark.min)}-{formatCurrency(benchmark.max)}/year on {benchmark.label} recruiting
            </p>
            <p className="mt-3 rounded-lg bg-[#F5F1E8] px-4 py-3 text-sm text-gray-700">💡 {benchmarkInsight}</p>

            <button type="button" className={PRO_BUTTON_CLASS} onClick={onUpgrade}>
                See ROI Analysis → PRO
            </button>
        </article>
    )
}
