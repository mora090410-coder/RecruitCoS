import { supabase } from './supabase';

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

    // Filter to get only the latest for each metric
    const latestMap = new Map();
    data.forEach(m => {
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
