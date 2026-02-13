/* global process */
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_OUTPUT_PATH = 'supabase/snippets/import_naia_njcaa_school_sports.sql';
const DEFAULT_ALIAS_MAP_PATH = 'scripts/data/school_name_aliases.naia_njcaa.json';
const BATCH_SIZE = 500;
const MAX_FETCH_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 300;
const USER_AGENT = 'Mozilla/5.0 (compatible; RecruitCoS-CatalogBot/1.0)';

const NAIA_BASE_SPORT_PAGE = 'https://naiastats.prestosports.com/sports/mbkb/2025-26/teams';
const NJCAA_INDEX_URL = 'https://njcaastats.prestosports.com/index';

const SPORT_LABEL_BY_CODE = new Map([
    ['bsb', 'baseball'],
    ['fball', 'football'],
    ['flagfball', 'flag football'],
    ['mbkb', 'basketball'],
    ['mlax', 'lacrosse'],
    ['msoc', 'soccer'],
    ['mten', 'tennis'],
    ['mvball', 'volleyball'],
    ['sball', 'softball'],
    ['wbkb', 'basketball'],
    ['wlax', 'lacrosse'],
    ['wsoc', 'soccer'],
    ['wten', 'tennis'],
    ['wvball', 'volleyball'],
    ['beachvball', 'beach volleyball']
]);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeSqlString(value) {
    return String(value).replace(/'/g, "''");
}

function sqlText(value) {
    return `'${escapeSqlString(String(value || '').trim())}'`;
}

function cleanSchoolName(value) {
    let name = String(value || '').trim();
    name = name.replace(/\s+/g, ' ');
    name = name.replace(/\s+\(.*?\)\s*$/g, '');
    name = name.replace(/\s+-\s+[A-Z]{2}\s*$/g, '');
    return name.trim();
}

function normalizeSportLabel(code) {
    const normalizedCode = String(code || '').trim().toLowerCase();
    if (SPORT_LABEL_BY_CODE.has(normalizedCode)) {
        return SPORT_LABEL_BY_CODE.get(normalizedCode);
    }
    return normalizedCode || null;
}

function parseArgs(argv) {
    const args = {
        out: DEFAULT_OUTPUT_PATH,
        aliasMap: DEFAULT_ALIAS_MAP_PATH
    };
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if ((token === '--out' || token === '-o') && argv[index + 1]) {
            args.out = argv[index + 1];
            index += 1;
            continue;
        }

        if ((token === '--alias-map' || token === '--aliases') && argv[index + 1]) {
            args.aliasMap = argv[index + 1];
            index += 1;
        }
    }
    return args;
}

function chunk(list, size) {
    const output = [];
    for (let index = 0; index < list.length; index += size) {
        output.push(list.slice(index, index + size));
    }
    return output;
}

async function fetchTextWithRetry(url, { label } = {}) {
    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_FETCH_ATTEMPTS) {
        attempt += 1;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'text/html,application/xhtml+xml',
                    'User-Agent': USER_AGENT
                }
            });

            if (!response.ok) {
                throw new Error(`${label || 'Request'} failed (${response.status})`);
            }

            return await response.text();
        } catch (error) {
            lastError = error;
            if (attempt >= MAX_FETCH_ATTEMPTS) break;
            const delay = INITIAL_RETRY_DELAY_MS * (2 ** (attempt - 1));
            await sleep(delay);
        }
    }

    throw lastError || new Error(`${label || 'Request'} failed.`);
}

async function fetchJsonWithRetry(url, { label } = {}) {
    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_FETCH_ATTEMPTS) {
        attempt += 1;
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': USER_AGENT
                }
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

function extractNaiaSportCodesAndSeason(html) {
    const routeMatches = Array.from(
        html.matchAll(/href="\/sports\/([a-z0-9-]+)\/([0-9]{4}-[0-9]{2})\/teams"/gi)
    );

    const uniqueCodes = new Set();
    for (const match of routeMatches) {
        uniqueCodes.add(String(match[1] || '').toLowerCase());
    }

    const firstSeason = routeMatches[0]?.[2] || null;
    return {
        season: firstSeason,
        sportCodes: Array.from(uniqueCodes).sort()
    };
}

function extractTeamsDataUrl(html) {
    const match = html.match(
        /teamsDataEndp\.set\("((?:https:\/\/)?prestosports-downloads\.s3\.us-west-2\.amazonaws\.com\/teamsData\/[^"]+\.json)"/i
    );
    if (!match) return null;
    return match[1].startsWith('http') ? match[1] : `https:${match[1]}`;
}

function extractNjcaaSportCodes(html) {
    const matches = Array.from(html.matchAll(/href="\/sports\/([a-z0-9-]+)\/teams-page"/gi));
    const codes = new Set(matches.map((match) => String(match[1] || '').toLowerCase()));
    return Array.from(codes).sort();
}

function extractNjcaaSchoolNamesFromTeamsPage(html) {
    const names = [];
    const profileAnchorRegex = /<a href="\/sports\/[^"]+\/teams\/[^"]+\?view=profile[^"]*" title="([^"]+)"/gi;
    let match;
    while ((match = profileAnchorRegex.exec(html))) {
        const cleaned = cleanSchoolName(match[1]);
        if (cleaned) names.push(cleaned);
    }
    return Array.from(new Set(names)).sort((left, right) => left.localeCompare(right));
}

function buildRowsKey({ source, division, sport, schoolName }) {
    return `${source}|${division}|${sport}|${schoolName.toLowerCase()}`;
}

function dedupeRows(rows) {
    const byKey = new Map();
    for (const row of rows) {
        const key = buildRowsKey(row);
        if (!byKey.has(key)) byKey.set(key, row);
    }
    return Array.from(byKey.values());
}

function buildAliasKey({ source, division, aliasName, canonicalName }) {
    return `${source || '*'}|${division || '*'}|${aliasName.toLowerCase()}|${canonicalName.toLowerCase()}`;
}

function dedupeAliasRows(rows) {
    const byKey = new Map();
    for (const row of rows) {
        const key = buildAliasKey(row);
        if (!byKey.has(key)) byKey.set(key, row);
    }
    return Array.from(byKey.values());
}

function buildInsertStatement(rows) {
    const values = rows
        .map((row) => `(${sqlText(row.source)}, ${sqlText(row.division)}, ${sqlText(row.sportCode)}, ${sqlText(row.sport)}, ${sqlText(row.schoolName)})`)
        .join(',\n');

    return `INSERT INTO tmp_association_school_sports (source, division, sport_code, sport, school_name)
VALUES
${values};`;
}

function buildAliasInsertStatement(rows) {
    const values = rows
        .map((row) => `(${row.source ? sqlText(row.source) : 'NULL'}, ${row.division ? sqlText(row.division) : 'NULL'}, ${sqlText(row.aliasName)}, ${sqlText(row.canonicalName)})`)
        .join(',\n');

    return `INSERT INTO tmp_school_name_aliases (source, division, alias_name, canonical_name)
VALUES
${values};`;
}

async function loadAliasMappings(inputPath) {
    const resolvedPath = path.resolve(process.cwd(), inputPath || DEFAULT_ALIAS_MAP_PATH);
    let payload;

    try {
        payload = await fs.readFile(resolvedPath, 'utf8');
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }

    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) {
        throw new Error(`Alias map must be a JSON array: ${resolvedPath}`);
    }

    return dedupeAliasRows(parsed
        .map((entry) => {
            const aliasName = cleanSchoolName(entry?.alias || entry?.aliasName || '');
            const canonicalName = cleanSchoolName(entry?.canonical || entry?.canonicalName || '');
            if (!aliasName || !canonicalName) return null;

            const source = String(entry?.source || '').trim().toLowerCase() || null;
            const division = String(entry?.division || '').trim().toLowerCase() || null;
            return { source, division, aliasName, canonicalName };
        })
        .filter(Boolean));
}

async function fetchNaiaRows() {
    const seedHtml = await fetchTextWithRetry(NAIA_BASE_SPORT_PAGE, {
        label: 'NAIA base sport page'
    });
    const { season, sportCodes } = extractNaiaSportCodesAndSeason(seedHtml);
    if (!season || sportCodes.length === 0) {
        throw new Error('Unable to discover NAIA season/sport codes.');
    }

    const outputRows = [];
    for (const sportCode of sportCodes) {
        const sport = normalizeSportLabel(sportCode);
        if (!sport) continue;

        const pageUrl = `https://naiastats.prestosports.com/sports/${sportCode}/${season}/teams`;
        let html;
        try {
            html = await fetchTextWithRetry(pageUrl, {
                label: `NAIA ${sportCode} teams page`
            });
        } catch (error) {
            console.warn(`[generate_naia_njcaa_school_sports_sql] Skipping NAIA sport "${sportCode}" (${error.message})`);
            continue;
        }

        const teamsDataUrl = extractTeamsDataUrl(html);
        if (!teamsDataUrl) continue;

        let payload;
        try {
            payload = await fetchJsonWithRetry(teamsDataUrl, {
                label: `NAIA teamsData ${sportCode}`
            });
        } catch (error) {
            console.warn(`[generate_naia_njcaa_school_sports_sql] Skipping NAIA teamsData "${sportCode}" (${error.message})`);
            continue;
        }

        const teams = Array.isArray(payload?.teams) ? payload.teams : [];
        for (const team of teams) {
            const schoolName = cleanSchoolName(team?.name || '');
            if (!schoolName) continue;
            outputRows.push({
                source: 'naia',
                division: 'naia',
                sportCode,
                sport,
                schoolName
            });
        }
    }

    return dedupeRows(outputRows);
}

async function fetchNjcaaRows() {
    const indexHtml = await fetchTextWithRetry(NJCAA_INDEX_URL, {
        label: 'NJCAA index'
    });
    const sportCodes = extractNjcaaSportCodes(indexHtml);
    if (sportCodes.length === 0) {
        throw new Error('Unable to discover NJCAA sport codes.');
    }

    const outputRows = [];
    for (const sportCode of sportCodes) {
        const sport = normalizeSportLabel(sportCode);
        if (!sport) continue;

        const pageUrl = `https://njcaastats.prestosports.com/sports/${sportCode}/teams-page`;
        let html;
        try {
            html = await fetchTextWithRetry(pageUrl, {
                label: `NJCAA ${sportCode} teams page`
            });
        } catch (error) {
            console.warn(`[generate_naia_njcaa_school_sports_sql] Skipping NJCAA sport "${sportCode}" (${error.message})`);
            continue;
        }

        const schoolNames = extractNjcaaSchoolNamesFromTeamsPage(html);
        for (const schoolName of schoolNames) {
            outputRows.push({
                source: 'njcaa',
                division: 'juco',
                sportCode,
                sport,
                schoolName
            });
        }
    }

    return dedupeRows(outputRows);
}

function buildSql(rows, aliasMappings) {
    const statements = [
        '-- Generated from official NAIA + NJCAA stats team pages',
        '-- Sources:',
        '-- NAIA: https://naiastats.prestosports.com/sports/<code>/<season>/teams',
        '-- NJCAA: https://njcaastats.prestosports.com/sports/<code>/teams-page',
        '-- Safe to re-run',
        'BEGIN;',
        'CREATE EXTENSION IF NOT EXISTS pg_trgm;',
        `CREATE TEMP TABLE tmp_association_school_sports (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    division TEXT NOT NULL,
    sport_code TEXT NOT NULL,
    sport TEXT NOT NULL,
    school_name TEXT NOT NULL
) ON COMMIT DROP;`
    ];

    for (const batchRows of chunk(rows, BATCH_SIZE)) {
        statements.push(buildInsertStatement(batchRows));
    }

    statements.push(`
CREATE TEMP TABLE tmp_school_name_aliases (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NULL,
    division TEXT NULL,
    alias_name TEXT NOT NULL,
    canonical_name TEXT NOT NULL
) ON COMMIT DROP;`);

    if (Array.isArray(aliasMappings) && aliasMappings.length > 0) {
        for (const batchRows of chunk(aliasMappings, BATCH_SIZE)) {
            statements.push(buildAliasInsertStatement(batchRows));
        }
    }

    statements.push(`
CREATE TEMP TABLE tmp_resolved_school_sports (
    source TEXT NOT NULL,
    division TEXT NOT NULL,
    sport_code TEXT NOT NULL,
    sport TEXT NOT NULL,
    school_name TEXT NOT NULL,
    school_id UUID NOT NULL,
    match_type TEXT NOT NULL,
    similarity_score NUMERIC(6,4) NULL
) ON COMMIT DROP;`);

    statements.push(`
CREATE OR REPLACE FUNCTION pg_temp.norm_school_name(raw TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT trim(
        regexp_replace(
            regexp_replace(
                lower(COALESCE(raw, '')),
                '\\s*\\([^\\)]*\\)\\s*',
                ' ',
                'g'
            ),
            '[^a-z0-9]+',
            ' ',
            'g'
        )
    );
$$;`);

    statements.push(`
CREATE OR REPLACE FUNCTION pg_temp.norm_school_name_expanded(raw TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT trim(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                pg_temp.norm_school_name(raw),
                                '\\mste\\M',
                                'sainte',
                                'g'
                            ),
                            '\\mst\\M',
                            'saint',
                            'g'
                        ),
                        '\\mmt\\M',
                        'mount',
                        'g'
                    ),
                    '\\mft\\M',
                    'fort',
                    'g'
                ),
                '\\muniv\\M',
                'university',
                'g'
            ),
            '\\s+',
            ' ',
            'g'
        )
    );
$$;`);

    statements.push(`
CREATE OR REPLACE FUNCTION pg_temp.norm_school_name_loose(raw TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT trim(
        regexp_replace(
            pg_temp.norm_school_name_expanded(raw),
            '\\m(university|college|community|technical|institute|school|campus|state|the|of|and|at|junior|branch|county|city|district|main)\\M',
            ' ',
            'g'
        )
    );
$$;`);

    statements.push(`
INSERT INTO tmp_resolved_school_sports (
    source, division, sport_code, sport, school_name, school_id, match_type, similarity_score
)
SELECT
    t.source,
    t.division,
    t.sport_code,
    t.sport,
    t.school_name,
    s.id,
    'exact_norm' AS match_type,
    1.0 AS similarity_score
FROM tmp_association_school_sports t
JOIN public.schools s
    ON s.division = t.division
   AND pg_temp.norm_school_name(s.name) = pg_temp.norm_school_name(t.school_name);`);

    statements.push(`
WITH unresolved AS (
    SELECT t.*
    FROM tmp_association_school_sports t
    LEFT JOIN tmp_resolved_school_sports r
        ON r.source = t.source
       AND r.division = t.division
       AND r.sport = t.sport
       AND r.school_name = t.school_name
    WHERE r.school_id IS NULL
),
candidate_matches AS (
    SELECT
        u.source,
        u.division,
        u.sport_code,
        u.sport,
        u.school_name,
        s.id AS school_id,
        row_number() OVER (
            PARTITION BY u.source, u.division, u.sport, u.school_name
            ORDER BY s.id
        ) AS rank_num,
        count(*) OVER (
            PARTITION BY u.source, u.division, u.sport, u.school_name
        ) AS match_count
    FROM unresolved u
    JOIN public.schools s
        ON s.division = u.division
       AND pg_temp.norm_school_name_expanded(s.name) = pg_temp.norm_school_name_expanded(u.school_name)
)
INSERT INTO tmp_resolved_school_sports (
    source, division, sport_code, sport, school_name, school_id, match_type, similarity_score
)
SELECT
    source,
    division,
    sport_code,
    sport,
    school_name,
    school_id,
    'exact_expanded' AS match_type,
    1.0 AS similarity_score
FROM candidate_matches
WHERE rank_num = 1
  AND match_count = 1;`);

    statements.push(`
WITH unresolved AS (
    SELECT t.*
    FROM tmp_association_school_sports t
    LEFT JOIN tmp_resolved_school_sports r
        ON r.source = t.source
       AND r.division = t.division
       AND r.sport = t.sport
       AND r.school_name = t.school_name
    WHERE r.school_id IS NULL
),
alias_matches AS (
    SELECT
        u.source,
        u.division,
        u.sport_code,
        u.sport,
        u.school_name,
        s.id AS school_id,
        row_number() OVER (
            PARTITION BY u.source, u.division, u.sport, u.school_name
            ORDER BY s.id
        ) AS rank_num,
        count(*) OVER (
            PARTITION BY u.source, u.division, u.sport, u.school_name
        ) AS match_count
    FROM unresolved u
    JOIN tmp_school_name_aliases aliases
        ON (aliases.source IS NULL OR aliases.source = u.source)
       AND (aliases.division IS NULL OR aliases.division = u.division)
       AND pg_temp.norm_school_name_expanded(aliases.alias_name) = pg_temp.norm_school_name_expanded(u.school_name)
    JOIN public.schools s
        ON s.division = u.division
       AND pg_temp.norm_school_name_expanded(s.name) = pg_temp.norm_school_name_expanded(aliases.canonical_name)
)
INSERT INTO tmp_resolved_school_sports (
    source, division, sport_code, sport, school_name, school_id, match_type, similarity_score
)
SELECT
    source,
    division,
    sport_code,
    sport,
    school_name,
    school_id,
    'exact_alias' AS match_type,
    1.0 AS similarity_score
FROM alias_matches
WHERE rank_num = 1
  AND match_count = 1;`);

    statements.push(`
WITH unresolved AS (
    SELECT t.*
    FROM tmp_association_school_sports t
    LEFT JOIN tmp_resolved_school_sports r
        ON r.source = t.source
       AND r.division = t.division
       AND r.sport = t.sport
       AND r.school_name = t.school_name
    WHERE r.school_id IS NULL
)
INSERT INTO tmp_resolved_school_sports (
    source, division, sport_code, sport, school_name, school_id, match_type, similarity_score
)
SELECT
    u.source,
    u.division,
    u.sport_code,
    u.sport,
    u.school_name,
    s.id,
    'exact_loose' AS match_type,
    1.0 AS similarity_score
FROM unresolved u
JOIN public.schools s
    ON s.division = u.division
   AND pg_temp.norm_school_name_loose(s.name) = pg_temp.norm_school_name_loose(u.school_name);`);

    statements.push(`
WITH unresolved AS (
    SELECT t.*
    FROM tmp_association_school_sports t
    LEFT JOIN tmp_resolved_school_sports r
        ON r.source = t.source
       AND r.division = t.division
       AND r.sport = t.sport
       AND r.school_name = t.school_name
    WHERE r.school_id IS NULL
),
candidate_scores AS (
    SELECT
        u.id AS unresolved_id,
        u.source,
        u.division,
        u.sport_code,
        u.sport,
        u.school_name,
        s.id AS school_id,
        GREATEST(
            similarity(pg_temp.norm_school_name_expanded(s.name), pg_temp.norm_school_name_expanded(u.school_name)),
            similarity(pg_temp.norm_school_name_loose(s.name), pg_temp.norm_school_name_loose(u.school_name)),
            word_similarity(pg_temp.norm_school_name_expanded(s.name), pg_temp.norm_school_name_expanded(u.school_name))
        ) AS sim
    FROM unresolved u
    JOIN public.schools s
        ON s.division = u.division
),
ranked AS (
    SELECT
        c.*,
        row_number() OVER (PARTITION BY c.unresolved_id ORDER BY c.sim DESC, c.school_id) AS rank_num,
        lead(c.sim) OVER (PARTITION BY c.unresolved_id ORDER BY c.sim DESC, c.school_id) AS second_best_sim
    FROM candidate_scores c
)
INSERT INTO tmp_resolved_school_sports (
    source, division, sport_code, sport, school_name, school_id, match_type, similarity_score
)
SELECT
    source,
    division,
    sport_code,
    sport,
    school_name,
    school_id,
    'fuzzy_norm' AS match_type,
    sim
FROM ranked
WHERE rank_num = 1
  AND (
      (division = 'naia' AND sim >= 0.80)
      OR (division = 'juco' AND sim >= 0.90)
  )
  AND (
      second_best_sim IS NULL
      OR (division = 'naia' AND sim - second_best_sim >= 0.02)
      OR (division = 'juco' AND sim - second_best_sim >= 0.03)
  );`);

    statements.push(`
INSERT INTO public.school_sports (school_id, sport)
SELECT DISTINCT
    school_id,
    lower(trim(sport))
FROM tmp_resolved_school_sports
WHERE trim(sport) <> ''
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

    statements.push(`
-- Verification output for import logs
SELECT
    source,
    division,
    COUNT(*) AS source_rows
FROM tmp_association_school_sports
GROUP BY source, division
ORDER BY source, division;

SELECT
    source,
    division,
    match_type,
    COUNT(*) AS matched_rows
FROM tmp_resolved_school_sports
GROUP BY source, division, match_type
ORDER BY source, division, match_type;

SELECT
    t.source,
    t.division,
    COUNT(*) AS unmatched_rows
FROM tmp_association_school_sports t
LEFT JOIN tmp_resolved_school_sports r
    ON r.source = t.source
   AND r.division = t.division
   AND r.sport = t.sport
   AND r.school_name = t.school_name
WHERE r.school_id IS NULL
GROUP BY t.source, t.division
ORDER BY t.source, t.division;

WITH unresolved AS (
    SELECT t.*
    FROM tmp_association_school_sports t
    LEFT JOIN tmp_resolved_school_sports r
        ON r.source = t.source
       AND r.division = t.division
       AND r.sport = t.sport
       AND r.school_name = t.school_name
    WHERE r.school_id IS NULL
),
candidate_scores AS (
    SELECT
        u.source,
        u.division,
        u.school_name,
        s.name AS suggested_school_name,
        GREATEST(
            similarity(pg_temp.norm_school_name_expanded(s.name), pg_temp.norm_school_name_expanded(u.school_name)),
            similarity(pg_temp.norm_school_name_loose(s.name), pg_temp.norm_school_name_loose(u.school_name)),
            word_similarity(pg_temp.norm_school_name_expanded(s.name), pg_temp.norm_school_name_expanded(u.school_name))
        ) AS sim
    FROM unresolved u
    JOIN public.schools s
        ON s.division = u.division
),
ranked AS (
    SELECT
        c.*,
        row_number() OVER (
            PARTITION BY c.source, c.division, c.school_name
            ORDER BY c.sim DESC, c.suggested_school_name
        ) AS rank_num
    FROM candidate_scores c
)
SELECT
    source,
    division,
    school_name,
    suggested_school_name,
    sim AS suggested_similarity
FROM ranked
WHERE rank_num = 1
ORDER BY source, division, sim DESC, school_name
LIMIT 150;
`);

    statements.push('COMMIT;');

    return `${statements.join('\n\n')}\n`;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const aliasMappings = await loadAliasMappings(args.aliasMap);

    const [naiaRows, njcaaRows] = await Promise.all([
        fetchNaiaRows(),
        fetchNjcaaRows()
    ]);

    const allRows = dedupeRows([...naiaRows, ...njcaaRows]).sort((left, right) => {
        if (left.division !== right.division) return left.division.localeCompare(right.division);
        if (left.sport !== right.sport) return left.sport.localeCompare(right.sport);
        return left.schoolName.localeCompare(right.schoolName);
    });

    const outputSql = buildSql(allRows, aliasMappings);
    const outputPath = path.resolve(process.cwd(), args.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, outputSql, 'utf8');

    const bySource = allRows.reduce((accumulator, row) => {
        const key = `${row.source}:${row.division}`;
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});

    console.log(`[generate_naia_njcaa_school_sports_sql] NAIA rows: ${naiaRows.length}`);
    console.log(`[generate_naia_njcaa_school_sports_sql] NJCAA rows: ${njcaaRows.length}`);
    console.log(`[generate_naia_njcaa_school_sports_sql] Total deduped rows: ${allRows.length}`);
    console.log(`[generate_naia_njcaa_school_sports_sql] Alias mappings loaded: ${aliasMappings.length}`);
    console.log(`[generate_naia_njcaa_school_sports_sql] Counts by source/division: ${JSON.stringify(bySource)}`);
    console.log(`[generate_naia_njcaa_school_sports_sql] Wrote SQL: ${outputPath}`);
}

main().catch((error) => {
    console.error('[generate_naia_njcaa_school_sports_sql] Failed:', error.message);
    process.exitCode = 1;
});
