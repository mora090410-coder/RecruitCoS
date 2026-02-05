import { describe, expect, it } from 'vitest';
import { derivePositionGroup, normalizeMetric } from './sportSchema';

describe('normalizeMetric', () => {
    it('normalizes whitespace and case', () => {
        expect(normalizeMetric('  40 YD Dash  ')).toBe('40 yd dash');
    });

    it('strips punctuation but keeps slashes', () => {
        expect(normalizeMetric('3/4 Court-Sprint!')).toBe('3/4 courtsprint');
    });
});

describe('derivePositionGroup', () => {
    it('maps softball aliases to IF group', () => {
        expect(derivePositionGroup('Softball', '3B')).toBe('IF');
        expect(derivePositionGroup('Softball', 'Third Base')).toBe('IF');
    });

    it('maps baseball outfield positions', () => {
        expect(derivePositionGroup('Baseball', 'CF')).toBe('OF');
    });

    it('maps football positions to groups', () => {
        expect(derivePositionGroup('Football', 'WR')).toBe('WR/DB');
        expect(derivePositionGroup('Football', 'Linebacker')).toBe('LB');
    });

    it('maps soccer goalkeeper', () => {
        expect(derivePositionGroup('Soccer', 'Goalkeeper')).toBe('GK');
    });

    it('maps basketball guard', () => {
        expect(derivePositionGroup('Basketball', 'Point Guard')).toBe('Guard');
    });

    it('returns null for unsupported input', () => {
        expect(derivePositionGroup('Softball', 'Unknown')).toBeNull();
    });
});
