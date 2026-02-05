import { describe, it, expect } from 'vitest';
import { computeReadinessScore } from './readinessEngine';
import { RECRUITING_PHASES } from './constants';

describe('readinessEngine', () => {
    const mockExecution = {
        totalEvents: 2,
        totalMeasurables: 2,
        recentEvents90d: 1,
        totalPosts: 2,
        recentInteractions30d: 2,
        momentumCount: 1,
        activeSchools: 2
    };

    it('calculates basic pillars correctly', () => {
        const result = computeReadinessScore({
            athleteProfile: { gpa: 3.9 },
            gapResult: { gapScore0to100: 80, missingMetrics: [] },
            executionSignals: mockExecution,
            phase: RECRUITING_PHASES.FOUNDATION
        });

        expect(result.pillars.academics).toBe(95);
        expect(result.pillars.measurables).toBe(80);
        expect(result.readinessScore0to100).toBeGreaterThan(0);
    });

    it('adjusts weighting based on phase', () => {
        const data = {
            athleteProfile: { gpa: 3.0 },
            gapResult: { gapScore0to100: 50, missingMetrics: [] },
            executionSignals: mockExecution
        };

        const foundation = computeReadinessScore({ ...data, phase: RECRUITING_PHASES.FOUNDATION });
        const commitment = computeReadinessScore({ ...data, phase: RECRUITING_PHASES.COMMITMENT });

        // In Foundation, measurables weight is 0.35
        // In Commitment, measurables weight is 0.15
        // Execution weight shifts from 0.05 to 0.30
        expect(foundation.readinessScore0to100).not.toBe(commitment.readinessScore0to100);
    });
});
