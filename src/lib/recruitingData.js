import { supabase } from './supabase';
import { canonicalizeMeasurableRow, getMetricKeysForSport } from '../config/sportSchema';

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
    const generatedAt = new Date().toISOString();
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
    const payload = [{
        athlete_id: athleteId,
        week_of_date: weekOf,
        phase: planData?.phase ?? null,
        primary_gap_metric: primaryGapMetric,
        primary_gap_band: primaryGapBand,
        primary_gap_score: primaryGapScore,
        summary,
        generated_at: generatedAt,
        plan_json: planData || {},
        computed_at: generatedAt
    }];

    const { data, error } = await supabase
        .from('athlete_weekly_plans')
        .upsert(payload, { onConflict: 'athlete_id,week_of_date' })
        .select();

    if (error) {
        console.error('[WeeklyPlanHeaderPersist] error', error);
        throw error;
    }
    return data[0];
}

/**
 * Fetches the latest weekly plan for an athlete.
 */
export async function fetchLatestWeeklyPlan(athleteId) {
    if (!athleteId) return null;

    const { data, error } = await supabase
        .from('athlete_weekly_plans')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[recruitingData] Error fetching latest weekly plan:', error);
        return null;
    }
    return data;
}

/**
 * Fetches the latest weekly plan headers for an athlete.
 */
export async function fetchLatestWeeklyPlanHeaders(athleteId, limit = 2) {
    if (!athleteId) return [];

    const { data, error } = await supabase
        .from('athlete_weekly_plans')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('week_of_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[recruitingData] Error fetching weekly plan headers:', error);
        return [];
    }
    return data || [];
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
        const shouldPreserveCompletion = existingRow?.status === 'done' || existingRow?.status === 'skipped';

        return {
            ...item,
            status: shouldPreserveCompletion ? existingRow.status : 'open',
            completed_at: shouldPreserveCompletion ? existingRow.completed_at : null
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
    const updates = {
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null
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
    return data;
}
