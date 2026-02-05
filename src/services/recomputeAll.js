import { buildAthleteProfile } from './buildAthleteProfile.js';
import {
    computeReadiness,
    computeSchoolInterest
} from './recomputeScores.js';
import { getAthletePhase } from '../lib/constants.js';
import { getSportSchema } from '../config/sportSchema.js';
import { fetchBenchmarks, saveGapResult, saveWeeklyPlan } from '../lib/recruitingData.js';
import { computeGap } from './engines/gapEngine.js';
import { generateWeeklyPlan } from './engines/weeklyPlanEngine.js';

/**
 * Orchestrates a full recompute of all scores and plans for an athlete.
 * 
 * @param {Object} profile - The athlete profile object
 * @returns {Object} Summary of the recomputation
 */
export async function recomputeAll(profile) {
    if (!profile) throw new Error('No profile provided for recomputeAll');

    const athleteId = profile?.athlete?.id || profile?.id;
    if (!athleteId) throw new Error('No athlete id provided for recomputeAll');

    const normalizedProfile = await buildAthleteProfile(athleteId);

    console.log('[recomputeAll] profile.sport', normalizedProfile.sport);
    console.log('[recomputeAll] profile.positions.primary.group', normalizedProfile.positions?.primary?.group);
    console.log('[recomputeAll] profile.measurables.positionGroup', normalizedProfile.measurables?.positionGroup);
    console.log('[recomputeAll] profile.flags', normalizedProfile.flags);

    const sportSchema = getSportSchema(normalizedProfile.sport);
    const positionGroup = normalizedProfile.positions?.primary?.group || null;
    const targetLevel = normalizedProfile?.goals?.targetLevels?.[0] || 'D2';

    console.log(`[recomputeAll] Executing global analysis for ${normalizedProfile.first_name}...`);

    const phase = normalizedProfile.phase || getAthletePhase(normalizedProfile.grad_year);

    const benchmarks = sportSchema && positionGroup
        ? await fetchBenchmarks(normalizedProfile.sport, positionGroup, targetLevel)
        : [];

    const gapResult = computeGap(normalizedProfile, { targetLevel, benchmarks });

    console.log('[recomputeAll] athleteId', athleteId);
    console.log('[recomputeAll] sport', normalizedProfile.sport);
    console.log('[recomputeAll] position_group', positionGroup);
    console.log('[recomputeAll] targetLevel', targetLevel);
    console.log('[recomputeAll] primaryGap.metricKey', gapResult?.primaryGap?.metricKey || null);

    if (gapResult?.notes?.reason) {
        return {
            success: false,
            athlete_id: normalizedProfile.id,
            timestamp: new Date().toISOString(),
            reason: gapResult.notes
        };
    }

    await saveGapResult({
        athlete_id: athleteId,
        sport: normalizedProfile.sport,
        position_group: positionGroup,
        target_level: gapResult.benchmarkLevelUsed || targetLevel,
        gap_score: gapResult.gapScore0to100,
        details_json: gapResult
    });

    const weeklyPlan = generateWeeklyPlan(normalizedProfile, gapResult);
    await saveWeeklyPlan(athleteId, weeklyPlan.weekOfDate, weeklyPlan);

    const { readinessResult } = await computeReadiness({ ...normalizedProfile, phase }, gapResult);
    await computeSchoolInterest(normalizedProfile, readinessResult);

    return {
        success: true,
        athlete_id: normalizedProfile.id,
        timestamp: new Date().toISOString(),
        summary: "Full analysis complete: Gap results, Readiness, School Interest, and Weekly Plan updated."
    };
}
