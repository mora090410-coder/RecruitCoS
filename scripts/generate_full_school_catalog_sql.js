import fs from 'node:fs/promises';
import path from 'node:path';

const NCAA_MEMBER_LIST_URL = 'https://web3.ncaa.org/directory/api/directory/memberList?type=12';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const DEFAULT_OUTPUT_PATH = 'supabase/snippets/import_full_school_catalog.sql';
const BATCH_SIZE = 250;

const US_STATE_CODES = new Map([
    ['alabama', 'AL'], ['alaska', 'AK'], ['arizona', 'AZ'], ['arkansas', 'AR'], ['california', 'CA'],
    ['colorado', 'CO'], ['connecticut', 'CT'], ['delaware', 'DE'], ['district of columbia', 'DC'],
    ['florida', 'FL'], ['georgia', 'GA'], ['hawaii', 'HI'], ['idaho', 'ID'], ['illinois', 'IL'],
    ['indiana', 'IN'], ['iowa', 'IA'], ['kansas', 'KS'], ['kentucky', 'KY'], ['louisiana', 'LA'],
    ['maine', 'ME'], ['maryland', 'MD'], ['massachusetts', 'MA'], ['michigan', 'MI'], ['minnesota', 'MN'],
    ['mississippi', 'MS'], ['missouri', 'MO'], ['montana', 'MT'], ['nebraska', 'NE'], ['nevada', 'NV'],
    ['new hampshire', 'NH'], ['new jersey', 'NJ'], ['new mexico', 'NM'], ['new york', 'NY'], ['north carolina', 'NC'],
    ['north dakota', 'ND'], ['ohio', 'OH'], ['oklahoma', 'OK'], ['oregon', 'OR'], ['pennsylvania', 'PA'],
    ['rhode island', 'RI'], ['south carolina', 'SC'], ['south dakota', 'SD'], ['tennessee', 'TN'], ['texas', 'TX'],
    ['utah', 'UT'], ['vermont', 'VT'], ['virginia', 'VA'], ['washington', 'WA'], ['west virginia', 'WV'],
    ['wisconsin', 'WI'], ['wyoming', 'WY'],
    ['puerto rico', 'PR'], ['british columbia', 'BC'], ['alberta', 'AB'], ['ontario', 'ON']
]);

function escapeSqlString(value) {
    return String(value).replace(/'/g, "''");
}

function sqlTextOrNull(value) {
    const normalized = String(value || '').trim();
    if (!normalized) return 'NULL';
    return `'${escapeSqlString(normalized)}'`;
}

function cleanWikitext(value) {
    let text = String(value || '');
    text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
    text = text.replace(/<ref[^/]*\/>/gi, '');

    while (/\{\{[^{}]*\}\}/.test(text)) {
        text = text.replace(/\{\{[^{}]*\}\}/g, '');
    }

    text = text.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1');
    text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
    text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
    text = text.replace(/''+/g, '');
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

function normalizeStateCode(value) {
    const raw = cleanWikitext(value);
    if (!raw) return null;

    const upper = raw.toUpperCase();
    if (/^[A-Z]{2}$/.test(upper)) return upper;

    const normalizedKey = raw
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z\s-]/g, '')
        .trim();

    if (US_STATE_CODES.has(normalizedKey)) {
        return US_STATE_CODES.get(normalizedKey);
    }

    const words = normalizedKey.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
    }

    return upper.slice(0, 2);
}

function normalizeSchoolName(value) {
    return cleanWikitext(value)
        .replace(/\s+\(.*?\)\s*$/g, '')
        .trim();
}

function schoolKey(name, state, division) {
    return `${String(name || '').toLowerCase()}|${String(state || '').toUpperCase()}|${String(division || '').toLowerCase()}`;
}

function dedupeSchools(rows) {
    const byKey = new Map();
    for (const row of rows) {
        if (!row?.name || !row?.state || !row?.division) continue;
        const key = schoolKey(row.name, row.state, row.division);
        if (!byKey.has(key)) byKey.set(key, row);
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

function mapNcaaDivision(value) {
    const numericDivision = Number(value);
    if (numericDivision === 1) return 'd1';
    if (numericDivision === 2) return 'd2';
    if (numericDivision === 3) return 'd3';
    return null;
}

async function fetchWikipediaWikitext(pageTitle) {
    const params = new URLSearchParams({
        action: 'parse',
        page: pageTitle,
        prop: 'wikitext',
        format: 'json',
        redirects: '1'
    });

    const response = await fetch(`${WIKIPEDIA_API_URL}?${params.toString()}`, {
        headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`Wikipedia API request failed for ${pageTitle} (${response.status}).`);
    }

    const payload = await response.json();
    if (payload?.error) {
        throw new Error(`Wikipedia API error for ${pageTitle}: ${payload.error.info || payload.error.code}`);
    }

    const wikitext = payload?.parse?.wikitext?.['*'];
    if (!wikitext) {
        throw new Error(`Wikipedia wikitext missing for ${pageTitle}.`);
    }

    return wikitext;
}

async function fetchNcaaSchools() {
    const response = await fetch(NCAA_MEMBER_LIST_URL, {
        headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`NCAA directory request failed (${response.status}).`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
        throw new Error('NCAA directory response was not an array.');
    }

    return rows
        .map((row) => {
            const name = normalizeSchoolName(row?.nameOfficial);
            const state = normalizeStateCode(row?.memberOrgAddress?.state || row?.stateAddr || row?.state);
            const division = mapNcaaDivision(row?.division);
            const conference = cleanWikitext(row?.conferenceName || '');
            if (!name || !state || !division) return null;
            return {
                name,
                city: cleanWikitext(row?.memberOrgAddress?.city || row?.city || '') || null,
                state,
                division,
                conference: conference || null
            };
        })
        .filter(Boolean);
}

function extractFirstLinkText(value) {
    const text = String(value || '');
    const piped = text.match(/\[\[[^\]|]+\|([^\]]+)\]\]/);
    if (piped) return cleanWikitext(piped[1]);
    const plain = text.match(/\[\[([^\]]+)\]\]/);
    if (plain) return cleanWikitext(plain[1]);
    return cleanWikitext(text);
}

function parseNaiaRows(wikitext) {
    const firstTableStart = wikitext.indexOf('{|');
    if (firstTableStart < 0) return [];
    const tableEnd = wikitext.indexOf('\n|}', firstTableStart);
    const table = tableEnd >= 0 ? wikitext.slice(firstTableStart, tableEnd) : wikitext.slice(firstTableStart);

    const rows = table.split('\n|-\n');
    const parsed = [];

    for (const row of rows) {
        if (!row.includes('!scope=row|')) continue;
        const lines = row.split('\n');
        const schoolLine = lines.find((line) => line.includes('!scope=row|'));
        const dataLine = lines.find((line) => line.startsWith('|') && line.includes('||'));
        if (!schoolLine || !dataLine) continue;

        const schoolRaw = schoolLine.split('!scope=row|')[1] || '';
        const schoolName = normalizeSchoolName(extractFirstLinkText(schoolRaw));
        if (!schoolName) continue;

        const cells = dataLine
            .replace(/^\|/, '')
            .split('||')
            .map((cell) => cleanWikitext(cell));

        const city = cells[1] || null;
        const state = normalizeStateCode(cells[2]);
        const conference = cleanWikitext(cells[4] || '') || null;
        if (!state) continue;

        parsed.push({
            name: schoolName,
            city: city || null,
            state,
            division: 'naia',
            conference
        });
    }

    return parsed;
}

function extractMembersSection(wikitext) {
    const membersStart = wikitext.indexOf('==Members==');
    if (membersStart < 0) return '';
    const tail = wikitext.slice(membersStart + '==Members=='.length);
    const nextSectionIndex = tail.search(/\n==[^=]/);
    if (nextSectionIndex < 0) return tail;
    return tail.slice(0, nextSectionIndex);
}

function parseNjcaaDivisionRows(wikitext) {
    const membersSection = extractMembersSection(wikitext);
    const parsed = [];
    let currentState = null;

    for (const rawLine of membersSection.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const stateHeading = line.match(/^===\s*(.+?)\s*===$/);
        if (stateHeading) {
            currentState = normalizeStateCode(stateHeading[1]);
            continue;
        }

        if (!line.startsWith('*') || !currentState) continue;
        const bulletContent = line.slice(1).trim();
        const schoolPart = bulletContent.split(/\s+in\s+/i)[0];
        let schoolName = extractFirstLinkText(schoolPart);
        if (!schoolName) schoolName = normalizeSchoolName(schoolPart);
        schoolName = normalizeSchoolName(schoolName);
        if (!schoolName) continue;

        const cityMatch = bulletContent.match(/\s+in\s+(.+)$/i);
        const city = cityMatch ? cleanWikitext(cityMatch[1]) : null;

        parsed.push({
            name: schoolName,
            city: city || null,
            state: currentState,
            division: 'juco',
            conference: 'NJCAA'
        });
    }

    return parsed;
}

async function fetchNaiaSchools() {
    const wikitext = await fetchWikipediaWikitext('List_of_NAIA_institutions');
    return parseNaiaRows(wikitext);
}

async function fetchNjcaaSchools() {
    const pages = [
        'List_of_NJCAA_Division_I_schools',
        'List_of_NJCAA_Division_II_schools',
        'List_of_NJCAA_Division_III_schools'
    ];

    const rowsByPage = await Promise.all(pages.map((page) => fetchWikipediaWikitext(page).then(parseNjcaaDivisionRows)));
    return rowsByPage.flat();
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

    const [ncaa, naia, njcaa] = await Promise.all([
        fetchNcaaSchools(),
        fetchNaiaSchools(),
        fetchNjcaaSchools()
    ]);

    const allSchools = dedupeSchools([...ncaa, ...naia, ...njcaa])
        .sort((left, right) => {
            if (left.division !== right.division) return left.division.localeCompare(right.division);
            if (left.state !== right.state) return left.state.localeCompare(right.state);
            return left.name.localeCompare(right.name);
        });

    const divisionCounts = allSchools.reduce((accumulator, school) => ({
        ...accumulator,
        [school.division]: (accumulator[school.division] || 0) + 1
    }), {});

    const statements = [
        '-- Generated from NCAA directory and Wikipedia NAIA/NJCAA lists',
        '-- Sources:',
        '-- NCAA: https://web3.ncaa.org/directory/api/directory/memberList?type=12',
        '-- NAIA: https://en.wikipedia.org/wiki/List_of_NAIA_institutions',
        '-- NJCAA D1/D2/D3: https://en.wikipedia.org/wiki/List_of_NJCAA_Division_I_schools',
        '-- Safe to re-run',
        'BEGIN;'
    ];

    for (const batchRows of chunk(allSchools, BATCH_SIZE)) {
        statements.push(buildInsertStatement(batchRows));
    }
    statements.push('COMMIT;');

    const outputPath = path.resolve(process.cwd(), args.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${statements.join('\n\n')}\n`, 'utf8');

    console.log(`[generate_full_school_catalog_sql] NCAA rows: ${ncaa.length}`);
    console.log(`[generate_full_school_catalog_sql] NAIA rows: ${naia.length}`);
    console.log(`[generate_full_school_catalog_sql] NJCAA rows: ${njcaa.length}`);
    console.log(`[generate_full_school_catalog_sql] Deduped total: ${allSchools.length}`);
    console.log(`[generate_full_school_catalog_sql] Counts by division: ${JSON.stringify(divisionCounts)}`);
    console.log(`[generate_full_school_catalog_sql] Wrote SQL: ${outputPath}`);
}

main().catch((error) => {
    console.error('[generate_full_school_catalog_sql] Failed:', error.message);
    process.exitCode = 1;
});
