import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { mapCanonicalToGroup, mapPositionToCanonical } from '../src/lib/normalize.js';
import { canonicalizeMetricKey, getMetricUnit } from '../src/config/sportSchema.js';

const readEnv = () => {
    const envPath = '.env';
    if (!fs.existsSync(envPath)) return {};
    return fs.readFileSync(envPath, 'utf-8')
        .split('\n')
        .filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
        .reduce((acc, line) => {
            const [key, ...rest] = line.split('=');
            acc[key] = rest.join('=');
            return acc;
        }, {});
};

const env = readEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const report = async () => {
    const { data: athletes, error: athleteError } = await supabase
        .from('athletes')
        .select('id, sport, position, position_canonical, position_group');

    if (athleteError) throw athleteError;

    const positionIssues = (athletes || []).map(row => {
        const canonical = mapPositionToCanonical(row.sport, row.position || row.position_canonical);
        const group = mapCanonicalToGroup(row.sport, canonical);
        const issue = !canonical || !group;
        return {
            id: row.id,
            sport: row.sport,
            position: row.position,
            position_canonical: canonical,
            position_group: group,
            issue
        };
    }).filter(row => row.issue);

    const { data: measurables, error: measurableError } = await supabase
        .from('athlete_measurables')
        .select('id, athlete_id, sport, metric, metric_canonical, unit, unit_canonical');

    if (measurableError) throw measurableError;

    const measurableIssues = (measurables || []).map(row => {
        const canonical = canonicalizeMetricKey(row.sport, row.metric_canonical || row.metric);
        const unit = row.unit_canonical || (row.unit ? row.unit.toString().trim().toLowerCase() : null);
        const expectedUnit = getMetricUnit(row.sport, canonical);
        const issue = !canonical || !unit || (expectedUnit && unit !== expectedUnit);
        return {
            id: row.id,
            athlete_id: row.athlete_id,
            sport: row.sport,
            metric: row.metric,
            metric_canonical: canonical,
            unit: row.unit,
            unit_canonical: unit,
            expected_unit: expectedUnit,
            issue
        };
    }).filter(row => row.issue);

    console.log('--- Cleanup Report ---');
    console.log(`Athletes with unmapped position/group: ${positionIssues.length}`);
    if (positionIssues.length > 0) console.table(positionIssues);
    console.log(`Measurables with metric/unit issues: ${measurableIssues.length}`);
    if (measurableIssues.length > 0) console.table(measurableIssues);
};

report().catch(err => {
    console.error('Cleanup report failed:', err);
    process.exit(1);
});
