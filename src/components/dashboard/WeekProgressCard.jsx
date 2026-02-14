function toMonday(dateValue) {
    const date = new Date(dateValue)
    const day = date.getDay()
    const delta = day === 0 ? -6 : 1 - day
    date.setDate(date.getDate() + delta)
    date.setHours(0, 0, 0, 0)
    return date
}

function addDays(dateValue, days) {
    const date = new Date(dateValue)
    date.setDate(date.getDate() + days)
    return date
}

function formatMonthDay(dateValue) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dateValue)
}

function isSameCalendarDay(left, right) {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate()
}

function getWeekTwoUnlockText(weekTwoDate) {
    const today = new Date()
    const tomorrow = addDays(today, 1)

    if (isSameCalendarDay(weekTwoDate, tomorrow)) {
        return 'tomorrow'
    }

    return `Monday (${formatMonthDay(weekTwoDate)})`
}

const PRO_BUTTON_CLASS = 'mt-5 inline-flex w-full items-center justify-center rounded-lg border-2 border-[#8B2635] bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#8B2635] transition hover:bg-[#7D2230] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2'

export default function WeekProgressCard({ currentWeek, completedActions, weekStartDate, onUpgrade }) {
    const clampedWeek = Math.min(4, Math.max(1, Number(currentWeek || 1)))
    const progressPercentage = Math.round((clampedWeek / 4) * 100)

    const baseWeekStart = weekStartDate ? toMonday(weekStartDate) : toMonday(new Date())
    const weekTwoDate = addDays(baseWeekStart, 7)
    const weekThreeDate = addDays(baseWeekStart, 14)
    const weekFourDate = addDays(baseWeekStart, 21)

    return (
        <article className="rounded-xl border-2 border-[#2C2C2C1A] bg-white p-8 transition-shadow hover:shadow-lg">
            <header className="mb-5 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">📅</span>
                <h2 className="text-xl font-bold text-gray-900">Your Journey</h2>
            </header>

            <p className="text-base font-semibold text-gray-900">Week {clampedWeek} of 4 (Free Trial)</p>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-700">
                    <span>{progressPercentage}% complete</span>
                    <span>{clampedWeek}/4 weeks</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B2635] to-[#8B2635]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-700">
                <p className="rounded-lg border border-[rgba(212,175,55,0.45)] bg-[rgba(212,175,55,0.16)] px-3 py-2 font-medium text-[#D4AF37]">
                    ✓ Week 1 Complete ({completedActions}/3 actions)
                </p>
                <p className="rounded-lg border border-[#2C2C2C1A] bg-[#F5F1E8] px-3 py-2">
                    → Week 2 unlocks {getWeekTwoUnlockText(weekTwoDate)}
                </p>
                <p className="rounded-lg border border-[#2C2C2C1A] bg-[#F5F1E8] px-3 py-2">
                    → Week 3 unlocks {formatMonthDay(weekThreeDate)}
                </p>
                <p className="rounded-lg border border-[#2C2C2C1A] bg-[#F5F1E8] px-3 py-2">
                    → Week 4 unlocks {formatMonthDay(weekFourDate)}
                </p>
            </div>

            <p className="mt-5 rounded-lg bg-[#F5F1E8] px-4 py-3 text-sm text-gray-800">
                After Week 4: Upgrade to continue weekly plans and unlock all features.
            </p>

            <button type="button" className={PRO_BUTTON_CLASS} onClick={onUpgrade}>
                See Pricing
            </button>
        </article>
    )
}
