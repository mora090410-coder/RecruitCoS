import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import WeekOnePlanView from '../components/WeekOnePlanView';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
import { generateWeeklyPlan } from '../utils/weeklyPlanGenerator';

const MAX_TRIAL_WEEK = 3;

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

export default function WeeklyPlan() {
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [hasTrackedPlanView, setHasTrackedPlanView] = useState(false);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
    const [showWeekUnlockMessage, setShowWeekUnlockMessage] = useState(false);
    const [unlockedWeekNumber, setUnlockedWeekNumber] = useState(null);

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
                const resolvedWeekNumber = safeWeeks.includes(currentWeekNumber)
                    ? currentWeekNumber
                    : highestWeek;

                const selectedWeekActions = await fetchWeekActions(targetAthleteId, resolvedWeekNumber);
                const weekStartDate = selectedWeekActions[0]?.week_start_date || null;

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

    const handleStartUnlockedWeek = () => {
        setShowWeekUnlockMessage(false);
        if (unlockedWeekNumber) {
            setCurrentWeekNumber(unlockedWeekNumber);
        }
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
        </DashboardLayout>
    );
}
