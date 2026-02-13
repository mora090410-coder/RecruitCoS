import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import WeekOnePlanView from '../components/WeekOnePlanView';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
import { isMissingTableError } from '../lib/dbResilience';
import { generateWeeklyPlan } from '../utils/weeklyPlanGenerator';

const MAX_TRIAL_WEEK = 4;

const WEEK_UNLOCK_COPY = {
    2: {
        title: 'Week 2 Unlocked!',
        subtitle: 'Great job completing Week 1. Here is what is next:',
        bullets: [
            '📅 Learn your recruiting timeline',
            '📞 Track coach interactions',
            '💰 Update your budget'
        ]
    },
    3: {
        title: 'Week 3 Unlocked!',
        subtitle: 'Now it is time for data-driven recruiting intelligence:',
        bullets: [
            '🤖 Get AI-powered school recommendations',
            '📈 See recruiting spend ROI insights',
            '🧭 Expand to a balanced 10-school list'
        ]
    },
    4: {
        title: 'Week 4 Unlocked!',
        subtitle: 'Final free week: build your long-term game plan before Week 5 paywall:',
        bullets: [
            '🗺️ Build your multi-year recruiting roadmap',
            '💵 Project total costs through commitment',
            '✅ Finalize your school list for outreach'
        ]
    }
};

async function fetchWeekActions(athleteId, weekNumber) {
    const { data, error } = await supabase
        .from('athlete_weekly_plan_items')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('week_number', weekNumber)
        .order('action_number', { ascending: true, nullsFirst: false })
        .order('priority_rank', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

async function fetchExistingWeeks(athleteId) {
    const { data, error } = await supabase
        .from('weekly_plans')
        .select('week_number')
        .eq('athlete_id', athleteId)
        .lte('week_number', MAX_TRIAL_WEEK)
        .order('week_number', { ascending: true });

    if (error) throw error;

    return Array.from(new Set((data || [])
        .map((row) => Number.parseInt(row.week_number, 10))
        .filter((week) => Number.isInteger(week) && week >= 1 && week <= MAX_TRIAL_WEEK)));
}

function isWeekComplete(actions) {
    return Array.isArray(actions)
        && actions.length === 3
        && actions.every((action) => action.status === 'done');
}

function buildWeekUnlockStorageKey(athleteId, weekNumber) {
    if (!athleteId || !weekNumber) return null;
    return `rc_week_unlock_seen:${athleteId}:${weekNumber}`;
}

function buildWeek5PaywallStorageKey(athleteId) {
    if (!athleteId) return null;
    return `rc_week5_paywall_seen:${athleteId}`;
}

function getSafeCount(result) {
    if (!result?.error) return Number(result?.count || 0);
    if (isMissingTableError(result.error)) return 0;
    throw result.error;
}

async function fetchWeek5PaywallSummary(athleteId) {
    if (!athleteId) {
        return {
            schoolCount: 0,
            totalExpenses: 0,
            coachContacts: 0,
            roadmapCreated: false
        };
    }

    const [schoolCountResult, coachContactsResult, expensesResult, roadmapResult] = await Promise.all([
        supabase
            .from('athlete_saved_schools')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', athleteId),
        supabase
            .from('coach_interactions')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', athleteId),
        supabase
            .from('expenses')
            .select('amount')
            .eq('athlete_id', athleteId),
        supabase
            .from('recruiting_roadmap')
            .select('id', { count: 'exact', head: true })
            .eq('athlete_id', athleteId)
    ]);

    const schoolCount = getSafeCount(schoolCountResult);
    const coachContacts = getSafeCount(coachContactsResult);
    const roadmapCount = getSafeCount(roadmapResult);

    if (expensesResult.error && !isMissingTableError(expensesResult.error)) {
        throw expensesResult.error;
    }

    const totalExpenses = (expensesResult.data || []).reduce((sum, expense) => {
        const amount = Number.parseFloat(expense.amount);
        return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    return {
        schoolCount,
        totalExpenses: Number(totalExpenses.toFixed(2)),
        coachContacts,
        roadmapCreated: roadmapCount > 0
    };
}

export default function WeeklyPlan() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedWeekParam = searchParams.get('week') || '';
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [hasTrackedPlanView, setHasTrackedPlanView] = useState(false);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
    const [showWeekUnlockMessage, setShowWeekUnlockMessage] = useState(false);
    const [unlockedWeekNumber, setUnlockedWeekNumber] = useState(null);
    const [showWeek5Paywall, setShowWeek5Paywall] = useState(false);
    const [week5Summary, setWeek5Summary] = useState({
        schoolCount: 0,
        totalExpenses: 0,
        coachContacts: 0,
        roadmapCreated: false
    });

    const targetAthleteId = useMemo(() => {
        if (isImpersonating) return activeAthlete?.id || null;
        return profile?.id || null;
    }, [activeAthlete?.id, isImpersonating, profile?.id]);

    const athleteContext = useMemo(() => (
        isImpersonating ? (activeAthlete || null) : (profile || null)
    ), [activeAthlete, isImpersonating, profile]);

    useEffect(() => {
        setHasTrackedPlanView(false);
    }, [targetAthleteId, reloadNonce, currentWeekNumber]);

    useEffect(() => {
        setShowWeekUnlockMessage(false);
        setUnlockedWeekNumber(null);
        setShowWeek5Paywall(false);
        setWeek5Summary({
            schoolCount: 0,
            totalExpenses: 0,
            coachContacts: 0,
            roadmapCreated: false
        });
    }, [targetAthleteId]);

    useEffect(() => {
        let active = true;

        const loadPlan = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!targetAthleteId) {
                    setSimplePlan(null);
                    return;
                }

                await generateWeeklyPlan(targetAthleteId, 1, supabase);
                let existingWeeks = await fetchExistingWeeks(targetAthleteId);

                let unlockedWeekNow = null;
                for (let week = 1; week < MAX_TRIAL_WEEK; week += 1) {
                    const nextWeek = week + 1;
                    if (!existingWeeks.includes(week)) break;

                    const weekActions = await fetchWeekActions(targetAthleteId, week);
                    if (!isWeekComplete(weekActions) || existingWeeks.includes(nextWeek)) {
                        continue;
                    }

                    await generateWeeklyPlan(targetAthleteId, nextWeek, supabase);
                    existingWeeks = await fetchExistingWeeks(targetAthleteId);
                    unlockedWeekNow = nextWeek;
                }

                const safeWeeks = existingWeeks.length > 0 ? existingWeeks : [1];
                const highestWeek = Math.max(...safeWeeks);
                const requestedWeekNumber = Number.parseInt(requestedWeekParam, 10);
                const preferredWeekNumber = (
                    Number.isInteger(requestedWeekNumber) && requestedWeekNumber >= 1
                ) ? requestedWeekNumber : currentWeekNumber;
                const resolvedWeekNumber = safeWeeks.includes(preferredWeekNumber)
                    ? preferredWeekNumber
                    : highestWeek;

                const selectedWeekActions = await fetchWeekActions(targetAthleteId, resolvedWeekNumber);
                const weekStartDate = selectedWeekActions[0]?.week_start_date || null;
                const weekFourComplete = resolvedWeekNumber === MAX_TRIAL_WEEK && isWeekComplete(selectedWeekActions);
                let paywallSummary = null;

                if (weekFourComplete) {
                    paywallSummary = await fetchWeek5PaywallSummary(targetAthleteId);
                }

                if (!active) return;

                if (resolvedWeekNumber !== currentWeekNumber) {
                    setCurrentWeekNumber(resolvedWeekNumber);
                }

                if (unlockedWeekNow) {
                    const storageKey = buildWeekUnlockStorageKey(targetAthleteId, unlockedWeekNow);
                    let alreadySeen = false;
                    try {
                        alreadySeen = storageKey ? window.localStorage.getItem(storageKey) === 'true' : false;
                    } catch {
                        alreadySeen = false;
                    }

                    if (!alreadySeen) {
                        setUnlockedWeekNumber(unlockedWeekNow);
                        setShowWeekUnlockMessage(true);
                        try {
                            if (storageKey) window.localStorage.setItem(storageKey, 'true');
                        } catch {
                            // no-op
                        }
                    }
                }

                if (weekFourComplete) {
                    if (paywallSummary) {
                        setWeek5Summary(paywallSummary);
                    }

                    const storageKey = buildWeek5PaywallStorageKey(targetAthleteId);
                    let alreadySeen = false;
                    try {
                        alreadySeen = storageKey ? window.localStorage.getItem(storageKey) === 'true' : false;
                    } catch {
                        alreadySeen = false;
                    }

                    if (!alreadySeen) {
                        setShowWeek5Paywall(true);
                    }
                } else {
                    setShowWeek5Paywall(false);
                }

                setSimplePlan({
                    athlete: athleteContext,
                    actions: selectedWeekActions,
                    weekStartDate,
                    weekNumber: resolvedWeekNumber,
                    availableWeekNumbers: safeWeeks
                });
            } catch (err) {
                if (!active) return;
                setError(err?.message || 'Failed to load weekly plan.');
                setSimplePlan(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPlan();
        return () => {
            active = false;
        };
    }, [athleteContext, currentWeekNumber, reloadNonce, requestedWeekParam, targetAthleteId]);

    const handleRetryLoad = () => {
        setReloadNonce((prev) => prev + 1);
    };

    const handleStartUnlockedWeek = () => {
        setShowWeekUnlockMessage(false);
        if (unlockedWeekNumber) {
            setCurrentWeekNumber(unlockedWeekNumber);
        }
    };

    const handleSelectWeek = (weekNumber) => {
        setCurrentWeekNumber(weekNumber);
    };

    const handleDismissWeek5Paywall = () => {
        const storageKey = buildWeek5PaywallStorageKey(targetAthleteId);
        try {
            if (storageKey) window.localStorage.setItem(storageKey, 'true');
        } catch {
            // no-op
        }
        setShowWeek5Paywall(false);
    };

    const handleWeek5Upgrade = () => {
        const storageKey = buildWeek5PaywallStorageKey(targetAthleteId);
        try {
            if (storageKey) window.localStorage.setItem(storageKey, 'true');
        } catch {
            // no-op
        }
        setShowWeek5Paywall(false);
        track('week5_paywall_upgrade_clicked', {
            week_number: simplePlan?.weekNumber || null,
            school_count: week5Summary.schoolCount || 0,
            coach_contacts: week5Summary.coachContacts || 0,
            total_expenses: week5Summary.totalExpenses || 0
        });
        navigate('/upgrade');
    };

    useEffect(() => {
        if (!simplePlan || loading || hasTrackedPlanView) return;
        track('weekly_plan_viewed', {
            week_number: simplePlan.weekNumber || null,
            week_start: simplePlan.weekStartDate || null,
            sport: simplePlan.athlete?.sport || null,
            position: simplePlan.athlete?.position || null,
            grad_year: simplePlan.athlete?.grad_year || null,
            actions_count: simplePlan.actions?.length || 0
        });
        setHasTrackedPlanView(true);
    }, [simplePlan, loading, hasTrackedPlanView]);

    const unlockCopy = WEEK_UNLOCK_COPY[unlockedWeekNumber] || WEEK_UNLOCK_COPY[2];

    return (
        <DashboardLayout>
            <WeekOnePlanView
                athlete={simplePlan?.athlete}
                actions={simplePlan?.actions || []}
                loading={loading}
                error={error}
                targetAthleteId={targetAthleteId}
                onRetry={handleRetryLoad}
                weekStartDate={simplePlan?.weekStartDate}
                weekNumber={simplePlan?.weekNumber || 1}
                availableWeekNumbers={simplePlan?.availableWeekNumbers || [1]}
                onSelectWeek={handleSelectWeek}
            />

            {showWeekUnlockMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-4 backdrop-blur-sm">
                    <section className="w-full max-w-[520px] rounded-2xl border border-[rgba(108,46,185,0.28)] bg-white p-6 shadow-2xl sm:p-8">
                        <div className="text-center">
                            <div className="text-6xl leading-none" aria-hidden="true">🎉</div>
                            <h2 className="mt-3 text-2xl font-bold text-gray-900">{unlockCopy.title}</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {unlockCopy.subtitle}
                            </p>
                        </div>

                        <ul className="mt-5 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-gray-800">
                            {unlockCopy.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            onClick={handleStartUnlockedWeek}
                            className="mt-6 h-11 w-full rounded-xl bg-[#6C2EB9] px-5 text-sm font-semibold text-white transition hover:bg-[#5B25A0]"
                        >
                            Start Week {unlockedWeekNumber || 2}
                        </button>
                    </section>
                </div>
            )}

            {showWeek5Paywall && (
                <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[rgba(15,23,42,0.55)] p-4 backdrop-blur-sm">
                    <section className="w-full max-w-[620px] rounded-2xl border border-[rgba(108,46,185,0.3)] bg-white p-6 shadow-2xl sm:p-8">
                        <div className="text-center">
                            <div className="text-5xl leading-none" aria-hidden="true">🎉</div>
                            <h2 className="mt-3 text-2xl font-bold text-gray-900">You Completed Your Free Trial</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Four weeks of recruiting progress are now in place. Keep momentum going with Pro.
                            </p>
                        </div>

                        <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                            <h3 className="text-sm font-semibold text-gray-900">Your 4-week outcomes</h3>
                            <ul className="mt-3 space-y-1.5 text-sm text-gray-800">
                                <li>✓ {week5Summary.schoolCount} schools researched</li>
                                <li>✓ ${week5Summary.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })} in expenses tracked</li>
                                <li>✓ {week5Summary.coachContacts} coach interactions logged</li>
                                <li>✓ {week5Summary.roadmapCreated ? 'Recruiting roadmap created' : 'Roadmap framework generated'}</li>
                            </ul>
                        </div>

                        <div className="mt-4 rounded-xl border border-[rgba(108,46,185,0.22)] bg-[rgba(108,46,185,0.05)] p-4">
                            <h3 className="text-base font-semibold text-gray-900">Continue with Pro</h3>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                <li>Weekly recruiting action plans every week</li>
                                <li>Coach contact database access</li>
                                <li>Advanced AI school fit recommendations</li>
                                <li>Financial optimization and budget alerts</li>
                                <li>Unlimited school tracking and outreach prep</li>
                            </ul>
                        </div>

                        <div className="mt-5 rounded-xl border border-[#E5E7EB] p-4 text-center">
                            <p className="text-3xl font-bold text-gray-900">$25/mo</p>
                            <p className="mt-1 text-sm font-medium text-gray-600">Individual Plan</p>
                            <button
                                type="button"
                                onClick={handleWeek5Upgrade}
                                className="mt-4 h-11 w-full rounded-xl bg-[#6C2EB9] px-5 text-sm font-semibold text-white transition hover:bg-[#5B25A0]"
                            >
                                Upgrade Now
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleDismissWeek5Paywall}
                            className="mt-4 w-full text-center text-sm font-semibold text-[#6C2EB9] underline-offset-2 hover:underline"
                        >
                            I&apos;ll decide later
                        </button>
                    </section>
                </div>
            )}
        </DashboardLayout>
    );
}
