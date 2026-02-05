import {
    fetchLatestMeasurables,
    fetchBenchmarks,
    saveGapResult,
    fetchExecutionSignals,
    saveReadinessResult,
    saveInterestResults
} from '../lib/recruitingData';
import { supabase } from '../lib/supabase';
import { computeGapScore } from '../lib/gapEngine';
import { computeReadinessScore } from '../lib/readinessEngine';
import { computeSchoolInterest } from '../lib/interestEngine';

/**
 * Recomputes the gap score for an athlete.
 * Also triggers a readiness recomputation.
 */
export async function recomputeGap(athleteId, sport, positionGroup, targetLevel, athleteProfile, phase) {
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

        // 5. Trigger Readiness Recompute (if profile and phase provided)
        if (athleteProfile && phase) {
            await recomputeReadiness(athleteId, sport, targetLevel, athleteProfile, phase, savedResult.details_json);
        }

        return savedResult;

    } catch (error) {
        console.error('[recomputeGap] Orchestration error:', error);
        throw error;
    }
}

/**
 * Recomputes the Readiness score for an athlete.
 */
export async function recomputeReadiness(athleteId, sport, targetLevel, athleteProfile, phase, gapResult) {
    try {
        console.log(`[recomputeReadiness] Starting for athlete ${athleteId}...`);

        // 1. Fetch Execution Signals
        const executionSignals = await fetchExecutionSignals(athleteId);

        // 2. Compute Readiness
        const readinessOutput = computeReadinessScore({
            athleteProfile,
            gapResult,
            executionSignals,
            phase
        });

        // 3. Save Result
        const savedResult = await saveReadinessResult({
            athlete_id: athleteId,
            sport,
            target_level: targetLevel,
            readiness_score: readinessOutput.readinessScore0to100,
            pillars_json: readinessOutput.pillars,
            narrative_json: {
                topPositives: readinessOutput.topPositives,
                topBlockers: readinessOutput.topBlockers,
                recommendedFocus: readinessOutput.recommendedFocus
            }
        });

        console.log(`[recomputeReadiness] Success! Score: ${readinessOutput.readinessScore0to100}`);

        // 4. Trigger Interest Recompute for all saved schools
        await recomputeInterestForAllSchools(athleteId, readinessOutput);

        return savedResult;

    } catch (error) {
        console.error('[recomputeReadiness] Orchestration error:', error);
        throw error;
    }
}

/**
 * Recomputes interest scores for every school on an athlete's list.
 */
export async function recomputeInterestForAllSchools(athleteId, readinessResult) {
    try {
        console.log(`[recomputeInterest] Starting for athlete ${athleteId}...`);

        // 1. Fetch saved schools with their interactions
        const { data: schools, error } = await supabase
            .from('athlete_saved_schools')
            .select('*, interactions:athlete_interactions(*)')
            .eq('athlete_id', athleteId);

        if (error) throw error;
        if (!schools || schools.length === 0) return;

        // 2. Compute interest for each school
        const interestResults = schools.map(school => {
            const output = computeSchoolInterest({
                athleteReadiness: readinessResult,
                schoolData: school,
                interactions: school.interactions || []
            });

            return {
                athlete_id: athleteId,
                school_id: school.id,
                interest_score: output.interestScore,
                drivers_json: output.drivers,
                next_action: output.nextAction,
                computed_at: new Date().toISOString()
            };
        });

        // 3. Save results
        await saveInterestResults(interestResults);
        console.log(`[recomputeInterest] Success for ${interestResults.length} schools.`);

    } catch (error) {
        console.error('[recomputeInterest] Error:', error);
    }
}
