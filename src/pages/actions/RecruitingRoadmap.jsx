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
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './week4-actions.css';

const CARD_CLASS = 'w4-card';

const DEVELOPMENT_GOALS = [
    ['Focus on skill development plan', 'Attend 1-2 local showcases', 'Follow 5 target schools online'],
    ['Update measurable stats', 'Attend one summer camp at a target school', 'Publish or refresh highlight clips'],
    ['Register with NCAA Eligibility Center', 'Email 3-5 coaches with intro notes', 'Attend one fall exposure event'],
    ['Update recruiting profile and transcript details', 'Follow up with coaches from recent events', 'Map spring event schedule']
];

const EXPOSURE_GOALS = [
    ['Attend 3-4 major showcases', 'Email 10+ coaches with film and stats', 'Shortlist top 8-10 schools'],
    ['Attend camps at target schools', 'Refresh highlight video monthly', 'Plan 2-3 unofficial visits'],
    ['Maintain weekly coach outreach cadence', 'Track every interaction in CRM', 'Prepare for official-visit windows'],
    ['Evaluate scholarship and fit signals', 'Narrow list to top 3-5 schools', 'Finalize senior-year strategy']
];

const DECISION_GOALS = [
    ['Complete remaining visits', 'Compare financial aid + fit packages', 'Select top commitment path'],
    ['Prepare commitment timeline', 'Confirm admissions and eligibility milestones', 'Finalize post-commitment transition'],
    ['Review backup options', 'Communicate decisions with coaches', 'Finalize final-season development plan'],
    ['Close out all recruiting tasks', 'Store all docs and contacts', 'Transition focus to college readiness']
];

function addMonths(dateValue, months) {
    const next = new Date(dateValue);
    next.setMonth(next.getMonth() + months);
    return next;
}

function formatDate(value) {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function getQuarterKey(dateValue) {
    const quarter = Math.floor(dateValue.getMonth() / 3) + 1;
    return `${dateValue.getFullYear()}_Q${quarter}`;
}

function getQuarterLabel(quarterKey) {
    const [year, quarter] = String(quarterKey || '').split('_');
    if (!year || !quarter) return quarterKey;
    return `${quarter.replace('Q', 'Q ')} ${year}`;
}

function getNextQuarterKeys(quarterCount) {
    const keys = [];
    const cursor = new Date();
    const currentQuarterStartMonth = Math.floor(cursor.getMonth() / 3) * 3;
    cursor.setMonth(currentQuarterStartMonth, 1);

    for (let index = 0; index < quarterCount; index += 1) {
        const quarterDate = addMonths(cursor, index * 3);
        keys.push(getQuarterKey(quarterDate));
    }

    return keys;
}

function getGoalsTemplate(yearsUntilGrad, recruitingPhase) {
    const phase = String(recruitingPhase || '').toLowerCase();
    if (yearsUntilGrad >= 3 || phase === 'evaluation' || phase === 'development') return DEVELOPMENT_GOALS;
    if (yearsUntilGrad === 2 || phase === 'exposure') return EXPOSURE_GOALS;
    return DECISION_GOALS;
}

function generateQuarterlyGoals(yearsUntilGrad, recruitingPhase) {
    const quarterCount = yearsUntilGrad <= 1 ? 2 : 4;
    const quarterKeys = getNextQuarterKeys(quarterCount);
    const template = getGoalsTemplate(yearsUntilGrad, recruitingPhase);

    return quarterKeys.reduce((accumulator, quarterKey, index) => ({
        ...accumulator,
        [quarterKey]: template[index] || template[template.length - 1]
    }), {});
}

function generateMilestones(athlete, yearsUntilGrad) {
    const milestones = {};
    const today = new Date();
    const gradYear = Number(athlete?.grad_year || athlete?.graduation_year || today.getFullYear() + 1);

    milestones.first_coach_email = addMonths(today, 1).toISOString().slice(0, 10);
    milestones.first_showcase = addMonths(today, 2).toISOString().slice(0, 10);

    if (yearsUntilGrad >= 2) {
        milestones.ncaa_registration = addMonths(today, 3).toISOString().slice(0, 10);
        milestones.unofficial_visit_window = addMonths(today, 5).toISOString().slice(0, 10);
    }

    if (yearsUntilGrad <= 2) {
        milestones.highlight_video_refresh = addMonths(today, 1).toISOString().slice(0, 10);
        milestones.official_visit_window = addMonths(today, 4).toISOString().slice(0, 10);
    }

    milestones.commitment_target = new Date(gradYear - 1, 10, 15).toISOString().slice(0, 10);
    milestones.signing_day_target = new Date(gradYear, 1, 1).toISOString().slice(0, 10);

    return milestones;
}

function generateBudgetAllocation(yearsUntilGrad) {
    const quarterKeys = getNextQuarterKeys(yearsUntilGrad <= 1 ? 2 : 4);
    let template = [450, 650, 500, 400];

    if (yearsUntilGrad === 2) template = [900, 1300, 1050, 700];
    if (yearsUntilGrad <= 1) template = [600, 450];

    return quarterKeys.reduce((accumulator, quarterKey, index) => ({
        ...accumulator,
        [quarterKey]: template[index] || template[template.length - 1]
    }), {});
}

function buildRoadmap(athleteRow) {
    const currentYear = new Date().getFullYear();
    const gradYear = Number(athleteRow?.grad_year || athleteRow?.graduation_year || currentYear + 1);
    const yearsUntilGrad = Math.max(1, gradYear - currentYear);

    return {
        athlete_id: athleteRow.id,
        current_grade: Number(athleteRow?.grade_level || 9),
        graduation_year: gradYear,
        goals_by_quarter: generateQuarterlyGoals(yearsUntilGrad, athleteRow?.recruiting_phase),
        milestones: generateMilestones(athleteRow, yearsUntilGrad),
        budget_by_quarter: generateBudgetAllocation(yearsUntilGrad)
    };
}

function TimelineBar({ yearsUntilGrad }) {
    const totalSegments = Math.max(4, Math.min(12, yearsUntilGrad * 4));
    return (
        <div className="w4-timeline-track" role="img" aria-label={`Timeline showing ${yearsUntilGrad} years until graduation`}>
            {Array.from({ length: totalSegments }).map((_, index) => (
                <span
                    key={index}
                    className={`w4-timeline-segment ${index === 0 ? 'w4-timeline-segment-active' : ''}`}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
}

function QuarterCard({ quarter, goals }) {
    return (
        <article className="w4-quarter-card">
            <h3 className="w4-quarter-title">{getQuarterLabel(quarter)}</h3>
            <ul className="w4-quarter-goals">
                {(goals || []).map((goal) => (
                    <li key={`${quarter}-${goal}`}>{goal}</li>
                ))}
            </ul>
        </article>
    );
}

function MilestoneItem({ name, date }) {
    const title = String(name || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <article className="w4-milestone-item">
            <p className="w4-milestone-date">{formatDate(date)}</p>
            <p className="w4-milestone-name">{title}</p>
        </article>
    );
}

function BudgetBar({ quarter, amount, maxAmount }) {
    const safeMax = Math.max(1, Number(maxAmount || 1));
    const width = Math.max(8, Math.round((Number(amount || 0) / safeMax) * 100));

    return (
        <article className="w4-budget-row">
            <p className="w4-budget-label">{getQuarterLabel(quarter)}</p>
            <div className="w4-budget-track" aria-hidden="true">
                <div className="w4-budget-fill" style={{ width: `${Math.min(100, width)}%` }} />
            </div>
            <p className="w4-budget-amount">${Number(amount || 0).toLocaleString()}</p>
        </article>
    );
}

export default function RecruitingRoadmap() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 1);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 4);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [athlete, setAthlete] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const yearsUntilGrad = useMemo(() => {
        const gradYear = Number(athlete?.grad_year || athlete?.graduation_year || new Date().getFullYear() + 1);
        return Math.max(1, gradYear - new Date().getFullYear());
    }, [athlete?.grad_year, athlete?.graduation_year]);

    const totalBudget = useMemo(() => {
        const values = Object.values(roadmap?.budget_by_quarter || {});
        return values.reduce((sum, amount) => sum + Number(amount || 0), 0);
    }, [roadmap?.budget_by_quarter]);

    const maxBudget = useMemo(() => {
        const values = Object.values(roadmap?.budget_by_quarter || {}).map((value) => Number(value || 0));
        return Math.max(0, ...values);
    }, [roadmap?.budget_by_quarter]);

    const loadRoadmap = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const athleteResult = await supabase
            .from('athletes')
            .select('id, name, sport, grade_level, grad_year, graduation_year, recruiting_phase')
            .eq('id', athleteId)
            .maybeSingle();

        if (athleteResult.error) {
            setError(athleteResult.error.message || 'Unable to load athlete profile.');
            setLoading(false);
            return;
        }

        if (!athleteResult.data?.id) {
            setError('Athlete profile not found.');
            setLoading(false);
            return;
        }

        const athleteRow = athleteResult.data;
        const generatedRoadmap = buildRoadmap(athleteRow);

        const roadmapResult = await supabase
            .from('recruiting_roadmap')
            .select('*')
            .eq('athlete_id', athleteId)
            .maybeSingle();

        if (roadmapResult.error && !isMissingTableError(roadmapResult.error)) {
            setError(roadmapResult.error.message || 'Unable to load roadmap details.');
            setAthlete(athleteRow);
            setRoadmap(generatedRoadmap);
            setLoading(false);
            return;
        }

        if (roadmapResult.error && isMissingTableError(roadmapResult.error)) {
            setError(getFeatureRebuildMessage('Recruiting roadmap')); 
        }

        const existing = roadmapResult.data || null;
        const mergedRoadmap = {
            ...generatedRoadmap,
            ...existing,
            athlete_id: athleteRow.id,
            current_grade: Number(existing?.current_grade || generatedRoadmap.current_grade),
            graduation_year: Number(existing?.graduation_year || generatedRoadmap.graduation_year),
            goals_by_quarter: Object.keys(existing?.goals_by_quarter || {}).length > 0
                ? existing.goals_by_quarter
                : generatedRoadmap.goals_by_quarter,
            milestones: Object.keys(existing?.milestones || {}).length > 0
                ? existing.milestones
                : generatedRoadmap.milestones,
            budget_by_quarter: Object.keys(existing?.budget_by_quarter || {}).length > 0
                ? existing.budget_by_quarter
                : generatedRoadmap.budget_by_quarter
        };

        setAthlete(athleteRow);
        setRoadmap(mergedRoadmap);
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadRoadmap();
    }, [loadRoadmap]);

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
        if (!athleteId || !roadmap || isCompleting || isSkipping) return;

        setError('');
        setIsCompleting(true);

        const payload = {
            athlete_id: athleteId,
            current_grade: Number(roadmap.current_grade || 9),
            graduation_year: Number(roadmap.graduation_year || new Date().getFullYear() + 1),
            goals_by_quarter: roadmap.goals_by_quarter || {},
            milestones: roadmap.milestones || {},
            budget_by_quarter: roadmap.budget_by_quarter || {}
        };

        try {
            const { error: saveError } = await supabase
                .from('recruiting_roadmap')
                .upsert([payload], { onConflict: 'athlete_id' });

            if (saveError) throw saveError;

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
                setError(completeError?.message || 'Unable to save roadmap right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, roadmap, weekNumber, weekStartDate]);

    return (
        <DashboardLayout>
            <div className="w4-page">
                <div className="w4-top-row">
                    <Link to={weeklyPlanHref} className="w4-back-link">Back to Plan</Link>
                    <span className="w4-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w4-header`}>
                    <h1>Your Recruiting Roadmap</h1>
                    <p>Your multi-year plan from today through commitment.</p>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Your Journey: Grade {roadmap?.current_grade || '--'} to Commitment</h2>
                        <p>{yearsUntilGrad} year{yearsUntilGrad === 1 ? '' : 's'} until graduation (Class of {roadmap?.graduation_year || 'TBD'})</p>
                    </div>
                    <TimelineBar yearsUntilGrad={yearsUntilGrad} />
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Quarterly Action Plan</h2>
                        <p>Personalized priorities for your next recruiting windows.</p>
                    </div>
                    {loading ? (
                        <p className="w4-empty">Generating roadmap...</p>
                    ) : (
                        <div className="w4-quarter-grid">
                            {Object.entries(roadmap?.goals_by_quarter || {}).map(([quarter, goals]) => (
                                <QuarterCard key={quarter} quarter={quarter} goals={goals} />
                            ))}
                        </div>
                    )}

                    <aside className="w4-upgrade-gate" aria-label="Pro roadmap features preview">
                        <div className="w4-gate-lock" aria-hidden="true">🔒</div>
                        <h3>Unlock Full Roadmap Editing in Pro</h3>
                        <p>Customize goals, automate reminders, and track quarterly completion rates.</p>
                        <ul>
                            <li>Edit goals and milestone dates</li>
                            <li>Weekly reminder check-ins</li>
                            <li>Quarter-level completion tracking</li>
                            <li>Spending alerts by phase</li>
                        </ul>
                        <Button
                            type="button"
                            className="w4-upgrade-button"
                            onClick={() => navigate('/upgrade')}
                        >
                            Upgrade to Pro - $25/mo
                        </Button>
                    </aside>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Key Milestones</h2>
                        <p>Dates to keep your recruiting cycle on track.</p>
                    </div>
                    <div className="w4-milestone-list">
                        {Object.entries(roadmap?.milestones || {}).map(([milestone, date]) => (
                            <MilestoneItem key={milestone} name={milestone} date={date} />
                        ))}
                    </div>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Projected Budget by Quarter</h2>
                        <p>Estimated spend aligned to your current recruiting phase.</p>
                    </div>
                    <div className="w4-budget-list">
                        {Object.entries(roadmap?.budget_by_quarter || {}).map(([quarter, amount]) => (
                            <BudgetBar
                                key={quarter}
                                quarter={quarter}
                                amount={Number(amount || 0)}
                                maxAmount={maxBudget}
                            />
                        ))}
                    </div>
                    <p className="w4-budget-total">Total projected: ${totalBudget.toLocaleString()}</p>
                </section>

                <section className="w4-callout">
                    <p>
                        <strong>Week 5 is Pro-only.</strong> Your roadmap is ready, and Pro unlocks editing, reminders, and progress automation so this plan stays executable.
                    </p>
                </section>

                {error && <div className="w4-error">{error}</div>}

                <div className="w4-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="w4-skip-button"
                        onClick={handleSkip}
                        disabled={loading || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="w4-primary-button"
                        onClick={handleComplete}
                        disabled={loading || isCompleting || isSkipping || !athleteId || !roadmap}
                    >
                        {isCompleting ? 'Saving...' : 'Save Roadmap & Mark Complete'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
