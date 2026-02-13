import { supabase } from '../lib/supabase'

const VALID_DIVISIONS = new Set(['d1', 'd2', 'd3', 'naia', 'juco'])
const NCAA_DIVISION_SET = new Set(['d1', 'd2', 'd3'])
const NCAA_MEMBER_LIST_URL = 'https://web3.ncaa.org/directory/api/directory/memberList?type=12'
const CORE_SELECT_COLUMNS = ['id', 'name', 'state', 'division']
const OPTIONAL_SELECT_COLUMNS = [
    'city',
    'conference',
    'tier',
    'enrollment',
    'cost_of_attendance',
    'sports_offered'
]
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
}

function extractMissingColumnName(errorMessage = '') {
    const match = errorMessage.match(/Could not find the '([^']+)' column/i)
    return match?.[1] || null
}

function relationIsMissing(errorMessage = '', relationName = '') {
    const normalized = String(errorMessage || '').toLowerCase()
    const relation = String(relationName || '').toLowerCase()
    return normalized.includes(`table '${relation}'`)
        || normalized.includes(`relation "${relation}"`)
        || normalized.includes(`'${relation}' in the schema cache`)
}

function parseInteger(rawValue, fallback) {
    const parsed = Number.parseInt(String(rawValue || ''), 10)
    if (!Number.isFinite(parsed)) return fallback
    return parsed
}

function normalizeDivision(value) {
    const normalized = String(value || '').trim().toLowerCase()
    return VALID_DIVISIONS.has(normalized) ? normalized : null
}

function normalizeSport(value) {
    return String(value || '').trim().toLowerCase() || null
}

function parseCsvValues(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

function normalizeSportsList(...lists) {
    const values = lists
        .flat()
        .map((sport) => normalizeSport(sport))
        .filter(Boolean)
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right))
}

function buildSchoolDedupKey(name, state) {
    return `${String(name || '').trim().toLowerCase()}|${String(state || '').trim().toUpperCase()}`
}

function mapNcaaDivision(value) {
    const normalized = String(value || '').trim().toLowerCase()
    if (normalized.includes('division i') && !normalized.includes('division ii') && !normalized.includes('division iii')) {
        return 'd1'
    }
    if (normalized.includes('division ii')) return 'd2'
    if (normalized.includes('division iii')) return 'd3'
    return null
}

function canUseNcaaDirectory(divisionFilters) {
    if (!Array.isArray(divisionFilters) || divisionFilters.length === 0) return true
    return divisionFilters.some((division) => NCAA_DIVISION_SET.has(division))
}

function mapNcaaMemberRow(row) {
    const division = mapNcaaDivision(row?.division)
    if (!division) return null
    const state = String(row?.stateAddr || row?.state || '').trim().toUpperCase()
    return {
        id: row?.orgId ? `ncaa:${row.orgId}` : `ncaa:${buildSchoolDedupKey(row?.nameOfficial || row?.name, state)}`,
        name: String(row?.nameOfficial || row?.name || '').trim(),
        city: String(row?.city || '').trim(),
        state,
        division,
        conference: String(row?.conference || '').trim() || null,
        tier: null,
        enrollment: null,
        cost_of_attendance: null,
        sports: []
    }
}

async function fetchNcaaDirectoryMatches({
    searchQuery,
    divisionFilters,
    limit
}) {
    if (!searchQuery || searchQuery.length < 3) return []
    if (!canUseNcaaDirectory(divisionFilters)) return []

    const response = await fetch(NCAA_MEMBER_LIST_URL, {
        headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
        throw new Error(`NCAA directory request failed (${response.status}).`)
    }

    const rows = await response.json()
    if (!Array.isArray(rows)) return []

    const searchTerm = searchQuery.toLowerCase()
    const allowedDivisions = divisionFilters.filter((division) => NCAA_DIVISION_SET.has(division))

    const mapped = rows
        .map(mapNcaaMemberRow)
        .filter(Boolean)
        .filter((school) => {
            if (allowedDivisions.length > 0 && !allowedDivisions.includes(school.division)) return false
            return school.name.toLowerCase().includes(searchTerm)
        })
        .sort((left, right) => left.name.localeCompare(right.name))

    return mapped.slice(0, Math.max(1, limit))
}

async function runSchoolsQuery({
    supabaseClient,
    searchQuery,
    divisionFilters,
    stateFilter,
    sportFilter,
    schoolIds,
    offset,
    limit
}) {
    if (Array.isArray(schoolIds) && schoolIds.length === 0) {
        return {
            rows: [],
            count: 0,
            selectedColumns: [...CORE_SELECT_COLUMNS],
            usedSportsOfferedFilter: false
        }
    }

    let selectedColumns = [...CORE_SELECT_COLUMNS, ...OPTIONAL_SELECT_COLUMNS]
    let usedSportsOfferedFilter = Boolean(sportFilter)

    while (selectedColumns.length >= CORE_SELECT_COLUMNS.length) {
        let queryBuilder = supabaseClient
            .from('schools')
            .select(selectedColumns.join(', '), { count: 'exact' })
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1)

        if (searchQuery) {
            queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`)
        }

        if (divisionFilters.length > 0) {
            queryBuilder = queryBuilder.in('division', divisionFilters)
        }

        if (stateFilter) {
            queryBuilder = queryBuilder.eq('state', stateFilter)
        }

        if (Array.isArray(schoolIds) && schoolIds.length > 0) {
            queryBuilder = queryBuilder.in('id', schoolIds)
        }

        if (sportFilter && usedSportsOfferedFilter) {
            queryBuilder = queryBuilder.contains('sports_offered', [sportFilter])
        }

        const { data, error, count } = await queryBuilder
        if (!error) {
            return {
                rows: data || [],
                count: count || 0,
                selectedColumns,
                usedSportsOfferedFilter
            }
        }

        const missingColumn = extractMissingColumnName(error.message)
        if (missingColumn && selectedColumns.includes(missingColumn)) {
            selectedColumns = selectedColumns.filter((column) => column !== missingColumn)
            continue
        }

        if (missingColumn === 'sports_offered' && usedSportsOfferedFilter) {
            usedSportsOfferedFilter = false
            continue
        }

        return { error }
    }

    return {
        error: new Error('Unable to determine school table columns for search query.')
    }
}

async function fetchSportSchoolIds({ supabaseClient, sport }) {
    const normalizedSport = normalizeSport(sport)
    if (!normalizedSport) return { schoolIds: null, relationAvailable: false }

    const { data, error } = await supabaseClient
        .from('school_sports')
        .select('school_id')
        .eq('sport', normalizedSport)

    if (error) {
        if (relationIsMissing(error.message, 'school_sports')) {
            return { schoolIds: null, relationAvailable: false }
        }
        throw error
    }

    const uniqueSchoolIds = Array.from(
        new Set((data || []).map((row) => row.school_id).filter(Boolean))
    )
    return { schoolIds: uniqueSchoolIds, relationAvailable: true }
}

async function fetchSchoolSportsMap({ supabaseClient, schoolIds }) {
    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
        return { sportsBySchoolId: new Map(), relationAvailable: true }
    }

    const { data, error } = await supabaseClient
        .from('school_sports')
        .select('school_id, sport')
        .in('school_id', schoolIds)

    if (error) {
        if (relationIsMissing(error.message, 'school_sports')) {
            return { sportsBySchoolId: new Map(), relationAvailable: false }
        }
        throw error
    }

    const sportsBySchoolId = new Map()
    for (const row of data || []) {
        const schoolId = row.school_id
        const sport = normalizeSport(row.sport)
        if (!schoolId || !sport) continue
        const current = sportsBySchoolId.get(schoolId) || []
        current.push(sport)
        sportsBySchoolId.set(schoolId, current)
    }

    for (const [schoolId, sports] of sportsBySchoolId.entries()) {
        sportsBySchoolId.set(schoolId, normalizeSportsList(sports))
    }

    return { sportsBySchoolId, relationAvailable: true }
}

function mapSchoolRow(row, sportsBySchoolId) {
    const sportsFromArray = Array.isArray(row?.sports_offered) ? row.sports_offered : []
    const sportsFromMap = sportsBySchoolId.get(row?.id) || []
    const sports = normalizeSportsList(sportsFromArray, sportsFromMap)

    return {
        id: row?.id || null,
        name: row?.name || '',
        city: row?.city || '',
        state: row?.state || '',
        division: normalizeDivision(row?.division) || '',
        conference: row?.conference || null,
        tier: row?.tier || null,
        enrollment: Number.isFinite(Number(row?.enrollment)) ? Number(row.enrollment) : null,
        cost_of_attendance: Number.isFinite(Number(row?.cost_of_attendance))
            ? Number(row.cost_of_attendance)
            : null,
        sports
    }
}

async function listSchools({ req, res, supabaseClient, legacyShape = false }) {
    const requestUrl = new URL(req.url, 'http://localhost')
    const searchQuery = String(requestUrl.searchParams.get('query') || requestUrl.searchParams.get('q') || '').trim()
    const rawDivisions = requestUrl.searchParams.get('divisions')
    const legacyDivision = requestUrl.searchParams.get('division')
    const divisionFilters = parseCsvValues(rawDivisions || legacyDivision)
        .map(normalizeDivision)
        .filter(Boolean)
    const stateFilter = String(requestUrl.searchParams.get('state') || '')
        .trim()
        .toUpperCase() || null
    const sportFilter = normalizeSport(requestUrl.searchParams.get('sport'))
    const offset = Math.max(0, parseInteger(requestUrl.searchParams.get('offset'), 0))
    const requestedLimit = parseInteger(requestUrl.searchParams.get('limit'), DEFAULT_LIMIT)
    const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit))
    const warnings = []

    let schoolIdsFilter = null
    let schoolQuery = await runSchoolsQuery({
        supabaseClient,
        searchQuery,
        divisionFilters,
        stateFilter,
        sportFilter,
        schoolIds: schoolIdsFilter,
        offset,
        limit
    })

    if (schoolQuery.error) {
        sendJson(res, 500, {
            error: 'SCHOOL_SEARCH_FAILED',
            message: schoolQuery.error.message || 'Unable to search schools right now.'
        })
        return
    }

    if (sportFilter && !schoolQuery.usedSportsOfferedFilter) {
        const sportSchoolIdsResult = await fetchSportSchoolIds({ supabaseClient, sport: sportFilter })
        if (sportSchoolIdsResult.relationAvailable) {
            schoolIdsFilter = sportSchoolIdsResult.schoolIds || []
            schoolQuery = await runSchoolsQuery({
                supabaseClient,
                searchQuery,
                divisionFilters,
                stateFilter,
                sportFilter: null,
                schoolIds: schoolIdsFilter,
                offset,
                limit
            })

            if (schoolQuery.error) {
                sendJson(res, 500, {
                    error: 'SCHOOL_SEARCH_FAILED',
                    message: schoolQuery.error.message || 'Unable to search schools right now.'
                })
                return
            }
        } else {
            warnings.push('Sport filtering is unavailable because school_sports is not present.')
        }
    }

    const rows = schoolQuery.rows || []
    const schoolIds = rows.map((row) => row.id).filter(Boolean)
    const schoolSportsResult = await fetchSchoolSportsMap({ supabaseClient, schoolIds })
    if (!schoolSportsResult.relationAvailable) {
        warnings.push('Sports metadata is limited to schools.sports_offered until school_sports is available.')
    }

    let mappedSchools = rows.map((row) => mapSchoolRow(row, schoolSportsResult.sportsBySchoolId))
    const canFilterInMemoryBySport = schoolQuery.selectedColumns.includes('sports_offered')
        || schoolSportsResult.relationAvailable
    if (sportFilter && schoolIdsFilter === null && !schoolQuery.usedSportsOfferedFilter && canFilterInMemoryBySport) {
        mappedSchools = mappedSchools.filter((school) => school.sports.includes(sportFilter))
    }

    if (offset === 0 && !sportFilter) {
        try {
            const ncaaMatches = await fetchNcaaDirectoryMatches({
                searchQuery,
                divisionFilters,
                limit
            })

            if (ncaaMatches.length > 0) {
                const existingKeys = new Set(
                    mappedSchools.map((school) => buildSchoolDedupKey(school.name, school.state))
                )
                for (const school of ncaaMatches) {
                    const key = buildSchoolDedupKey(school.name, school.state)
                    if (existingKeys.has(key)) continue
                    mappedSchools.push(school)
                    existingKeys.add(key)
                }
                mappedSchools = mappedSchools
                    .sort((left, right) => left.name.localeCompare(right.name))
                    .slice(0, limit)

                warnings.push('Some results are live NCAA directory matches and may not be persisted in your local catalog yet.')
            }
        } catch (directoryError) {
            warnings.push(`NCAA live lookup unavailable: ${directoryError.message}`)
        }
    }

    if (legacyShape) {
        sendJson(res, 200, {
            count: Math.max(schoolQuery.count || 0, mappedSchools.length),
            data: mappedSchools
        })
        return
    }

    sendJson(res, 200, {
        data: mappedSchools,
        pagination: {
            offset,
            limit,
            count: Math.max(schoolQuery.count || 0, mappedSchools.length)
        },
        filters: {
            query: searchQuery || null,
            divisions: divisionFilters,
            state: stateFilter,
            sport: sportFilter
        },
        warnings
    })
}

async function getSchoolById({ res, supabaseClient, schoolId }) {
    const selectedColumns = [...CORE_SELECT_COLUMNS, ...OPTIONAL_SELECT_COLUMNS]
    let fields = [...selectedColumns]

    while (fields.length >= CORE_SELECT_COLUMNS.length) {
        const { data, error } = await supabaseClient
            .from('schools')
            .select(fields.join(', '))
            .eq('id', schoolId)
            .maybeSingle()

        if (!error) {
            if (!data) {
                sendJson(res, 404, {
                    error: 'SCHOOL_NOT_FOUND',
                    message: `No school found for id "${schoolId}".`
                })
                return
            }

            const schoolSportsResult = await fetchSchoolSportsMap({
                supabaseClient,
                schoolIds: [schoolId]
            })

            const school = mapSchoolRow(data, schoolSportsResult.sportsBySchoolId)
            sendJson(res, 200, {
                data: school,
                warnings: schoolSportsResult.relationAvailable
                    ? []
                    : ['Sports metadata is limited to schools.sports_offered until school_sports is available.']
            })
            return
        }

        const missingColumn = extractMissingColumnName(error.message)
        if (missingColumn && fields.includes(missingColumn)) {
            fields = fields.filter((column) => column !== missingColumn)
            continue
        }

        sendJson(res, 500, {
            error: 'SCHOOL_LOOKUP_FAILED',
            message: error.message || 'Unable to look up school right now.'
        })
        return
    }

    sendJson(res, 500, {
        error: 'SCHOOL_LOOKUP_FAILED',
        message: 'No valid school column set is available.'
    })
}

async function listSports({ res, supabaseClient }) {
    const warnings = []
    const sports = new Set()

    const { data: schoolSportsRows, error: schoolSportsError } = await supabaseClient
        .from('school_sports')
        .select('sport')

    if (schoolSportsError) {
        if (!relationIsMissing(schoolSportsError.message, 'school_sports')) {
            sendJson(res, 500, {
                error: 'SPORT_LIST_FAILED',
                message: schoolSportsError.message || 'Unable to list sports right now.'
            })
            return
        }

        warnings.push('school_sports is not present; sports list is derived from schools.sports_offered.')
    } else {
        for (const row of schoolSportsRows || []) {
            const sport = normalizeSport(row.sport)
            if (sport) sports.add(sport)
        }
    }

    const { data: rows, error: schoolsError } = await supabaseClient
        .from('schools')
        .select('sports_offered')
        .limit(5000)

    if (schoolsError && !extractMissingColumnName(schoolsError.message)) {
        sendJson(res, 500, {
            error: 'SPORT_LIST_FAILED',
            message: schoolsError.message || 'Unable to list sports right now.'
        })
        return
    }

    for (const row of rows || []) {
        for (const sport of normalizeSportsList(row.sports_offered || [])) {
            sports.add(sport)
        }
    }

    sendJson(res, 200, {
        data: Array.from(sports).sort((left, right) => left.localeCompare(right)),
        warnings
    })
}

export async function handleSchoolCatalogRequest({ req, res, supabaseClient = supabase }) {
    if (req.method !== 'GET') {
        sendJson(res, 405, {
            error: 'METHOD_NOT_ALLOWED',
            message: 'Only GET is supported for school catalog routes.'
        })
        return
    }

    const requestUrl = new URL(req.url, 'http://localhost')
    const pathname = requestUrl.pathname

    if (pathname === '/v1/schools') {
        await listSchools({ req, res, supabaseClient, legacyShape: false })
        return
    }

    if (pathname.startsWith('/v1/schools/')) {
        const schoolId = decodeURIComponent(pathname.replace('/v1/schools/', '')).trim()
        if (!schoolId) {
            sendJson(res, 400, {
                error: 'INVALID_SCHOOL_ID',
                message: 'A school id is required.'
            })
            return
        }
        await getSchoolById({ res, supabaseClient, schoolId })
        return
    }

    if (pathname === '/v1/sports') {
        await listSports({ res, supabaseClient })
        return
    }

    if (pathname === '/api/schools') {
        await listSchools({ req, res, supabaseClient, legacyShape: true })
        return
    }

    sendJson(res, 404, {
        error: 'NOT_FOUND',
        message: 'Requested school catalog endpoint was not found.'
    })
}
