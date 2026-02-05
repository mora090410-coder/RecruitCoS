import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { getMetricKeysForSport, canonicalizeMetricKey } from '../src/config/sportSchema.js';

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

const listUnknowns = async () => {
    const { data: benchmarks, error: benchmarksError } = await supabase
        .from('measurable_benchmarks')
        .select('id, sport, metric, position_group, target_level');

    if (benchmarksError) throw benchmarksError;

    const unknownBenchmarks = (benchmarks || []).filter(row => {
        const allowed = new Set(getMetricKeysForSport(row.sport));
        return !allowed.has(row.metric);
    });

    const { data: measurables, error: measurablesError } = await supabase
        .from('athlete_measurables')
        .select('id, athlete_id, sport, metric, metric_canonical');

    if (measurablesError) throw measurablesError;

    const unknownMeasurables = (measurables || []).filter(row => {
        const allowed = new Set(getMetricKeysForSport(row.sport));
        const key = row.metric_canonical || canonicalizeMetricKey(row.sport, row.metric);
        return !allowed.has(key);
    });

    console.log('--- Benchmark Metric Audit ---');
    console.log(`Unknown benchmark metrics: ${unknownBenchmarks.length}`);
    if (unknownBenchmarks.length > 0) console.table(unknownBenchmarks);
    console.log(`Unknown athlete_measurables metrics: ${unknownMeasurables.length}`);
    if (unknownMeasurables.length > 0) console.table(unknownMeasurables);
};

listUnknowns().catch(err => {
    console.error('Benchmark metric audit failed:', err);
    process.exit(1);
});
