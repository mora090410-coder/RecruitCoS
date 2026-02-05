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

    const athleteProfile = await buildAthleteProfile(athleteId);

    console.log('[recomputeAll] profile.sport', athleteProfile.sport);
    console.log('[recomputeAll] profile.positions.primary.group', athleteProfile.positions?.primary?.group);
    console.log('[recomputeAll] profile.measurables.positionGroup', athleteProfile.measurables?.positionGroup);
    console.log('[recomputeAll] profile.flags', athleteProfile.flags);

    const positionGroup = athleteProfile.positions?.primary?.group || null;
    const targetLevel = athleteProfile?.goals?.targetLevels?.[0] || 'D2';

    console.log(`[recomputeAll] Executing global analysis for ${athleteProfile.first_name}...`);

    const phase = athleteProfile.phase || getAthletePhase(athleteProfile.grad_year);

    const gapResult = computeGap(athleteProfile);

    console.log('[recomputeAll] athleteId', athleteId);
    console.log('[recomputeAll] sport', athleteProfile.sport);
    console.log('[recomputeAll] position_group', positionGroup);
    console.log('[recomputeAll] primaryGap.metricKey', gapResult?.primaryGap?.metricKey || null);

    if (gapResult?.notes?.reason) {
        return {
            success: false,
            athlete_id: athleteProfile.id,
            timestamp: new Date().toISOString(),
            reason: gapResult.notes
        };
    }

    await saveGapResult({
        athlete_id: athleteId,
        sport: athleteProfile.sport,
        position_group: positionGroup,
        target_level: gapResult.benchmarkLevelUsed || targetLevel,
        gap_score: gapResult.gapScore0to100,
        details_json: gapResult
    });

    const weeklyPlan = generateWeeklyPlan(athleteProfile, gapResult);
    await saveWeeklyPlan(athleteId, weeklyPlan.weekOfDate, weeklyPlan);

    const { readinessResult } = await computeReadiness({ ...athleteProfile, phase }, gapResult);
    await computeSchoolInterest(athleteProfile, readinessResult);

    return {
        success: true,
        athlete_id: athleteProfile.id,
        timestamp: new Date().toISOString(),
        summary: "Full analysis complete: Gap results, Readiness, School Interest, and Weekly Plan updated."
    };
}
