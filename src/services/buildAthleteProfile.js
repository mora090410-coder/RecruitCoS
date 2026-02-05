import { supabase } from '../lib/supabase';
import { canonicalizeMetricKeyForGroup, getMetricKeysForSport, getSportSchema } from '../config/sportSchema';
import { getAthletePhase } from '../lib/constants';
import { calculateSchoolSignal } from '../lib/signalEngine';
import { fetchBenchmarks } from '../lib/recruitingData';
import {
    mapCanonicalToGroup,
    mapPositionToCanonical,
    normalizeText,
    normalizeUnit
} from '../lib/normalize';

const CLOSED_STATUSES = new Set(['closed', 'inactive', 'rejected', 'archived']);

const isMissingTableError = (error) => {
    if (!error) return false;
    if (error.code === '42P01') return true;
    return typeof error.message === 'string' && error.message.toLowerCase().includes('relation') && error.message.toLowerCase().includes('does not exist');
};

const safeSelect = async (table, builder) => {
    try {
        const result = await builder(supabase.from(table));
        if (result.error && isMissingTableError(result.error)) {
            return { data: [], error: null, missing: true };
        }
        return { data: result.data || [], error: result.error || null, missing: false };
    } catch (error) {
        if (isMissingTableError(error)) {
            return { data: [], error: null, missing: true };
        }
        return { data: [], error, missing: false };
    }
};

const computeSignalHeat = (interactions) => {
    if (!Array.isArray(interactions) || interactions.length === 0) return 0;
    const signalScore = calculateSchoolSignal(interactions);
    return Math.min(100, Math.round((signalScore / 40) * 100));
};

const buildLatestByMetric = (rows) => {
    const latest = {};
    rows.forEach((row) => {
        const key = row.metric;
        if (!key) return;
        if (latest[key]) return;
        const value = Number(row.value);
        latest[key] = {
            value: Number.isNaN(value) ? null : value,
            unit: row.unit || null,
            measured_at: row.measured_at || null
        };
    });
    return latest;
};

const getDateWindow = (days) => {
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { now, start };
};

const normalizeAthleteRow = (row) => {
    if (!row) return null;
    return {
        ...row,
        first_name: row.first_name ?? row.firstName ?? null,
        last_name: row.last_name ?? row.lastName ?? null,
        grad_year: row.grad_year ?? row.gradYear ?? null,
        zip_code: row.zip_code ?? row.zipCode ?? null,
        gpa_range: row.gpa_range ?? row.gpaRange ?? null,
        academic_tier: row.academic_tier ?? row.academicTier ?? null,
        dream_school: row.dream_school ?? row.dreamSchool ?? null,
        target_divisions: row.target_divisions ?? row.targetDivisions ?? null,
        preferred_regions: row.preferred_regions ?? row.preferredRegions ?? null,
        distance_preference: row.distance_preference ?? row.distancePreference ?? null,
        primary_position_display: row.primary_position_display ?? row.primaryPositionDisplay ?? null,
        primary_position_canonical: row.primary_position_canonical ?? row.primaryPositionCanonical ?? null,
        primary_position_group: row.primary_position_group ?? row.primaryPositionGroup ?? null,
        secondary_positions_canonical: row.secondary_positions_canonical ?? row.secondaryPositionsCanonical ?? [],
        secondary_position_groups: row.secondary_position_groups ?? row.secondaryPositionGroups ?? []
    };
};

export async function buildAthleteProfile(athleteId) {
    const { data: rawAthlete, error: athleteError } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', athleteId)
        .maybeSingle();

    if (athleteError) throw athleteError;
    if (!rawAthlete) throw new Error('Athlete not found');
    const athlete = normalizeAthleteRow(rawAthlete);

    const sportKey = athlete?.sport ? athlete.sport.toString().trim().toLowerCase() : null;
    const sportSchema = getSportSchema(sportKey || athlete.sport);
    const sportSupported = !!sportSchema;

    const primaryDisplay = normalizeText(athlete.primary_position_display || athlete.position || '');
    const primaryCanonical = athlete.primary_position_canonical || mapPositionToCanonical(athlete.sport, primaryDisplay);
    const primaryGroup = athlete.primary_position_group || mapCanonicalToGroup(athlete.sport, primaryCanonical);

    const unmappedInputs = [];
    if (primaryDisplay && (!primaryCanonical || !primaryGroup)) {
        unmappedInputs.push(primaryDisplay);
    }

    const secondaryCanonical = Array.isArray(athlete.secondary_positions_canonical) ? athlete.secondary_positions_canonical : [];
    const secondaryGroups = Array.isArray(athlete.secondary_position_groups)
        ? athlete.secondary_position_groups
        : secondaryCanonical.map((value) => mapCanonicalToGroup(athlete.sport, value)).filter(Boolean);

    const positions = {
        primary: {
            display: primaryDisplay || null,
            canonical: primaryCanonical || null,
            group: primaryGroup || null
        },
        secondary: secondaryCanonical.map((value, index) => ({
            canonical: value,
            group: secondaryGroups[index] || mapCanonicalToGroup(athlete.sport, value) || null
        })),
        unmappedInputs
    };

    console.log('[buildAthleteProfile] athleteId', athleteId);
    const { data: measurablesRaw } = await safeSelect('athlete_measurables', (table) =>
        table
            .select('sport, metric, value, unit, measured_at')
            .eq('athlete_id', athleteId)
            .order('measured_at', { ascending: false })
    );
    console.log('[buildAthleteProfile] measurables rows length', measurablesRaw?.length || 0);
    if (Array.isArray(measurablesRaw) && measurablesRaw.length > 0) {
        const firstRow = measurablesRaw[0];
        console.log('[buildAthleteProfile] measurables first row', {
            sport: firstRow.sport,
            metric: firstRow.metric,
            value: firstRow.value,
            unit: firstRow.unit,
            measured_at: firstRow.measured_at
        });
    }

    const allowedMetrics = new Set(getMetricKeysForSport(athlete.sport));
    const measurablesHistory = (measurablesRaw || []).map((row) => {
        const canonicalMetric = canonicalizeMetricKeyForGroup(athlete.sport, row.metric, positions.primary.group);
        return {
            ...row,
            metric: canonicalMetric,
            unit: normalizeUnit(row.unit)
        };
    });

    const unknownMetrics = measurablesHistory
        .map((row) => row.metric)
        .filter((metric) => metric && !allowedMetrics.has(metric));

    const latestByMetric = buildLatestByMetric(measurablesHistory);
    const measurables = {
        positionGroup: positions.primary.group || null,
        latestByMetric,
        rawCount: measurablesHistory.length,
        latestKeys: Object.keys(latestByMetric),
        history: measurablesHistory.slice(0, 25),
        unknownMetrics: Array.from(new Set(unknownMetrics))
    };

    const targetLevel = athlete?.goals?.targetLevels?.[0] || 'D2';
    const applicableMetricKeys = sportSchema && positions.primary.group
        ? (sportSchema.metrics || [])
            .filter((metric) => metric.appliesToGroups?.includes(positions.primary.group))
            .map((metric) => metric.key)
        : [];
    const benchmarkQueryFilters = {
        sport: sportKey,
        position_group: positions.primary.group || null,
        target_level: targetLevel,
        metrics: applicableMetricKeys
    };
    const { data: benchmarksRaw, error: benchmarksError } = sportSupported && positions.primary.group
        ? await safeSelect('measurable_benchmarks', (table) =>
            table
                .select('metric, p50, direction')
                .eq('sport', sportKey)
                .eq('position_group', positions.primary.group)
                .eq('target_level', targetLevel)
                .in('metric', applicableMetricKeys)
        )
        : { data: [], error: null };
    const benchmarks = benchmarksRaw || [];
    const benchmarkDiagnostics = {
        sportKeyUsed: sportKey,
        benchmarkQueryFilters,
        benchmarksFoundCount: benchmarks.length,
        benchmarksUsed: benchmarks.map((row) => ({
            metric: row.metric,
            p50: row.p50,
            direction: row.direction
        })),
        benchmarkError: benchmarksError ? (benchmarksError.message || String(benchmarksError)) : null
    };

    const { data: savedSchools } = await safeSelect('athlete_saved_schools', (table) =>
        table
            .select('id, school_name, division, conference, status, created_at, updated_at, distance_miles')
            .eq('athlete_id', athleteId)
    );

    const { data: interactions } = await safeSelect('athlete_interactions', (table) =>
        table
            .select('id, school_id, type, interaction_date, intensity_score, created_at')
            .eq('athlete_id', athleteId)
    );

    const { data: events } = await safeSelect('events', (table) =>
        table
            .select('id, event_date, created_at')
            .eq('athlete_id', athleteId)
    );

    const { data: posts } = await safeSelect('posts', (table) =>
        table
            .select('id, created_at, posted_at')
            .eq('athlete_id', athleteId)
    );

    const { data: interestResults } = await safeSelect('athlete_school_interest_results', (table) =>
        table
            .select('school_id, interest_score, next_action, drivers_json, computed_at')
            .eq('athlete_id', athleteId)
            .order('computed_at', { ascending: false })
    );

    const now = new Date();
    const { start: start30 } = getDateWindow(30);
    const { start: start90 } = getDateWindow(90);
    const interactionsLast30Days = interactions.filter((item) => new Date(item.interaction_date || item.created_at) >= start30);
    const interactionsLast90Days = interactions.filter((item) => new Date(item.interaction_date || item.created_at) >= start90);
    const eventsNext14Days = events.filter((item) => {
        const date = new Date(item.event_date || item.created_at);
        return date >= now && date <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    });
    const eventsLast90Days = events.filter((item) => new Date(item.event_date || item.created_at) >= start90);
    const postsLast30Days = posts.filter((item) => new Date(item.created_at || item.posted_at) >= start30);

    const activeSchoolsCount = savedSchools.filter((school) => {
        if (!school.status) return true;
        return !CLOSED_STATUSES.has(school.status.toLowerCase());
    }).length;

    const executionSignals = {
        savedSchoolsCount: savedSchools.length,
        activeSchoolsCount,
        interactionsLast30Days: interactionsLast30Days.length,
        interactionsLast90Days: interactionsLast90Days.length,
        eventsNext14Days: eventsNext14Days.length,
        eventsLast90Days: eventsLast90Days.length,
        postsLast30Days: postsLast30Days.length,
        momentumScore0to100: computeSignalHeat(interactionsLast30Days),
        totalEvents: events.length,
        recentEvents90d: eventsLast90Days.length,
        totalMeasurables: measurablesHistory.length,
        totalPosts: posts.length,
        recentInteractions30d: interactionsLast30Days.length,
        activeSchools: activeSchoolsCount,
        momentumCount: interactionsLast30Days.length
    };

    const interestMap = new Map();
    interestResults.forEach((row) => {
        if (!interestMap.has(row.school_id)) {
            interestMap.set(row.school_id, row);
        }
    });

    const interactionsBySchool = interactions.reduce((acc, interaction) => {
        const key = interaction.school_id;
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key).push(interaction);
        return acc;
    }, new Map());

    const schools = savedSchools.map((school) => {
        const schoolInteractions = interactionsBySchool.get(school.id) || [];
        const lastInteraction = schoolInteractions.reduce((latest, item) => {
            const date = new Date(item.interaction_date || item.created_at);
            if (!latest || date > latest) return date;
            return latest;
        }, null);
        const interest = interestMap.get(school.id) || null;
        return {
            schoolId: school.id,
            id: school.id,
            school_name: school.school_name,
            name: school.school_name,
            division: school.division || null,
            conference: school.conference || null,
            location: null,
            pipelineStatus: school.status || null,
            status: school.status || null,
            lastInteractionAt: lastInteraction ? lastInteraction.toISOString() : null,
            signalHeat0to100: computeSignalHeat(schoolInteractions),
            interestScore0to100: interest ? Number(interest.interest_score) : null,
            nextAction: interest ? interest.next_action : null,
            interactions: schoolInteractions,
            interest
        };
    });

    const phase = getAthletePhase(athlete.grad_year);
    const flags = {
        needsPositionSelection: sportSupported && !positions.primary.group,
        unsupportedSportMode: !sportSupported,
        degradedScoringReason: !sportSupported ? 'unsupported_sport' : (!positions.primary.group ? 'missing_position' : null)
    };

    return {
        id: athlete.id,
        sport: athlete.sport,
        first_name: athlete.first_name,
        grad_year: athlete.grad_year,
        goals: athlete.goals,
        athlete: {
            id: athlete.id,
            first_name: athlete.first_name,
            last_name: athlete.last_name,
            name: athlete.name,
            sport: athlete.sport,
            grad_year: athlete.grad_year,
            position: athlete.position,
            city: athlete.city,
            state: athlete.state,
            zip_code: athlete.zip_code,
            latitude: athlete.latitude,
            longitude: athlete.longitude,
            gpa: athlete.gpa,
            gpa_range: athlete.gpa_range,
            academic_tier: athlete.academic_tier,
            dream_school: athlete.dream_school,
            target_divisions: athlete.target_divisions,
            preferred_regions: athlete.preferred_regions,
            distance_preference: athlete.distance_preference,
            goals: athlete.goals,
            created_at: athlete.created_at,
            updated_at: athlete.updated_at
        },
        sportKey,
        sportSupported,
        positions,
        measurables,
        benchmarks,
        benchmarkDiagnostics,
        executionSignals,
        schools,
        upcomingEvents: eventsNext14Days,
        phase,
        flags
    };
}
