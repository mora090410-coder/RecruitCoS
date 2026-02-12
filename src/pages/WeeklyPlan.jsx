import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SimpleWeeklyView from '../components/SimpleWeeklyView';
import { useProfile } from '../hooks/useProfile';
import { getSimpleWeeklyPlan } from '../lib/weeklyPlan/getSimpleWeeklyPlan';
import { getAthleteEngagement } from '../lib/getAthleteEngagement';
import { track } from '../lib/analytics';

export default function WeeklyPlan() {
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [simplePlan, setSimplePlan] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [hasTrackedPlanView, setHasTrackedPlanView] = useState(false);

    const targetAthleteId = useMemo(() => {
        if (isImpersonating) return activeAthlete?.id || null;
        return profile?.id || null;
    }, [activeAthlete?.id, isImpersonating, profile?.id]);

    useEffect(() => {
        setHasTrackedPlanView(false);
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

    useEffect(() => {
        if (!simplePlan || loading || hasTrackedPlanView) return;
        track('weekly_plan_viewed', {
            week_start: simplePlan.weekStartDate || null,
            phase: simplePlan.phaseLabel || null,
            sport: simplePlan.athlete?.sport || null,
            position: simplePlan.athlete?.position || null,
            grad_year: simplePlan.athlete?.grad_year || null,
            has_primary_gap: Boolean(simplePlan?.primaryGap?.metricKey),
            has_metrics: simplePlan?.primaryGapState !== 'missing_baseline'
        });
        setHasTrackedPlanView(true);
    }, [simplePlan, loading, hasTrackedPlanView]);

    return (
        <DashboardLayout phase={simplePlan?.phaseLabel}>
            <SimpleWeeklyView
                athlete={simplePlan?.athlete}
                phaseLabel={simplePlan?.phaseLabel}
                actions={simplePlan?.actions || []}
                loading={loading}
                error={error}
                targetAthleteId={targetAthleteId}
                engagement={engagement}
                onRetry={handleRetryLoad}
                weekStartDate={simplePlan?.weekStartDate}
            />
        </DashboardLayout>
    );
}
