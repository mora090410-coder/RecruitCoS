/**
 * Normalizes a raw metric score to a 0..1 range based on percentiles.
 * 
 * @param {Object} params
 * @param {number} params.value - The athlete's raw value
 * @param {number} params.p50 - The 50th percentile benchmark
 * @param {number} params.p90 - The 90th percentile benchmark
 * @param {string} params.direction - 'higher_better' | 'lower_better'
 * @returns {number} Score between 0 and 1
 */
export function normalizeMetricScore({ value, p50, p90, direction }) {
    if (value === undefined || p50 === undefined || p90 === undefined) return 0;

    // If p50 and p90 are equal, we can't interpolate. Return 1 if equal to benchmark, else 0.
    if (p50 === p90) return value === p50 ? 1 : 0;

    let score;
    if (direction === 'higher_better') {
        // Linear interpolation between p50 (0.5) and p90 (1.0)
        // Adjusting so values below p50 don't just drop to 0 instantly, but are penalized
        score = 0.5 + (value - p50) / (p90 - p50) * 0.5;
    } else {
        // Lower is better (e.g., 40-yard dash)
        score = 0.5 + (p50 - value) / (p50 - p90) * 0.5;
    }

    return Math.max(0, Math.min(1, score));
}

/**
 * Computes the overall Gap Score for an athlete.
 * 
 * @param {Object} params
 * @param {string} params.sport
 * @param {string} params.positionGroup
 * @param {string} params.targetLevel
 * @param {Array} params.athleteMetrics - Array of { metric, value }
 * @param {Array} params.benchmarks - Array of { metric, p50, p75, p90, direction, weight }
 * @returns {Object} Gap score details
 */
export function computeGapScore({ sport, positionGroup, targetLevel, athleteMetrics = [], benchmarks = [] }) {
    const metricMap = new Map(athleteMetrics.map(m => [m.metric, m.value]));
    const results = [];
    const missingMetrics = [];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    benchmarks.forEach(bm => {
        const value = metricMap.get(bm.metric);

        if (value === undefined) {
            missingMetrics.push(bm.metric);
            return;
        }

        const metricScore = normalizeMetricScore({
            value,
            p50: bm.p50,
            p90: bm.p90,
            direction: bm.direction
        });

        const deltaToP75 = bm.direction === 'higher_better'
            ? Math.max(0, bm.p75 - value)
            : Math.max(0, value - bm.p75);

        const deltaToP90 = bm.direction === 'higher_better'
            ? Math.max(0, bm.p90 - value)
            : Math.max(0, value - bm.p90);

        results.push({
            metric: bm.metric,
            value,
            unit: bm.unit,
            p50: bm.p50,
            p75: bm.p75,
            p90: bm.p90,
            direction: bm.direction,
            weight: bm.weight || 5,
            metricScore0to1: metricScore,
            deltaToP75,
            deltaToP90
        });

        totalWeightedScore += (metricScore * (bm.weight || 5));
        totalWeight += (bm.weight || 5);
    });

    const gapScore0to100 = totalWeight > 0
        ? Math.round((totalWeightedScore / totalWeight) * 100)
        : 0;

    // Filter for top gaps: lowest scores among present benchmarks
    const topGaps = [...results]
        .filter(r => r.metricScore0to1 < 0.9) // Only gaps
        .sort((a, b) => a.metricScore0to1 - b.metricScore0to1)
        .slice(0, 3);

    return {
        gapScore0to100,
        metricDetails: results,
        topGaps,
        missingMetrics
    };
}
