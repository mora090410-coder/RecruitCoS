import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildAthleteProfile } from '../services/buildAthleteProfile';
import { computeGap } from '../services/engines/gapEngine';
import { generateWeeklyPlan } from '../services/engines/weeklyPlanEngine';
import { getSportSchema } from '../config/sportSchema';
import { generateAndPersistWeeklyPlan, getWeeklyPlanDebugSnapshot } from '../services/weeklyPlanService';

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
                await generateAndPersistWeeklyPlan(athleteId);
                const weeklyPlanDebug = await getWeeklyPlanDebugSnapshot(athleteId);
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
                        strengths: gapResult?.strengths || [],
                        perMetric: gapResult?.perMetric || [],
                        priorities: weeklyPlan?.priorities || [],
                        weeklyPlanDebug
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
                <div className="mt-6 space-y-6">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <h2 className="text-sm font-semibold mb-2">Primary Gap</h2>
                        {state.payload.primaryGap ? (
                            <div className="text-xs text-zinc-200">
                                <div>Metric: {state.payload.primaryGap.metricKey}</div>
                                <div>Band: {state.payload.primaryGap.band || 'n/a'}</div>
                                <div>Gap Score: {state.payload.primaryGap.normalizedGapScore ?? 'n/a'}</div>
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-400">No primary gap detected.</p>
                        )}
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4">
                        <h2 className="text-sm font-semibold mb-2">Strengths</h2>
                        {state.payload.strengths?.length ? (
                            <ul className="text-xs text-zinc-200 space-y-1">
                                {state.payload.strengths.map((metric) => (
                                    <li key={metric.metricKey}>
                                        {metric.metricKey} ({metric.band || 'n/a'}) - Strength Score: {metric.normalizedStrengthScore ?? 'n/a'}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-zinc-400">No strengths detected.</p>
                        )}
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 overflow-auto">
                        <h2 className="text-sm font-semibold mb-3">Per-Metric Breakdown</h2>
                        <table className="w-full text-xs text-left">
                            <thead className="text-zinc-400">
                                <tr>
                                    <th className="pr-4 py-1">Metric</th>
                                    <th className="pr-4 py-1">Athlete</th>
                                    <th className="pr-4 py-1">P50</th>
                                    <th className="pr-4 py-1">P75</th>
                                    <th className="pr-4 py-1">P90</th>
                                    <th className="pr-4 py-1">Band</th>
                                    <th className="pr-4 py-1">Strength Tier</th>
                                    <th className="pr-4 py-1">Advantage vs P50</th>
                                    <th className="pr-4 py-1">Normalized Advantage</th>
                                    <th className="pr-4 py-1">Gap Score</th>
                                    <th className="pr-4 py-1">Strength Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-zinc-200">
                                {state.payload.perMetric.map((metric) => (
                                    <tr key={metric.metricKey} className="border-t border-zinc-800">
                                        <td className="pr-4 py-1">{metric.metricKey}</td>
                                        <td className="pr-4 py-1">{metric.athleteValue ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.p50 ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.p75 ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.p90 ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.band || 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.strengthTier || 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.advantageVsP50 ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.normalizedAdvantage ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.normalizedGapScore ?? 'n/a'}</td>
                                        <td className="pr-4 py-1">{metric.normalizedStrengthScore ?? 'n/a'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 overflow-auto">
                        <h2 className="text-sm font-semibold mb-3">Weekly Plan Output</h2>
                        <pre className="text-xs text-zinc-200">{JSON.stringify(state.payload.priorities, null, 2)}</pre>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 overflow-auto">
                        <h2 className="text-sm font-semibold mb-3">Current Week Plan Items</h2>
                        <pre className="text-xs text-zinc-200">
                            {JSON.stringify(state.payload.weeklyPlanDebug?.currentWeekItems || [], null, 2)}
                        </pre>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 overflow-auto">
                        <h2 className="text-sm font-semibold mb-3">Last Week Plan Items</h2>
                        <pre className="text-xs text-zinc-200">
                            {JSON.stringify(state.payload.weeklyPlanDebug?.lastWeekItems || [], null, 2)}
                        </pre>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-4 overflow-auto">
                        <h2 className="text-sm font-semibold mb-3">Plan Decisions</h2>
                        <pre className="text-xs text-zinc-200">
                            {JSON.stringify(state.payload.weeklyPlanDebug?.decisions || {}, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
