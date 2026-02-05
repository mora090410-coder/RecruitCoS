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

const clamp01 = (value) => Math.max(0, Math.min(1, value));

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

const computeDeficit = ({ value, target, direction }) => {
    if (value === null || target === null) return null;
    return direction === 'higher_better'
        ? Math.max(0, target - value)
        : Math.max(0, value - target);
};

const computeStrength = ({ value, baseline, direction }) => {
    if (value === null || baseline === null) return null;
    return direction === 'higher_better'
        ? Math.max(0, value - baseline)
        : Math.max(0, baseline - value);
};

const resolveBand = ({ value, p50, p75, p90, direction }) => {
    if (value === null || p50 === null || p75 === null || p90 === null) return null;
    if (direction === 'higher_better') {
        if (value < p50) return 'below_p50';
        if (value < p75) return 'p50_to_p75';
        if (value < p90) return 'p75_to_p90';
        return 'above_p90';
    }
    if (value > p50) return 'below_p50';
    if (value > p75) return 'p50_to_p75';
    if (value > p90) return 'p75_to_p90';
    return 'above_p90';
};

const resolveStrengthTier = (band) => {
    switch (band) {
        case 'p50_to_p75':
            return 'competitive';
        case 'p75_to_p90':
            return 'strong';
        case 'above_p90':
            return 'elite';
        case 'below_p50':
        default:
            return 'below_p50';
    }
};

const resolveSportKey = (sport) => (sport ? sport.toString().trim().toLowerCase() : '');

const SHOWCASE_PRIORITY = {
    softball: {
        IF: ['exit_velo', 'overhand_velocity', 'home_to_first', 'pop_time'],
        OF: ['exit_velo', 'overhand_velocity', 'home_to_first', 'pop_time'],
        C: ['exit_velo', 'overhand_velocity', 'home_to_first', 'pop_time'],
        P: ['pitch_velocity', 'strike_percentage', 'spin_rate']
    },
    baseball: {
        IF: ['exit_velocity', 'infield_velocity', 'sixty_time'],
        OF: ['exit_velocity', 'outfield_velocity', 'sixty_time'],
        C: ['exit_velocity', 'pop_time', 'catcher_throw_velocity'],
        P: ['pitch_velocity', 'strike_percentage', 'spin_rate']
    },
    football: {
        QB: ['throwing_velocity', 'forty_time', 'shuttle'],
        RB: ['forty_time', 'vertical', 'shuttle'],
        WR: ['forty_time', 'three_cone', 'vertical'],
        TE: ['forty_time', 'bench_reps', 'shuttle'],
        OL: ['bench_reps', 'shuttle', 'forty_time'],
        DL: ['bench_reps', 'forty_time', 'shuttle'],
        LB: ['forty_time', 'vertical', 'shuttle'],
        DB: ['forty_time', 'three_cone', 'vertical'],
        KP: ['kick_distance', 'kick_accuracy', 'hang_time']
    },
    soccer: {
        GK: ['vertical_jump', 'sprint_30m', 'agility_505'],
        DEF: ['sprint_30m', 'yo_yo', 'agility_505', 'vertical_jump'],
        MID: ['sprint_30m', 'yo_yo', 'agility_505', 'vertical_jump'],
        FWD: ['sprint_30m', 'yo_yo', 'agility_505', 'vertical_jump']
    },
    basketball: {
        G: ['three_quarter_sprint', 'lane_agility', 'vertical_jump', 'height'],
        W: ['three_quarter_sprint', 'lane_agility', 'vertical_jump', 'wingspan', 'height'],
        B: ['lane_agility', 'three_quarter_sprint', 'vertical_jump', 'wingspan', 'height']
    }
};

const getShowcasePriority = (sport, positionGroup) => {
    const sportKey = resolveSportKey(sport);
    return SHOWCASE_PRIORITY[sportKey]?.[positionGroup] || [];
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
            strengths: [],
            perMetric: [],
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
            strengths: [],
            perMetric: [],
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
    const perMetric = [];
    const gapsByMetric = [];
    const diagnostics = {
        matchedMetrics: []
    };

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
        const benchmarkP75 = toNumber(benchmark?.p75);
        const benchmarkP90 = toNumber(benchmark?.p90);
        const benchmarkUnit = benchmark?.unit || metric.unit || null;
        const benchmarkWeight = toNumber(benchmark?.weight ?? metric.weightDefault ?? metric.weight ?? null);
        const athleteValue = athleteMetricMap.get(metric.key) ?? null;
        if (athleteValue === null) {
            missingMetrics.push(metric.key);
        }

        const a = athleteValue === null ? null : Number(athleteValue);
        const b = benchmarkP50 === null ? null : Number(benchmarkP50);
        const b75 = benchmarkP75 === null ? null : Number(benchmarkP75);
        const b90 = benchmarkP90 === null ? null : Number(benchmarkP90);
        const athleteValueIsNan = a !== null && Number.isNaN(a);
        const benchmarkIsNan = (b !== null && Number.isNaN(b))
            || (b75 !== null && Number.isNaN(b75))
            || (b90 !== null && Number.isNaN(b90));

        if (athleteValueIsNan || benchmarkIsNan) {
            diagnostics.matchedMetrics.push({
                metricKey: metric.key,
                athleteValue,
                p50: benchmarkP50,
                p75: benchmarkP75,
                p90: benchmarkP90,
                direction: metric.direction,
                deficitToP50: 'NaN',
                deficitToP75: 'NaN',
                deficitToP90: 'NaN',
                normalizedGapScore: 'NaN',
                normalizedStrengthScore: 'NaN'
            });
            return;
        }

        const deficitToP50 = computeDeficit({ value: a, target: b, direction: metric.direction });
        const deficitToP75 = computeDeficit({ value: a, target: b75, direction: metric.direction });
        const deficitToP90 = computeDeficit({ value: a, target: b90, direction: metric.direction });

        const meaningfulDelta = metric.meaningfulDelta || 1;
        const normalizedGapScore = (typeof deficitToP50 === 'number' && meaningfulDelta > 0)
            ? clamp01(deficitToP50 / meaningfulDelta)
            : null;

        const band = resolveBand({
            value: a,
            p50: b,
            p75: b75,
            p90: b90,
            direction: metric.direction
        });
        const strengthTier = resolveStrengthTier(band);
        const strengthBaseline = band === 'above_p90' ? b90 : b75;
        const rawStrength = computeStrength({
            value: a,
            baseline: strengthBaseline,
            direction: metric.direction
        });
        const normalizedStrengthScore = (typeof rawStrength === 'number' && meaningfulDelta > 0)
            ? clamp01(rawStrength / meaningfulDelta)
            : null;

        const advantageVsP50 = computeStrength({
            value: a,
            baseline: b,
            direction: metric.direction
        });
        const normalizedAdvantage = (typeof advantageVsP50 === 'number' && meaningfulDelta > 0)
            ? clamp01(advantageVsP50 / meaningfulDelta)
            : null;

        if (typeof normalizedGapScore === 'number') {
            totalDeficit += normalizedGapScore;
            totalMeasured += 1;
        }

        diagnostics.matchedMetrics.push({
            metricKey: metric.key,
            athleteValue: a,
            p50: b,
            p75: b75,
            p90: b90,
            direction: metric.direction,
            deficitToP50,
            deficitToP75,
            deficitToP90,
            normalizedGapScore,
            normalizedStrengthScore
        });

        const metricEntry = {
            metricKey: metric.key,
            athleteValue,
            direction: metric.direction,
            unit: benchmarkUnit,
            weight: benchmarkWeight,
            p50: benchmarkP50,
            p75: benchmarkP75,
            p90: benchmarkP90,
            band,
            strengthTier,
            meaningfulDelta,
            deficitToP50,
            deficitToP75,
            deficitToP90,
            advantageVsP50,
            normalizedAdvantage,
            normalizedGapScore,
            normalizedStrengthScore
        };

        perMetric.push(metricEntry);

        gapsByMetric.push({
            metricKey: metric.key,
            athleteValue,
            benchmarkValue: benchmarkP50,
            normalizedDeficit: normalizedGapScore,
            direction: metric.direction
        });
    });

    const deficitRatio = totalMeasured > 0 ? totalDeficit / totalMeasured : null;
    const gapScore0to100 = deficitRatio === null
        ? null
        : Math.max(0, Math.min(100, Math.round(MAX_GAP_SCORE - (deficitRatio * MAX_GAP_SCORE))));

    const primaryGap = perMetric
        .filter((gap) => typeof gap.normalizedGapScore === 'number' && gap.normalizedGapScore > 0)
        .sort((a, b) => b.normalizedGapScore - a.normalizedGapScore)[0] || null;

    const strongCandidates = perMetric
        .filter((metric) => metric.strengthTier === 'strong' || metric.strengthTier === 'elite')
        .sort((a, b) => (b.normalizedStrengthScore ?? 0) - (a.normalizedStrengthScore ?? 0))
        .slice(0, 2);

    const competitiveCandidates = perMetric
        .filter((metric) => (
            metric.band === 'p50_to_p75'
            || metric.band === 'p75_to_p90'
            || metric.band === 'above_p90'
        ));

    const positiveAdvantageCandidates = competitiveCandidates
        .filter((metric) => typeof metric.advantageVsP50 === 'number' && metric.advantageVsP50 > 0)
        .sort((a, b) => (b.normalizedAdvantage ?? 0) - (a.normalizedAdvantage ?? 0));

    let strengths = [];
    if (strongCandidates.length > 0) {
        strengths = strongCandidates;
    } else if (positiveAdvantageCandidates.length > 0) {
        strengths = positiveAdvantageCandidates.slice(0, 1);
    } else if (competitiveCandidates.length > 0) {
        const priorityOrder = getShowcasePriority(sport, positionGroup);
        const candidateMap = new Map(competitiveCandidates.map((metric) => [metric.metricKey, metric]));
        const prioritized = priorityOrder.map((key) => candidateMap.get(key)).filter(Boolean)[0] || null;
        strengths = prioritized ? [prioritized] : competitiveCandidates.slice(0, 1);
    }

    const primaryGapWithLegacy = primaryGap
        ? {
            ...primaryGap,
            benchmarkValue: primaryGap.p50 ?? null,
            normalizedDeficit: primaryGap.normalizedGapScore
        }
        : null;

    return {
        gapScore0to100,
        primaryGap: primaryGapWithLegacy,
        strengths,
        perMetric,
        gapsByMetric,
        benchmarkLevelUsed,
        missingMetrics,
        diagnostics,
        notes: primaryGap ? undefined : { reason: 'NO_DEFICIT' }
    };
}
