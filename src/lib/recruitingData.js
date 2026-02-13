import { supabase } from './supabase';
import { canonicalizeMeasurableRow, getMetricKeysForSport } from '../config/sportSchema';
import { track } from './analytics';

const WEEKLY_STATUS_NOT_STARTED = 'not_started';
const WEEKLY_STATUS_IN_PROGRESS = 'in_progress';
const WEEKLY_STATUS_DONE = 'done';

function normalizeWeeklyItemStatus(status, fallback = WEEKLY_STATUS_NOT_STARTED) {
    const normalized = String(status || '').trim().toLowerCase();

    if (normalized === WEEKLY_STATUS_DONE) return WEEKLY_STATUS_DONE;
    if (normalized === WEEKLY_STATUS_IN_PROGRESS) return WEEKLY_STATUS_IN_PROGRESS;
    if (normalized === WEEKLY_STATUS_NOT_STARTED) return WEEKLY_STATUS_NOT_STARTED;
    if (normalized === 'open' || normalized === 'skipped') return WEEKLY_STATUS_NOT_STARTED;
    return fallback;
}

function toDateOnly(value) {
    if (!value) return null;
    const asString = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) return asString;
    const parsed = new Date(asString);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
}

function getCurrentWeekStartDate() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + diffToMonday);
    return monday.toISOString().slice(0, 10);
}

function resolveWeekOfDate(weekOf, planData) {
    const candidates = [
        weekOf,
        planData?.week_of_date,
        planData?.weekOfDate,
        planData?.weekOf
    ];

    for (const candidate of candidates) {
        const dateOnly = toDateOnly(candidate);
        if (dateOnly) return dateOnly;
    }

    return getCurrentWeekStartDate();
}

function resolveExplicitWeekNumber(planData) {
    const candidates = [planData?.week_number, planData?.weekNumber, planData?.week];
    for (const candidate of candidates) {
        const value = Number.parseInt(candidate, 10);
        if (Number.isInteger(value) && value > 0) return value;
    }
    return null;
}

function getWeekDateBoundsIso(weekOfDate) {
    const start = new Date(`${weekOfDate}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return {
        startIso: start.toISOString(),
        endIso: end.toISOString()
    };
}

function mapWeeklyPlanRowToHeader(row, overrides = {}) {
    if (!row) return null;
    return {
        id: row.id,
        athlete_id: row.athlete_id,
        week_number: row.week_number,
        week_of_date: overrides.week_of_date || toDateOnly(row.started_at),
        phase: overrides.phase ?? row.recruiting_phase ?? null,
        primary_gap_metric: overrides.primary_gap_metric ?? null,
        primary_gap_band: overrides.primary_gap_band ?? null,
        primary_gap_score: overrides.primary_gap_score ?? null,
        summary: overrides.summary ?? {},
        generated_at: overrides.generated_at ?? row.created_at ?? null,
        plan_json: overrides.plan_json ?? {},
        computed_at: overrides.computed_at ?? row.created_at ?? null,
        sport: row.sport ?? null,
        grade_level: row.grade_level ?? null,
        recruiting_phase: row.recruiting_phase ?? null,
        started_at: row.started_at ?? null,
        completed_at: row.completed_at ?? null,
        created_at: row.created_at ?? null
    };
}

async function fetchWeekStartDateMap(athleteId, weekNumbers) {
    const sanitizedWeekNumbers = Array.from(
        new Set((weekNumbers || []).filter((value) => Number.isInteger(value) && value > 0))
    );
    const weekStartByWeekNumber = new Map();

    if (!athleteId || sanitizedWeekNumbers.length === 0) return weekStartByWeekNumber;

    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .select('week_number, week_start_date')
        .eq('athlete_id', athleteId)
        .in('week_number', sanitizedWeekNumbers)
        .not('week_start_date', 'is', null)
        .order('week_start_date', { ascending: false });

    if (error) {
        console.error('[recruitingData] Error fetching week_start_date map:', error);
        return weekStartByWeekNumber;
    }

    (data || []).forEach((row) => {
        const weekNumber = Number.parseInt(row.week_number, 10);
        const weekStartDate = toDateOnly(row.week_start_date);
        if (!Number.isInteger(weekNumber) || !weekStartDate) return;
        if (!weekStartByWeekNumber.has(weekNumber)) {
            weekStartByWeekNumber.set(weekNumber, weekStartDate);
        }
    });

    return weekStartByWeekNumber;
}

/**
 * Fetches the most recent measurables for an athlete.
 * Uses a unique-by-metric approach.
 */
export async function fetchLatestMeasurables(athleteId) {
    if (!athleteId) return [];

    const { data, error } = await supabase
        .from('athlete_measurables')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('metric')
        .order('measured_at', { ascending: false });

    if (error) {
        console.error('[recruitingData] Error fetching measurables:', error);
        return [];
    }

    const canonicalized = (data || []).map(row => {
        const canonicalRow = canonicalizeMeasurableRow(row.sport, row);
        const preferredMetric = row.metric_canonical || canonicalRow.metric;
        return {
            ...canonicalRow,
            metric: preferredMetric
        };
    });

    // Filter to get only the latest for each metric
    const latestMap = new Map();
    canonicalized.forEach(m => {
        if (!latestMap.has(m.metric)) {
            latestMap.set(m.metric, m);
        }
    });

    return Array.from(latestMap.values());
}

/**
 * Fetches benchmarks for a specific sport, position, and level.
 */
export async function fetchBenchmarks(sport, positionGroup, targetLevel) {
    const { data, error } = await supabase
        .from('measurable_benchmarks')
        .select('*')
        .eq('sport', sport)
        .eq('position_group', positionGroup)
        .eq('target_level', targetLevel);

    if (error) {
        console.error('[recruitingData] Error fetching benchmarks:', error);
        return [];
    }

    if (import.meta.env.DEV) {
        const allowed = new Set(getMetricKeysForSport(sport));
        const unknown = (data || []).filter(row => !allowed.has(row.metric));
        if (unknown.length > 0) {
            console.warn('[benchmarks] Unknown metric keys found:', {
                sport,
                positionGroup,
                targetLevel,
                metrics: unknown.map(row => row.metric)
            });
        }
    }

    return data;
}

/**
 * Saves a computed gap result.
 */
export async function saveGapResult(result) {
    const { data, error } = await supabase
        .from('athlete_gap_results')
        .insert([result])
        .select();

    if (error) {
        console.error('[recruitingData] Error saving gap result:', error);
        throw error;
    }

    return data[0];
}

/**
 * Fetches signals needed for the Readiness Engine.
 */
export async function fetchExecutionSignals(athleteId) {
    if (!athleteId) return {};

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
        { count: totalEvents },
        { count: recentEvents },
        { count: totalMeasurables },
        { count: totalPosts },
        { count: recentInteractions },
        { data: activeSchools }
    ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('athlete_id', athleteId),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('athlete_id', athleteId).gt('event_date', ninetyDaysAgo),
        supabase.from('athlete_measurables').select('*', { count: 'exact', head: true }).eq('athlete_id', athleteId),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('athlete_id', athleteId),
        supabase.from('athlete_interactions').select('*', { count: 'exact', head: true }).eq('athlete_id', athleteId).gt('interaction_date', thirtyDaysAgo),
        supabase.from('athlete_saved_schools').select('id, category').eq('athlete_id', athleteId).eq('category', 'active')
    ]);

    return {
        totalEvents: totalEvents || 0,
        recentEvents90d: recentEvents || 0,
        totalMeasurables: totalMeasurables || 0,
        totalPosts: totalPosts || 0,
        recentInteractions30d: recentInteractions || 0,
        activeSchools: activeSchools?.length || 0,
        momentumCount: recentInteractions || 0 // Proxying for now
    };
}

/**
 * Fetches the latest readiness result for an athlete.
 */
export async function fetchLatestReadiness(athleteId) {
    if (!athleteId) return null;

    const { data, error } = await supabase
        .from('athlete_readiness_results')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[recruitingData] Error fetching latest readiness:', error);
        return null;
    }

    return data;
}

/**
 * Saves a computed readiness result.
 */
export async function saveReadinessResult(result) {
    const { data, error } = await supabase
        .from('athlete_readiness_results')
        .insert([result])
        .select();

    if (error) {
        console.error('[recruitingData] Error saving readiness result:', error);
        throw error;
    }

    return data[0];
}

/**
 * Fetches all interest results for an athlete's schools.
 */
export async function fetchLatestSchoolInterest(athleteId) {
    if (!athleteId) return [];

    const { data, error } = await supabase
        .from('athlete_school_interest_results')
        .select('*')
        .eq('athlete_id', athleteId);

    if (error) {
        console.error('[recruitingData] Error fetching interest results:', error);
        return [];
    }
    return data || [];
}

/**
 * Saves multiple school interest results (upsert).
 */
export async function saveInterestResults(results) {
    if (!results || results.length === 0) return;

    const { error } = await supabase
        .from('athlete_school_interest_results')
        .upsert(results, { onConflict: 'athlete_id,school_id' });

    if (error) {
        console.error('[recruitingData] Error saving interest results:', error);
        throw error;
    }
}

/**
 * Saves a generated weekly plan.
 */
export async function saveWeeklyPlan(athleteId, weekOf, planData) {
    if (!athleteId) {
        throw new Error('Missing athlete id for saveWeeklyPlan.');
    }

    const generatedAt = new Date().toISOString();
    const weekOfDate = resolveWeekOfDate(weekOf, planData);
    const { startIso, endIso } = getWeekDateBoundsIso(weekOfDate);
    const primaryGapMetric = planData?.primary_gap_metric
        ?? planData?.primaryGapMetric
        ?? planData?.primaryGap?.metricKey
        ?? planData?.primary_gap?.metricKey
        ?? null;
    const primaryGapBand = planData?.primary_gap_band
        ?? planData?.primaryGap?.band
        ?? planData?.primary_gap?.band
        ?? null;
    const primaryGapScore = planData?.primary_gap_score
        ?? planData?.primaryGap?.normalizedGapScore
        ?? planData?.primary_gap?.normalizedGapScore
        ?? planData?.primaryGap?.gapScore
        ?? null;
    const summary = {
        priorities: Array.isArray(planData?.priorities) ? planData.priorities : [],
        sport: planData?.sport ?? null,
        position_group: planData?.position_group ?? planData?.positionGroup ?? null,
        target_level: planData?.target_level ?? planData?.targetLevel ?? null,
        ...(planData?.summary || {})
    };

    const explicitWeekNumber = resolveExplicitWeekNumber(planData);

    const [
        { data: athleteMeta, error: athleteMetaError },
        { data: existingPlanForDate, error: existingPlanError },
        { data: latestPlan, error: latestPlanError }
    ] = await Promise.all([
        supabase
            .from('athletes')
            .select('sport, grade_level, recruiting_phase')
            .eq('id', athleteId)
            .maybeSingle(),
        explicitWeekNumber
            ? Promise.resolve({ data: null, error: null })
            : supabase
                .from('weekly_plans')
                .select('id, week_number')
                .eq('athlete_id', athleteId)
                .gte('started_at', startIso)
                .lt('started_at', endIso)
                .order('week_number', { ascending: false })
                .limit(1)
                .maybeSingle(),
        explicitWeekNumber
            ? Promise.resolve({ data: null, error: null })
            : supabase
                .from('weekly_plans')
                .select('week_number')
                .eq('athlete_id', athleteId)
                .order('week_number', { ascending: false })
                .limit(1)
                .maybeSingle()
    ]);

    if (athleteMetaError) {
        console.error('[WeeklyPlanHeaderPersist] athlete lookup error', athleteMetaError);
        throw athleteMetaError;
    }
    if (existingPlanError) {
        console.error('[WeeklyPlanHeaderPersist] existing week lookup error', existingPlanError);
        throw existingPlanError;
    }
    if (latestPlanError) {
        console.error('[WeeklyPlanHeaderPersist] latest week lookup error', latestPlanError);
        throw latestPlanError;
    }

    const resolvedWeekNumber = explicitWeekNumber
        || existingPlanForDate?.week_number
        || ((latestPlan?.week_number || 0) + 1)
        || 1;

    const recruitingPhase = planData?.phase
        || planData?.recruiting_phase
        || athleteMeta?.recruiting_phase
        || 'evaluation';
    const payload = [{
        athlete_id: athleteId,
        week_number: resolvedWeekNumber,
        sport: planData?.sport || athleteMeta?.sport || 'unknown',
        grade_level: Number.isInteger(planData?.grade_level)
            ? planData.grade_level
            : (Number.isInteger(athleteMeta?.grade_level) ? athleteMeta.grade_level : 9),
        recruiting_phase: recruitingPhase,
        started_at: startIso
    }];

    const { data, error } = await supabase
        .from('weekly_plans')
        .upsert(payload, { onConflict: 'athlete_id,week_number' })
        .select();

    if (error) {
        console.error('[WeeklyPlanHeaderPersist] error', error);
        throw error;
    }

    return mapWeeklyPlanRowToHeader(data?.[0], {
        week_of_date: weekOfDate,
        phase: recruitingPhase,
        primary_gap_metric: primaryGapMetric,
        primary_gap_band: primaryGapBand,
        primary_gap_score: primaryGapScore,
        summary,
        plan_json: planData || {},
        generated_at: generatedAt,
        computed_at: generatedAt
    });
}

/**
 * Fetches the latest weekly plan for an athlete.
 */
export async function fetchLatestWeeklyPlan(athleteId) {
    if (!athleteId) return null;

    const { data: planRow, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('week_number', { ascending: false })
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[recruitingData] Error fetching latest weekly plan:', error);
        return null;
    }

    if (!planRow) return null;

    const weekStartMap = await fetchWeekStartDateMap(athleteId, [planRow.week_number]);
    return mapWeeklyPlanRowToHeader(planRow, {
        week_of_date: weekStartMap.get(planRow.week_number) || toDateOnly(planRow.started_at)
    });
}

/**
 * Fetches the latest weekly plan headers for an athlete.
 */
export async function fetchLatestWeeklyPlanHeaders(athleteId, limit = 2) {
    if (!athleteId) return [];

    const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('week_number', { ascending: false })
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[recruitingData] Error fetching weekly plan headers:', error);
        return [];
    }

    const weekNumbers = (data || [])
        .map((row) => Number.parseInt(row.week_number, 10))
        .filter((value) => Number.isInteger(value) && value > 0);
    const weekStartMap = await fetchWeekStartDateMap(athleteId, weekNumbers);

    return (data || []).map((row) => mapWeeklyPlanRowToHeader(row, {
        week_of_date: weekStartMap.get(row.week_number) || toDateOnly(row.started_at)
    }));
}

/**
 * Fetches weekly plan items for a given athlete + week start date.
 */
export async function fetchWeeklyPlanItems(athleteId, weekStartDate) {
    if (!athleteId || !weekStartDate) return [];

    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('week_start_date', weekStartDate)
        .order('priority_rank', { ascending: true });

    if (error) {
        console.error('[recruitingData] Error fetching weekly plan items:', error);
        return [];
    }
    return data || [];
}

/**
 * Inserts weekly plan items.
 */
export async function insertWeeklyPlanItems(items) {
    if (!items || items.length === 0) return [];

    const missingRequiredFields = items.find((item) => (
        !item?.athlete_id || !item?.week_start_date || item?.priority_rank == null
    ));

    if (missingRequiredFields) {
        throw new Error('Weekly plan items must include athlete_id, week_start_date, and priority_rank.');
    }

    const uniqueScopes = Array.from(
        new Map(
            items.map((item) => [
                `${item.athlete_id}::${item.week_start_date}`,
                { athlete_id: item.athlete_id, week_start_date: item.week_start_date }
            ])
        ).values()
    );

    const existingRowsByKey = new Map();
    for (const scope of uniqueScopes) {
        const { data: existingRows, error: fetchError } = await supabase
            .from('athlete_weekly_plan_items')
            .select('athlete_id, week_start_date, priority_rank, status, completed_at')
            .eq('athlete_id', scope.athlete_id)
            .eq('week_start_date', scope.week_start_date);

        if (fetchError) {
            console.error('[WeeklyPlanPersist] error', fetchError);
            throw fetchError;
        }

        (existingRows || []).forEach((row) => {
            const key = `${row.athlete_id}::${row.week_start_date}::${row.priority_rank}`;
            existingRowsByKey.set(key, row);
        });
    }

    const upsertRows = items.map((item) => {
        const key = `${item.athlete_id}::${item.week_start_date}::${item.priority_rank}`;
        const existingRow = existingRowsByKey.get(key);
        const existingStatus = normalizeWeeklyItemStatus(existingRow?.status);
        const shouldPreserveDone = existingStatus === WEEKLY_STATUS_DONE;
        const shouldPreserveInProgress = existingStatus === WEEKLY_STATUS_IN_PROGRESS;

        return {
            ...item,
            status: shouldPreserveDone || shouldPreserveInProgress
                ? existingStatus
                : WEEKLY_STATUS_NOT_STARTED,
            completed_at: shouldPreserveDone ? existingRow.completed_at : null
        };
    });

    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .upsert(upsertRows, { onConflict: 'athlete_id,week_start_date,priority_rank' })
        .select();

    if (error) {
        console.error('[WeeklyPlanPersist] error', error);
        throw error;
    }
    return data || [];
}

/**
 * Deletes weekly plan items for a given athlete + week start date.
 */
export async function deleteWeeklyPlanItemsForWeek(athleteId, weekStartDate) {
    if (!athleteId || !weekStartDate) return;

    const { error } = await supabase
        .from('athlete_weekly_plan_items')
        .delete()
        .eq('athlete_id', athleteId)
        .eq('week_start_date', weekStartDate);

    if (error) {
        console.error('[recruitingData] Error deleting weekly plan items:', error);
        throw error;
    }
}

/**
 * Updates status for a weekly plan item.
 */
export async function updateWeeklyPlanItemStatus(itemId, status) {
    if (!itemId || !status) return null;
    const normalizedStatus = normalizeWeeklyItemStatus(status);

    const { data: existingItem, error: existingItemError } = await supabase
        .from('athlete_weekly_plan_items')
        .select('id, athlete_id, status, week_start_date')
        .eq('id', itemId)
        .maybeSingle();

    if (existingItemError) {
        console.error('[recruitingData] Error fetching existing weekly plan item status:', existingItemError);
        throw existingItemError;
    }

    const updates = {
        status: normalizedStatus,
        completed_at: normalizedStatus === WEEKLY_STATUS_DONE ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .maybeSingle();

    if (error) {
        console.error('[recruitingData] Error updating weekly plan item status:', error);
        throw error;
    }

    // Best-effort write for optional completion analytics table.
    // Some environments may not have this table yet, so failures are non-fatal.
    if (normalizedStatus === WEEKLY_STATUS_DONE && data?.athlete_id && data?.week_start_date) {
        const completionPayload = {
            athlete_id: data.athlete_id,
            action_id: data.id,
            week_start_date: data.week_start_date,
            completed_at: data.completed_at || new Date().toISOString()
        };

        const { error: completionError } = await supabase
            .from('action_completions')
            .upsert([completionPayload], { onConflict: 'athlete_id,action_id' });

        if (completionError && completionError.code !== '42P01') {
            console.warn('[recruitingData] Optional action_completions write failed:', completionError);
        }
    }

    if (data?.athlete_id && existingItem) {
        const wasDone = normalizeWeeklyItemStatus(existingItem.status) === WEEKLY_STATUS_DONE;
        const isNowDone = normalizedStatus === WEEKLY_STATUS_DONE;
        let actionDelta = 0;

        if (!wasDone && isNowDone) actionDelta = 1;
        if (wasDone && !isNowDone) actionDelta = -1;

        if (actionDelta !== 0 || isNowDone) {
            const { data: athleteRow, error: athleteFetchError } = await supabase
                .from('athletes')
                .select('id, actions_completed, dashboard_unlocked_at')
                .eq('id', data.athlete_id)
                .maybeSingle();

            if (!athleteFetchError && athleteRow) {
                const nextActionsCompleted = Math.max(0, Number(athleteRow.actions_completed || 0) + actionDelta);
                const athleteUpdates = {
                    actions_completed: nextActionsCompleted,
                    last_active_at: new Date().toISOString()
                };

                if (!athleteRow.dashboard_unlocked_at && nextActionsCompleted >= 4) {
                    athleteUpdates.dashboard_unlocked_at = new Date().toISOString();
                    track('dashboard_unlocked', {
                        unlock_reason: 'completed_4_actions'
                    });
                }

                const { error: athleteUpdateError } = await supabase
                    .from('athletes')
                    .update(athleteUpdates)
                    .eq('id', data.athlete_id);

                if (athleteUpdateError && athleteUpdateError.code !== '42703') {
                    console.warn('[recruitingData] Optional athletes engagement counter update failed:', athleteUpdateError);
                }
            }
        }
    }
    return data;
}

/**
 * Computes weekly-plan engagement metrics for progressive disclosure.
 * Completion rate is defined as done/total across plan items in the last 2 plans.
 */
export async function getAthleteEngagement(athleteId) {
    if (!athleteId) {
        return {
            weeksActive: 0,
            actionsCompleted: 0,
            completionRate: 0,
            window: 'last 2 plans'
        };
    }

    const [
        { data: athleteRow, error: athleteError },
        { count: weeksActiveCount, error: weeksActiveError },
        { count: actionsCompletedCount, error: actionsCompletedError },
        { data: latestPlans, error: latestPlansError }
    ] = await Promise.all([
        supabase
            .from('athletes')
            .select('id, weeks_active, actions_completed, metrics_count')
            .eq('id', athleteId)
            .maybeSingle(),
        supabase
            .from('weekly_plans')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', athleteId),
        supabase
            .from('athlete_weekly_plan_items')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', athleteId)
            .eq('status', 'done'),
        supabase
            .from('weekly_plans')
            .select('week_number, started_at')
            .eq('athlete_id', athleteId)
            .order('week_number', { ascending: false })
            .order('started_at', { ascending: false })
            .limit(2)
    ]);

    if (weeksActiveError) {
        console.error('[recruitingData] Error fetching weeks active:', weeksActiveError);
    }
    if (athleteError && athleteError.code !== '42703') {
        console.error('[recruitingData] Error fetching athlete engagement columns:', athleteError);
    }
    if (actionsCompletedError) {
        console.error('[recruitingData] Error fetching actions completed:', actionsCompletedError);
    }
    if (latestPlansError) {
        console.error('[recruitingData] Error fetching latest plans for completion rate:', latestPlansError);
    }

    const latestWeekNumbers = (latestPlans || [])
        .map((row) => Number.parseInt(row.week_number, 10))
        .filter((value) => Number.isInteger(value) && value > 0);
    const latestWeekStartMap = await fetchWeekStartDateMap(athleteId, latestWeekNumbers);
    const latestWeeks = (latestPlans || [])
        .map((row) => (
            latestWeekStartMap.get(row.week_number)
            || toDateOnly(row.started_at)
        ))
        .filter(Boolean);

    let completionRate = 0;
    if (latestWeeks.length === 2) {
        const { data: completionRows, error: completionRowsError } = await supabase
            .from('athlete_weekly_plan_items')
            .select('status')
            .eq('athlete_id', athleteId)
            .in('week_start_date', latestWeeks);

        if (completionRowsError) {
            console.error('[recruitingData] Error fetching completion rate rows:', completionRowsError);
        } else {
            const totalActions = completionRows?.length || 0;
            const doneActions = (completionRows || []).filter((row) => row.status === 'done').length;
            completionRate = totalActions > 0 ? doneActions / totalActions : 0;
        }
    }

    return {
        weeksActive: Number(athleteRow?.weeks_active ?? weeksActiveCount ?? 0),
        actionsCompleted: Number(athleteRow?.actions_completed ?? actionsCompletedCount ?? 0),
        metricsCount: Number(athleteRow?.metrics_count ?? 0),
        completionRate,
        window: 'last 2 plans'
    };
}

/**
 * Sets dashboard_unlocked_at for an athlete if it has not been set yet.
 */
export async function unlockDashboard(athleteId) {
    if (!athleteId) return { unlockedNow: false };

    const { data, error } = await supabase
        .from('athletes')
        .update({ dashboard_unlocked_at: new Date().toISOString() })
        .eq('id', athleteId)
        .is('dashboard_unlocked_at', null)
        .select('id, dashboard_unlocked_at');

    if (error) {
        console.error('[recruitingData] Error unlocking dashboard:', error);
        throw error;
    }

    return {
        unlockedNow: Array.isArray(data) && data.length > 0
    };
}
