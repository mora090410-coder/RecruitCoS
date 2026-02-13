import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import WeekOnePlanView from '../components/WeekOnePlanView';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
import { generateWeeklyPlan } from '../utils/weeklyPlanGenerator';

const MAX_TRIAL_WEEK = 2;

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

function buildWeekUnlockStorageKey(athleteId, weekNumber) {
    if (!athleteId || !weekNumber) return null;
    return `rc_week_unlock_seen:${athleteId}:${weekNumber}`;
}

export default function WeeklyPlan() {
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [hasTrackedPlanView, setHasTrackedPlanView] = useState(false);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
    const [showWeekUnlockMessage, setShowWeekUnlockMessage] = useState(false);

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

                const weekOneActions = await fetchWeekActions(targetAthleteId, 1);
                const weekOneComplete = weekOneActions.length === 3
                    && weekOneActions.every((action) => action.status === 'done');

                let existingWeeks = await fetchExistingWeeks(targetAthleteId);
                let unlockedWeek2Now = false;

                if (weekOneComplete && !existingWeeks.includes(2)) {
                    await generateWeeklyPlan(targetAthleteId, 2, supabase);
                    existingWeeks = await fetchExistingWeeks(targetAthleteId);
                    unlockedWeek2Now = true;
                }

                const safeWeeks = existingWeeks.length > 0 ? existingWeeks : [1];
                const highestWeek = Math.max(...safeWeeks);
                const resolvedWeekNumber = safeWeeks.includes(currentWeekNumber)
                    ? currentWeekNumber
                    : highestWeek;

                const selectedWeekActions = await fetchWeekActions(targetAthleteId, resolvedWeekNumber);
                const weekStartDate = selectedWeekActions[0]?.week_start_date || null;

                if (!active) return;

                if (resolvedWeekNumber !== currentWeekNumber) {
                    setCurrentWeekNumber(resolvedWeekNumber);
                }

                if (unlockedWeek2Now) {
                    const storageKey = buildWeekUnlockStorageKey(targetAthleteId, 2);
                    let alreadySeen = false;
                    try {
                        alreadySeen = storageKey ? window.localStorage.getItem(storageKey) === 'true' : false;
                    } catch {
                        alreadySeen = false;
                    }

                    if (!alreadySeen) {
                        setShowWeekUnlockMessage(true);
                        try {
                            if (storageKey) window.localStorage.setItem(storageKey, 'true');
                        } catch {
                            // no-op
                        }
                    }
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
    }, [athleteContext, currentWeekNumber, reloadNonce, targetAthleteId]);

    const handleRetryLoad = () => {
        setReloadNonce((prev) => prev + 1);
    };

    const handleStartWeekTwo = () => {
        setShowWeekUnlockMessage(false);
        setCurrentWeekNumber(2);
    };

    const handleSelectWeek = (weekNumber) => {
        setCurrentWeekNumber(weekNumber);
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
                            <h2 className="mt-3 text-2xl font-bold text-gray-900">Week 2 Unlocked!</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Great job completing Week 1. Here&apos;s what is next:
                            </p>
                        </div>

                        <ul className="mt-5 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-gray-800">
                            <li>📅 Learn your recruiting timeline</li>
                            <li>📞 Track coach interactions</li>
                            <li>💰 Update your budget</li>
                        </ul>

                        <button
                            type="button"
                            onClick={handleStartWeekTwo}
                            className="mt-6 h-11 w-full rounded-xl bg-[#6C2EB9] px-5 text-sm font-semibold text-white transition hover:bg-[#5B25A0]"
                        >
                            Start Week 2
                        </button>
                    </section>
                </div>
            )}
        </DashboardLayout>
    );
}
