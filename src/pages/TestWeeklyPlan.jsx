import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildAthleteProfile } from '../services/buildAthleteProfile';
import { computeGap } from '../services/engines/gapEngine';
import { generateWeeklyPlan } from '../services/engines/weeklyPlanEngine';
import { getSportSchema } from '../config/sportSchema';

const DEFAULT_TARGET_LEVEL = 'D2';

export default function WeeklyPlanDebug() {
    const { athleteId } = useParams();
    const [state, setState] = useState({
        loading: true,
        error: null,
        payload: null
    });

    useEffect(() => {
        if (!import.meta.env.DEV) {
            setState({
                loading: false,
                error: null,
                payload: null
            });
            return undefined;
        }
        let active = true;

        const load = async () => {
            try {
                const athleteProfile = await buildAthleteProfile(athleteId);
                const positionGroup = athleteProfile?.positions?.primary?.group || null;
                const targetLevel = athleteProfile?.goals?.targetLevels?.[0] || DEFAULT_TARGET_LEVEL;
                const sportSchema = getSportSchema(athleteProfile?.sportKey || athleteProfile?.sport);
                const gapResult = computeGap(athleteProfile);
                const weeklyPlan = generateWeeklyPlan(athleteProfile, gapResult);
                const latestMetricKeys = Object.keys(athleteProfile?.measurables?.latestByMetric || {});
                const measurablesRawCount = athleteProfile?.measurables?.rawCount || 0;
                const benchmarksUsed = athleteProfile?.benchmarkDiagnostics?.benchmarksUsed
                    || (athleteProfile?.benchmarks || []).map((row) => ({
                        metric: row.metric,
                        p50: row.p50,
                        direction: row.direction
                    }));
                const applicableMetricKeys = (sportSchema?.metrics || [])
                    .filter((metric) => metric.appliesToGroups?.includes(positionGroup))
                    .map((metric) => metric.key);
                const matchedMetrics = gapResult?.diagnostics?.matchedMetrics || [];

                if (!active) return;
                setState({
                    loading: false,
                    error: null,
                    payload: {
                        sport: athleteProfile?.sport || null,
                        position: athleteProfile?.athlete?.position || athleteProfile?.positions?.primary?.display || null,
                        positionGroupUsed: athleteProfile?.positions?.primary?.group || null,
                        benchmarkLevelUsed: gapResult?.benchmarkLevelUsed || null,
                        sportKeyUsed: athleteProfile?.benchmarkDiagnostics?.sportKeyUsed || athleteProfile?.sportKey || null,
                        benchmarkQueryFilters: athleteProfile?.benchmarkDiagnostics?.benchmarkQueryFilters || null,
                        benchmarksFoundCount: athleteProfile?.benchmarkDiagnostics?.benchmarksFoundCount || 0,
                        benchmarkError: athleteProfile?.benchmarkDiagnostics?.benchmarkError || null,
                        measurablesRawCount,
                        latestMetricKeys,
                        latestByMetric: athleteProfile?.measurables?.latestByMetric || {},
                        benchmarksUsed,
                        applicableMetricKeys,
                        matchedMetrics,
                        phase: athleteProfile?.phase,
                        primaryGap: gapResult?.primaryGap || null,
                        priorities: weeklyPlan?.priorities || []
                    }
                });
            } catch (error) {
                if (!active) return;
                setState({
                    loading: false,
                    error: error?.message || 'Failed to run test weekly plan.',
                    payload: null
                });
            }
        };

        if (athleteId) {
            load();
        } else {
            setState({
                loading: false,
                error: 'Missing athleteId parameter.',
                payload: null
            });
        }

        return () => {
            active = false;
        };
    }, [athleteId]);

    if (!import.meta.env.DEV) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-6">
                <h1 className="text-lg font-semibold">Weekly Plan Debug</h1>
                <p className="text-sm text-zinc-400 mt-2">Debug disabled in production.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <h1 className="text-lg font-semibold">Weekly Plan Debug</h1>
            <p className="text-sm text-zinc-400 mt-2">
                Athlete ID: <span className="font-mono">{athleteId}</span>
            </p>
            {state.loading && <p className="mt-4 text-sm text-zinc-300">Loading...</p>}
            {state.error && (
                <p className="mt-4 text-sm text-red-400">{state.error}</p>
            )}
            {state.payload && (
                <pre className="mt-4 text-xs bg-zinc-900 rounded-lg p-4 overflow-auto">
                    {JSON.stringify(state.payload, null, 2)}
                </pre>
            )}
        </div>
    );
}
