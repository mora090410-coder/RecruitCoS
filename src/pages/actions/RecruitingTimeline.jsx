import { useEffect, useMemo, useState } from 'react';
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

const CARD_CLASS = 'rounded-[12px] border-2 border-[#2C2C2C1A] bg-white p-6 md:p-8';

const PHASE_MILESTONES = {
    freshmen_sophomores: [
        { type: 'recruiting_email_created', label: 'Created recruiting email account' },
        { type: 'first_showcase', label: 'Attended first showcase or camp' },
        { type: 'first_contact', label: 'Built first list of coaches to contact' }
    ],
    juniors: [
        { type: 'ncaa_registration', label: 'Registered with NCAA Eligibility Center' },
        { type: 'first_coach_email', label: 'Sent first coach email' },
        { type: 'unofficial_visit', label: 'Planned or completed unofficial visit' }
    ],
    seniors: [
        { type: 'offer_received', label: 'Received first offer' },
        { type: 'official_visit', label: 'Scheduled official visit(s)' },
        { type: 'commitment', label: 'Ready to make final commitment decision' }
    ]
};

function resolveSchoolYearEnd() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return currentMonth >= 8 ? currentYear + 1 : currentYear;
}

function resolvePhaseBucket(gradeLevel, gradYear) {
    const numericGrade = Number.parseInt(gradeLevel, 10);
    if (Number.isInteger(numericGrade)) {
        if (numericGrade <= 10) return 'freshmen_sophomores';
        if (numericGrade === 11) return 'juniors';
        return 'seniors';
    }

    const numericGradYear = Number.parseInt(gradYear, 10);
    const schoolYearEnd = resolveSchoolYearEnd();

    if (!Number.isInteger(numericGradYear)) return 'freshmen_sophomores';

    const yearsAway = numericGradYear - schoolYearEnd;
    if (yearsAway >= 2) return 'freshmen_sophomores';
    if (yearsAway === 1) return 'juniors';
    return 'seniors';
}

function getTimelineForGradYear(gradYear, phaseBucket) {
    const parsedGradYear = Number.parseInt(gradYear, 10);
    const safeGradYear = Number.isInteger(parsedGradYear) ? parsedGradYear : new Date().getFullYear() + 2;

    const shared = [
        {
            title: 'Build your outreach tracker',
            dateLabel: 'This week',
            detail: 'Keep all coach messages, camps, and follow-ups in one place.'
        },
        {
            title: 'Review contact period rules',
            dateLabel: 'Monthly check',
            detail: 'Confirm NCAA contact windows for your sport before major outreach pushes.'
        }
    ];

    if (phaseBucket === 'freshmen_sophomores') {
        return [
            {
                title: `Class of ${safeGradYear}: Foundation Year`,
                dateLabel: `School year ${safeGradYear - 3} to ${safeGradYear - 2}`,
                detail: 'Focus on skill development, exposure events, and profile setup.'
            },
            {
                title: 'Unofficial visit planning window',
                dateLabel: 'Start by sophomore spring',
                detail: 'Campus visits help your family compare fit and travel requirements.'
            },
            ...shared
        ];
    }

    if (phaseBucket === 'juniors') {
        return [
            {
                title: 'NCAA Eligibility Center registration',
                dateLabel: 'Junior year',
                detail: 'Complete registration to stay eligible for official recruiting steps.'
            },
            {
                title: 'High-volume coach outreach phase',
                dateLabel: 'Junior spring to summer',
                detail: 'Send personalized communication with updated clips and measurables.'
            },
            {
                title: 'Unofficial visits and camp decision window',
                dateLabel: 'Junior year',
                detail: 'Prioritize campuses where coach communication is active.'
            },
            ...shared
        ];
    }

    return [
        {
            title: 'Official visit decision period',
            dateLabel: 'Senior year',
            detail: 'Finalize top choices and confirm roster + admissions timelines.'
        },
        {
            title: 'Offer and commitment window',
            dateLabel: 'Senior year signing periods',
            detail: 'Evaluate total fit: roster opportunity, academics, and financial impact.'
        },
        {
            title: 'Post-commitment checklist',
            dateLabel: 'Immediately after commitment',
            detail: 'Complete eligibility and admissions requirements with no delays.'
        },
        ...shared
    ];
}

function MilestoneChecklist({ milestoneItems, milestoneState, onToggle, onNotesChange }) {
    return (
        <div className="space-y-3">
            {milestoneItems.map((milestone) => {
                const state = milestoneState[milestone.type] || { completed: false, notes: '' };

                return (
                    <div key={milestone.type} className="rounded-[12px] border-2 border-[#2C2C2C1A] bg-white p-4">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#8B2635] focus:ring-[#8B2635]"
                                checked={Boolean(state.completed)}
                                onChange={(event) => onToggle(milestone.type, event.target.checked)}
                            />
                            <span className="text-sm font-medium text-gray-900">{milestone.label}</span>
                        </label>

                        <textarea
                            rows={2}
                            value={state.notes || ''}
                            onChange={(event) => onNotesChange(milestone.type, event.target.value)}
                            placeholder="Optional note for this milestone"
                            className="mt-3 w-full rounded-[10px] border border-[#2C2C2C1A] px-3 py-2 text-sm outline-none transition focus:border-[#8B2635]"
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function RecruitingTimeline() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 1);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 2);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const [athleteGradYear, setAthleteGradYear] = useState(null);
    const [gradeLevel, setGradeLevel] = useState(null);
    const [milestoneState, setMilestoneState] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const phaseBucket = useMemo(
        () => resolvePhaseBucket(gradeLevel, athleteGradYear),
        [athleteGradYear, gradeLevel]
    );

    const milestoneItems = useMemo(
        () => PHASE_MILESTONES[phaseBucket] || PHASE_MILESTONES.freshmen_sophomores,
        [phaseBucket]
    );

    const timelineEvents = useMemo(
        () => getTimelineForGradYear(athleteGradYear, phaseBucket),
        [athleteGradYear, phaseBucket]
    );

    useEffect(() => {
        let active = true;

        async function loadData() {
            if (!targetAthleteId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            const [athleteResult, milestonesResult] = await Promise.all([
                supabase
                    .from('athletes')
                    .select('grad_year, grade_level')
                    .eq('id', targetAthleteId)
                    .maybeSingle(),
                supabase
                    .from('recruiting_milestones')
                    .select('milestone_type, completed, notes, milestone_date')
                    .eq('athlete_id', targetAthleteId)
            ]);

            if (!active) return;

            if (athleteResult.error) {
                setError(athleteResult.error.message || 'Unable to load athlete timeline data.');
                setLoading(false);
                return;
            }

            if (milestonesResult.error) {
                if (isMissingTableError(milestonesResult.error)) {
                    setError(getFeatureRebuildMessage('Recruiting milestones'));
                } else {
                    setError(milestonesResult.error.message || 'Unable to load milestones right now.');
                }
                setLoading(false);
                return;
            }

            setAthleteGradYear(athleteResult.data?.grad_year || null);
            setGradeLevel(athleteResult.data?.grade_level || null);

            const state = {};
            (milestonesResult.data || []).forEach((row) => {
                state[row.milestone_type] = {
                    completed: Boolean(row.completed),
                    notes: row.notes || '',
                    milestone_date: row.milestone_date || null
                };
            });
            setMilestoneState(state);
            setLoading(false);
        }

        loadData();

        return () => {
            active = false;
        };
    }, [targetAthleteId]);

    const handleToggle = (milestoneType, completed) => {
        setMilestoneState((previous) => ({
            ...previous,
            [milestoneType]: {
                ...(previous[milestoneType] || {}),
                completed,
                milestone_date: completed ? new Date().toISOString().slice(0, 10) : null
            }
        }));
    };

    const handleNotesChange = (milestoneType, notes) => {
        setMilestoneState((previous) => ({
            ...previous,
            [milestoneType]: {
                ...(previous[milestoneType] || {}),
                notes
            }
        }));
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
    };

    const handleComplete = async () => {
        if (!targetAthleteId || isSaving || isSkipping) return;

        const completedCount = milestoneItems.filter((item) => Boolean(milestoneState[item.type]?.completed)).length;
        if (completedCount < 1) {
            setError('Mark at least one milestone before completing this action.');
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const rows = milestoneItems.map((item) => {
                const state = milestoneState[item.type] || {};
                const completed = Boolean(state.completed);
                return {
                    athlete_id: targetAthleteId,
                    milestone_type: item.type,
                    milestone_date: completed ? (state.milestone_date || new Date().toISOString().slice(0, 10)) : null,
                    notes: (state.notes || '').trim() || null,
                    completed
                };
            });

            const { error: upsertError } = await supabase
                .from('recruiting_milestones')
                .upsert(rows, { onConflict: 'athlete_id,milestone_type' });

            if (upsertError) throw upsertError;

            await setWeeklyActionStatus({
                athleteId: targetAthleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });

            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
        } catch (saveError) {
            if (isMissingTableError(saveError)) {
                setError(getFeatureRebuildMessage('Recruiting milestones'));
            } else {
                setError(saveError?.message || 'Unable to save timeline progress right now.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center justify-between">
                    <Link to={weeklyPlanHref} className="text-sm font-semibold text-[#8B2635] hover:underline">
                        Back to Plan
                    </Link>
                    <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-semibold text-[#8B2635]">
                        Action {actionNumber} of 3
                    </span>
                </div>

                <section className={`${CARD_CLASS} space-y-6 bg-[#F5F1E8]`}>
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Your Recruiting Timeline</h1>
                        <p className="text-sm text-gray-600">
                            Key dates and milestone checkpoints for Class of {athleteGradYear || 'your athlete'}.
                        </p>
                    </header>

                    <section className="rounded-[12px] border-2 border-[#2C2C2C1A] bg-white p-5">
                        <h2 className="text-lg font-semibold text-gray-900">Timeline Focus</h2>
                        <div className="mt-4 space-y-3">
                            {timelineEvents.map((event, index) => (
                                <article key={`${event.title}-${index}`} className="rounded-[10px] border border-[#2C2C2C1A] bg-white p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                                        <span className="inline-flex rounded-full bg-[#F5F1E8] px-2.5 py-1 text-xs font-semibold text-[#8B2635]">
                                            {event.dateLabel}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">{event.detail}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Track Your Milestones</h2>
                        <MilestoneChecklist
                            milestoneItems={milestoneItems}
                            milestoneState={milestoneState}
                            onToggle={handleToggle}
                            onNotesChange={handleNotesChange}
                        />
                    </section>

                    {loading && <p className="text-sm text-gray-600">Loading timeline...</p>}

                    {error && (
                        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-[12px] border-2 border-[#2C2C2C1A] bg-white px-5 text-sm font-semibold text-gray-700"
                            onClick={handleSkip}
                            disabled={isSaving || isSkipping || loading}
                        >
                            {isSkipping ? 'Skipping...' : 'Skip This'}
                        </Button>
                        <Button
                            type="button"
                            className="h-11 rounded-[12px] bg-[#8B2635] px-5 text-sm font-semibold text-white hover:bg-[#7D2230]"
                            onClick={handleComplete}
                            disabled={isSaving || isSkipping || loading || !targetAthleteId}
                        >
                            {isSaving ? 'Saving...' : 'Save & Mark Complete'}
                        </Button>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
