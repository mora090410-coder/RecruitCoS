import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import SimpleWeeklyView from '../components/SimpleWeeklyView';
import { useProfile } from '../hooks/useProfile';
import { getSimpleWeeklyPlan } from '../lib/weeklyPlan/getSimpleWeeklyPlan';
import { getAthleteEngagement } from '../lib/getAthleteEngagement';
import {
    unlockDashboard,
    updateWeeklyPlanItemStatus
} from '../lib/recruitingData';
import { track } from '../lib/analytics';

export default function WeeklyPlan() {
    const navigate = useNavigate();
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unlockingDashboard, setUnlockingDashboard] = useState(false);
    const [unlockError, setUnlockError] = useState(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [hasTrackedPlanView, setHasTrackedPlanView] = useState(false);
    const [hasTrackedUnlockPrompt, setHasTrackedUnlockPrompt] = useState(false);

    const targetAthleteId = useMemo(() => {
        if (isImpersonating) return activeAthlete?.id || null;
        return profile?.id || null;
    }, [activeAthlete?.id, isImpersonating, profile?.id]);

    useEffect(() => {
        setHasTrackedPlanView(false);
        setHasTrackedUnlockPrompt(false);
    }, [targetAthleteId, reloadNonce]);

    useEffect(() => {
        let active = true;

        const loadPlan = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!targetAthleteId) {
                    setSimplePlan(null);
                    setEngagement(null);
                    return;
                }

                const [plan, engagementData] = await Promise.all([
                    getSimpleWeeklyPlan(targetAthleteId),
                    getAthleteEngagement(targetAthleteId)
                ]);
                if (!active) return;
                setSimplePlan(plan);
                setEngagement(engagementData);
            } catch (err) {
                if (!active) return;
                setError(err?.message || 'Failed to load weekly plan.');
                setSimplePlan(null);
                setEngagement(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPlan();
        return () => {
            active = false;
        };
    }, [targetAthleteId, reloadNonce]);

    const handleRetryLoad = () => {
        setReloadNonce((prev) => prev + 1);
    };

    const showUnlockCard = useMemo(() => {
        const weeksActive = engagement?.weeksActive || 0;
        const actionsCompleted = engagement?.actionsCompleted || 0;
        const completionRate = engagement?.completionRate || 0;

        return weeksActive >= 2 && actionsCompleted >= 4 && completionRate > 0.5;
    }, [engagement?.actionsCompleted, engagement?.completionRate, engagement?.weeksActive]);

    const handleUnlockDashboard = async () => {
        if (!targetAthleteId || unlockingDashboard) return;
        track('unlock_clicked', {
            weeks_active: engagement?.weeksActive || 0,
            actions_completed: engagement?.actionsCompleted || 0,
            completion_rate: engagement?.completionRate || 0
        });
        setUnlockingDashboard(true);
        setUnlockError(null);

        try {
            await unlockDashboard(targetAthleteId);
            navigate('/dashboard');
        } catch (err) {
            setUnlockError(err?.message || 'Failed to unlock dashboard. Please try again.');
        } finally {
            setUnlockingDashboard(false);
        }
    };

    const handleStatusChange = async (item, nextStatus) => {
        if (!item?.id || !targetAthleteId) return null;
        const fromStatus = item.status || 'open';
        const normalizedStatus = nextStatus === 'todo' ? 'open' : nextStatus;
        if (!normalizedStatus) return null;
        if (item.status === normalizedStatus) return item;
        if (item.athlete_id && item.athlete_id !== targetAthleteId) {
            throw new Error('Not authorized to update this plan item.');
        }

        const updated = await updateWeeklyPlanItemStatus(item.id, normalizedStatus);
        if (!updated) return null;

        track('weekly_action_status_changed', {
            week_start: simplePlan?.weekStartDate || null,
            action_id: item.id,
            action_type: item.item_type || null,
            from_status: fromStatus,
            to_status: normalizedStatus
        });

        setSimplePlan((prev) => {
            if (!prev?.actions) return prev;
            return {
                ...prev,
                actions: prev.actions.map((entry) => (entry.id === updated.id ? updated : entry))
            };
        });

        return updated;
    };

    useEffect(() => {
        if (!simplePlan || loading || hasTrackedPlanView) return;
        track('weekly_plan_viewed', {
            week_start: simplePlan.weekStartDate || null,
            phase: simplePlan.phaseLabel || null,
            sport: simplePlan.athlete?.sport || null,
            position: simplePlan.athlete?.position || null,
            grad_year: simplePlan.athlete?.grad_year || null,
            has_primary_gap: Boolean(simplePlan?.primaryGap?.metricKey)
        });
        setHasTrackedPlanView(true);
    }, [simplePlan, loading, hasTrackedPlanView]);

    useEffect(() => {
        if (!showUnlockCard || hasTrackedUnlockPrompt) return;
        track('unlock_prompt_shown', {
            weeks_active: engagement?.weeksActive || 0,
            actions_completed: engagement?.actionsCompleted || 0,
            completion_rate: engagement?.completionRate || 0
        });
        setHasTrackedUnlockPrompt(true);
    }, [showUnlockCard, hasTrackedUnlockPrompt, engagement?.weeksActive, engagement?.actionsCompleted, engagement?.completionRate]);

    return (
        <DashboardLayout phase={simplePlan?.phaseLabel}>
            <SimpleWeeklyView
                athlete={simplePlan?.athlete}
                phaseLabel={simplePlan?.phaseLabel}
                primaryGap={simplePlan?.primaryGap}
                primaryGapState={simplePlan?.primaryGapState}
                actions={simplePlan?.actions || []}
                loading={loading}
                error={error}
                onStatusChange={handleStatusChange}
                targetAthleteId={targetAthleteId}
                showUnlockCard={showUnlockCard}
                engagement={engagement}
                unlockingDashboard={unlockingDashboard}
                unlockError={unlockError}
                onUnlockDashboard={handleUnlockDashboard}
                onRetry={handleRetryLoad}
            />
        </DashboardLayout>
    );
}
