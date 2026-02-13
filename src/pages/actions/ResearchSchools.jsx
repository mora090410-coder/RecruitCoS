import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { getFeatureRebuildMessage, isMissingTableError } from '../../lib/dbResilience';
import {
    calculateAcademicFit,
    calculateAthleticFit,
    calculateDistance,
    calculateFinancialFit,
    calculateGeographicFit,
    calculateOverallMatch,
    categorizeMatch,
    generatePivotSuggestions,
    getStateCentroid,
    MATCH_CATEGORY_COLORS,
    normalizeLatitude,
    normalizeLongitude
} from '../../lib/matchScoring';
import {
    resolveActionNumberFromSearch,
    resolveItemIdFromSearch,
    resolveWeekStartFromSearch,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './research-schools.css';

const DIVISIONS = ['d1', 'd2', 'd3', 'naia', 'juco'];
const DIVISION_LABELS = {
    d1: 'D1',
    d2: 'D2',
    d3: 'D3',
    naia: 'NAIA',
    juco: 'JUCO'
};
const LEGACY_CATEGORY_MAP = {
    DREAM: 'reach',
    REACH: 'reach',
    TARGET: 'target',
    SAFETY: 'solid'
};
const MATCH_CATEGORY_FROM_LEGACY = {
    reach: 'REACH',
    target: 'TARGET',
    solid: 'SAFETY'
};

const NEARBY_RADIUS_MILES = 300;
const SEARCH_MIN_LENGTH = 2;
const MAX_SELECTED_SCHOOLS = 3;
const MIN_SCHOOLS_FOR_COMPLETION = 3;
const PIVOT_THRESHOLD = 50;

const DEFAULT_LOCATION = {
    latitude: 39.7684,
    longitude: -86.1581,
    state: 'IN'
};

function normalizeSport(value) {
    return String(value || '').trim().toLowerCase();
}

function coerceNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMatchCategory(row) {
    const explicitCategory = String(row?.match_category || '').trim().toUpperCase();
    if (explicitCategory && MATCH_CATEGORY_COLORS[explicitCategory]) {
        return explicitCategory;
    }

    const legacyCategory = String(row?.category || '').trim().toLowerCase();
    return MATCH_CATEGORY_FROM_LEGACY[legacyCategory] || 'TARGET';
}

function toLegacyCategory(matchCategory) {
    return LEGACY_CATEGORY_MAP[matchCategory] || 'target';
}

function parseAthleteStats(athlete, measurableRows) {
    const normalized = {
        sport: normalizeSport(athlete?.sport),
        sixty_yard_dash: null,
        vertical_jump: null,
        recent_stats: false,
        gpa: coerceNumber(athlete?.gpa)
    };

    const metricRows = Array.isArray(measurableRows) ? measurableRows : [];
    for (const row of metricRows) {
        const metric = String(row.metric || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const value = coerceNumber(row.value);

        if (normalized.sixty_yard_dash === null && (metric === 'sixty_yard_dash' || metric === '60_yard_dash' || metric === 'sixty_time')) {
            normalized.sixty_yard_dash = value;
        }
        if (normalized.vertical_jump === null && (metric === 'vertical_jump' || metric === 'vertical')) {
            normalized.vertical_jump = value;
        }

        if (metric === 'recent_stats' && String(row.value || '').trim()) {
            normalized.recent_stats = true;
        }
        if (row.recent_stats) {
            normalized.recent_stats = true;
        }

        if (normalized.sixty_yard_dash === null && coerceNumber(row.sixty_yard_dash) !== null) {
            normalized.sixty_yard_dash = coerceNumber(row.sixty_yard_dash);
        }
        if (normalized.vertical_jump === null && coerceNumber(row.vertical_jump) !== null) {
            normalized.vertical_jump = coerceNumber(row.vertical_jump);
        }
    }

    return normalized;
}

function resolveCoordinatePair(latitudeValue, longitudeValue, stateValue) {
    let latitude = normalizeLatitude(latitudeValue);
    let longitude = normalizeLongitude(longitudeValue);
    const state = String(stateValue || '').trim().toUpperCase();

    // Most U.S. coordinates should be western hemisphere (negative longitude).
    if (longitude !== null && longitude > 0 && state.length === 2) {
        longitude = -longitude;
    }

    // Ignore known placeholder coordinate pairs.
    if (latitude !== null && longitude !== null && Math.abs(latitude) < 1 && Math.abs(longitude) < 1) {
        latitude = null;
        longitude = null;
    }

    if (latitude !== null && longitude !== null) {
        return { latitude, longitude, state: state || DEFAULT_LOCATION.state };
    }

    const centroid = getStateCentroid(state);
    if (centroid) {
        return { ...centroid, state };
    }

    return DEFAULT_LOCATION;
}

function resolveAthleteLocation(athlete) {
    return resolveCoordinatePair(athlete?.latitude, athlete?.longitude, athlete?.state);
}

function isMissingColumnError(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        String(error?.code || '') === '42703'
        || (message.includes('column') && message.includes('does not exist'))
    );
}

function buildLegacySavedSchoolPayload(payload) {
    return {
        athlete_id: payload.athlete_id,
        school_name: payload.school_name,
        school_location: payload.school_location,
        division: payload.division,
        conference: payload.conference,
        category: payload.category,
        match_score: payload.match_score,
        distance_miles: payload.distance_miles
    };
}

function schoolOffersSport(school, sport) {
    const sportKey = normalizeSport(sport);
    if (!sportKey) return true;

    const offeredSports = Array.isArray(school?.sports_offered)
        ? school.sports_offered.map((item) => normalizeSport(item))
        : [];

    return offeredSports.includes(sportKey);
}

function getSchoolBenchmarks(school, sport) {
    const benchmarkRows = Array.isArray(school?.school_recruiting_benchmarks)
        ? school.school_recruiting_benchmarks
        : [];

    const normalizedSport = normalizeSport(sport);
    if (normalizedSport) {
        const exactMatch = benchmarkRows.find((row) => normalizeSport(row.sport) === normalizedSport);
        if (exactMatch) return exactMatch;
    }

    return benchmarkRows[0] || null;
}

function recruitsAthleteRegion(school, athleteState) {
    const regions = Array.isArray(school?.school_recruiting_regions)
        ? school.school_recruiting_regions
        : [];
    const normalizedState = String(athleteState || '').trim().toUpperCase();

    return regions.some((row) => (
        String(row.state || '').trim().toUpperCase() === normalizedState
        && Boolean(row.recruits_heavily)
    ));
}

function sortBySchoolName(left, right) {
    return String(left.name || '').localeCompare(String(right.name || ''));
}

function getHonestAssessment(matchCategory, athleticFit, geographicFit) {
    if (matchCategory === 'DREAM') {
        return 'High upside, low current probability. Keep this as a long-term goal, not your primary plan.';
    }
    if (matchCategory === 'REACH') {
        if (athleticFit < 55) {
            return 'Reach today. Athletic benchmarks are currently below this program’s typical recruit profile.';
        }
        if (geographicFit < 50) {
            return 'Reach due to geography. Build local communication momentum before investing heavily in travel.';
        }
        return 'Reach with upside. Keep if this is a priority, but pair with stronger target options.';
    }
    if (matchCategory === 'TARGET') {
        return 'Realistic target. Maintain consistent outreach and measurable progress to stay competitive.';
    }
    return 'Strong fit. This should stay on your active priority list as a safety option.';
}

function normalizeSavedSchool(row) {
    const matchCategory = normalizeMatchCategory(row);
    const matchScore = Number(row.match_score ?? 0);

    return {
        ...row,
        match_category: matchCategory,
        match_score: Number.isFinite(matchScore) ? matchScore : 0,
        athletic_fit: Number(row.athletic_fit ?? 0),
        geographic_fit: Number(row.geographic_fit ?? 0),
        academic_fit: Number(row.academic_fit ?? 0),
        financial_fit: Number(row.financial_fit ?? 0),
        distance_miles: Number(row.distance_miles ?? 0)
    };
}

function DivisionFilters({ filters, onToggle }) {
    return (
        <div className="rs-filter-row" role="group" aria-label="Division filters">
            {DIVISIONS.map((division) => {
                const checked = Boolean(filters[division]);
                return (
                    <button
                        key={division}
                        type="button"
                        className={`rs-pill ${checked ? 'is-active' : ''}`}
                        onClick={() => onToggle(division)}
                        aria-pressed={checked}
                    >
                        {DIVISION_LABELS[division]}
                    </button>
                );
            })}
        </div>
    );
}

function FitIndicator({ label, score }) {
    const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
    const stars = Math.round((safeScore / 100) * 5);

    return (
        <div className="rs-fit-indicator">
            <span className="rs-fit-label">{label}</span>
            <span className="rs-fit-stars" aria-label={`${label} ${stars} out of 5`}>
                {'●'.repeat(stars)}{'○'.repeat(5 - stars)}
            </span>
        </div>
    );
}

function SchoolCard({ school, onAdd, addLabel, disabled, isDream, previewCategory }) {
    const category = previewCategory || 'TARGET';
    return (
        <article className="rs-school-card">
            <div className="rs-school-head">
                <h3>{school.name}</h3>
                <span className={`rs-category-badge rs-${category.toLowerCase()}`}>{category}</span>
            </div>
            <p className="rs-school-meta">
                {DIVISION_LABELS[String(school.division || '').toLowerCase()] || String(school.division || '').toUpperCase()} • {school.city}, {school.state}
            </p>
            <p className="rs-school-meta">
                {school.distance_miles} mi away{school.recruits_region ? ' • recruits your state' : ''}
            </p>
            <button
                type="button"
                className={`rs-btn ${isDream ? 'is-dream' : ''}`}
                onClick={onAdd}
                disabled={disabled}
            >
                {addLabel}
            </button>
        </article>
    );
}

function SelectedSchoolCard({ school, onRemove }) {
    const category = normalizeMatchCategory(school);
    const categoryColor = MATCH_CATEGORY_COLORS[category] || MATCH_CATEGORY_COLORS.TARGET;

    return (
        <article className="rs-selected-school-card">
            <div className="rs-school-head">
                <h3>{school.school_name}</h3>
                <span className={`rs-category-badge rs-${category.toLowerCase()}`}>{category}</span>
            </div>

            <p className="rs-school-meta">
                {String(school.division || '').toUpperCase()} • {school.school_location} • {Math.round(Number(school.distance_miles || 0))} mi
            </p>

            <div className="rs-score-bar-wrap">
                <div className="rs-score-bar">
                    <div
                        className="rs-score-bar-fill"
                        style={{ width: `${Math.max(0, Math.min(100, school.match_score || 0))}%`, backgroundColor: categoryColor }}
                    />
                </div>
                <span className="rs-score-text">Match Score: {school.match_score}/100</span>
            </div>

            <p className="rs-honest-note">
                {getHonestAssessment(category, school.athletic_fit, school.geographic_fit)}
            </p>

            <div className="rs-fit-grid">
                <FitIndicator label="Athletic" score={school.athletic_fit} />
                <FitIndicator label="Geographic" score={school.geographic_fit} />
                <FitIndicator label="Academic" score={school.academic_fit} />
                <FitIndicator label="Financial" score={school.financial_fit} />
            </div>

            <button type="button" className="rs-link-btn" onClick={onRemove}>Remove</button>
        </article>
    );
}

function PivotSuggestionModal({
    isOpen,
    data,
    onClose,
    onAddAlternative,
    selectedSchoolCount,
    maxSelectedSchools
}) {
    if (!isOpen || !data) return null;

    const category = data?.matchScore < 40 ? 'DREAM' : 'REACH';
    const isAtLimit = selectedSchoolCount >= maxSelectedSchools;

    return (
        <div className="rs-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pivot-modal-title">
            <section className="rs-modal">
                <h2 id="pivot-modal-title">Reality Check: {data.school.name}</h2>

                <div className="rs-modal-score">
                    <div className={`rs-modal-score-circle rs-${category.toLowerCase()}`}>
                        <span>{data.matchScore}</span>
                        <small>{category}</small>
                    </div>
                </div>

                <p className="rs-modal-message">{data.pivots.message}</p>

                <div className="rs-modal-section">
                    <h3>🎯 {data.pivots.alternativesHeading}</h3>
                    {data.pivots.alternatives.length === 0 ? (
                        <p className="rs-modal-muted">No strong alternatives found in this tier set yet. Try widening filters.</p>
                    ) : (
                        <div className="rs-modal-alt-list">
                            {data.pivots.alternatives.map((alternative) => (
                                <article key={alternative.id} className="rs-modal-alt-item">
                                    <div>
                                        <p className="rs-modal-alt-name">{alternative.name}</p>
                                        <p className="rs-modal-alt-meta">
                                            {DIVISION_LABELS[String(alternative.division || '').toLowerCase()] || alternative.division?.toUpperCase()} • {alternative.city}, {alternative.state} • {alternative.distance_miles} mi
                                        </p>
                                        <p className="rs-modal-alt-meta">Match: {alternative.match_score}/100 ({alternative.match_category})</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rs-btn"
                                        disabled={isAtLimit}
                                        onClick={() => onAddAlternative(alternative)}
                                    >
                                        Add
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {data.pivots.safetyNet && (
                    <div className="rs-modal-section">
                        <h3>🔄 {data.pivots.safetyNet.message}</h3>
                        <ul className="rs-modal-list">
                            {data.pivots.safetyNet.options.map((option) => (
                                <li key={option}>{option}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="rs-modal-actions">
                    <button type="button" className="rs-btn rs-btn-muted" onClick={onClose}>Keep Dream School</button>
                    <button type="button" className="rs-btn is-primary" onClick={onClose}>Review Alternatives</button>
                </div>
            </section>
        </div>
    );
}

export default function ResearchSchools() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);

    const targetAthleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [catalogUnavailable, setCatalogUnavailable] = useState(false);

    const [athleteRow, setAthleteRow] = useState(null);
    const [athleteStats, setAthleteStats] = useState(null);
    const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
    const [schoolCatalog, setSchoolCatalog] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [divisionFilters, setDivisionFilters] = useState({
        d1: true,
        d2: true,
        d3: true,
        naia: true,
        juco: true
    });

    const [pivotData, setPivotData] = useState(null);
    const [showPivotSuggestion, setShowPivotSuggestion] = useState(false);

    const activeSport = normalizeSport(athleteStats?.sport || athleteRow?.sport);

    const filteredCatalog = useMemo(() => {
        return schoolCatalog
            .filter((school) => Boolean(divisionFilters[String(school.division || '').toLowerCase()]))
            .filter((school) => schoolOffersSport(school, activeSport))
            .sort(sortBySchoolName);
    }, [schoolCatalog, divisionFilters, activeSport]);

    const buildSchoolAssessment = useCallback((school) => {
        const schoolCoordinates = resolveCoordinatePair(school.latitude, school.longitude, school.state);
        const benchmark = getSchoolBenchmarks(school, activeSport);
        const recruitsRegion = recruitsAthleteRegion(school, userLocation.state);
        const athleticFit = calculateAthleticFit(athleteStats, benchmark, school.tier);
        const geographicFit = calculateGeographicFit(userLocation, schoolCoordinates, recruitsRegion);
        const academicFit = calculateAcademicFit(athleteStats?.gpa ?? athleteRow?.gpa, benchmark?.avg_gpa);
        const financialFit = calculateFinancialFit(athleteRow, school.cost_of_attendance);
        const matchScore = calculateOverallMatch(athleticFit, geographicFit, academicFit, financialFit);
        const matchCategory = categorizeMatch(matchScore);

        const distanceMiles = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            schoolCoordinates.latitude,
            schoolCoordinates.longitude
        );

        return {
            school_id: school.id,
            school_name: school.name,
            school_location: `${school.city}, ${school.state}`,
            division: String(school.division || '').toUpperCase(),
            conference: school.conference,
            match_score: matchScore,
            athletic_fit: athleticFit,
            geographic_fit: geographicFit,
            academic_fit: academicFit,
            financial_fit: financialFit,
            distance_miles: distanceMiles,
            match_category: matchCategory,
            category: toLegacyCategory(matchCategory),
            recruits_region: recruitsRegion
        };
    }, [activeSport, athleteRow, athleteStats, userLocation]);

    const schoolsNearby = useMemo(() => {
        const selectedSchoolIds = new Set(selectedSchools.map((row) => row.school_id).filter(Boolean));

        return filteredCatalog
            .filter((school) => !selectedSchoolIds.has(school.id))
            .map((school) => {
                const assessment = buildSchoolAssessment(school);
                return {
                    ...school,
                    ...assessment
                };
            })
            .filter((school) => school.distance_miles <= NEARBY_RADIUS_MILES)
            .sort((left, right) => {
                if (left.recruits_region !== right.recruits_region) {
                    return left.recruits_region ? -1 : 1;
                }
                return left.distance_miles - right.distance_miles;
            })
            .slice(0, 25);
    }, [filteredCatalog, buildSchoolAssessment, selectedSchools]);

    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (query.length < SEARCH_MIN_LENGTH) return [];

        return filteredCatalog
            .filter((school) => !selectedSchools.some((saved) => (
                (saved.school_id && saved.school_id === school.id)
                || String(saved.school_name || '').toLowerCase() === String(school.name || '').toLowerCase()
            )))
            .filter((school) => (
                school.name.toLowerCase().includes(query)
                || school.city.toLowerCase().includes(query)
                || school.state.toLowerCase().includes(query)
                || String(school.conference || '').toLowerCase().includes(query)
            ))
            .slice(0, 12)
            .map((school) => ({
                ...school,
                ...buildSchoolAssessment(school)
            }));
    }, [searchQuery, filteredCatalog, buildSchoolAssessment, selectedSchools]);

    useEffect(() => {
        let active = true;

        const loadInitialData = async () => {
            if (!targetAthleteId) {
                if (active) {
                    setError('No athlete profile selected.');
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError('');
            setCatalogUnavailable(false);

            const [athleteResult, measurablesResult, selectedResult, catalogResult] = await Promise.all([
                supabase
                    .from('athletes')
                    .select('id, sport, gpa, city, state, latitude, longitude, grad_year, target_divisions')
                    .eq('id', targetAthleteId)
                    .maybeSingle(),
                supabase
                    .from('athlete_measurables')
                    .select('sport, metric, value, sixty_yard_dash, vertical_jump, recent_stats, measured_at, created_at')
                    .eq('athlete_id', targetAthleteId)
                    .order('measured_at', { ascending: false })
                    .order('created_at', { ascending: false }),
                supabase
                    .from('athlete_saved_schools')
                    .select('id, school_name, school_location, division, conference, category, match_score, distance_miles, created_at')
                    .eq('athlete_id', targetAthleteId)
                    .order('created_at', { ascending: true }),
                supabase
                    .from('schools')
                    .select('id, name, city, state, latitude, longitude, division, tier, conference, cost_of_attendance, sports_offered, enrollment, school_recruiting_benchmarks(sport, avg_sixty_yard_dash, avg_vertical_jump, avg_gpa, roster_size, recruiting_class_size), school_recruiting_regions(state, recruits_heavily, avg_recruits_per_year)')
            ]);

            if (!active) return;

            const hardError = [athleteResult.error, measurablesResult.error, selectedResult.error]
                .find((queryError) => queryError && !isMissingTableError(queryError));

            if (hardError) {
                setError('Unable to load Action 2 data right now. Please retry.');
                setLoading(false);
                return;
            }

            if (catalogResult.error) {
                if (isMissingTableError(catalogResult.error)) {
                    setCatalogUnavailable(true);
                    setError(getFeatureRebuildMessage('School catalog intelligence'));
                } else {
                    setError(catalogResult.error.message || 'Unable to load school catalog right now.');
                }
            }

            const athlete = athleteResult.data || profile || null;
            const stats = parseAthleteStats(athlete, isMissingTableError(measurablesResult.error) ? [] : (measurablesResult.data || []));
            const location = resolveAthleteLocation(athlete);

            setAthleteRow(athlete);
            setAthleteStats(stats);
            setUserLocation(location);
            setSelectedSchools((isMissingTableError(selectedResult.error) ? [] : (selectedResult.data || [])).map(normalizeSavedSchool));
            setSchoolCatalog(catalogResult.error ? [] : (catalogResult.data || []));
            setLoading(false);
        };

        loadInitialData();

        return () => {
            active = false;
        };
    }, [targetAthleteId, profile]);

    const toggleDivision = (division) => {
        setDivisionFilters((previous) => ({
            ...previous,
            [division]: !previous[division]
        }));
    };

    const addSchool = useCallback(async (school, options = {}) => {
        if (!targetAthleteId) return;
        if (selectedSchools.length >= MAX_SELECTED_SCHOOLS) {
            setError(`Free trial allows ${MAX_SELECTED_SCHOOLS} schools in Week 1.`);
            return;
        }

        const alreadySelected = selectedSchools.some((item) => (
            (item.school_id && school.id && item.school_id === school.id)
            || String(item.school_name || '').toLowerCase() === String(school.name || '').toLowerCase()
        ));

        if (alreadySelected) {
            setError(`${school.name} is already on your list.`);
            return;
        }

        const assessment = buildSchoolAssessment(school);
        const payload = {
            athlete_id: targetAthleteId,
            ...assessment,
            is_dream_school: Boolean(options.isDream),
            is_pivot_suggestion: Boolean(options.isPivotSuggestion),
            pivot_from_school_id: options.pivotFromSchoolId || null
        };

        setError('');
        setIsSaving(true);

        try {
            const { data, error: saveError } = await supabase
                .from('athlete_saved_schools')
                .upsert(payload, { onConflict: 'athlete_id,school_name' })
                .select('id, school_id, school_name, school_location, division, conference, category, match_score, athletic_fit, geographic_fit, academic_fit, financial_fit, distance_miles, match_category, is_dream_school, is_pivot_suggestion, pivot_from_school_id')
                .single();

            let savedPayload = data;
            let workingError = saveError;

            if (workingError && isMissingColumnError(workingError)) {
                // Fallback for environments not yet migrated with advanced fit columns.
                const legacyPayload = buildLegacySavedSchoolPayload(payload);
                const legacySave = await supabase
                    .from('athlete_saved_schools')
                    .upsert(legacyPayload, { onConflict: 'athlete_id,school_name' })
                    .select('id, school_name, school_location, division, conference, category, match_score, distance_miles')
                    .single();

                savedPayload = legacySave.data;
                workingError = legacySave.error;
            }

            if (workingError) throw workingError;

            const savedRow = normalizeSavedSchool({ ...payload, ...savedPayload });
            setSelectedSchools((previous) => [...previous, savedRow]);

            if (options.isDream && payload.match_score < PIVOT_THRESHOLD) {
                const pivotStrategy = generatePivotSuggestions(school, payload.match_score);
                if (pivotStrategy) {
                    const alternatives = schoolCatalog
                        .filter((candidate) => candidate.id !== school.id)
                        .filter((candidate) => !pivotStrategy.recommendedTiers || pivotStrategy.recommendedTiers.includes(candidate.tier))
                        .map((candidate) => ({
                            ...candidate,
                            ...buildSchoolAssessment(candidate)
                        }))
                        .filter((candidate) => candidate.match_category === 'TARGET' || candidate.match_category === 'SAFETY')
                        .sort((left, right) => {
                            if (right.match_score !== left.match_score) return right.match_score - left.match_score;
                            if (right.geographic_fit !== left.geographic_fit) return right.geographic_fit - left.geographic_fit;
                            return left.distance_miles - right.distance_miles;
                        })
                        .slice(0, 5);

                    setPivotData({
                        school,
                        matchScore: payload.match_score,
                        pivots: {
                            ...pivotStrategy,
                            alternatives
                        },
                        pivotFromSchoolId: savedRow.id
                    });
                    setShowPivotSuggestion(true);
                }
            }

            setSearchQuery('');
        } catch (saveError) {
            if (isMissingTableError(saveError)) {
                setError(getFeatureRebuildMessage('School fit scoring'));
            } else {
                setError(saveError?.message || 'Unable to save this school right now.');
            }
        } finally {
            setIsSaving(false);
        }
    }, [buildSchoolAssessment, schoolCatalog, selectedSchools, targetAthleteId]);

    const removeSchool = async (schoolRow) => {
        if (!targetAthleteId || !schoolRow) return;

        setError('');
        setIsSaving(true);

        try {
            let deleteQuery = supabase
                .from('athlete_saved_schools')
                .delete()
                .eq('athlete_id', targetAthleteId);

            if (schoolRow.id) {
                deleteQuery = deleteQuery.eq('id', schoolRow.id);
            } else {
                deleteQuery = deleteQuery.eq('school_name', schoolRow.school_name);
            }

            const { error: deleteError } = await deleteQuery;
            if (deleteError) throw deleteError;

            setSelectedSchools((previous) => previous.filter((row) => {
                if (schoolRow.id && row.id) {
                    return row.id !== schoolRow.id;
                }
                return row.school_name !== schoolRow.school_name;
            }));
        } catch (deleteError) {
            setError(deleteError?.message || 'Unable to remove school right now.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = async () => {
        if (!targetAthleteId || isSaving || isSkipping) return;

        setError('');
        setIsSkipping(true);
        try {
            await setWeeklyActionStatus({
                athleteId: targetAthleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'skipped'
            });
            navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
                return;
            }
            setError(skipError?.message || 'Unable to skip this action right now.');
        } finally {
            setIsSkipping(false);
        }
    };

    const handleComplete = async () => {
        if (!targetAthleteId || isSaving || isSkipping) return;

        if (selectedSchools.length < MIN_SCHOOLS_FOR_COMPLETION) {
            setError(`Please add ${MIN_SCHOOLS_FOR_COMPLETION} schools before completing Action 2.`);
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            await setWeeklyActionStatus({
                athleteId: targetAthleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });

            navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
        } catch (completeError) {
            setError(completeError?.message || 'Unable to mark this action complete right now.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="rs-page">
                <div className="rs-top-row">
                    <Link to="/weekly-plan" className="rs-back-link">Back to Plan</Link>
                    <span className="rs-action-pill">Action {actionNumber} of 3</span>
                </div>

                <header className="rs-header">
                    <div className="rs-progress-track" aria-hidden="true">
                        <div className="rs-progress-value" style={{ width: '66%' }} />
                    </div>
                    <h1>🎯 Research Schools with Reality-Based Match Scores</h1>
                    <p>
                        Build a smart list using athletic fit, geography, academics, and cost.
                        Dream schools stay on the board, but this engine forces realistic pivots.
                    </p>
                    <div className="rs-submeta">
                        <span>⏱ ~15 min</span>
                        <span>{athleteRow?.grad_year ? `Class of ${athleteRow.grad_year}` : 'Grad year not set'}</span>
                        <span>{activeSport ? `Sport: ${activeSport}` : 'Sport not set'}</span>
                        <span>{userLocation.state ? `Home: ${userLocation.state}` : 'Home state not set'}</span>
                    </div>
                </header>

                <section className="rs-section">
                    <h2>Start With Dream Schools</h2>
                    <p>Search any school and add it as a dream. You will get a direct reality score and pivot options if fit is weak.</p>

                    <DivisionFilters filters={divisionFilters} onToggle={toggleDivision} />

                    <label className="rs-search-label">
                        <span>Dream school search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search Tennessee, Stanford, UCLA, Duke..."
                            aria-label="Search schools"
                        />
                    </label>

                    {searchQuery.trim().length > 0 && searchQuery.trim().length < SEARCH_MIN_LENGTH && (
                        <p className="rs-inline-note">Type at least {SEARCH_MIN_LENGTH} characters to search.</p>
                    )}

                    {searchResults.length > 0 && (
                        <div className="rs-search-results">
                            {searchResults.map((school) => (
                                <SchoolCard
                                    key={school.id}
                                    school={school}
                                    previewCategory={school.match_category}
                                    disabled={isSaving || selectedSchools.length >= MAX_SELECTED_SCHOOLS}
                                    addLabel="Add as Dream"
                                    isDream
                                    onAdd={() => addSchool(school, { isDream: true })}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="rs-section">
                    <h2>🗺️ Top 25 Schools Within 300 Miles</h2>
                    <p>These schools are geographically practical and prioritized when they recruit your state heavily.</p>

                    {loading && <p className="rs-inline-note">Loading school intelligence...</p>}

                    {catalogUnavailable && (
                        <p className="rs-error-text">School catalog unavailable until migration/seed is applied.</p>
                    )}

                    {!catalogUnavailable && schoolsNearby.length === 0 && (
                        <p className="rs-inline-note">No nearby schools found with the active sport + division filters.</p>
                    )}

                    {!catalogUnavailable && schoolsNearby.length > 0 && (
                        <div className="rs-school-grid">
                            {schoolsNearby.map((school) => (
                                <SchoolCard
                                    key={school.id}
                                    school={school}
                                    previewCategory={school.match_category}
                                    disabled={isSaving || selectedSchools.length >= MAX_SELECTED_SCHOOLS}
                                    addLabel="+ Add"
                                    onAdd={() => addSchool(school, { isDream: false })}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="rs-section">
                    <h2>Your School List ({selectedSchools.length}/{MAX_SELECTED_SCHOOLS})</h2>
                    {selectedSchools.length === 0 ? (
                        <div className="rs-empty-state">No schools added yet. Add 3 to complete Action 2.</div>
                    ) : (
                        <div className="rs-selected-list">
                            {selectedSchools.map((school) => (
                                <SelectedSchoolCard
                                    key={school.id || `${school.school_name}-${school.school_location}`}
                                    school={school}
                                    onRemove={() => removeSchool(school)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {error && <div className="rs-error-banner">{error}</div>}

                <div className="rs-actions">
                    <button
                        type="button"
                        className="rs-btn rs-btn-muted"
                        onClick={handleSkip}
                        disabled={isSaving || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </button>
                    <button
                        type="button"
                        className="rs-btn is-primary"
                        onClick={handleComplete}
                        disabled={isSaving || isSkipping || loading}
                    >
                        {isSaving ? 'Saving...' : 'Save & Mark Complete'}
                    </button>
                </div>

                <PivotSuggestionModal
                    isOpen={showPivotSuggestion}
                    data={pivotData}
                    onClose={() => setShowPivotSuggestion(false)}
                    selectedSchoolCount={selectedSchools.length}
                    maxSelectedSchools={MAX_SELECTED_SCHOOLS}
                    onAddAlternative={(school) => addSchool(school, {
                        isDream: false,
                        isPivotSuggestion: true,
                        pivotFromSchoolId: pivotData?.pivotFromSchoolId || null
                    })}
                />
            </div>
        </DashboardLayout>
    );
}
