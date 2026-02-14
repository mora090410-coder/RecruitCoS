import {
    calculateReadinessScore,
    getDivisionRecommendation,
    getScoreLabel
} from './insightCalculations'

const PRO_BUTTON_CLASS = 'mt-5 inline-flex w-full items-center justify-center rounded-lg border-2 border-[#8B2635] bg-white px-4 py-3 text-sm font-semibold text-[#8B2635] transition hover:bg-[#8B2635] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2635] focus-visible:ring-offset-2'

function ScoreCircle({ score, label }) {
    const circleStyle = {
        background: `conic-gradient(#8B2635 ${score * 3.6}deg, #F5F1E8 ${score * 3.6}deg 360deg)`
    }

    return (
        <div className="mx-auto mb-5 h-40 w-40 rounded-full p-2" style={circleStyle}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-5xl font-bold leading-none text-gray-900">{score}</span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#8B2635]">{label}</span>
            </div>
        </div>
    )
}

export default function ReadinessScoreCard({ stats, onUpgrade }) {
    const readinessScore = calculateReadinessScore(stats)
    const scoreLabel = getScoreLabel(readinessScore)
    const divisionRecommendation = getDivisionRecommendation(readinessScore)
    const dashTime = Number.isFinite(Number(stats?.sixty_yard_dash))
        ? `${Number(stats.sixty_yard_dash).toFixed(2)}s`
        : 'Not logged yet'
    const verticalJump = Number.isFinite(Number(stats?.vertical_jump))
        ? `${Number(stats.vertical_jump).toFixed(1)}"`
        : 'Not logged yet'

    return (
        <article className="rounded-xl border-2 border-[#2C2C2C1A] bg-white p-8 transition-shadow hover:shadow-lg">
            <header className="mb-6 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">📊</span>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Recruiting Readiness</h2>
                    <p className="text-sm text-gray-500">Week 1 performance snapshot</p>
                </div>
            </header>

            <ScoreCircle score={readinessScore} label={scoreLabel} />

            <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Your Profile Strength</span>
                    <span>{readinessScore}/100</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B2635] to-[#8B2635]"
                        style={{ width: `${readinessScore}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2 rounded-lg border border-[#2C2C2C1A] bg-[#F5F1E8] p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Based on:</p>
                <p>• 60-yard dash: {dashTime}</p>
                <p>• Vertical jump: {verticalJump}</p>
                <p>• Recent stats: {stats?.recent_stats ? 'Logged' : 'Not yet'}</p>
            </div>

            <p className="mt-4 rounded-lg bg-[#F5F1E8] px-4 py-3 text-sm font-medium text-gray-800">
                💡 {divisionRecommendation}
            </p>

            <button type="button" className={PRO_BUTTON_CLASS} onClick={onUpgrade}>
                See Full Analysis → PRO
            </button>
        </article>
    )
}
