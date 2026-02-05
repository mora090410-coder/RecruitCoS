import { fetchLatestMeasurables, fetchBenchmarks, saveGapResult } from '../lib/recruitingData';
import { computeGapScore } from '../lib/gapEngine';

/**
 * Recomputes the gap score for an athlete.
 * 
 * @param {string} athleteId 
 * @param {string} sport 
 * @param {string} positionGroup 
 * @param {string} targetLevel 
 */
export async function recomputeGap(athleteId, sport, positionGroup, targetLevel) {
    try {
        if (!athleteId || !sport || !positionGroup || !targetLevel) {
            throw new Error('Missing required arguments for recomputeGap');
        }

        console.log(`[recomputeGap] Starting for athlete ${athleteId}...`);

        // 1. Fetch latest metrics
        const measurables = await fetchLatestMeasurables(athleteId);

        // 2. Fetch benchmarks
        const benchmarks = await fetchBenchmarks(sport, positionGroup, targetLevel);

        if (benchmarks.length === 0) {
            console.warn(`[recomputeGap] No benchmarks found for ${sport} - ${positionGroup} - ${targetLevel}`);
            // We can still "compute" but score will be 0 or based on empty set
        }

        // 3. Compute score
        const athleteMetrics = measurables.map(m => ({
            metric: m.metric,
            value: Number(m.value)
        }));

        const scoreOutput = computeGapScore({
            sport,
            positionGroup,
            targetLevel,
            athleteMetrics,
            benchmarks
        });

        // 4. Save result
        const savedResult = await saveGapResult({
            athlete_id: athleteId,
            sport,
            position_group: positionGroup,
            target_level: targetLevel,
            gap_score: scoreOutput.gapScore0to100,
            details_json: scoreOutput
        });

        console.log(`[recomputeGap] Success! Score: ${scoreOutput.gapScore0to100}`);
        return savedResult;

    } catch (error) {
        console.error('[recomputeGap] Orchestration error:', error);
        throw error;
    }
}
