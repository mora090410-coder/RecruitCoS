import { buildAthleteProfile } from './buildAthleteProfile.js';
import {
    computeGap,
    computeReadiness,
    computeSchoolInterest,
    computeWeeklyPlan
} from './recomputeScores.js';
import { getAthletePhase } from '../lib/constants.js';
import { getSportSchema } from '../config/sportSchema.js';

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
    if (!sportSchema) {
        return {
            success: false,
            athlete_id: normalizedProfile.id,
            timestamp: new Date().toISOString(),
            reason: {
                code: 'UNSUPPORTED_SPORT',
                message: 'Scoring engines are disabled for this sport. CRM features remain available.'
            }
        };
    }

    const positionGroup = normalizedProfile.positions?.primary?.group || null;
    if (!positionGroup) {
        return {
            success: false,
            athlete_id: normalizedProfile.id,
            timestamp: new Date().toISOString(),
            reason: {
                code: 'MISSING_POSITION_GROUP',
                message: 'Primary position is not set. Please select a supported position to run scoring.'
            }
        };
    }

    console.log(`[recomputeAll] Executing global analysis for ${normalizedProfile.first_name}...`);

    const phase = normalizedProfile.phase || getAthletePhase(normalizedProfile.grad_year);

    const { gapResult } = await computeGap({ ...normalizedProfile, phase });
    const { readinessResult } = await computeReadiness({ ...normalizedProfile, phase }, gapResult);
    const interestResults = await computeSchoolInterest(normalizedProfile, readinessResult);
    await computeWeeklyPlan(normalizedProfile, gapResult, readinessResult, interestResults);

    return {
        success: true,
        athlete_id: normalizedProfile.id,
        timestamp: new Date().toISOString(),
        summary: "Full analysis complete: Gaps, Readiness, School Interest, and Weekly Plan updated."
    };
}
