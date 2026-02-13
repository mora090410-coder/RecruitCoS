import { supabase } from './supabase';

const SCHOOL_SELECT_COLUMNS = 'id, name, city, state, division, conference';
const DEFAULT_SEARCH_LIMIT = 12;
const DEFAULT_LIST_LIMIT = 250;

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
    limit = DEFAULT_SEARCH_LIMIT
} = {}) {
    const trimmedQuery = String(query || '').trim();
    if (!trimmedQuery) return [];

    try {
        const result = await fetchSchoolCatalog({
            query: trimmedQuery,
            divisionFilter,
            limit
        });
        return result.data;
    } catch {
        return searchSchoolsViaSupabase({
            query: trimmedQuery,
            divisionFilter,
            limit
        });
    }
}

export async function listSchoolsWithFallback({
    limit = DEFAULT_LIST_LIMIT
} = {}) {
    try {
        const result = await fetchSchoolCatalog({ limit });
        return result.data;
    } catch {
        return listSchoolsViaSupabase({ limit });
    }
}
