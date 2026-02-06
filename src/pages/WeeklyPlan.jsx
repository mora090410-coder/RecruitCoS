import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import SimpleWeeklyView from '../components/SimpleWeeklyView';
import { useProfile } from '../hooks/useProfile';
import { getSimpleWeeklyPlan } from '../lib/weeklyPlan/getSimpleWeeklyPlan';
import {
    getAthleteEngagement,
    unlockDashboard,
    updateWeeklyPlanItemStatus
} from '../lib/recruitingData';

export default function WeeklyPlan() {
    const navigate = useNavigate();
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unlockingDashboard, setUnlockingDashboard] = useState(false);
    const [unlockError, setUnlockError] = useState(null);

    const targetAthleteId = useMemo(() => {
        if (isImpersonating) return activeAthlete?.id || null;
        return profile?.id || null;
    }, [activeAthlete?.id, isImpersonating, profile?.id]);

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
    }, [targetAthleteId]);

    const showUnlockCard = useMemo(() => {
        const weeksActive = engagement?.weeksActive || 0;
        const actionsCompleted = engagement?.actionsCompleted || 0;
        const completionRate = engagement?.completionRate || 0;

        return weeksActive >= 2 && actionsCompleted >= 4 && completionRate > 0.5;
    }, [engagement?.actionsCompleted, engagement?.completionRate, engagement?.weeksActive]);

    const handleUnlockDashboard = async () => {
        if (!targetAthleteId || unlockingDashboard) return;
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
        const normalizedStatus = nextStatus === 'todo' ? 'open' : nextStatus;
        if (!normalizedStatus) return null;
        if (item.status === normalizedStatus) return item;
        if (item.athlete_id && item.athlete_id !== targetAthleteId) {
            throw new Error('Not authorized to update this plan item.');
        }

        const updated = await updateWeeklyPlanItemStatus(item.id, normalizedStatus);
        if (!updated) return null;

        setSimplePlan((prev) => {
            if (!prev?.actions) return prev;
            return {
                ...prev,
                actions: prev.actions.map((entry) => (entry.id === updated.id ? updated : entry))
            };
        });

        return updated;
    };

    return (
        <DashboardLayout phase={simplePlan?.phaseLabel}>
            <SimpleWeeklyView
                athlete={simplePlan?.athlete}
                phaseLabel={simplePlan?.phaseLabel}
                primaryGap={simplePlan?.primaryGap}
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
            />
        </DashboardLayout>
    );
}
