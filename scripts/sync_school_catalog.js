import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REQUIRED_SCHOOL_FIELDS = ['name', 'state', 'division']
const BASE_UPSERT_COLUMNS = [
    'name',
    'city',
    'state',
    'division',
    'conference',
    'tier',
    'enrollment',
    'cost_of_attendance',
    'sports_offered'
]
const MAX_BATCH_SIZE = 250
const SELECT_PAGE_SIZE = 1000

function normalizeSport(value) {
    return String(value || '').trim().toLowerCase()
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

function parseArguments(argv) {
    const args = {
        file: path.resolve(__dirname, 'data', 'schools_catalog.sample.json'),
        dryRun: false,
        replaceSports: false,
        delta: false
    }

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index]
        if ((token === '--file' || token === '-f') && argv[index + 1]) {
            args.file = path.resolve(process.cwd(), argv[index + 1])
            index += 1
            continue
        }

        if (token === '--dry-run') {
            args.dryRun = true
            continue
        }

        if (token === '--replace-sports') {
            args.replaceSports = true
            continue
        }

        if (token === '--delta') {
            args.delta = true
        }
    }

    return args
}

function normalizeSchoolRow(rawRow, rowNumber) {
    const source = typeof rawRow === 'object' && rawRow !== null ? rawRow : {}
    const normalized = {
        name: String(source.name || '').trim(),
        city: String(source.city || '').trim() || null,
        state: String(source.state || '').trim().toUpperCase(),
        division: String(source.division || '').trim().toLowerCase(),
        conference: String(source.conference || '').trim() || null,
        tier: String(source.tier || '').trim() || null,
        enrollment: Number.isFinite(Number(source.enrollment)) ? Number(source.enrollment) : null,
        cost_of_attendance: Number.isFinite(Number(source.cost_of_attendance))
            ? Number(source.cost_of_attendance)
            : null,
        sports_offered: Array.from(
            new Set(
                (Array.isArray(source.sports) ? source.sports : source.sports_offered || [])
                    .map(normalizeSport)
                    .filter(Boolean)
            )
        ).sort((left, right) => left.localeCompare(right))
    }

    for (const requiredField of REQUIRED_SCHOOL_FIELDS) {
        if (!normalized[requiredField]) {
            throw new Error(`Row ${rowNumber} is missing required field "${requiredField}".`)
        }
    }

    return normalized
}

function splitIntoBatches(list, size = MAX_BATCH_SIZE) {
    const batches = []
    for (let index = 0; index < list.length; index += size) {
        batches.push(list.slice(index, index + size))
    }
    return batches
}

function schoolKey(name, state) {
    return `${String(name || '').toLowerCase()}|${String(state || '').toUpperCase()}`
}

function normalizeNullableText(value) {
    const normalized = String(value || '').trim()
    return normalized || null
}

function normalizeNullableNumber(value) {
    const asNumber = Number(value)
    return Number.isFinite(asNumber) ? asNumber : null
}

function normalizeDivisionValue(value) {
    const normalized = String(value || '').trim().toLowerCase()
    return normalized || null
}

function normalizeSportsArray(values) {
    return Array.from(
        new Set((Array.isArray(values) ? values : []).map(normalizeSport).filter(Boolean))
    ).sort((left, right) => left.localeCompare(right))
}

function schoolsMatchForDelta(sourceSchool, existingSchool, columnsSelected) {
    const selected = new Set(columnsSelected)

    if (selected.has('city') && normalizeNullableText(sourceSchool.city) !== normalizeNullableText(existingSchool.city)) {
        return false
    }
    if (selected.has('division') && normalizeDivisionValue(sourceSchool.division) !== normalizeDivisionValue(existingSchool.division)) {
        return false
    }
    if (selected.has('conference') && normalizeNullableText(sourceSchool.conference) !== normalizeNullableText(existingSchool.conference)) {
        return false
    }
    if (selected.has('tier') && normalizeNullableText(sourceSchool.tier) !== normalizeNullableText(existingSchool.tier)) {
        return false
    }
    if (selected.has('enrollment') && normalizeNullableNumber(sourceSchool.enrollment) !== normalizeNullableNumber(existingSchool.enrollment)) {
        return false
    }
    if (
        selected.has('cost_of_attendance')
        && normalizeNullableNumber(sourceSchool.cost_of_attendance) !== normalizeNullableNumber(existingSchool.cost_of_attendance)
    ) {
        return false
    }

    if (selected.has('sports_offered')) {
        const sourceSports = normalizeSportsArray(sourceSchool.sports_offered)
        const existingSports = normalizeSportsArray(existingSchool.sports_offered)
        if (sourceSports.length !== existingSports.length) return false
        for (let index = 0; index < sourceSports.length; index += 1) {
            if (sourceSports[index] !== existingSports[index]) return false
        }
    }

    return true
}

function computeDeltaSchools({ schools, existingRows, columnsSelected }) {
    const existingByKey = new Map(
        existingRows.map((row) => [schoolKey(row.name, row.state), row])
    )

    const schoolsToUpsert = []
    let unchangedCount = 0
    let newCount = 0
    let changedCount = 0

    for (const school of schools) {
        const key = schoolKey(school.name, school.state)
        const existing = existingByKey.get(key)
        if (!existing) {
            schoolsToUpsert.push(school)
            newCount += 1
            continue
        }

        if (!schoolsMatchForDelta(school, existing, columnsSelected)) {
            schoolsToUpsert.push(school)
            changedCount += 1
            continue
        }

        unchangedCount += 1
    }

    return {
        schoolsToUpsert,
        unchangedCount,
        newCount,
        changedCount
    }
}

async function fetchExistingSchools({ supabaseClient }) {
    let columns = [...BASE_UPSERT_COLUMNS]
    if (!columns.includes('name')) columns = ['name', ...columns]
    if (!columns.includes('state')) columns = [...columns, 'state']

    while (columns.length >= REQUIRED_SCHOOL_FIELDS.length) {
        const rows = []
        let offset = 0
        let shouldRetry = false

        while (true) {
            const { data, error } = await supabaseClient
                .from('schools')
                .select(columns.join(', '))
                .order('name', { ascending: true })
                .range(offset, offset + SELECT_PAGE_SIZE - 1)

            if (error) {
                const missingColumn = extractMissingColumnName(error.message)
                if (missingColumn && columns.includes(missingColumn)) {
                    columns = columns.filter((column) => column !== missingColumn)
                    shouldRetry = true
                    break
                }
                throw error
            }

            const pageRows = data || []
            rows.push(...pageRows)

            if (pageRows.length < SELECT_PAGE_SIZE) break
            offset += SELECT_PAGE_SIZE
        }

        if (shouldRetry) continue

        return {
            rows,
            columnsSelected: columns
        }
    }

    throw new Error('Unable to load existing schools for delta sync.')
}

async function upsertSchools({ supabaseClient, schools }) {
    let onConflict = 'name,state'
    let columns = [...BASE_UPSERT_COLUMNS]

    while (columns.length >= REQUIRED_SCHOOL_FIELDS.length) {
        const payload = schools.map((school) => {
            const row = {}
            for (const column of columns) {
                row[column] = school[column]
            }
            return row
        })

        const inserted = []
        let shouldRetry = false

        for (const batch of splitIntoBatches(payload)) {
            const { data, error } = await supabaseClient
                .from('schools')
                .upsert(batch, { onConflict })
                .select('id, name, state')

            if (error) {
                const missingColumn = extractMissingColumnName(error.message)
                if (missingColumn && columns.includes(missingColumn)) {
                    columns = columns.filter((column) => column !== missingColumn)
                    shouldRetry = true
                    break
                }

                if (error.message.includes('no unique or exclusion constraint matching the ON CONFLICT')) {
                    if (onConflict === 'name,state') {
                        onConflict = 'name'
                        shouldRetry = true
                        break
                    }
                }

                throw error
            }

            inserted.push(...(data || []))
        }

        if (shouldRetry) continue

        return {
            insertedSchools: inserted,
            columnsUsed: columns,
            onConflict
        }
    }

    throw new Error('Failed to determine a valid schools payload shape for upsert.')
}

async function syncSchoolSports({ supabaseClient, schools, insertedSchools, replaceSports }) {
    if (!insertedSchools.length) {
        return {
            relationAvailable: true,
            touchedSchoolCount: 0,
            upsertedSportsCount: 0
        }
    }

    const insertedByKey = new Map(
        insertedSchools.map((school) => [`${school.name.toLowerCase()}|${String(school.state || '').toUpperCase()}`, school.id])
    )

    const sportRows = []
    for (const school of schools) {
        const key = `${school.name.toLowerCase()}|${school.state}`
        const schoolId = insertedByKey.get(key)
        if (!schoolId) continue
        for (const sport of school.sports_offered || []) {
            sportRows.push({ school_id: schoolId, sport })
        }
    }

    const uniqueSportRows = Array.from(
        new Map(sportRows.map((row) => [`${row.school_id}|${row.sport}`, row])).values()
    )

    const touchedSchoolIds = Array.from(new Set(uniqueSportRows.map((row) => row.school_id)))
    if (!touchedSchoolIds.length) {
        return {
            relationAvailable: true,
            touchedSchoolCount: 0,
            upsertedSportsCount: 0
        }
    }

    if (replaceSports) {
        const { error: deleteError } = await supabaseClient
            .from('school_sports')
            .delete()
            .in('school_id', touchedSchoolIds)

        if (deleteError) {
            if (relationIsMissing(deleteError.message, 'school_sports')) {
                return {
                    relationAvailable: false,
                    touchedSchoolCount: 0,
                    upsertedSportsCount: 0
                }
            }
            throw deleteError
        }
    }

    const { error: upsertError } = await supabaseClient
        .from('school_sports')
        .upsert(uniqueSportRows, { onConflict: 'school_id,sport' })

    if (upsertError) {
        if (relationIsMissing(upsertError.message, 'school_sports')) {
            return {
                relationAvailable: false,
                touchedSchoolCount: 0,
                upsertedSportsCount: 0
            }
        }
        throw upsertError
    }

    return {
        relationAvailable: true,
        touchedSchoolCount: touchedSchoolIds.length,
        upsertedSportsCount: uniqueSportRows.length
    }
}

async function loadSchoolsFromFile(filePath) {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    const schools = Array.isArray(parsed) ? parsed : parsed?.schools
    if (!Array.isArray(schools)) {
        throw new Error('Input JSON must be an array or an object with a "schools" array.')
    }

    return schools.map((row, index) => normalizeSchoolRow(row, index + 1))
}

async function main() {
    const args = parseArguments(process.argv.slice(2))
    const schools = await loadSchoolsFromFile(args.file)
    if (!schools.length) {
        throw new Error('School catalog file does not contain any schools to sync.')
    }

    console.log(`[sync_school_catalog] Loaded ${schools.length} schools from ${args.file}`)

    if (args.dryRun && !args.delta) {
        console.log('[sync_school_catalog] Dry run enabled. No database writes were made.')
        return
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY environment variables.'
        )
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)
    let schoolsToSync = schools

    if (args.delta) {
        const existingResult = await fetchExistingSchools({ supabaseClient })
        const delta = computeDeltaSchools({
            schools,
            existingRows: existingResult.rows,
            columnsSelected: existingResult.columnsSelected
        })

        schoolsToSync = delta.schoolsToUpsert

        console.log(`[sync_school_catalog] Delta mode enabled (compare columns: ${existingResult.columnsSelected.join(', ')})`)
        console.log(`[sync_school_catalog] New schools: ${delta.newCount}`)
        console.log(`[sync_school_catalog] Changed schools: ${delta.changedCount}`)
        console.log(`[sync_school_catalog] Unchanged schools: ${delta.unchangedCount}`)
        console.log(`[sync_school_catalog] Schools queued for upsert: ${schoolsToSync.length}`)

        if (args.dryRun) {
            console.log('[sync_school_catalog] Dry run enabled. No database writes were made.')
            return
        }
    }

    const upsertResult = await upsertSchools({ supabaseClient, schools: schoolsToSync })
    const sportsResult = await syncSchoolSports({
        supabaseClient,
        schools: schoolsToSync,
        insertedSchools: upsertResult.insertedSchools,
        replaceSports: args.replaceSports
    })

    console.log(`[sync_school_catalog] Upserted schools: ${upsertResult.insertedSchools.length}`)
    console.log(`[sync_school_catalog] Conflict key used: ${upsertResult.onConflict}`)
    console.log(`[sync_school_catalog] Columns used: ${upsertResult.columnsUsed.join(', ')}`)

    if (sportsResult.relationAvailable) {
        console.log(`[sync_school_catalog] School sports updated for ${sportsResult.touchedSchoolCount} schools`)
        console.log(`[sync_school_catalog] School sports upsert rows: ${sportsResult.upsertedSportsCount}`)
    } else {
        console.log('[sync_school_catalog] Skipped school_sports sync (table is unavailable).')
    }
}

main().catch((error) => {
    console.error('[sync_school_catalog] Failed:', error.message)
    process.exitCode = 1
})
