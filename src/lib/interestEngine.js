/**
 * School Interest Engine
 * Combines engagement signals and level fit into a composite interest score.
 */
import { calculateSchoolSignal } from './signalEngine.js';

export function computeSchoolInterest({
    athleteReadiness,
    schoolData,
    interactions = []
}) {
    // 1. Engagement Signal (0-100)
    // Scale signal score relative to a 'strong' threshold of 40
    const signalScore = calculateSchoolSignal(interactions);
    const engagementSignal = Math.min(100, Math.round((signalScore / 40) * 100));

    // 2. Level Fit (0-100)
    // Compare athlete readiness against school division
    // D1: needs 80+, D2: needs 60+, D3: needs 40+
    const readiness = athleteReadiness?.readinessScore0to100 || 0;
    const division = schoolData.division || 'D1';

    let levelFit = 50;
    const isD1 = division.includes('D1') || division.includes('Division 1');
    const isD2 = division.includes('D2') || division.includes('Division 2');
    const isD3 = division.includes('D3') || division.includes('Division 3');
    const isNAIA = division.includes('NAIA');

    if (isD1) {
        levelFit = readiness >= 85 ? 100 : readiness >= 75 ? 80 : readiness >= 60 ? 50 : 30;
    } else if (isD2) {
        levelFit = readiness >= 65 ? 100 : readiness >= 50 ? 80 : readiness >= 40 ? 60 : 40;
    } else if (isD3 || isNAIA) {
        levelFit = readiness >= 45 ? 100 : readiness >= 30 ? 80 : 60;
    }

    // 3. Position Fit (Baseline 50)
    const positionFit = 50;

    // 4. Composite Interest Score
    const interestScore = Math.round(
        (0.55 * engagementSignal) +
        (0.30 * levelFit) +
        (0.15 * positionFit)
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
