import { buildAthleteProfile } from './buildAthleteProfile.js';
import {
    computeReadiness,
    computeSchoolInterest
} from './recomputeScores.js';
import { getAthletePhase } from '../lib/constants.js';
import { saveGapResult, saveWeeklyPlan } from '../lib/recruitingData.js';
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

    const profile = await buildAthleteProfile(athleteId);

    console.log('[recomputeAll] profile.sport', profile.sport);
    console.log('[recomputeAll] profile.positions.primary.group', profile.positions?.primary?.group);
    console.log('[recomputeAll] profile.measurables.positionGroup', profile.measurables?.positionGroup);
    console.log('[recomputeAll] profile.flags', profile.flags);

    const positionGroup = profile.positions?.primary?.group || null;
    const targetLevel = profile?.goals?.targetLevels?.[0] || 'D2';

    console.log(`[recomputeAll] Executing global analysis for ${profile.first_name}...`);

    const phase = profile.phase || getAthletePhase(profile.grad_year);

    const gapResult = computeGap(profile);

    console.log('[recomputeAll] athleteId', athleteId);
    console.log('[recomputeAll] sport', profile.sport);
    console.log('[recomputeAll] position_group', positionGroup);
    console.log('[recomputeAll] primaryGap.metricKey', gapResult?.primaryGap?.metricKey || null);

    if (gapResult?.notes?.reason) {
        return {
            success: false,
            athlete_id: profile.id,
            timestamp: new Date().toISOString(),
            reason: gapResult.notes
        };
    }

    await saveGapResult({
        athlete_id: athleteId,
        sport: profile.sport,
        position_group: positionGroup,
        target_level: gapResult.benchmarkLevelUsed || targetLevel,
        gap_score: gapResult.gapScore0to100,
        details_json: gapResult
    });

    const weeklyPlan = generateWeeklyPlan(profile, gapResult);
    await saveWeeklyPlan(athleteId, weeklyPlan.weekOfDate, weeklyPlan);

    const { readinessResult } = await computeReadiness({ ...profile, phase }, gapResult);
    await computeSchoolInterest(profile, readinessResult);

    return {
        success: true,
        athlete_id: profile.id,
        timestamp: new Date().toISOString(),
        summary: "Full analysis complete: Gap results, Readiness, School Interest, and Weekly Plan updated."
    };
}
