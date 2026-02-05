import { describe, it, expect, vi } from 'vitest';
import { computeSchoolInterest } from './interestEngine';

// Mock signalEngine
vi.mock('./signalEngine.js', () => ({
    calculateSchoolSignal: vi.fn((interactions) => interactions.length * 10)
}));

describe('interestEngine', () => {
    const schoolData = { division: 'Division 1' };

    it('calculates interest score correctly', () => {
        const result = computeSchoolInterest({
            athleteReadiness: { readinessScore0to100: 85 },
            schoolData,
            interactions: [{}, {}, {}, {}] // signal = 40, engagement = 100
        });

        // engagement=100, levelFit=100 (readiness 85 vs D1), positionFit=50
        // 0.55*100 + 0.30*100 + 0.15*50 = 55 + 30 + 7.5 = 92.5 -> 93
        expect(result.interestScore).toBe(93);
        expect(result.nextAction).toContain('Push to conversion');
    });

    it('handles low readiness for high division', () => {
        const result = computeSchoolInterest({
            athleteReadiness: { readinessScore0to100: 40 },
            schoolData,
            interactions: [] // signal = 0
        });

        expect(result.levelFit).toBe(30);
        expect(result.nextAction).toContain('Re-evaluate');
    });
});
