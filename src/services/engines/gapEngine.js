import { canonicalizeMetricKey, getMetricLabel, getMetricUnit, getSportSchema } from '../../config/sportSchema.js';

const DEFAULT_TARGET_LEVEL = 'D2';
const DEFAULT_WEIGHT = 5;
const MAX_GAP_SCORE = 100;

const resolveSport = (profile) => profile?.sport || profile?.athlete?.sport || null;

const resolveTargetLevel = (profile, override) => (
    override
    || profile?.goals?.targetLevels?.[0]
    || DEFAULT_TARGET_LEVEL
);

const resolvePositionGroup = (profile) => profile?.positions?.primary?.group || null;

const toNumber = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const buildAthleteMetricMap = (sport, latestByMetric = {}) => {
    const entries = Object.entries(latestByMetric);
    return entries.reduce((acc, [metricKey, row]) => {
        const canonical = canonicalizeMetricKey(sport, metricKey);
        if (!canonical) return acc;
        const value = toNumber(row?.value ?? row?.raw_value ?? row?.measurement ?? row?.score);
        if (value === null) return acc;
        if (!acc.has(canonical)) acc.set(canonical, value);
        return acc;
    }, new Map());
};

const buildBenchmarkMap = (sport, benchmarks = []) => {
    return benchmarks.reduce((acc, row) => {
        const canonical = canonicalizeMetricKey(sport, row?.metric);
        if (!canonical) return acc;
        acc.set(canonical, row);
        return acc;
    }, new Map());
};

const computeNormalizedDeficit = ({ value, p50, direction, range }) => {
    if (value === null || p50 === null || range <= 0) return 0;
    const delta = direction === 'higher_better'
        ? Math.max(0, p50 - value)
        : Math.max(0, value - p50);
    return Math.min(1, delta / range);
};

/**
 * Computes an MVP Gap result for a normalized AthleteProfile DTO.
 * Edge cases: returns a null score with a reason when sport is unsupported
 * or the primary position group is missing.
 */
export function computeGap(profile, { targetLevel, benchmarks = [] } = {}) {
    const sport = resolveSport(profile);
    const schema = getSportSchema(sport);
    const sportSupported = profile?.sportSupported !== false && !!schema;

    if (!sportSupported) {
        return {
            gapScore0to100: null,
            primaryGap: null,
            gapsByMetric: [],
            benchmarkLevelUsed: null,
            missingMetrics: [],
            notes: {
                reason: 'unsupported_sport',
                message: 'Scoring is disabled for unsupported sports.'
            }
        };
    }

    const positionGroup = resolvePositionGroup(profile);
    if (!positionGroup) {
        return {
            gapScore0to100: null,
            primaryGap: null,
            gapsByMetric: [],
            benchmarkLevelUsed: null,
            missingMetrics: [],
            notes: {
                reason: 'missing_position_group',
                message: 'Primary position group is required to compute gaps.'
            }
        };
    }

    const benchmarkLevelUsed = resolveTargetLevel(profile, targetLevel);
    const athleteMetricMap = buildAthleteMetricMap(sport, profile?.measurables?.latestByMetric || {});
    const benchmarkMap = buildBenchmarkMap(sport, benchmarks || []);

    const missingMetrics = [];
    const missingBenchmarks = [];
    const gapsByMetric = [];

    let totalWeightedDeficit = 0;
    let totalWeight = 0;

    const applicableMetrics = (schema?.metrics || [])
        .filter((metric) => metric.appliesToGroups?.includes(positionGroup));

    applicableMetrics.forEach((metric) => {
        const benchmark = benchmarkMap.get(metric.key);
        const benchmarkP50 = toNumber(benchmark?.p50);
        if (benchmarkP50 === null) {
            missingBenchmarks.push(metric.key);
            return;
        }

        const athleteValue = athleteMetricMap.get(metric.key) ?? null;
        if (athleteValue === null) {
            missingMetrics.push(metric.key);
        }

        const range = Math.max(
            1,
            (metric?.input?.max ?? 0) - (metric?.input?.min ?? 0)
        );
        const normalizedDeficit = athleteValue === null
            ? 0
            : computeNormalizedDeficit({
                value: athleteValue,
                p50: benchmarkP50,
                direction: metric.direction,
                range
            });

        const weight = metric.weightDefault || DEFAULT_WEIGHT;
        if (athleteValue !== null) {
            totalWeightedDeficit += normalizedDeficit * weight;
            totalWeight += weight;
        }

        gapsByMetric.push({
            metricKey: metric.key,
            label: getMetricLabel(sport, metric.key),
            unit: getMetricUnit(sport, metric.key),
            direction: metric.direction,
            appliesToGroups: metric.appliesToGroups,
            athleteValue,
            benchmarkP50,
            normalizedDeficit
        });
    });

    const deficitRatio = totalWeight > 0 ? totalWeightedDeficit / totalWeight : 1;
    const gapScore0to100 = totalWeight > 0
        ? Math.max(0, Math.round(MAX_GAP_SCORE - (deficitRatio * MAX_GAP_SCORE)))
        : 0;

    const primaryGap = gapsByMetric
        .filter((gap) => (gap.normalizedDeficit || 0) > 0)
        .sort((a, b) => b.normalizedDeficit - a.normalizedDeficit)[0] || null;

    return {
        gapScore0to100,
        primaryGap,
        gapsByMetric,
        benchmarkLevelUsed,
        missingMetrics,
        notes: {
            missingBenchmarks,
            missingMetrics
        }
    };
}
