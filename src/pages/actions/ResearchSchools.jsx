import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
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
import './research-schools.css';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_LIMIT = 12;

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

const CATEGORY_COPY = {
    dream: {
        title: 'Dream',
        icon: 'Dream',
        description: 'Reach schools that would be incredible outcomes. Keep 1 to 2 on your list.'
    },
    target: {
        title: 'Target',
        icon: 'Target',
        description: 'Schools that feel like a realistic fit based on what you know right now. Most of your list should live here.'
    },
    safety: {
        title: 'Safety',
        icon: 'Safety',
        description: 'Backup schools where you feel confident you can play. Keep a few of these for balance.'
    }
};

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

function formatDivision(division) {
    const normalized = String(division || '').trim().toLowerCase();
    if (!normalized) return 'N/A';
    return normalized.toUpperCase();
}

function formatSchoolLocation(school) {
    if (!school?.city && !school?.state) return '';
    if (!school?.city) return String(school.state || '');
    return `${school.city}, ${school.state}`;
}

function normalizeSavedSchool(row) {
    return {
        ...row,
        category: normalizeCategory(row?.category)
    };
}

function CategoryHelper({ isOpen, onClose, onOpen }) {
    if (!isOpen) {
        return (
            <div className="rs-category-helper-collapsed">
                <button type="button" className="rs-link-btn" onClick={onOpen}>
                    Show category guide
                </button>
            </div>
        );
    }

    return (
        <section className="rs-category-helper" aria-labelledby="school-category-guide-title">
            <div className="rs-category-helper-header">
                <h2 id="school-category-guide-title">What Dream, Target, and Safety mean</h2>
                <button type="button" className="rs-close-btn" onClick={onClose} aria-label="Hide category guide">
                    Close
                </button>
            </div>

            <div className="rs-category-card-grid">
                {CATEGORY_OPTIONS.map((option) => (
                    <article key={option.value} className={`rs-category-card rs-${option.value}`}>
                        <div className="rs-category-card-heading">
                            <span className="rs-category-pill">{CATEGORY_COPY[option.value].icon}</span>
                            <strong>{CATEGORY_COPY[option.value].title}</strong>
                        </div>
                        <p>{CATEGORY_COPY[option.value].description}</p>
                    </article>
                ))}
            </div>

            <p className="rs-helper-note">
                These are your own first-pass categories. In Week 3 and Week 4, we will layer in data-driven fit insights to help refine your list.
            </p>
        </section>
    );
}

function SchoolSearchResult({ school, onAdd, disabled }) {
    const [selectedCategory, setSelectedCategory] = useState('target');

    return (
        <article className="rs-search-result" aria-label={`Add ${school.name}`}>
            <div className="rs-school-info">
                <h3>{school.name}</h3>
                <p>
                    {formatDivision(school.division)} • {formatSchoolLocation(school)}
                    {school.conference ? ` • ${school.conference}` : ''}
                </p>
            </div>

            <div className="rs-search-result-actions">
                <label className="rs-inline-label" htmlFor={`category-${school.id}`}>Category</label>
                <select
                    id={`category-${school.id}`}
                    className="rs-select"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    disabled={disabled}
                >
                    {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <button
                    type="button"
                    className="rs-btn rs-btn-primary"
                    onClick={() => onAdd(selectedCategory)}
                    disabled={disabled}
                >
                    Add
                </button>
            </div>
        </article>
    );
}

function SelectedSchoolCard({ school, onUpdateCategory, onRemove, disabled }) {
    const category = normalizeCategory(school.category);

    return (
        <article className="rs-selected-school-card">
            <div className="rs-selected-school-header">
                <div>
                    <h3>{school.school_name}</h3>
                    <p>
                        {formatDivision(school.division)} • {school.school_location || 'Location not set'}
                        {school.conference ? ` • ${school.conference}` : ''}
                    </p>
                </div>

                <span className={`rs-category-badge rs-${category}`}>{CATEGORY_COPY[category].title}</span>
            </div>

            <div className="rs-selected-school-controls">
                <label className="rs-inline-label" htmlFor={`saved-category-${school.id}`}>Update Category</label>
                <select
                    id={`saved-category-${school.id}`}
                    className="rs-select"
                    value={category}
                    onChange={(event) => onUpdateCategory(event.target.value)}
                    disabled={disabled}
                >
                    {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <button type="button" className="rs-btn rs-btn-danger" onClick={onRemove} disabled={disabled}>
                    Remove
                </button>
            </div>
        </article>
    );
}

export default function ResearchSchools() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 1);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );
    const athleteSport = useMemo(
        () => String(isImpersonating ? activeAthlete?.sport || '' : profile?.sport || '').trim().toLowerCase(),
        [activeAthlete?.sport, isImpersonating, profile?.sport]
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const [error, setError] = useState('');

    const [showCategoryHelper, setShowCategoryHelper] = useState(true);

    const [divisionFilter, setDivisionFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);

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

    const loadSavedSchools = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: loadError } = await supabase
            .from('athlete_saved_schools')
            .select('id, school_name, school_location, division, conference, category, notes, created_at')
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: true });

        if (loadError) {
            if (isMissingTableError(loadError)) {
                setError(getFeatureRebuildMessage('Saved school list'));
                setSelectedSchools([]);
            } else {
                setError(loadError.message || 'Unable to load your saved schools.');
            }
            setLoading(false);
            return;
        }

        setSelectedSchools((data || []).map(normalizeSavedSchool));
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        loadSavedSchools();
    }, [athleteId, loadSavedSchools]);

    useEffect(() => {
        let active = true;

        async function runSearch() {
            const trimmedQuery = trimmedSearchQuery;
            if (trimmedQuery.length < SEARCH_MIN_LENGTH) {
                setSearchResults([]);
                setSearching(false);
                return;
            }

            setError('');
            setSearching(true);

            try {
                const schools = await searchSchoolsWithFallback({
                    query: trimmedQuery,
                    divisionFilter,
                    limit: SEARCH_LIMIT,
                    sport: athleteSport
                });

                if (!active) return;

                const filtered = schools.filter(
                    (school) => !selectedSchoolNames.has(String(school.name || '').toLowerCase())
                );

                setSearchResults(filtered);
                setSearching(false);
            } catch (searchError) {
                if (!active) return;
                if (isMissingTableError(searchError)) {
                    setError(getFeatureRebuildMessage('School catalog'));
                } else {
                    setError(searchError.message || 'Unable to search schools right now.');
                }
                setSearchResults([]);
                setSearching(false);
            }
        }

        const timeoutId = window.setTimeout(runSearch, 200);

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
        };
    }, [athleteSport, divisionFilter, selectedSchoolNames, trimmedSearchQuery]);

    const addSchool = useCallback(async (school, category) => {
        if (!athleteId || !school?.name) return;

        if (selectedSchoolNames.has(String(school.name || '').toLowerCase())) {
            setError(`${school.name} is already in your list.`);
            return;
        }

        setSaving(true);
        setError('');

        const payload = {
            athlete_id: athleteId,
            school_name: school.name,
            school_location: formatSchoolLocation(school),
            division: String(school.division || '').trim().toLowerCase() || null,
            conference: school.conference || null,
            category: normalizeCategory(category),
            notes: ''
        };

        const { data, error: insertError } = await supabase
            .from('athlete_saved_schools')
            .upsert(payload, { onConflict: 'athlete_id,school_name' })
            .select('id, school_name, school_location, division, conference, category, notes, created_at')
            .single();

        if (insertError) {
            setSaving(false);
            if (isMissingTableError(insertError)) {
                setError(getFeatureRebuildMessage('Saved school list'));
                return;
            }
            setError(insertError.message || 'Unable to save this school right now.');
            return;
        }

        setSelectedSchools((previous) => {
            const existingIndex = previous.findIndex(
                (row) => String(row.school_name || '').toLowerCase() === String(data.school_name || '').toLowerCase()
            );

            if (existingIndex === -1) {
                return [...previous, normalizeSavedSchool(data)];
            }

            const next = [...previous];
            next[existingIndex] = normalizeSavedSchool(data);
            return next;
        });

        setSearchQuery('');
        setSearchResults([]);
        setSaving(false);
    }, [athleteId, selectedSchoolNames]);

    const addCustomSchool = useCallback(async () => {
        if (!customSchoolCandidate) return;
        await addSchool(customSchoolCandidate, 'target');
    }, [addSchool, customSchoolCandidate]);

    const removeSchool = useCallback(async (schoolId) => {
        if (!schoolId) return;

        setSaving(true);
        setError('');

        const { error: deleteError } = await supabase
            .from('athlete_saved_schools')
            .delete()
            .eq('id', schoolId);

        if (deleteError) {
            setSaving(false);
            setError(deleteError.message || 'Unable to remove school right now.');
            return;
        }

        setSelectedSchools((previous) => previous.filter((school) => school.id !== schoolId));
        setSaving(false);
    }, []);

    const updateSchoolCategory = useCallback(async (schoolId, nextCategory) => {
        if (!schoolId) return;

        const normalizedCategory = normalizeCategory(nextCategory);
        setSaving(true);
        setError('');

        const { error: updateError } = await supabase
            .from('athlete_saved_schools')
            .update({ category: normalizedCategory })
            .eq('id', schoolId);

        if (updateError) {
            setSaving(false);
            setError(updateError.message || 'Unable to update category right now.');
            return;
        }

        setSelectedSchools((previous) => previous.map((school) => (
            school.id === schoolId
                ? { ...school, category: normalizedCategory }
                : school
        )));
        setSaving(false);
    }, []);

    const handleSkip = useCallback(async () => {
        if (!athleteId || saving || skipping) return;

        setError('');
        setSkipping(true);

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
                setError(skipError.message || 'Unable to skip this action right now.');
            }
        } finally {
            setSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, navigate, saving, skipping, weekNumber, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || saving || skipping) return;

        if (selectedSchools.length < 1) {
            setError('Please add at least one school before marking Action 2 complete.');
            return;
        }

        setError('');
        setSaving(true);

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
                setError(completeError.message || 'Unable to complete this action right now.');
            }
        } finally {
            setSaving(false);
        }
    }, [actionItemId, actionNumber, athleteId, navigate, saving, selectedSchools.length, skipping, weekNumber, weekStartDate]);

    const counts = useMemo(() => ({
        dream: selectedSchools.filter((school) => normalizeCategory(school.category) === 'dream').length,
        target: selectedSchools.filter((school) => normalizeCategory(school.category) === 'target').length,
        safety: selectedSchools.filter((school) => normalizeCategory(school.category) === 'safety').length
    }), [selectedSchools]);

    return (
        <DashboardLayout>
            <div className="rs-page">
                <div className="rs-top-row">
                    <Link to={weeklyPlanHref} className="rs-back-link">Back to Plan</Link>
                    <span className="rs-action-pill">Action {actionNumber} of 3</span>
                </div>

                <header className="rs-header">
                    <div className="rs-progress-track" aria-hidden="true">
                        <div className="rs-progress-value" style={{ width: '66%' }} />
                    </div>
                    <h1>Build your Week 1 school list</h1>
                    <p>
                        Search any schools you are curious about and tag each one as Dream, Target, or Safety based on your current feel.
                        No stats or match scores required this week.
                    </p>
                    <div className="rs-submeta">
                        <span>Time: about 15 minutes</span>
                        <span>Low-friction exploration</span>
                        <span>Week 3-4 unlocks fit scoring</span>
                    </div>
                </header>

                <CategoryHelper
                    isOpen={showCategoryHelper}
                    onClose={() => setShowCategoryHelper(false)}
                    onOpen={() => setShowCategoryHelper(true)}
                />

                <section className="rs-section">
                    <h2>Search schools</h2>
                    <p>Start broad. You can always edit categories as your list evolves.</p>

                    <div className="rs-search-controls">
                        <label className="rs-filter-label" htmlFor="division-filter">Division</label>
                        <select
                            id="division-filter"
                            className="rs-select"
                            value={divisionFilter}
                            onChange={(event) => setDivisionFilter(event.target.value)}
                            disabled={loading || saving}
                        >
                            {DIVISION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <label className="rs-filter-label" htmlFor="school-search-input">School Name</label>
                        <input
                            id="school-search-input"
                            type="text"
                            className="rs-input"
                            placeholder="Search Tennessee, Purdue, Notre Dame..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            disabled={loading || saving}
                        />
                    </div>

                    {trimmedSearchQuery.length > 0 && trimmedSearchQuery.length < SEARCH_MIN_LENGTH && (
                        <p className="rs-inline-note">Type at least {SEARCH_MIN_LENGTH} characters to search.</p>
                    )}

                    {searching && (
                        <p className="rs-inline-note">Searching schools...</p>
                    )}

                    {searchResults.length > 0 && (
                        <div className="rs-search-results">
                            {searchResults.map((school) => (
                                <SchoolSearchResult
                                    key={school.id}
                                    school={school}
                                    onAdd={(category) => addSchool(school, category)}
                                    disabled={loading || saving}
                                />
                            ))}
                        </div>
                    )}

                    {trimmedSearchQuery.length >= SEARCH_MIN_LENGTH && !searching && searchResults.length === 0 && !error && (
                        <div className="rs-inline-note">
                            <p>No results found for that search and filter combination.</p>
                            {customSchoolCandidate ? (
                                <button type="button" className="rs-link-btn" onClick={addCustomSchool} disabled={loading || saving}>
                                    Add "{customSchoolCandidate.name}" as a custom school
                                </button>
                            ) : null}
                        </div>
                    )}
                </section>

                <section className="rs-section">
                    <h2>Your School List ({selectedSchools.length})</h2>

                    {loading ? (
                        <p className="rs-inline-note">Loading your school list...</p>
                    ) : null}

                    {!loading && selectedSchools.length === 0 ? (
                        <div className="rs-empty-state">
                            <p className="rs-empty-title">No schools added yet</p>
                            <p className="rs-empty-subtitle">Search above to add your first school.</p>
                        </div>
                    ) : null}

                    {!loading && selectedSchools.length > 0 ? (
                        <div className="rs-selected-list">
                            {selectedSchools.map((school) => (
                                <SelectedSchoolCard
                                    key={school.id}
                                    school={school}
                                    onUpdateCategory={(nextCategory) => updateSchoolCategory(school.id, nextCategory)}
                                    onRemove={() => removeSchool(school.id)}
                                    disabled={saving}
                                />
                            ))}
                        </div>
                    ) : null}

                    <div className="rs-list-summary" aria-live="polite">
                        <p>
                            {counts.dream} Dream • {counts.target} Target • {counts.safety} Safety
                        </p>
                    </div>
                </section>

                {error && <div className="rs-error-banner">{error}</div>}

                <div className="rs-actions">
                    <button
                        type="button"
                        className="rs-btn rs-btn-muted"
                        onClick={handleSkip}
                        disabled={loading || saving || skipping}
                    >
                        {skipping ? 'Skipping...' : 'Skip This'}
                    </button>
                    <button
                        type="button"
                        className="rs-btn rs-btn-primary"
                        onClick={handleComplete}
                        disabled={loading || saving || skipping || selectedSchools.length === 0}
                    >
                        {saving ? 'Saving...' : 'Save & Mark Complete'}
                    </button>
                </div>

                <section className="rs-help">
                    <p>
                        Building a balanced early list keeps momentum high. In Week 3 and Week 4, this same list becomes your conversion hook for deeper, data-backed school targeting.
                    </p>
                </section>
            </div>
        </DashboardLayout>
    );
}
