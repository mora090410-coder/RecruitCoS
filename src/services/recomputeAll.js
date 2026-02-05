import { recomputeGap } from './recomputeScores.js';
import { getAthletePhase } from '../lib/constants.js';

/**
 * Orchestrates a full recompute of all scores and plans for an athlete.
 * 
 * @param {Object} profile - The athlete profile object
 * @returns {Object} Summary of the recomputation
 */
export async function recomputeAll(profile) {
    if (!profile) throw new Error('No profile provided for recomputeAll');

    console.log(`[recomputeAll] Executing global analysis for ${profile.first_name}...`);

    const phase = profile.phase || getAthletePhase(profile.grad_year);

    // The current recomputeGap orchestration already triggers:
    // 1. recomputeGap
    // 2. recomputeReadiness
    // 3. recomputeInterestForAllSchools
    // 4. regenerateWeeklyPlan

    const result = await recomputeGap(
        profile.id,
        profile.sport,
        profile.position,
        profile.goals?.division_priority || 'D1',
        profile,
        phase
    );

    return {
        success: true,
        athlete_id: profile.id,
        timestamp: new Date().toISOString(),
        summary: "Full analysis complete: Gaps, Readiness, School Interest, and Weekly Plan updated."
    };
}
