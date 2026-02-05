/**
 * School Interest Engine
 * Combines engagement signals and level fit into a composite interest score.
 */
import { calculateSchoolSignal } from './signalEngine.js';
import { LEVEL_THRESHOLDS, INTEREST_WEIGHTS } from './sportConfig.js';

export function computeSchoolInterest({
    athleteReadiness,
    athleteProfile,
    schoolData,
    interactions = []
}) {
    // 1. Engagement Signal (0-100)
    // Scale signal score relative to a 'strong' threshold of 40
    const signalScore = calculateSchoolSignal(interactions);
    const engagementSignal = Math.min(100, Math.round((signalScore / 40) * 100));

    // 2. Level Fit (0-100)
    const readiness = athleteReadiness?.readinessScore0to100 || 0;
    const division = schoolData.division || 'D1';

    let levelFit = 50;
    const isD1 = division.includes('D1') || division.includes('Division 1');
    const isD2 = division.includes('D2') || division.includes('Division 2');
    const isD3 = division.includes('D3') || division.includes('Division 3');
    const isNAIA = division.includes('NAIA');

    const divKey = isD1 ? 'D1' : isD2 ? 'D2' : (isD3 || isNAIA) ? 'D3' : null;
    const thresholds = LEVEL_THRESHOLDS[divKey];

    if (thresholds) {
        levelFit = readiness >= thresholds.excellent ? 100
            : readiness >= thresholds.strong ? 80
                : readiness >= thresholds.good ? 50
                    : 30;
    }

    // 3. Position Fit (Baseline 50 + minor flexibility signal)
    const secondaryCount = Array.isArray(athleteProfile?.secondary_positions_canonical)
        ? athleteProfile.secondary_positions_canonical.length
        : 0;
    const positionFit = 50 + Math.min(10, secondaryCount * 5);

    // 4. Composite Interest Score
    const interestScore = Math.round(
        (INTEREST_WEIGHTS.engagement * engagementSignal) +
        (INTEREST_WEIGHTS.levelFit * levelFit) +
        (INTEREST_WEIGHTS.positionFit * positionFit)
    );

    // 5. Drivers and Next Action
    const drivers = [];
    let nextAction = "Build awareness: send intro email";

    if (engagementSignal >= 70) {
        drivers.push(`Engagement is strong with a signal score of ${signalScore}`);
        nextAction = "Push to conversion: request visit/call";
    } else if (engagementSignal >= 30) {
        drivers.push("Steady interaction history establishes baseline interest");
        nextAction = "Maintenance: send recent highlight/stat update";
    } else {
        drivers.push("Low direct engagement; school may not be tracking closely yet");
    }

    if (levelFit >= 80) {
        drivers.push(`Strong physical/academic fit for ${division} level`);
        if (engagementSignal < 30) {
            nextAction = "Send updated schedule + 1 recent asset";
        }
    } else if (levelFit < 50) {
        drivers.push(`Currently below typical ${division} readiness benchmarks`);
        if (engagementSignal < 30) {
            nextAction = "Re-evaluate or wait until readiness improves";
        }
    }

    return {
        interestScore,
        engagementSignal,
        levelFit,
        positionFit,
        drivers,
        nextAction
    };
}
