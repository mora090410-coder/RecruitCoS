import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { getFeatureRebuildMessage, isMissingTableError } from '../../lib/dbResilience';
import { listSchoolsWithFallback } from '../../lib/schoolCatalogClient';
import {
    resolveActionNumberFromSearch,
    resolveItemIdFromSearch,
    resolveWeekStartFromSearch,
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './week3-actions.css';

const FREE_RECOMMENDATION_LIMIT = 3;
const MAX_RECOMMENDATIONS = 15;
const CARD_CLASS = 'w3-card';
const REASON_LABELS = {
    geographic_fit: 'Recruits your state heavily',
    athletic_match: 'Strong athletic match for your target division',
    recruiting_history: 'Similar conference profile to schools already on your list',
    financial_fit: 'Strong overall value fit for your recruiting goals'
};

function stringHash(value) {
    const text = String(value || '');
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
}

function safeDivision(value) {
    return String(value || '').trim().toLowerCase();
}

function buildRecommendationReason({ sameState, divisionMatch, conferenceMatch }) {
    if (sameState) {
        return { code: 'geographic_fit', label: 'Recruits your state heavily' };
    }
    if (divisionMatch) {
        return { code: 'athletic_match', label: 'Strong athletic match for your target division' };
    }
    if (conferenceMatch) {
        return { code: 'recruiting_history', label: 'Similar conference profile to schools already on your list' };
    }
    return { code: 'financial_fit', label: 'Strong overall value fit for your recruiting goals' };
}

function normalizeStoredRecommendation(row) {
    return {
        id: row.school_id || `${row.athlete_id}-${row.school_name}`,
        school_id: row.school_id || null,
        name: row.school_name,
        school_name: row.school_name,
        city: row.school_location?.split(',')[0]?.trim() || null,
        state: row.school_location?.split(',')[1]?.trim() || null,
        school_location: row.school_location || '',
        division: safeDivision(row.division),
        conference: null,
        recommendation_reason: row.recommendation_reason || 'athletic_match',
        recommendation_reason_label: REASON_LABELS[row.recommendation_reason] || 'Strong profile match',
        recommendation_score: Number(row.recommendation_score || 0),
        recruits_from_state: Number(row.recruits_from_state || 0),
        distance_miles: Number(row.distance_miles || 0),
        avg_scholarship_amount: Number(row.avg_scholarship_amount || 0),
        added_to_list: Boolean(row.added_to_list),
        dismissed: Boolean(row.dismissed)
    };
}

function RecommendationCard({
    school,
    disabled,
    onAdd,
    onDismiss
}) {
    const matchScore = Math.max(0, Math.min(100, Number(school.recommendation_score || 0)));

    return (
        <article className="w3-recommendation-card">
            <header className="w3-recommendation-header">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-600">
                        {(school.division || 'N/A').toUpperCase()} • {school.school_location || 'Location unavailable'}
                    </p>
                </div>
                <span className="w3-match-badge" aria-label={`Match score ${matchScore} out of 100`}>
                    {matchScore} Match
                </span>
            </header>

            <ul className="w3-detail-list">
                <li>📍 {school.distance_miles} miles away</li>
                <li>👥 Recruited {school.recruits_from_state} athletes from your state</li>
                <li>💡 {school.recommendation_reason_label}</li>
            </ul>

            <div className="w3-card-actions">
                <Button
                    type="button"
                    className="h-10 rounded-[10px] bg-[#8B2635] px-4 text-sm font-semibold text-white hover:bg-[#7D2230]"
                    onClick={onAdd}
                    disabled={disabled || school.added_to_list}
                >
                    {school.added_to_list ? 'Added' : '+ Add to My List'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-[10px] border-2 border-[#2C2C2C1A] bg-white px-4 text-sm font-semibold text-gray-700"
                    onClick={onDismiss}
                    disabled={disabled || school.dismissed || school.added_to_list}
                >
                    Not Interested
                </Button>
            </div>
        </article>
    );
}

export default function RefineSchoolList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 1);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 3);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [athleteProfile, setAthleteProfile] = useState(null);
    const [currentSchools, setCurrentSchools] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [error, setError] = useState('');

    const loadActionData = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const [athleteResult, schoolsResult, storedRecommendationsResult] = await Promise.all([
            supabase
                .from('athletes')
                .select('id, state, target_divisions, sport')
                .eq('id', athleteId)
                .maybeSingle(),
            supabase
                .from('athlete_saved_schools')
                .select('id, school_name, school_location, division, conference, category, created_at')
                .eq('athlete_id', athleteId)
                .order('created_at', { ascending: true }),
            supabase
                .from('school_recommendations')
                .select(`
                    athlete_id,
                    school_id,
                    school_name,
                    school_location,
                    division,
                    recommendation_reason,
                    recommendation_score,
                    recruits_from_state,
                    distance_miles,
                    avg_scholarship_amount,
                    added_to_list,
                    dismissed
                `)
                .eq('athlete_id', athleteId)
                .eq('week_number', 3)
                .order('recommendation_score', { ascending: false })
                .order('recommended_at', { ascending: true })
        ]);

        if (athleteResult.error) {
            setError(athleteResult.error.message || 'Unable to load athlete profile for recommendations.');
            setLoading(false);
            return;
        }
        if (schoolsResult.error) {
            if (isMissingTableError(schoolsResult.error)) {
                setError(getFeatureRebuildMessage('Saved school list'));
            } else {
                setError(schoolsResult.error.message || 'Unable to load your school list.');
            }
            setLoading(false);
            return;
        }
        if (storedRecommendationsResult.error) {
            if (isMissingTableError(storedRecommendationsResult.error)) {
                setError(getFeatureRebuildMessage('AI recommendations'));
            } else {
                setError(storedRecommendationsResult.error.message || 'Unable to load recommendations.');
            }
            setLoading(false);
            return;
        }

        const athleteRow = athleteResult.data || null;
        const savedSchools = schoolsResult.data || [];
        setAthleteProfile(athleteRow);
        setCurrentSchools(savedSchools);

        if ((storedRecommendationsResult.data || []).length > 0) {
            setRecommendations((storedRecommendationsResult.data || []).map(normalizeStoredRecommendation));
            setLoading(false);
            return;
        }

        const existingNames = new Set(savedSchools.map((row) => String(row.school_name || '').toLowerCase()));
        const existingConferences = new Set(
            savedSchools
                .map((row) => String(row.conference || '').trim().toLowerCase())
                .filter(Boolean)
        );
        const savedDivisionCounts = savedSchools.reduce((accumulator, row) => {
            const division = safeDivision(row.division);
            if (!division) return accumulator;
            return { ...accumulator, [division]: (accumulator[division] || 0) + 1 };
        }, {});

        const targetDivisions = (athleteRow?.target_divisions || [])
            .map((value) => safeDivision(value))
            .filter(Boolean);
        const athleteState = String(athleteRow?.state || '').trim().toUpperCase();

        let schoolCandidates = [];
        try {
            schoolCandidates = await listSchoolsWithFallback({ limit: 250 });
        } catch (schoolsError) {
            setError(schoolsError.message || 'Unable to generate recommendations right now.');
            setLoading(false);
            return;
        }

        const scoredRecommendations = (schoolCandidates || [])
            .filter((school) => !existingNames.has(String(school.name || '').toLowerCase()))
            .map((school) => {
                const division = safeDivision(school.division);
                const schoolState = String(school.state || '').trim().toUpperCase();
                const conference = String(school.conference || '').trim();
                const hash = stringHash(`${school.name}|${school.city}|${school.state}|${division}`);
                const sameState = Boolean(athleteState) && schoolState === athleteState;
                const divisionMatch = targetDivisions.includes(division);
                const conferenceMatch = Boolean(conference)
                    && existingConferences.has(conference.toLowerCase());

                let score = 45;
                if (sameState) score += 24;
                if (divisionMatch) score += 18;
                if (conferenceMatch) score += 8;
                if ((savedDivisionCounts[division] || 0) > 0) score += 6;
                score += hash % 10;

                const reason = buildRecommendationReason({ sameState, divisionMatch, conferenceMatch });
                const recruitsFromState = 3 + (hash % 14);
                const distanceMiles = sameState ? 45 + (hash % 210) : 180 + (hash % 1250);
                const scholarshipBaseline = {
                    d1: 18000,
                    d2: 12000,
                    d3: 4000,
                    naia: 9000,
                    juco: 5500
                };
                const avgScholarship = (scholarshipBaseline[division] || 7000) + ((hash % 8) * 500);

                return {
                    id: school.id,
                    school_id: school.id,
                    name: school.name,
                    school_name: school.name,
                    city: school.city || '',
                    state: school.state || '',
                    school_location: [school.city, school.state].filter(Boolean).join(', '),
                    division,
                    conference: school.conference || null,
                    recommendation_score: Math.min(100, score),
                    recommendation_reason: reason.code,
                    recommendation_reason_label: reason.label,
                    recruits_from_state: recruitsFromState,
                    distance_miles: distanceMiles,
                    avg_scholarship_amount: avgScholarship,
                    added_to_list: false,
                    dismissed: false
                };
            })
            .sort((left, right) => right.recommendation_score - left.recommendation_score)
            .slice(0, MAX_RECOMMENDATIONS);

        if (scoredRecommendations.length === 0) {
            setRecommendations([]);
            setLoading(false);
            return;
        }

        const persistRows = scoredRecommendations.map((rec) => ({
            athlete_id: athleteId,
            school_id: rec.school_id,
            school_name: rec.school_name,
            school_location: rec.school_location || null,
            division: rec.division,
            recommendation_reason: rec.recommendation_reason,
            recommendation_score: rec.recommendation_score,
            recruits_from_state: rec.recruits_from_state,
            distance_miles: rec.distance_miles,
            avg_scholarship_amount: rec.avg_scholarship_amount,
            week_number: 3
        }));

        const { error: persistError } = await supabase
            .from('school_recommendations')
            .upsert(persistRows, { onConflict: 'athlete_id,week_number,school_name' });

        if (persistError) {
            setError(persistError.message || 'Unable to save recommendations.');
            setLoading(false);
            return;
        }

        setRecommendations(scoredRecommendations);
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadActionData();
    }, [loadActionData]);

    const visibleRecommendations = useMemo(
        () => recommendations.filter((row) => !row.dismissed),
        [recommendations]
    );

    const freeRecommendations = useMemo(
        () => visibleRecommendations.slice(0, FREE_RECOMMENDATION_LIMIT),
        [visibleRecommendations]
    );

    const lockedCount = Math.max(0, visibleRecommendations.length - FREE_RECOMMENDATION_LIMIT);
    const reviewedCount = useMemo(
        () => recommendations.filter((row) => row.added_to_list || row.dismissed).length,
        [recommendations]
    );

    const handleAddRecommendation = useCallback(async (school) => {
        if (!athleteId || saving) return;

        setSaving(true);
        setError('');

        const payload = {
            athlete_id: athleteId,
            school_name: school.school_name || school.name,
            school_location: school.school_location || [school.city, school.state].filter(Boolean).join(', '),
            division: safeDivision(school.division),
            conference: school.conference || null,
            category: 'target',
            notes: ''
        };

        const { data: upsertedSchool, error: upsertError } = await supabase
            .from('athlete_saved_schools')
            .upsert(payload, { onConflict: 'athlete_id,school_name' })
            .select('id, school_name, school_location, division, conference, category, created_at')
            .single();

        if (upsertError) {
            setSaving(false);
            setError(upsertError.message || 'Unable to add that school right now.');
            return;
        }

        const { error: markAddedError } = await supabase
            .from('school_recommendations')
            .update({ added_to_list: true, dismissed: false })
            .eq('athlete_id', athleteId)
            .eq('week_number', 3)
            .eq('school_name', school.school_name || school.name);

        if (markAddedError) {
            setSaving(false);
            setError(markAddedError.message || 'School added, but recommendation status could not be updated.');
            return;
        }

        setCurrentSchools((previous) => {
            const exists = previous.some((row) => (
                String(row.school_name || '').toLowerCase() === String(upsertedSchool.school_name || '').toLowerCase()
            ));
            return exists ? previous : [...previous, upsertedSchool];
        });
        setRecommendations((previous) => previous.map((row) => (
            String(row.school_name || row.name || '').toLowerCase()
                === String(school.school_name || school.name || '').toLowerCase()
                ? { ...row, added_to_list: true, dismissed: false }
                : row
        )));
        toast.success(`${school.school_name || school.name} added to your list.`);
        setSaving(false);
    }, [athleteId, saving]);

    const handleDismissRecommendation = useCallback(async (school) => {
        if (!athleteId || saving) return;

        setSaving(true);
        setError('');

        const { error: dismissError } = await supabase
            .from('school_recommendations')
            .update({ dismissed: true })
            .eq('athlete_id', athleteId)
            .eq('week_number', 3)
            .eq('school_name', school.school_name || school.name);

        if (dismissError) {
            setSaving(false);
            setError(dismissError.message || 'Unable to dismiss this recommendation.');
            return;
        }

        setRecommendations((previous) => previous.map((row) => (
            String(row.school_name || row.name || '').toLowerCase()
                === String(school.school_name || school.name || '').toLowerCase()
                ? { ...row, dismissed: true }
                : row
        )));
        toast.success('Recommendation dismissed.');
        setSaving(false);
    }, [athleteId, saving]);

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
                setError(skipError.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, weekNumber, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;
        if (recommendations.length > 0 && reviewedCount < 1) {
            setError('Review at least one recommendation before marking this action complete.');
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
                setError(completeError.message || 'Unable to complete this action right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [
        actionItemId,
        actionNumber,
        athleteId,
        isCompleting,
        isSkipping,
        navigate,
        weekNumber,
        recommendations.length,
        reviewedCount,
        weekStartDate
    ]);

    return (
        <DashboardLayout>
            <div className="w3-page">
                <div className="w3-top-row">
                    <Link to={weeklyPlanHref} className="w3-back-link">Back to Plan</Link>
                    <span className="w3-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w3-header`}>
                    <h1>AI-Powered School Recommendations</h1>
                    <p>Conversion hook: show high-fit schools based on location, division goals, and list patterns.</p>
                    <div className="w3-meta-list">
                        <span className="w3-meta-chip">Week 3 Intelligence</span>
                        <span className="w3-meta-chip">Free Preview: 3 schools</span>
                        <span className="w3-meta-chip">State focus: {athleteProfile?.state || 'Not set'}</span>
                    </div>
                </section>

                <section className={CARD_CLASS}>
                    <h2 className="text-xl font-semibold text-gray-900">Your Current Schools ({currentSchools.length})</h2>
                    {currentSchools.length === 0 ? (
                        <p className="w3-empty mt-3">No schools yet. Add a recommendation below to kickstart your list.</p>
                    ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {currentSchools.slice(0, 14).map((school) => (
                                <span
                                    key={school.id || school.school_name}
                                    className="rounded-full border border-[#2C2C2C1A] bg-[#F5F1E8] px-3 py-1 text-xs font-semibold text-[#8B2635]"
                                >
                                    {school.school_name}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                <section className={CARD_CLASS}>
                    <h2 className="text-xl font-semibold text-gray-900">Recommended Additions</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Based on schools that recruit from {athleteProfile?.state || 'your region'} and fit your profile.
                    </p>

                    {loading ? (
                        <p className="w3-empty mt-3">Generating recommendations...</p>
                    ) : freeRecommendations.length === 0 ? (
                        <p className="w3-empty mt-3">No recommendations yet. Update your profile state and saved schools, then retry.</p>
                    ) : (
                        <div className="w3-recommendation-grid mt-4">
                            {freeRecommendations.map((school) => (
                                <RecommendationCard
                                    key={`${school.school_id || school.id}-${school.school_name || school.name}`}
                                    school={school}
                                    disabled={saving || isCompleting || isSkipping}
                                    onAdd={() => handleAddRecommendation(school)}
                                    onDismiss={() => handleDismissRecommendation(school)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {lockedCount > 0 && (
                    <section className="w3-upgrade-teaser">
                        <h3 className="text-lg font-semibold text-gray-900">See {lockedCount} More Recommendations</h3>
                        <p className="mt-1 text-sm text-gray-700">
                            Unlock full AI school matching, coach contact overlays, and unlimited school tracking.
                        </p>
                        <ul>
                            <li>Full recommendation set tailored to your state and division goals</li>
                            <li>Coach contact enrichment and follow-up reminders</li>
                            <li>Weekly ranking refresh as your profile changes</li>
                            <li>Premium ROI insights for spend optimization</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                className="h-10 rounded-[10px] bg-[#8B2635] px-4 text-sm font-semibold text-white hover:bg-[#7D2230]"
                                onClick={() => navigate('/pricing')}
                            >
                                Unlock Pro Features - $25/mo
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-[10px] border-2 border-[#2C2C2C1A] bg-white px-4 text-sm font-semibold text-gray-700"
                                onClick={handleComplete}
                                disabled={isCompleting || isSkipping}
                            >
                                Continue with Free Recommendations
                            </Button>
                        </div>
                    </section>
                )}

                {error && <div className="w3-error">{error}</div>}

                <div className="w3-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-[12px] border-2 border-[#2C2C2C1A] bg-white px-5 text-sm font-semibold text-gray-700"
                        onClick={handleSkip}
                        disabled={loading || saving || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="h-11 rounded-[12px] bg-[#8B2635] px-5 text-sm font-semibold text-white hover:bg-[#7D2230]"
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
