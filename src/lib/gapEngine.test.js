import { describe, it, expect } from 'vitest';
import { normalizeMetricScore, computeGapScore } from './gapEngine';

describe('gapEngine', () => {
    describe('normalizeMetricScore', () => {
        it('normalizes higher_better metrics correctly', () => {
            // p50=10, p90=20. value=15 should be 0.75
            const score = normalizeMetricScore({ value: 15, p50: 10, p90: 20, direction: 'higher_better' });
            expect(score).toBe(0.75);
        });

        it('normalizes lower_better metrics correctly', () => {
            // p50=5.0, p90=4.0. value=4.5 should be 0.75
            const score = normalizeMetricScore({ value: 4.5, p50: 5.0, p90: 4.0, direction: 'lower_better' });
            expect(score).toBe(0.75);
        });

        it('caps scores between 0 and 1', () => {
            expect(normalizeMetricScore({ value: 25, p50: 10, p90: 20, direction: 'higher_better' })).toBe(1);
            expect(normalizeMetricScore({ value: 5, p50: 10, p90: 20, direction: 'higher_better' })).toBe(0.25); // Linear interpolation
            expect(normalizeMetricScore({ value: 0, p50: 10, p90: 20, direction: 'higher_better' })).toBe(0);
        });
    });

    describe('computeGapScore', () => {
        it('calculates weighted gap score correctly', () => {
            const athleteMetrics = [
                { metric: 'vertical', value: 30 }
            ];
            const benchmarks = [
                { metric: 'vertical', p50: 20, p90: 40, direction: 'higher_better', weight: 10 }
            ];

            const result = computeGapScore({ athleteMetrics, benchmarks });
            expect(result.gapScore0to100).toBe(75);
            expect(result.topGaps.length).toBe(1);
        });
    });
});
