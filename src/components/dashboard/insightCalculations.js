/**
 * Calculates a readiness score from Week 1 measurable inputs.
 * Inputs are optional; missing stats keep the athlete at baseline score.
 */
const DIVISION_BENCHMARKS = {
    d1: { min: 3000, max: 8000, label: 'D1' },
    d2: { min: 2000, max: 5000, label: 'D2' },
    d3: { min: 1200, max: 2400, label: 'D3' },
    naia: { min: 1000, max: 2000, label: 'NAIA' },
    juco: { min: 500, max: 1500, label: 'JUCO' }
}

function normalizeDivisionKey(division) {
    const normalized = String(division || 'd3').toLowerCase().replace(/[^a-z0-9]/g, '')
    return DIVISION_BENCHMARKS[normalized] ? normalized : 'd3'
}

export function calculateReadinessScore(stats) {
    let score = 50

    const dash = Number(stats?.sixty_yard_dash)
    if (Number.isFinite(dash)) {
        if (dash < 7.0) score += 20
        else if (dash < 7.5) score += 10
        else if (dash < 8.0) score += 5
    }

    const vertical = Number(stats?.vertical_jump)
    if (Number.isFinite(vertical)) {
        if (vertical > 30) score += 20
        else if (vertical > 26) score += 10
        else if (vertical > 22) score += 5
    }

    if (stats?.recent_stats) {
        score += 10
    }

    return Math.min(score, 100)
}

/**
 * Maps numeric readiness score into a short competitive label.
 */
export function getScoreLabel(score) {
    if (score >= 80) return 'ELITE'
    if (score >= 60) return 'COMPETITIVE'
    return 'DEVELOPING'
}

/**
 * Returns a plain-language division recommendation from readiness score.
 */
export function getDivisionRecommendation(score) {
    if (score >= 85) return 'D1 programs are within reach'
    if (score >= 70) return 'D2 and high-level D3 are your best fit'
    if (score >= 55) return 'D2 and D3 programs are realistic targets'
    return 'D3, NAIA, and JUCO are great options'
}

/**
 * Provides a monthly spend insight against division-level annual recruiting ranges.
 */
export function getBenchmarkInsight(total, division) {
    const range = DIVISION_BENCHMARKS[normalizeDivisionKey(division)]
    const monthlyAvg = range.min / 12

    if (total < monthlyAvg * 0.7) {
        return `You're below average spending. Consider adding 1-2 camps.`
    }
    if (total > monthlyAvg * 1.3) {
        return `You're above average. Review ROI on each expense.`
    }

    return `You're on track with typical ${range.label} spending.`
}

/**
 * Returns normalized annual benchmark ranges for display in expense UI.
 */
export function getDivisionBenchmark(division) {
    const normalizedDivision = normalizeDivisionKey(division)
    const range = DIVISION_BENCHMARKS[normalizedDivision]
    return {
        min: range.min,
        max: range.max,
        label: range.label
    }
}

/**
 * Estimates school match quality using readiness and division difficulty.
 */
export function calculateSchoolMatch(school, athleteStats) {
    const athleteScore = calculateReadinessScore(athleteStats)
    const divisionDifficulty = {
        d1: 90,
        d2: 70,
        d3: 50,
        naia: 45,
        juco: 40
    }

    const schoolDivision = String(school?.division || 'd3').toLowerCase()
    const divisionBar = divisionDifficulty[schoolDivision] || 50
    const athleticFitRaw = Math.max(0, 100 - Math.abs(athleteScore - divisionBar))
    const academicFitRaw = 70
    const matchScore = (athleticFitRaw * 0.6) + (academicFitRaw * 0.4)
    const roundedMatchScore = Math.round(matchScore)

    return {
        matchScore: roundedMatchScore,
        athleticFit: Math.round((athleticFitRaw / 100) * 5),
        academicFit: Math.round((academicFitRaw / 100) * 5),
        category: roundedMatchScore >= 86 ? 'SAFETY' : roundedMatchScore >= 61 ? 'TARGET' : 'REACH'
    }
}
