import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { getFeatureRebuildMessage, isMissingTableError } from '../../lib/dbResilience';
import { searchSchoolsWithFallback } from '../../lib/schoolCatalogClient';
import {
    resolveActionNumberFromSearch,
    resolveItemIdFromSearch,
    resolveWeekStartFromSearch,
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './week3-actions.css';

const CARD_CLASS = 'w3-card';
const SEARCH_MIN_LENGTH = 2;
const SEARCH_LIMIT = 12;
const TARGET_SCHOOL_COUNT = 10;

const DIVISION_OPTIONS = [
    { value: 'all', label: 'All Divisions' },
    { value: 'd1', label: 'D1' },
    { value: 'd2', label: 'D2' },
    { value: 'd3', label: 'D3' },
    { value: 'naia', label: 'NAIA' },
    { value: 'juco', label: 'JUCO' }
];

const CATEGORY_OPTIONS = [
    { value: 'dream', label: 'Dream' },
    { value: 'target', label: 'Target' },
    { value: 'safety', label: 'Safety' }
];

const CATEGORY_NORMALIZATION = {
    dream: 'dream',
    reach: 'dream',
    target: 'target',
    safety: 'safety',
    solid: 'safety'
};

function normalizeCategory(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return CATEGORY_NORMALIZATION[normalized] || 'target';
}

function normalizeSchoolNameInput(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeSavedSchool(row) {
    return {
        ...row,
        category: normalizeCategory(row.category)
    };
}

function formatDivision(division) {
    const normalized = String(division || '').trim().toLowerCase();
    return normalized ? normalized.toUpperCase() : 'N/A';
}

function formatSchoolLocation(school) {
    if (!school?.city && !school?.state) return '';
    if (!school?.city) return String(school.state || '');
    return `${school.city}, ${school.state}`;
}

export default function ExpandSchoolList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 3);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 3);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [error, setError] = useState('');
    const [searching, setSearching] = useState(false);
    const [divisionFilter, setDivisionFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [recommendationPicks, setRecommendationPicks] = useState([]);

    const trimmedSearchQuery = useMemo(
        () => normalizeSchoolNameInput(searchQuery),
        [searchQuery]
    );

    const selectedSchoolNames = useMemo(
        () => new Set(selectedSchools.map((school) => String(school.school_name || '').toLowerCase())),
        [selectedSchools]
    );

    const customSchoolCandidate = useMemo(() => {
        if (trimmedSearchQuery.length < SEARCH_MIN_LENGTH) return null;
        if (searching) return null;
        if (searchResults.length > 0) return null;
        if (selectedSchoolNames.has(trimmedSearchQuery.toLowerCase())) return null;
        return {
            name: trimmedSearchQuery,
            city: '',
            state: '',
            division: divisionFilter === 'all' ? null : divisionFilter,
            conference: null
        };
    }, [divisionFilter, searchResults.length, searching, selectedSchoolNames, trimmedSearchQuery]);

    const loadData = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const [savedSchoolsResult, recommendationsResult] = await Promise.all([
            supabase
                .from('athlete_saved_schools')
                .select('id, school_name, school_location, division, conference, category, notes, created_at')
                .eq('athlete_id', athleteId)
                .order('created_at', { ascending: true }),
            supabase
                .from('school_recommendations')
                .select('id, school_id, school_name, school_location, division, recommendation_score, dismissed, added_to_list')
                .eq('athlete_id', athleteId)
                .eq('week_number', 3)
                .eq('dismissed', false)
                .order('recommendation_score', { ascending: false })
                .limit(12)
        ]);

        if (savedSchoolsResult.error) {
            if (isMissingTableError(savedSchoolsResult.error)) {
                setError(getFeatureRebuildMessage('Saved school list'));
            } else {
                setError(savedSchoolsResult.error.message || 'Unable to load saved schools.');
            }
            setSelectedSchools([]);
            setLoading(false);
            return;
        }

        setSelectedSchools((savedSchoolsResult.data || []).map(normalizeSavedSchool));

        if (recommendationsResult.error && !isMissingTableError(recommendationsResult.error)) {
            setError(recommendationsResult.error.message || 'Unable to load recommendation picks.');
        }

        const savedNameSet = new Set(
            (savedSchoolsResult.data || []).map((row) => String(row.school_name || '').toLowerCase())
        );

        const picks = (recommendationsResult.data || [])
            .filter((row) => !savedNameSet.has(String(row.school_name || '').toLowerCase()))
            .map((row) => ({
                id: row.id,
                school_id: row.school_id,
                school_name: row.school_name,
                school_location: row.school_location,
                division: String(row.division || '').toLowerCase(),
                recommendation_score: row.recommendation_score
            }))
            .slice(0, 6);
        setRecommendationPicks(picks);

        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        let active = true;

        async function runSearch() {
            const trimmedQuery = trimmedSearchQuery;
            if (trimmedQuery.length < SEARCH_MIN_LENGTH) {
                setSearchResults([]);
                setSearching(false);
                return;
            }

            setSearching(true);

            try {
                const schools = await searchSchoolsWithFallback({
                    query: trimmedQuery,
                    divisionFilter,
                    limit: SEARCH_LIMIT
                });
                if (!active) return;

                const filtered = schools.filter(
                    (school) => !selectedSchoolNames.has(String(school.name || '').toLowerCase())
                );
                setSearchResults(filtered);
                setSearching(false);
            } catch (searchError) {
                if (!active) return;
                setError(searchError.message || 'Unable to search schools right now.');
                setSearchResults([]);
                setSearching(false);
            }
        }

        const timeoutId = window.setTimeout(runSearch, 200);
        return () => {
            active = false;
            window.clearTimeout(timeoutId);
        };
    }, [divisionFilter, selectedSchoolNames, trimmedSearchQuery]);

    const addSchool = useCallback(async (school, category = 'target') => {
        if (!athleteId || (!school?.school_name && !school?.name) || saving) return;
        const schoolName = school.school_name || school.name;
        if (selectedSchoolNames.has(String(schoolName || '').toLowerCase())) {
            setError(`${schoolName} is already in your list.`);
            return;
        }
        if (selectedSchools.length >= TARGET_SCHOOL_COUNT) {
            setError(`Free trial lists are capped at ${TARGET_SCHOOL_COUNT} schools. Upgrade to add more.`);
            return;
        }

        setSaving(true);
        setError('');

        const payload = {
            athlete_id: athleteId,
            school_name: schoolName,
            school_location: school.school_location || formatSchoolLocation(school),
            division: String(school.division || '').trim().toLowerCase() || null,
            conference: school.conference || null,
            category: normalizeCategory(category),
            notes: ''
        };

        const { data: insertedSchool, error: insertError } = await supabase
            .from('athlete_saved_schools')
            .upsert(payload, { onConflict: 'athlete_id,school_name' })
            .select('id, school_name, school_location, division, conference, category, notes, created_at')
            .single();

        if (insertError) {
            setSaving(false);
            setError(insertError.message || 'Unable to add this school right now.');
            return;
        }

        await supabase
            .from('school_recommendations')
            .update({ added_to_list: true, dismissed: false })
            .eq('athlete_id', athleteId)
            .eq('week_number', 3)
            .eq('school_name', schoolName);

        setSelectedSchools((previous) => [...previous, normalizeSavedSchool(insertedSchool)]);
        setRecommendationPicks((previous) => previous.filter((item) => (
            String(item.school_name || '').toLowerCase() !== String(schoolName || '').toLowerCase()
        )));
        setSearchQuery('');
        setSearchResults([]);
        setSaving(false);
    }, [athleteId, saving, selectedSchoolNames, selectedSchools.length]);

    const addCustomSchool = useCallback(async () => {
        if (!customSchoolCandidate) return;
        await addSchool(customSchoolCandidate, 'target');
    }, [addSchool, customSchoolCandidate]);

    const updateCategory = useCallback(async (schoolId, nextCategory) => {
        if (!schoolId || saving) return;

        const normalized = normalizeCategory(nextCategory);
        setSaving(true);
        setError('');

        const { error: updateError } = await supabase
            .from('athlete_saved_schools')
            .update({ category: normalized })
            .eq('id', schoolId);

        if (updateError) {
            setSaving(false);
            setError(updateError.message || 'Unable to update category.');
            return;
        }

        setSelectedSchools((previous) => previous.map((school) => (
            school.id === schoolId ? { ...school, category: normalized } : school
        )));
        setSaving(false);
    }, [saving]);

    const removeSchool = useCallback(async (schoolId) => {
        if (!schoolId || saving) return;
        setSaving(true);
        setError('');

        const { error: deleteError } = await supabase
            .from('athlete_saved_schools')
            .delete()
            .eq('id', schoolId);

        if (deleteError) {
            setSaving(false);
            setError(deleteError.message || 'Unable to remove school.');
            return;
        }

        setSelectedSchools((previous) => previous.filter((school) => school.id !== schoolId));
        setSaving(false);
    }, [saving]);

    const handleSkip = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;
        setError('');
        setIsSkipping(true);
        try {
            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'skipped'
            });
            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
            } else {
                setError(skipError?.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, weekNumber, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;

        if (selectedSchools.length < TARGET_SCHOOL_COUNT) {
            setError(`Add ${TARGET_SCHOOL_COUNT - selectedSchools.length} more school(s) to reach your Week 3 goal.`);
            return;
        }

        setError('');
        setIsCompleting(true);
        try {
            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });
            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
        } catch (completeError) {
            if (isMissingTableError(completeError)) {
                navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
            } else {
                setError(completeError?.message || 'Unable to complete this action right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, selectedSchools.length, weekNumber, weekStartDate]);

    const counts = useMemo(() => ({
        dream: selectedSchools.filter((school) => normalizeCategory(school.category) === 'dream').length,
        target: selectedSchools.filter((school) => normalizeCategory(school.category) === 'target').length,
        safety: selectedSchools.filter((school) => normalizeCategory(school.category) === 'safety').length
    }), [selectedSchools]);

    const schoolsNeeded = Math.max(0, TARGET_SCHOOL_COUNT - selectedSchools.length);
    const progressPercent = Math.min(100, Math.round((selectedSchools.length / TARGET_SCHOOL_COUNT) * 100));
    const safetyNeeded = Math.max(0, 2 - counts.safety);

    return (
        <DashboardLayout>
            <div className="w3-page">
                <div className="w3-top-row">
                    <Link to={weeklyPlanHref} className="w3-back-link">Back to Plan</Link>
                    <span className="w3-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w3-header`}>
                    <h1>Expand Your School List to 10 Schools</h1>
                    <p>Use Week 3 intelligence to build a balanced Dream, Target, and Safety list.</p>

                    <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-800">
                            Goal: {selectedSchools.length}/{TARGET_SCHOOL_COUNT} schools
                        </p>
                        <div className="w3-progress-track mt-2">
                            <div className="w3-progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            {schoolsNeeded > 0
                                ? `Add ${schoolsNeeded} more to hit your target.`
                                : 'Goal reached. Your list is now conversion-ready.'}
                        </p>
                    </div>

                    <div className="w3-goal-grid">
                        <div className="w3-goal-item">
                            <span className="w3-goal-count">{counts.dream}</span>
                            <span className="w3-goal-label">Dream</span>
                        </div>
                        <div className="w3-goal-item">
                            <span className="w3-goal-count">{counts.target}</span>
                            <span className="w3-goal-label">Target</span>
                        </div>
                        <div className="w3-goal-item">
                            <span className="w3-goal-count">{counts.safety}</span>
                            <span className="w3-goal-label">Safety</span>
                        </div>
                    </div>

                    {safetyNeeded > 0 && (
                        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            Add {safetyNeeded} more safety school{safetyNeeded > 1 ? 's' : ''} for a more resilient list.
                        </p>
                    )}
                </section>

                <section className={CARD_CLASS}>
                    <h2 className="text-xl font-semibold text-gray-900">Suggested Picks from AI</h2>
                    {recommendationPicks.length === 0 ? (
                        <p className="w3-empty mt-3">No saved recommendations yet. Search manually below to continue expanding.</p>
                    ) : (
                        <div className="mt-3 grid gap-2">
                            {recommendationPicks.map((pick) => (
                                <div key={pick.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{pick.school_name}</p>
                                        <p className="text-xs text-gray-600">
                                            {(pick.division || '').toUpperCase()} • {pick.school_location || 'Location unavailable'} • Match {pick.recommendation_score || 0}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        className="h-9 rounded-[10px] bg-[#6C2EB9] px-3 text-xs font-semibold text-white hover:bg-[#5B25A0]"
                                        onClick={() => addSchool(pick, 'target')}
                                        disabled={saving || isCompleting || isSkipping}
                                    >
                                        Add to List
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className={CARD_CLASS}>
                    <h2 className="text-xl font-semibold text-gray-900">Search Schools</h2>
                    <p className="mt-1 text-sm text-gray-600">Same Week 1 workflow, now with a clear balance target.</p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Division</span>
                            <select
                                value={divisionFilter}
                                onChange={(event) => setDivisionFilter(event.target.value)}
                                className="w-full rounded-[10px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#6C2EB9]"
                                disabled={loading || saving}
                            >
                                {DIVISION_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">School Name</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search Purdue, Tennessee, Notre Dame..."
                                className="w-full rounded-[10px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#6C2EB9]"
                                disabled={loading || saving}
                            />
                        </label>
                    </div>

                    {trimmedSearchQuery.length > 0 && trimmedSearchQuery.length < SEARCH_MIN_LENGTH && (
                        <p className="mt-2 text-xs font-medium text-gray-600">Type at least {SEARCH_MIN_LENGTH} characters to search.</p>
                    )}

                    {searching && (
                        <p className="mt-2 text-xs font-medium text-gray-600">Searching schools...</p>
                    )}

                    {searchResults.length > 0 && (
                        <div className="mt-3 grid gap-2">
                            {searchResults.map((school) => (
                                <div key={school.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {formatDivision(school.division)} • {formatSchoolLocation(school)}
                                            {school.conference ? ` • ${school.conference}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <Button
                                                key={`${school.id}-${option.value}`}
                                                type="button"
                                                variant="outline"
                                                className="h-8 rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-xs font-semibold text-gray-700"
                                                onClick={() => addSchool(school, option.value)}
                                                disabled={saving}
                                            >
                                                Add {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {trimmedSearchQuery.length >= SEARCH_MIN_LENGTH && !searching && searchResults.length === 0 && (
                        <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-gray-600">
                                No results found. Try another spelling or division filter.
                            </p>
                            {customSchoolCandidate ? (
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-[#6C2EB9] underline-offset-2 hover:underline"
                                    onClick={addCustomSchool}
                                    disabled={loading || saving}
                                >
                                    Add "{customSchoolCandidate.name}" as a custom school
                                </button>
                            ) : null}
                        </div>
                    )}
                </section>

                <section className={CARD_CLASS}>
                    <h2 className="text-xl font-semibold text-gray-900">My School List ({selectedSchools.length})</h2>
                    {loading ? (
                        <p className="w3-empty mt-3">Loading saved schools...</p>
                    ) : selectedSchools.length === 0 ? (
                        <p className="w3-empty mt-3">No schools yet. Add your first school above.</p>
                    ) : (
                        <div className="mt-3 grid gap-2">
                            {selectedSchools.map((school) => (
                                <article key={school.id} className="rounded-lg border border-[#E5E7EB] bg-white p-3">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{school.school_name}</p>
                                            <p className="text-xs text-gray-600">
                                                {formatDivision(school.division)} • {school.school_location || 'Location unavailable'}
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-[#D8B4FE] bg-[#F8F2FF] px-2 py-1 text-xs font-semibold text-[#6C2EB9]">
                                            {normalizeCategory(school.category)}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <select
                                            value={normalizeCategory(school.category)}
                                            onChange={(event) => updateCategory(school.id, event.target.value)}
                                            className="rounded-[10px] border border-[#D1D5DB] bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none transition focus:border-[#6C2EB9]"
                                            disabled={saving}
                                        >
                                            {CATEGORY_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 rounded-[10px] border border-[#E5E7EB] px-3 text-xs font-semibold text-gray-700"
                                            onClick={() => removeSchool(school.id)}
                                            disabled={saving}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="w3-upgrade-teaser">
                    <h3 className="text-lg font-semibold text-gray-900">Need More Than 10 Schools?</h3>
                    <p className="mt-1 text-sm text-gray-700">
                        Pro unlocks unlimited school tracking, coach contact enrichment, and advanced fit segmentation.
                    </p>
                    <div className="mt-3">
                        <Button
                            type="button"
                            className="h-10 rounded-[10px] bg-[#6C2EB9] px-4 text-sm font-semibold text-white hover:bg-[#5B25A0]"
                            onClick={() => navigate('/pricing')}
                        >
                            Upgrade to Pro - $25/mo
                        </Button>
                    </div>
                </section>

                {error && <div className="w3-error">{error}</div>}

                <div className="w3-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-[12px] border-2 border-[#D1D5DB] bg-white px-5 text-sm font-semibold text-gray-700"
                        onClick={handleSkip}
                        disabled={loading || saving || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="h-11 rounded-[12px] bg-[#6C2EB9] px-5 text-sm font-semibold text-white hover:bg-[#5B25A0]"
                        onClick={handleComplete}
                        disabled={loading || saving || isCompleting || isSkipping || !athleteId}
                    >
                        {isCompleting ? 'Saving...' : 'Save & Mark Complete'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
