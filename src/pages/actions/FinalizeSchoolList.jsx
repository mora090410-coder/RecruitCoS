import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { getFeatureRebuildMessage, isMissingTableError } from '../../lib/dbResilience';
import {
    resolveActionNumberFromSearch,
    resolveItemIdFromSearch,
    resolveWeekStartFromSearch,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './week4-actions.css';

const CARD_CLASS = 'w4-card';

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

function formatDivision(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized ? normalized.toUpperCase() : 'N/A';
}

function calculateBalance(schools) {
    const dreamCount = schools.filter((school) => normalizeCategory(school.category) === 'dream').length;
    const targetCount = schools.filter((school) => normalizeCategory(school.category) === 'target').length;
    const safetyCount = schools.filter((school) => normalizeCategory(school.category) === 'safety').length;

    const issues = [];
    const suggestions = [];

    if (safetyCount < 2) {
        issues.push('needs_more_safeties');
        suggestions.push(`Add ${2 - safetyCount} more safety school${2 - safetyCount === 1 ? '' : 's'} to reduce risk.`);
    }

    if (dreamCount > targetCount) {
        issues.push('too_many_reaches');
        suggestions.push('Shift one or more dream schools into target/safety options for a more executable list.');
    }

    if (schools.length < 8) {
        issues.push('list_too_small');
        suggestions.push(`Add ${8 - schools.length} more school${8 - schools.length === 1 ? '' : 's'} before Week 5 outreach.`);
    }

    if (targetCount < 3) {
        issues.push('needs_more_targets');
        suggestions.push(`Add ${3 - targetCount} more target school${3 - targetCount === 1 ? '' : 's'} to improve realistic options.`);
    }

    return {
        total_schools: schools.length,
        dream_count: dreamCount,
        target_count: targetCount,
        safety_count: safetyCount,
        is_balanced: issues.length === 0,
        balance_issues: issues,
        suggestions
    };
}

function BalanceStat({ label, count, tone }) {
    return (
        <article className={`w4-balance-stat w4-balance-stat-${tone}`}>
            <p className="w4-balance-stat-count">{count}</p>
            <p className="w4-balance-stat-label">{label}</p>
        </article>
    );
}

function SchoolReviewCard({ school, onRemove, disabled }) {
    return (
        <article className="w4-school-card">
            <div>
                <h4>{school.school_name}</h4>
                <p className="w4-school-meta">
                    {formatDivision(school.division)} • {school.school_location || 'Location unavailable'}
                </p>
                <span className={`w4-category-badge w4-category-${normalizeCategory(school.category)}`}>
                    {normalizeCategory(school.category)}
                </span>
            </div>
            <Button
                type="button"
                variant="outline"
                className="w4-remove-button"
                onClick={onRemove}
                disabled={disabled}
                aria-label={`Remove ${school.school_name} from your list`}
            >
                Remove
            </Button>
        </article>
    );
}

export default function FinalizeSchoolList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 3);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [error, setError] = useState('');

    const balance = useMemo(() => calculateBalance(schools), [schools]);

    const loadSchools = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: loadError } = await supabase
            .from('athlete_saved_schools')
            .select('id, school_name, school_location, division, category, created_at')
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: true });

        if (loadError) {
            if (isMissingTableError(loadError)) {
                setError(getFeatureRebuildMessage('School list'));
            } else {
                setError(loadError.message || 'Unable to load school list.');
            }
            setSchools([]);
            setLoading(false);
            return;
        }

        setSchools((data || []).map((row) => ({
            ...row,
            category: normalizeCategory(row.category)
        })));
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadSchools();
    }, [loadSchools]);

    const handleRemoveSchool = useCallback(async (schoolId) => {
        if (!schoolId || saving) return;

        setSaving(true);
        setError('');

        const { error: deleteError } = await supabase
            .from('athlete_saved_schools')
            .delete()
            .eq('id', schoolId);

        if (deleteError) {
            setError(deleteError.message || 'Unable to remove this school right now.');
            setSaving(false);
            return;
        }

        setSchools((previous) => previous.filter((school) => school.id !== schoolId));
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
            navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
            } else {
                setError(skipError?.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;

        setError('');
        setIsCompleting(true);

        const reviewPayload = {
            athlete_id: athleteId,
            total_schools: balance.total_schools,
            dream_count: balance.dream_count,
            target_count: balance.target_count,
            safety_count: balance.safety_count,
            is_balanced: balance.is_balanced,
            balance_issues: balance.balance_issues,
            suggestions: balance.suggestions
        };

        try {
            const { error: saveError } = await supabase
                .from('school_list_reviews')
                .insert([reviewPayload]);

            if (saveError) throw saveError;

            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });
            navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
        } catch (completeError) {
            if (isMissingTableError(completeError)) {
                navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
            } else {
                setError(completeError?.message || 'Unable to save list review right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [actionItemId, actionNumber, athleteId, balance, isCompleting, isSkipping, navigate, weekStartDate]);

    return (
        <DashboardLayout>
            <div className="w4-page">
                <div className="w4-top-row">
                    <Link to="/weekly-plan" className="w4-back-link">Back to Plan</Link>
                    <span className="w4-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w4-header`}>
                    <h1>Finalize Your School List</h1>
                    <p>Balance your Dream, Target, and Safety mix before Week 5 outreach tools unlock.</p>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Your Current List ({schools.length} schools)</h2>
                        <p>Balanced lists convert better once coach outreach starts.</p>
                    </div>

                    <div className="w4-balance-grid">
                        <BalanceStat label="Dream" count={balance.dream_count} tone="dream" />
                        <BalanceStat label="Target" count={balance.target_count} tone="target" />
                        <BalanceStat label="Safety" count={balance.safety_count} tone="safety" />
                    </div>

                    {balance.is_balanced ? (
                        <p className="w4-balance-good">Your list is balanced and Week 5-ready.</p>
                    ) : (
                        <div className="w4-balance-alert">
                            <h3>Balance check: Action needed</h3>
                            {balance.suggestions.map((suggestion) => (
                                <p key={suggestion}>• {suggestion}</p>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                className="w4-inline-button"
                                onClick={() => navigate('/actions/research-schools')}
                            >
                                Add More Schools
                            </Button>
                        </div>
                    )}
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Review Each School</h2>
                        <p>Remove schools you no longer plan to pursue.</p>
                    </div>

                    {loading ? (
                        <p className="w4-empty">Loading school list...</p>
                    ) : schools.length === 0 ? (
                        <p className="w4-empty">No schools saved yet. Add schools before finalizing this action.</p>
                    ) : (
                        <div className="w4-school-list">
                            {schools.map((school) => (
                                <SchoolReviewCard
                                    key={school.id}
                                    school={school}
                                    onRemove={() => handleRemoveSchool(school.id)}
                                    disabled={saving || isCompleting || isSkipping}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="w4-upgrade-gate" aria-label="Week 5 Pro preview">
                    <div className="w4-gate-lock" aria-hidden="true">🔓</div>
                    <h3>Week 5 (Pro) Unlocks Direct Outreach Tools</h3>
                    <p>Finishing Week 4 sets up your outreach stack for the next phase.</p>
                    <ul>
                        <li>Coach contact details for your full list</li>
                        <li>Detailed AI fit scoring per school</li>
                        <li>Outreach sequence planning by school priority</li>
                    </ul>
                    <Button type="button" className="w4-upgrade-button" onClick={() => navigate('/upgrade')}>
                        Upgrade to Pro - $25/mo
                    </Button>
                </section>

                {error && <div className="w4-error">{error}</div>}

                <div className="w4-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="w4-skip-button"
                        onClick={handleSkip}
                        disabled={loading || saving || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="w4-primary-button"
                        onClick={handleComplete}
                        disabled={loading || saving || isCompleting || isSkipping || !athleteId}
                    >
                        {isCompleting ? 'Saving...' : 'Finalize List & Mark Complete'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
