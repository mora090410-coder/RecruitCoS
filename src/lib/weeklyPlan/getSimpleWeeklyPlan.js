import { supabase } from '../supabase';
import {
    fetchBenchmarks,
    fetchLatestMeasurables,
    fetchLatestWeeklyPlan
} from '../recruitingData';
import { getMetricLabel, getMetricUnit } from '../../config/sportSchema';
import { getAthletePhase, RECRUITING_PHASES } from '../constants';

const PHASE_KEY_TO_LABEL = {
    foundation: RECRUITING_PHASES.FOUNDATION,
    evaluation: RECRUITING_PHASES.EVALUATION,
    identification: RECRUITING_PHASES.IDENTIFICATION,
    comparison: RECRUITING_PHASES.COMPARISON,
    commitment: RECRUITING_PHASES.COMMITMENT
};

const formatMetricValue = (value, unit) => {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return null;
    return `${numeric}${unit ? ` ${unit}` : ''}`;
};

const resolvePhaseLabel = (phaseKeyOrLabel, gradYear) => {
    if (phaseKeyOrLabel && PHASE_KEY_TO_LABEL[phaseKeyOrLabel]) {
        return PHASE_KEY_TO_LABEL[phaseKeyOrLabel];
    }
    const phaseValues = new Set(Object.values(RECRUITING_PHASES));
    if (phaseKeyOrLabel && phaseValues.has(phaseKeyOrLabel)) {
        return phaseKeyOrLabel;
    }
    return getAthletePhase(gradYear);
};

const resolveTargetDivision = (planSummary, planJson, athlete) => (
    planSummary?.target_level
    || planJson?.target_level
    || athlete?.target_divisions?.[0]
    || null
);

const resolvePositionGroup = (planSummary, planJson) => (
    planSummary?.position_group
    || planJson?.position_group
    || null
);

const resolveSport = (planSummary, planJson, athlete) => (
    planSummary?.sport
    || planJson?.sport
    || athlete?.sport
    || null
);

const resolveMetricLabel = (sport, metricKey) => {
    if (!metricKey) return 'Primary gap';
    if (!sport) return metricKey;
    return getMetricLabel(sport, metricKey) || metricKey;
};

const resolveMetricValues = async (options) => {
    const {
        athleteId,
        sport,
        positionGroup,
        targetDivision,
        metricKey,
        primaryGap
    } = options;

    let athleteValue = primaryGap?.athleteValue ?? null;
    let benchmarkValue = primaryGap?.p50 ?? primaryGap?.benchmarkValue ?? null;
    let unit = primaryGap?.unit || (sport && metricKey ? getMetricUnit(sport, metricKey) : null);

    if (metricKey && sport && (athleteValue === null || benchmarkValue === null)) {
        const [measurables, benchmarks] = await Promise.all([
            fetchLatestMeasurables(athleteId),
            positionGroup && targetDivision
                ? fetchBenchmarks(sport, positionGroup, targetDivision)
                : Promise.resolve([])
        ]);

        if (athleteValue === null) {
            const measurable = (measurables || []).find((row) => row.metric === metricKey);
            athleteValue = measurable?.value ?? null;
        }

        if (benchmarkValue === null) {
            const benchmark = (benchmarks || []).find((row) => row.metric === metricKey);
            benchmarkValue = benchmark?.p50 ?? benchmark?.value ?? null;
        }
    }

    if (!unit && sport && metricKey) {
        unit = getMetricUnit(sport, metricKey) || null;
    }

    return {
        athleteValue,
        benchmarkValue,
        unit
    };
};

const fetchLatestGapDetails = async (athleteId) => {
    if (!athleteId) return null;
    const { data, error } = await supabase
        .from('athlete_gap_results')
        .select('details_json, computed_at')
        .eq('athlete_id', athleteId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[getSimpleWeeklyPlan] Error fetching gap results:', error);
        return null;
    }

    return data?.details_json || null;
};

const fetchWeeklyPlanItemsForWeek = async (athleteId, weekStartDate) => {
    if (!athleteId || !weekStartDate) return [];

    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('week_start_date', weekStartDate)
        .order('priority_rank', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

    if (error) {
        console.error('[getSimpleWeeklyPlan] Error fetching weekly plan items:', error);
        return [];
    }

    return data || [];
};

export async function getSimpleWeeklyPlan(userId) {
    if (!userId) return null;

    const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('id, name, grad_year, sport, position, target_divisions')
        .eq('id', userId)
        .maybeSingle();

    if (athleteError) {
        console.error('[getSimpleWeeklyPlan] Error fetching athlete profile:', athleteError);
        throw athleteError;
    }

    const planHeader = await fetchLatestWeeklyPlan(userId);
    const planJson = planHeader?.plan_json || {};
    const planSummary = planHeader?.summary || {};

    const sport = resolveSport(planSummary, planJson, athlete);
    const positionGroup = resolvePositionGroup(planSummary, planJson);
    const targetDivision = resolveTargetDivision(planSummary, planJson, athlete);

    const gapDetails = await fetchLatestGapDetails(userId);
    const primaryGap = gapDetails?.primaryGap || null;
    const primaryGapMetricKey = primaryGap?.metricKey
        || planHeader?.primary_gap_metric
        || planJson?.primary_gap_metric
        || null;

    const { athleteValue, benchmarkValue, unit } = await resolveMetricValues({
        athleteId: userId,
        sport,
        positionGroup,
        targetDivision,
        metricKey: primaryGapMetricKey,
        primaryGap
    });

    const metricLabel = resolveMetricLabel(sport, primaryGapMetricKey);
    const athleteValueText = formatMetricValue(athleteValue, unit) || '—';
    const targetValueText = formatMetricValue(benchmarkValue, unit) || '—';

    const weekStartDate = planHeader?.week_of_date || null;
    const actions = await fetchWeeklyPlanItemsForWeek(userId, weekStartDate);
    const orderedActions = (actions || []).slice(0, 3);

    const phaseLabel = resolvePhaseLabel(planHeader?.phase, athlete?.grad_year);

    return {
        athlete,
        phaseLabel,
        primaryGap: {
            metricKey: primaryGapMetricKey,
            metricLabel,
            athleteValueText,
            targetValueText,
            targetDivision
        },
        actions: orderedActions,
        weekStartDate
    };
}
