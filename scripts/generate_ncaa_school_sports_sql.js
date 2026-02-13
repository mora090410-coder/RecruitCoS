import fs from 'node:fs/promises';
import path from 'node:path';

const NCAA_MEMBER_LIST_URL = 'https://web3.ncaa.org/directory/api/directory/memberList';
const NCAA_SPORT_LIST_URL = 'https://web3.ncaa.org/directory/api/common/sportList';
const DEFAULT_OUTPUT_PATH = 'supabase/snippets/import_ncaa_school_sports.sql';
const BATCH_SIZE = 500;
const MAX_FETCH_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 300;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, { label, signal } = {}) {
    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_FETCH_ATTEMPTS) {
        attempt += 1;
        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal
            });

            if (!response.ok) {
                throw new Error(`${label || 'Request'} failed (${response.status})`);
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            if (attempt >= MAX_FETCH_ATTEMPTS) break;
            const delay = INITIAL_RETRY_DELAY_MS * (2 ** (attempt - 1));
            await sleep(delay);
        }
    }

    throw lastError || new Error(`${label || 'Request'} failed.`);
}

function escapeSqlString(value) {
    return String(value).replace(/'/g, "''");
}

function sqlText(value) {
    return `'${escapeSqlString(String(value || '').trim())}'`;
}

function normalizeSchoolName(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeStateCode(value) {
    const normalized = String(value || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(normalized)) return normalized;
    return null;
}

function mapNcaaDivision(value) {
    const numericDivision = Number(value);
    if (numericDivision === 1) return 'd1';
    if (numericDivision === 2) return 'd2';
    if (numericDivision === 3) return 'd3';
    return null;
}

function normalizeSportLabel(value) {
    const normalized = String(value || '')
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/^men'?s\s+/i, '')
        .replace(/^women'?s\s+/i, '')
        .replace(/\s*&\s*/g, ' and ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalized) return null;
    if (normalized.includes('track and field')) return 'track and field';
    if (normalized.includes('cross country')) return 'cross country';
    return normalized;
}

function buildSchoolKey(name, state) {
    return `${String(name || '').toLowerCase()}|${String(state || '').toUpperCase()}`;
}

function chunk(list, size) {
    const output = [];
    for (let index = 0; index < list.length; index += size) {
        output.push(list.slice(index, index + size));
    }
    return output;
}

function buildInsertStatement(rows) {
    const values = rows
        .map((row) => `(${sqlText(row.name)}, ${sqlText(row.state)}, ${sqlText(row.division)}, ${sqlText(row.sport)})`)
        .join(',\n');

    return `INSERT INTO tmp_ncaa_school_sports (name, state, division, sport)
VALUES
${values};`;
}

function parseArgs(argv) {
    const args = {
        out: DEFAULT_OUTPUT_PATH
    };

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if ((token === '--out' || token === '-o') && argv[index + 1]) {
            args.out = argv[index + 1];
            index += 1;
        }
    }

    return args;
}

async function fetchNcaaSportCatalog() {
    const sportRows = await fetchJsonWithRetry(NCAA_SPORT_LIST_URL, {
        label: 'NCAA sport list'
    });

    if (!Array.isArray(sportRows)) {
        throw new Error('NCAA sport list response was not an array.');
    }

    return sportRows
        .map((row) => ({
            code: String(row?.value || '').trim(),
            sport: normalizeSportLabel(row?.label)
        }))
        .filter((row) => row.code && row.sport);
}

async function fetchSchoolsForSportCode(code) {
    const params = new URLSearchParams({
        type: '12',
        sportCode: code
    });
    const url = `${NCAA_MEMBER_LIST_URL}?${params.toString()}`;

    const rows = await fetchJsonWithRetry(url, {
        label: `NCAA member list for ${code}`
    });

    if (!Array.isArray(rows)) {
        throw new Error(`NCAA member list response for ${code} was not an array.`);
    }

    return rows;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const sportsCatalog = await fetchNcaaSportCatalog();
    const sportsBySchoolKey = new Map();
    const divisionBySchoolKey = new Map();

    for (const sportRow of sportsCatalog) {
        const rows = await fetchSchoolsForSportCode(sportRow.code);
        for (const row of rows) {
            const name = normalizeSchoolName(row?.nameOfficial);
            const state = normalizeStateCode(
                row?.memberOrgAddress?.state || row?.stateAddr || row?.state
            );
            const division = mapNcaaDivision(row?.division);
            if (!name || !state || !division) continue;

            const key = buildSchoolKey(name, state);
            const sports = sportsBySchoolKey.get(key) || new Set();
            sports.add(sportRow.sport);
            sportsBySchoolKey.set(key, sports);
            divisionBySchoolKey.set(key, division);
        }
    }

    const outputRows = Array.from(sportsBySchoolKey.entries())
        .flatMap(([key, sports]) => {
            const [name, state] = key.split('|');
            const division = divisionBySchoolKey.get(key);
            const sportList = Array.from(sports).sort((left, right) => left.localeCompare(right));
            return sportList.map((sport) => ({
                name,
                state,
                division,
                sport
            }));
        })
        .sort((left, right) => {
            if (left.division !== right.division) return left.division.localeCompare(right.division);
            if (left.state !== right.state) return left.state.localeCompare(right.state);
            if (left.name !== right.name) return left.name.localeCompare(right.name);
            return left.sport.localeCompare(right.sport);
        });

    const statements = [
        '-- Generated from NCAA sport list and member list APIs',
        '-- Sources:',
        '-- https://web3.ncaa.org/directory/api/common/sportList',
        '-- https://web3.ncaa.org/directory/api/directory/memberList?type=12&sportCode=<code>',
        '-- Safe to re-run',
        'BEGIN;',
        'CREATE TEMP TABLE tmp_ncaa_school_sports (',
        '    name TEXT NOT NULL,',
        '    state TEXT NOT NULL,',
        '    division TEXT NOT NULL,',
        '    sport TEXT NOT NULL',
        ') ON COMMIT DROP;'
    ];

    for (const rows of chunk(outputRows, BATCH_SIZE)) {
        statements.push(buildInsertStatement(rows));
    }

    statements.push(`
INSERT INTO public.school_sports (school_id, sport)
SELECT DISTINCT
    s.id,
    t.sport
FROM tmp_ncaa_school_sports t
JOIN public.schools s
    ON lower(s.name) = lower(t.name)
   AND upper(s.state) = upper(t.state)
WHERE s.division IN ('d1', 'd2', 'd3')
ON CONFLICT (school_id, sport) DO NOTHING;`);

    statements.push(`
UPDATE public.schools s
SET sports_offered = aggregated.sports
FROM (
    SELECT
        school_id,
        array_agg(DISTINCT sport ORDER BY sport) AS sports
    FROM public.school_sports
    GROUP BY school_id
) AS aggregated
WHERE aggregated.school_id = s.id;`);

    statements.push('COMMIT;');

    const outputPath = path.resolve(process.cwd(), args.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${statements.join('\n\n')}\n`, 'utf8');

    const schoolsWithSports = new Set(outputRows.map((row) => buildSchoolKey(row.name, row.state))).size;
    console.log(`[generate_ncaa_school_sports_sql] Sports codes: ${sportsCatalog.length}`);
    console.log(`[generate_ncaa_school_sports_sql] Schools with mapped sports: ${schoolsWithSports}`);
    console.log(`[generate_ncaa_school_sports_sql] School-sport rows: ${outputRows.length}`);
    console.log(`[generate_ncaa_school_sports_sql] Wrote SQL: ${outputPath}`);
}

main().catch((error) => {
    console.error('[generate_ncaa_school_sports_sql] Failed:', error.message);
    process.exitCode = 1;
});
