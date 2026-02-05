import { describe, expect, it, vi } from 'vitest';
import { buildAthleteProfile } from './buildAthleteProfile';

vi.mock('../lib/supabase', () => {
    const tableData = {
        athletes: [{
            id: 'athlete-1',
            first_name: 'Ava',
            last_name: 'Jordan',
            name: 'Ava Jordan',
            sport: 'Softball',
            grad_year: 2027,
            position: 'Third Base',
            city: 'Austin',
            state: 'TX',
            gpa: 3.7,
            goals: {}
        }],
        athlete_measurables: [{
            id: 'm1',
            athlete_id: 'athlete-1',
            sport: 'Softball',
            metric: 'Home to First',
            unit: 'sec',
            measured_at: '2025-01-01',
            value: 3.1
        }],
        athlete_saved_schools: [],
        athlete_interactions: [],
        events: [],
        posts: [],
        athlete_school_interest_results: []
    };

    const makeQuery = (tableName) => {
        let rows = [...(tableData[tableName] || [])];
        const query = {
            select: () => query,
            eq: (column, value) => {
                rows = rows.filter(row => row[column] === value);
                return query;
            },
            order: () => query,
            limit: () => query,
            maybeSingle: async () => ({ data: rows[0] || null, error: null }),
            single: async () => ({ data: rows[0] || null, error: null }),
            get data() { return rows; },
            error: null
        };
        return query;
    };

    return {
        supabase: {
            from: (tableName) => makeQuery(tableName)
        }
    };
});

vi.mock('../lib/signalEngine', () => ({
    calculateSchoolSignal: () => 0
}));

describe('buildAthleteProfile', () => {
    it('normalizes position and metric keys', async () => {
        const profile = await buildAthleteProfile('athlete-1');

        expect(profile.positions.primary.group).toBe('IF');
        expect(profile.measurables.latestByMetric.home_to_first).toBeDefined();
        expect(profile.measurables.latestByMetric.home_to_first.metric).toBe('home_to_first');
    });
});
