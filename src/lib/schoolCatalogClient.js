import { supabase } from './supabase';

const SCHOOL_SELECT_COLUMNS = 'id, name, city, state, division, conference';
const DEFAULT_SEARCH_LIMIT = 12;
const DEFAULT_LIST_LIMIT = 250;

function relationIsMissing(errorMessage = '', relationName = '') {
    const normalized = String(errorMessage || '').toLowerCase();
    const relation = String(relationName || '').toLowerCase();
    return normalized.includes(`table '${relation}'`)
        || normalized.includes(`relation "${relation}"`)
        || normalized.includes(`'${relation}' in the schema cache`);
}

function extractMissingColumnName(errorMessage = '') {
    const match = String(errorMessage || '').match(/Could not find the '([^']+)' column/i);
    return match?.[1] || null;
}

function normalizeSportFilter(value) {
    return String(value || '').trim().toLowerCase() || '';
}

function normalizeSchoolListPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function toDivisionFilters(divisionFilter) {
    const normalized = String(divisionFilter || '').trim().toLowerCase();
    if (!normalized || normalized === 'all') return [];
    return [normalized];
}

function buildSchoolCatalogSearchParams({
    query = '',
    divisionFilter = 'all',
    limit = DEFAULT_SEARCH_LIMIT,
    offset = 0,
    state = '',
    sport = ''
}) {
    const params = new URLSearchParams();
    const trimmedQuery = String(query || '').trim();
    const normalizedState = String(state || '').trim().toUpperCase();
    const normalizedSport = String(sport || '').trim().toLowerCase();
    const divisions = toDivisionFilters(divisionFilter);

    if (trimmedQuery) params.set('query', trimmedQuery);
    if (divisions.length > 0) params.set('divisions', divisions.join(','));
    if (normalizedState) params.set('state', normalizedState);
    if (normalizedSport) params.set('sport', normalizedSport);
    params.set('limit', String(Math.max(1, limit)));
    params.set('offset', String(Math.max(0, offset)));

    return params;
}

async function searchSchoolsViaSupabase({ query, divisionFilter, limit }) {
    let queryBuilder = supabase
        .from('schools')
        .select(SCHOOL_SELECT_COLUMNS)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(limit);

    if (divisionFilter !== 'all') {
        queryBuilder = queryBuilder.eq('division', divisionFilter);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
}

async function fetchSchoolIdsBySportViaSupabase(sport) {
    const normalizedSport = normalizeSportFilter(sport);
    if (!normalizedSport) return { schoolIds: null, relationAvailable: false };

    const { data, error } = await supabase
        .from('school_sports')
        .select('school_id')
        .eq('sport', normalizedSport);

    if (error) {
        if (relationIsMissing(error.message, 'school_sports')) {
            return { schoolIds: null, relationAvailable: false };
        }
        throw error;
    }

    const schoolIds = Array.from(new Set((data || []).map((row) => row.school_id).filter(Boolean)));
    return { schoolIds, relationAvailable: true };
}

async function searchSchoolsViaSupabaseWithSport({ query, divisionFilter, limit, sport }) {
    const normalizedSport = normalizeSportFilter(sport);
    if (!normalizedSport) {
        return searchSchoolsViaSupabase({ query, divisionFilter, limit });
    }

    let queryBuilder = supabase
        .from('schools')
        .select(SCHOOL_SELECT_COLUMNS)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(limit);

    if (divisionFilter !== 'all') {
        queryBuilder = queryBuilder.eq('division', divisionFilter);
    }

    queryBuilder = queryBuilder.contains('sports_offered', [normalizedSport]);

    const result = await queryBuilder;
    if (!result.error) {
        return result.data || [];
    }

    if (extractMissingColumnName(result.error.message) !== 'sports_offered') {
        throw result.error;
    }

    const sportLookup = await fetchSchoolIdsBySportViaSupabase(normalizedSport);
    if (!sportLookup.relationAvailable) {
        throw result.error;
    }
    if (sportLookup.schoolIds.length === 0) {
        return [];
    }

    let fallbackQuery = supabase
        .from('schools')
        .select(SCHOOL_SELECT_COLUMNS)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(limit)
        .in('id', sportLookup.schoolIds);

    if (divisionFilter !== 'all') {
        fallbackQuery = fallbackQuery.eq('division', divisionFilter);
    }

    const { data, error } = await fallbackQuery;
    if (error) throw error;
    return data || [];
}

async function listSchoolsViaSupabase({ limit }) {
    const { data, error } = await supabase
        .from('schools')
        .select(SCHOOL_SELECT_COLUMNS)
        .order('name', { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function fetchSchoolCatalog({
    query = '',
    divisionFilter = 'all',
    limit = DEFAULT_SEARCH_LIMIT,
    offset = 0,
    state = '',
    sport = ''
} = {}) {
    const params = buildSchoolCatalogSearchParams({
        query,
        divisionFilter,
        limit,
        offset,
        state,
        sport
    });

    const response = await fetch(`/v1/schools?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`School catalog API request failed (${response.status}).`);
    }

    const payload = await response.json();
    return {
        data: normalizeSchoolListPayload(payload),
        pagination: payload?.pagination || null,
        warnings: Array.isArray(payload?.warnings) ? payload.warnings : []
    };
}

export async function searchSchoolsWithFallback({
    query,
    divisionFilter = 'all',
    limit = DEFAULT_SEARCH_LIMIT,
    sport = ''
} = {}) {
    const trimmedQuery = String(query || '').trim();
    if (!trimmedQuery) return [];

    try {
        const result = await fetchSchoolCatalog({
            query: trimmedQuery,
            divisionFilter,
            limit,
            sport
        });
        if (Array.isArray(result.data) && result.data.length > 0) {
            return result.data;
        }

        // API can return empty rows in local/dev setups when server-side auth context is missing.
        // Fall back to direct client query before concluding "no results".
        return searchSchoolsViaSupabaseWithSport({
            query: trimmedQuery,
            divisionFilter,
            limit,
            sport
        });
    } catch {
        return searchSchoolsViaSupabaseWithSport({
            query: trimmedQuery,
            divisionFilter,
            limit,
            sport
        });
    }
}

export async function listSchoolsWithFallback({
    limit = DEFAULT_LIST_LIMIT
} = {}) {
    try {
        const result = await fetchSchoolCatalog({ limit });
        if (Array.isArray(result.data) && result.data.length > 0) {
            return result.data;
        }

        return listSchoolsViaSupabase({ limit });
    } catch {
        return listSchoolsViaSupabase({ limit });
    }
}
