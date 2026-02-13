import fs from 'node:fs/promises';
import path from 'node:path';

const NCAA_MEMBER_LIST_URL = 'https://web3.ncaa.org/directory/api/directory/memberList?type=12';
const DEFAULT_OUTPUT_PATH = 'supabase/snippets/import_ncaa_catalog.sql';
const BATCH_SIZE = 250;

function escapeSqlString(value) {
    return String(value).replace(/'/g, "''");
}

function sqlTextOrNull(value) {
    const normalized = String(value || '').trim();
    if (!normalized) return 'NULL';
    return `'${escapeSqlString(normalized)}'`;
}

function mapDivision(value) {
    const divisionNumber = Number(value);
    if (divisionNumber === 1) return 'd1';
    if (divisionNumber === 2) return 'd2';
    if (divisionNumber === 3) return 'd3';
    return null;
}

function normalizeSchoolRow(row) {
    const name = String(row?.nameOfficial || '').trim();
    const city = String(row?.memberOrgAddress?.city || '').trim();
    const state = String(row?.memberOrgAddress?.state || '').trim().toUpperCase();
    const division = mapDivision(row?.division);
    const conference = String(row?.conferenceName || '').trim();
    const isActive = String(row?.deactive || 'N').toUpperCase() !== 'Y';

    if (!isActive || !name || !state || !division) return null;

    return {
        name,
        city: city || null,
        state,
        division,
        conference: conference || null
    };
}

function dedupeSchools(rows) {
    const byKey = new Map();
    for (const row of rows) {
        const key = `${row.name.toLowerCase()}|${row.state}`;
        if (!byKey.has(key)) {
            byKey.set(key, row);
        }
    }
    return Array.from(byKey.values());
}

function chunk(list, size) {
    const output = [];
    for (let index = 0; index < list.length; index += size) {
        output.push(list.slice(index, index + size));
    }
    return output;
}

function buildInsertStatement(schoolsBatch) {
    const valuesSql = schoolsBatch
        .map((school) => `(
            ${sqlTextOrNull(school.name)},
            ${sqlTextOrNull(school.city)},
            ${sqlTextOrNull(school.state)},
            ${sqlTextOrNull(school.division)},
            ${sqlTextOrNull(school.conference)},
            ARRAY[]::text[]
        )`)
        .join(',\n');

    return `INSERT INTO public.schools (name, city, state, division, conference, sports_offered)
VALUES
${valuesSql}
ON CONFLICT (name, state) DO UPDATE
SET
    city = COALESCE(EXCLUDED.city, public.schools.city),
    division = EXCLUDED.division,
    conference = COALESCE(EXCLUDED.conference, public.schools.conference),
    sports_offered = CASE
        WHEN cardinality(public.schools.sports_offered) > 0 THEN public.schools.sports_offered
        ELSE EXCLUDED.sports_offered
    END;`;
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

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const response = await fetch(NCAA_MEMBER_LIST_URL, {
        headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`NCAA directory request failed (${response.status}).`);
    }

    const rawRows = await response.json();
    if (!Array.isArray(rawRows)) {
        throw new Error('NCAA directory response was not an array.');
    }

    const normalizedRows = rawRows
        .map(normalizeSchoolRow)
        .filter(Boolean);
    const schools = dedupeSchools(normalizedRows);
    const batches = chunk(schools, BATCH_SIZE);

    const statements = [
        '-- Generated from NCAA directory member list',
        '-- Safe to re-run',
        'BEGIN;'
    ];

    for (const batchRows of batches) {
        statements.push(buildInsertStatement(batchRows));
    }

    statements.push('COMMIT;');

    const outputPath = path.resolve(process.cwd(), args.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${statements.join('\n\n')}\n`, 'utf8');

    console.log(`[generate_ncaa_catalog_sql] Raw rows: ${rawRows.length}`);
    console.log(`[generate_ncaa_catalog_sql] Eligible schools: ${normalizedRows.length}`);
    console.log(`[generate_ncaa_catalog_sql] Deduped schools: ${schools.length}`);
    console.log(`[generate_ncaa_catalog_sql] Wrote SQL: ${outputPath}`);
}

main().catch((error) => {
    console.error('[generate_ncaa_catalog_sql] Failed:', error.message);
    process.exitCode = 1;
});
