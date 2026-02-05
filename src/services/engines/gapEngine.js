import { canonicalizeMetricKey, getSportSchema } from '../../config/sportSchema.js';

const DEFAULT_TARGET_LEVEL = 'D2';
const MAX_GAP_SCORE = 100;

const resolveSport = (profile) => profile?.sport || profile?.athlete?.sport || null;

const resolveTargetLevel = (profile) => (
    profile?.goals?.targetLevels?.[0]
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

const buildBenchmarkMap = (sport, benchmarks = [], positionGroup, targetLevel) => {
    const filtered = benchmarks.filter((row) => {
        if (row?.metric === undefined || row?.metric === null) return false;
        if (row?.position_group && positionGroup && row.position_group !== positionGroup) return false;
        if (row?.target_level && targetLevel && row.target_level !== targetLevel) return false;
        return true;
    });
    return filtered.reduce((acc, row) => {
        const canonical = canonicalizeMetricKey(sport, row?.metric);
        if (!canonical) return acc;
        acc.set(canonical, row);
        return acc;
    }, new Map());
};

const computeNormalizedDeficit = ({ value, p50, direction, meaningfulDelta }) => {
    if (value === null || p50 === null || meaningfulDelta <= 0) return null;
    const delta = direction === 'higher_better'
        ? Math.max(0, p50 - value)
        : Math.max(0, value - p50);
    return delta / meaningfulDelta;
};

/**
 * Computes an MVP Gap result for a normalized AthleteProfile DTO.
 * Edge cases: returns a null score with a reason when sport is unsupported
 * or the primary position group is missing.
 */
export function computeGap(profile, _options = {}) {
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

    const benchmarkLevelUsed = resolveTargetLevel(profile);
    const athleteMetricMap = buildAthleteMetricMap(sport, profile?.measurables?.latestByMetric || {});
    const benchmarkRows = Array.isArray(profile?.benchmarks)
        ? profile.benchmarks
        : [];
    const benchmarkMap = buildBenchmarkMap(sport, benchmarkRows, positionGroup, benchmarkLevelUsed);

    const missingMetrics = [];
    const gapsByMetric = [];

    let totalDeficit = 0;
    let totalMeasured = 0;

    const applicableMetrics = (schema?.metrics || [])
        .filter((metric) => metric.appliesToGroups?.includes(positionGroup))
        .filter((metric) => {
            if (sport !== 'softball') return true;
            if (positionGroup === 'P') return metric.key !== 'overhand_velocity';
            return metric.key !== 'pitch_velocity';
        });

    applicableMetrics.forEach((metric) => {
        const benchmark = benchmarkMap.get(metric.key);
        const benchmarkP50 = toNumber(benchmark?.p50);
        const athleteValue = athleteMetricMap.get(metric.key) ?? null;
        if (athleteValue === null) {
            missingMetrics.push(metric.key);
        }

        const normalizedDeficit = athleteValue === null
            ? null
            : computeNormalizedDeficit({
                value: athleteValue,
                p50: benchmarkP50,
                direction: metric.direction,
                meaningfulDelta: metric.meaningfulDelta || 1
            });

        if (typeof normalizedDeficit === 'number') {
            totalDeficit += normalizedDeficit;
            totalMeasured += 1;
        }

        gapsByMetric.push({
            metricKey: metric.key,
            athleteValue,
            benchmarkValue: benchmarkP50,
            normalizedDeficit,
            direction: metric.direction
        });
    });

    const deficitRatio = totalMeasured > 0 ? totalDeficit / totalMeasured : null;
    const gapScore0to100 = deficitRatio === null
        ? null
        : Math.max(0, Math.min(100, Math.round(MAX_GAP_SCORE - (deficitRatio * MAX_GAP_SCORE))));

    const primaryGap = gapsByMetric
        .filter((gap) => typeof gap.normalizedDeficit === 'number' && gap.normalizedDeficit > 0)
        .sort((a, b) => b.normalizedDeficit - a.normalizedDeficit)[0] || null;

    return {
        gapScore0to100,
        primaryGap,
        gapsByMetric,
        benchmarkLevelUsed,
        missingMetrics
    };
}
