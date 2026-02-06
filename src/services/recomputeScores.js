import {
    fetchBenchmarks,
    saveGapResult,
    saveReadinessResult,
    saveInterestResults,
    saveWeeklyPlan
} from '../lib/recruitingData';
import { buildAthleteProfile } from './buildAthleteProfile';
import { computeGapScore } from '../lib/gapEngine';
import { computeReadinessScore } from '../lib/readinessEngine';
import { computeSchoolInterest as computeSchoolInterestScore } from '../lib/interestEngine';
import { generateWeeklyPlan } from '../lib/weeklyPlanEngine';

const resolveAthleteId = (profile) => profile?.athlete?.id || profile?.id || null;
const resolveSport = (profile) => profile?.sport || profile?.athlete?.sport || null;
const resolveTargetLevel = (profile, fallback) => (
    profile?.goals?.division_priority
    || profile?.athlete?.goals?.division_priority
    || fallback
    || 'D1'
);
const resolvePositionGroup = (profile, fallback) => (
    profile?.positions?.primary?.group
    || profile?.measurables?.positionGroup
    || fallback
    || null
);

const buildAthleteMetrics = (profile) => {
    const latest = profile?.measurables?.latestByMetric || {};
    return Object.values(latest)
        .map((row) => ({ metric: row.metric, value: Number(row.value) }))
        .filter((row) => row.metric && !Number.isNaN(row.value));
};

const buildExecutionSignals = (profile) => {
    const signals = profile?.executionSignals || {};
    return {
        totalEvents: signals.totalEvents || 0,
        recentEvents90d: signals.recentEvents90d || signals.eventsLast90Days || 0,
        totalMeasurables: signals.totalMeasurables || 0,
        totalPosts: signals.totalPosts || 0,
        recentInteractions30d: signals.recentInteractions30d || signals.interactionsLast30Days || 0,
        activeSchools: signals.activeSchools || signals.activeSchoolsCount || 0,
        momentumCount: signals.momentumCount || signals.recentInteractions30d || signals.interactionsLast30Days || 0
    };
};

const buildInterestProfile = (profile) => ({
    secondary_positions_canonical: profile?.positions?.secondary
        ? profile.positions.secondary.map((position) => position.canonical).filter(Boolean)
        : []
});

/**
 * Computes and persists the gap score using a normalized AthleteProfile DTO.
 */
export async function computeGap(profile) {
    const athleteId = resolveAthleteId(profile);
    const sport = resolveSport(profile);
    const positionGroup = resolvePositionGroup(profile);
    const targetLevel = resolveTargetLevel(profile);

    if (!athleteId || !sport || !positionGroup || !targetLevel) {
        throw new Error('Missing required arguments for computeGap');
    }

    console.log(`[computeGap] Starting for athlete ${athleteId}...`);

    const benchmarks = await fetchBenchmarks(sport, positionGroup, targetLevel);

    if (benchmarks.length === 0) {
        console.warn(`[computeGap] No benchmarks found for ${sport} - ${positionGroup} - ${targetLevel}`);
    }

    const athleteMetrics = buildAthleteMetrics(profile);

    const scoreOutput = computeGapScore({
        sport,
        positionGroup,
        targetLevel,
        athleteMetrics,
        benchmarks
    });

    const savedResult = await saveGapResult({
        athlete_id: athleteId,
        sport,
        position_group: positionGroup,
        target_level: targetLevel,
        gap_score: scoreOutput.gapScore0to100,
        details_json: scoreOutput
    });

    console.log(`[computeGap] Success! Score: ${scoreOutput.gapScore0to100}`);

    return { savedResult, gapResult: scoreOutput };
}

/**
 * Computes and persists the readiness score using a normalized AthleteProfile DTO.
 */
export async function computeReadiness(profile, gapResult) {
    const athleteId = resolveAthleteId(profile);
    const sport = resolveSport(profile);
    const targetLevel = resolveTargetLevel(profile);
    const phase = profile?.phase || null;

    if (!athleteId || !sport || !targetLevel || !phase) {
        throw new Error('Missing required arguments for computeReadiness');
    }

    console.log(`[computeReadiness] Starting for athlete ${athleteId}...`);

    const readinessOutput = computeReadinessScore({
        athleteProfile: profile?.athlete || profile,
        gapResult,
        executionSignals: buildExecutionSignals(profile),
        phase
    });

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

    console.log(`[computeReadiness] Success! Score: ${readinessOutput.readinessScore0to100}`);

    return { savedResult, readinessResult: readinessOutput };
}

/**
 * Computes and persists school interest using a normalized AthleteProfile DTO.
 */
export async function computeSchoolInterest(profile, readinessResult) {
    const athleteId = resolveAthleteId(profile);
    const schools = profile?.schools || [];

    if (!athleteId) {
        throw new Error('Missing required arguments for computeSchoolInterest');
    }

    console.log(`[computeSchoolInterest] Starting for athlete ${athleteId}...`);

    if (schools.length === 0) return [];

    const interestProfile = buildInterestProfile(profile);

    const interestResults = schools.map((school) => {
        const output = computeSchoolInterestScore({
            athleteReadiness: readinessResult,
            athleteProfile: interestProfile,
            schoolData: school,
            interactions: school.interactions || []
        });

        return {
            athlete_id: athleteId,
            school_id: school.schoolId || school.id,
            interest_score: output.interestScore,
            drivers_json: output.drivers,
            next_action: output.nextAction,
            computed_at: new Date().toISOString()
        };
    });

    await saveInterestResults(interestResults);
    console.log(`[computeSchoolInterest] Success for ${interestResults.length} schools.`);

    return interestResults;
}

/**
 * Computes and persists the weekly plan using a normalized AthleteProfile DTO.
 */
export async function computeWeeklyPlan(profile, gapResult, readinessResult, interestResults = []) {
    const athleteId = resolveAthleteId(profile);
    const phase = profile?.phase || null;

    if (!athleteId || !phase) {
        throw new Error('Missing required arguments for computeWeeklyPlan');
    }

    console.log(`[computeWeeklyPlan] Starting for athlete ${athleteId}...`);

    const interestMap = new Map((interestResults || []).map((result) => [result.school_id, result]));
    const savedSchools = (profile?.schools || []).map((school) => {
        const interest = interestMap.get(school.schoolId || school.id) || school.interest || null;
        return {
            ...school,
            school_name: school.school_name || school.name,
            interactions: school.interactions || [],
            interest
        };
    });

    const recentPostsCount = savedSchools.reduce((acc, school) => {
        return acc + (school.interactions?.filter((interaction) => interaction.type === 'Social DM').length || 0);
    }, 0);

    const plan = generateWeeklyPlan({
        phase,
        gapResult,
        readinessResult,
        savedSchools,
        upcomingEvents: profile?.upcomingEvents || [],
        recentPostsCount
    });

    const planWithContext = {
        ...plan,
        sport: resolveSport(profile),
        position_group: resolvePositionGroup(profile),
        target_level: resolveTargetLevel(profile),
        phase
    };

    await saveWeeklyPlan(athleteId, plan.weekOf, planWithContext);
    console.log(`[computeWeeklyPlan] Success for week ${plan.weekOf}`);

    return plan;
}

/**
 * Backwards-compatible wrappers.
 */
export async function recomputeGap(athleteId, sport, positionGroup, targetLevel, athleteProfile, phase) {
    const profile = athleteProfile?.athlete
        ? athleteProfile
        : await buildAthleteProfile(athleteId);
    const { savedResult } = await computeGap({
        ...profile,
        sport: resolveSport(profile) || sport,
        goals: profile.goals || profile?.athlete?.goals || { division_priority: targetLevel },
        positions: profile.positions || { primary: { group: positionGroup } }
    });

    if (athleteProfile && phase) {
        await recomputeReadiness(athleteId, sport, targetLevel, profile, phase, savedResult.details_json);
    }

    return savedResult;
}

export async function recomputeReadiness(athleteId, sport, targetLevel, athleteProfile, phase, gapResult) {
    const profile = athleteProfile?.athlete
        ? athleteProfile
        : await buildAthleteProfile(athleteId);

    const { savedResult, readinessResult } = await computeReadiness({
        ...profile,
        sport: resolveSport(profile) || sport,
        goals: profile.goals || profile?.athlete?.goals || { division_priority: targetLevel },
        phase: profile.phase || phase
    }, gapResult);

    await recomputeInterestForAllSchools(athleteId, readinessResult, profile);
    await regenerateWeeklyPlan(athleteId, phase || profile.phase, gapResult, readinessResult);

    return savedResult;
}

export async function recomputeInterestForAllSchools(athleteId, readinessResult, athleteProfile) {
    const profile = athleteProfile?.athlete
        ? athleteProfile
        : await buildAthleteProfile(athleteId);
    await computeSchoolInterest(profile, readinessResult);
}

export async function regenerateWeeklyPlan(athleteId, phase, gapResult, readinessResult) {
    const profile = await buildAthleteProfile(athleteId);
    await computeWeeklyPlan({
        ...profile,
        phase: profile.phase || phase
    }, gapResult, readinessResult);
}
