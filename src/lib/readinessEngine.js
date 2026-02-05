/**
 * Readiness Score Engine
 * Computes an explainable, stage-aware readiness score (0-100).
 */
import { RECRUITING_PHASES } from './constants.js';
import { PILLAR_WEIGHTS } from './sportConfig.js';

export function computeReadinessScore({
    athleteProfile,
    gapResult,
    executionSignals,
    phase
}) {
    // 1. Calculate Pillars (0-100)

    // Pillar A: Measurables
    // Derived from gapScore, penalized if missing key metrics
    let measurables = gapResult?.gapScore0to100 || 0;
    const missingCount = gapResult?.missingMetrics?.length || 0;
    if (missingCount > 0) {
        measurables = Math.max(0, measurables - (missingCount * 5));
    }

    // Pillar B: Performance / Progression
    // Baseline 50. Improves based on history of events and measurables.
    const totalEvents = executionSignals.totalEvents || 0;
    const totalMeasurables = executionSignals.totalMeasurables || 0;
    let progression = 50 + (totalEvents * 2) + (totalMeasurables * 2);
    progression = Math.min(100, Math.max(0, progression));

    // Pillar C: Exposure / Assets
    // Based on recent events and video/posts presence
    const recentEvents = executionSignals.recentEvents90d || 0;
    const totalPosts = executionSignals.totalPosts || 0;
    let exposure = (recentEvents * 15) + (totalPosts * 5);
    exposure = Math.min(100, Math.max(0, exposure));

    // Pillar D: Academics
    // GPA banding (null -> 50)
    let academics = 50;
    const gpa = Number(athleteProfile.gpa);
    if (!isNaN(gpa) && gpa > 0) {
        if (gpa >= 3.8) academics = 95;
        else if (gpa >= 3.5) academics = 85;
        else if (gpa >= 3.0) academics = 75;
        else if (gpa >= 2.5) academics = 60;
        else academics = 40;
    }

    // Pillar E: Execution
    // Interactions + Momentum + Active Schools
    const recentInteractions = executionSignals.recentInteractions30d || 0;
    const momentum = executionSignals.momentumCount || 0;
    const activeSchools = executionSignals.activeSchools || 0;
    let execution = (recentInteractions * 10) + (momentum * 5) + (activeSchools * 10);
    execution = Math.min(100, Math.max(0, execution));

    // 2. Stage/Phase Modifiers
    const weights = PILLAR_WEIGHTS[phase] || PILLAR_WEIGHTS[RECRUITING_PHASES.IDENTIFICATION];

    const readinessScore0to100 = Math.round(
        (measurables * weights.measurables) +
        (progression * weights.progression) +
        (exposure * weights.exposure) +
        (academics * weights.academics) +
        (execution * weights.execution)
    );

    // 3. Insight Generation
    const topPositives = [];
    const topBlockers = [];
    const recommendedFocus = [];

    // Check Pillars for insights
    const pillars = { measurables, progression, exposure, academics, execution };

    if (measurables > 80) topPositives.push("Elite physical metrics for target level");
    if (academics > 80) topPositives.push("Strong academic profile expands options");
    if (exposure > 80) topPositives.push("High volume of recent exposure events");
    if (execution > 80) topPositives.push("Active momentum with college coaches");

    if (measurables < 60) {
        topBlockers.push("Physical gap vs target level benchmarks");
        recommendedFocus.push("Strength & Skill Development");
    }
    if (missingCount > 2) {
        topBlockers.push("Insufficient verified data points");
        recommendedFocus.push("Measurable Verification");
    }
    if (exposure < 50) {
        topBlockers.push("Limited recent event participation");
        recommendedFocus.push("Event Planning");
    }
    if (execution < 40) {
        topBlockers.push("Low recent engagement with coaches");
        recommendedFocus.push("Direct Coach Outreach");
    }

    return {
        readinessScore0to100,
        pillars,
        topPositives: topPositives.slice(0, 3),
        topBlockers: topBlockers.slice(0, 3),
        recommendedFocus: [...new Set(recommendedFocus)].slice(0, 3)
    };
}
