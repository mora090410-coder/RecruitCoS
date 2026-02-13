import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { getFeatureRebuildMessage, isMissingTableError } from '../../lib/dbResilience';
import { getSportSchema } from '../../config/sportSchema';
import {
    resolveActionNumberFromSearch,
    resolveItemIdFromSearch,
    resolveWeekStartFromSearch,
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';

const CARD_CLASS = 'rounded-[12px] border-2 border-[#E5E7EB] bg-white p-6 md:p-8';

const FALLBACK_METRICS = [
    {
        key: 'sixty_yard_dash',
        label: '60-yard dash',
        unit: 'seconds',
        input: { min: 0, max: 20, step: 0.01 }
    },
    {
        key: 'vertical_jump',
        label: 'Vertical jump',
        unit: 'inches',
        input: { min: 0, max: 60, step: 0.1 }
    }
];

const UNIT_LABELS = {
    sec: 'seconds',
    in: 'inches',
    cm: 'cm',
    mph: 'mph',
    rpm: 'rpm',
    reps: 'reps',
    level: 'level',
    percent: '%',
    yd: 'yards',
    text: 'text'
};

const resolveUnitLabel = (unit) => UNIT_LABELS[unit] || unit || '';

const resolveMetricPlaceholder = (metric) => {
    const lowerBetter = metric?.direction === 'lower_better';
    const unit = resolveUnitLabel(metric?.unit);
    if (unit === '%') return 'e.g. 65';
    if (unit === 'seconds') return lowerBetter ? 'e.g. 2.88' : 'e.g. 4.20';
    if (unit === 'inches') return 'e.g. 28.5';
    if (unit === 'cm') return 'e.g. 72';
    if (unit === 'mph') return 'e.g. 63';
    if (unit === 'rpm') return 'e.g. 2100';
    if (unit === 'reps') return 'e.g. 12';
    if (unit === 'yards') return 'e.g. 55';
    return 'Enter value';
};

async function upsertMeasurableRow({ athleteId, sport, metric, value, unit }) {
    const { data: existingRow, error: lookupError } = await supabase
        .from('athlete_measurables')
        .select('id')
        .eq('athlete_id', athleteId)
        .eq('metric', metric)
        .order('measured_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (lookupError) throw lookupError;

    const payload = {
        athlete_id: athleteId,
        sport,
        metric,
        value,
        unit,
        measured_at: new Date().toISOString().slice(0, 10),
        verified: false
    };

    if (existingRow?.id) {
        const { error: updateError } = await supabase
            .from('athlete_measurables')
            .update(payload)
            .eq('id', existingRow.id);
        if (updateError) throw updateError;
        return;
    }

    const { error: insertError } = await supabase
        .from('athlete_measurables')
        .insert([payload]);
    if (insertError) throw insertError;
}

export default function UpdateStats() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 1);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 1);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const targetSport = useMemo(() => (
        (isImpersonating ? activeAthlete?.sport : profile?.sport) || 'unknown'
    ), [activeAthlete?.sport, isImpersonating, profile?.sport]);

    const targetPositionGroup = useMemo(() => (
        (isImpersonating
            ? (activeAthlete?.primary_position_group || activeAthlete?.position_group)
            : (profile?.primary_position_group || profile?.position_group)
        ) || null
    ), [
        activeAthlete?.position_group,
        activeAthlete?.primary_position_group,
        isImpersonating,
        profile?.position_group,
        profile?.primary_position_group
    ]);

    const metricFields = useMemo(() => {
        const schema = getSportSchema(targetSport);
        if (!schema?.metrics?.length) return FALLBACK_METRICS;
        if (!targetPositionGroup) return schema.metrics;

        const positionMetrics = schema.metrics.filter((metric) => metric.appliesToGroups?.includes(targetPositionGroup));
        return positionMetrics.length > 0 ? positionMetrics : schema.metrics;
    }, [targetPositionGroup, targetSport]);

    const [metricValues, setMetricValues] = useState({});
    const [recentStats, setRecentStats] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    useEffect(() => {
        setMetricValues((previous) => {
            const next = {};
            metricFields.forEach((metric) => {
                next[metric.key] = previous[metric.key] ?? '';
            });
            return next;
        });
    }, [metricFields]);

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
                return;
            }
            setError(skipError?.message || 'Unable to skip this action right now.');
        } finally {
            setIsSkipping(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!targetAthleteId || isSaving || isSkipping) return;

        const trimmedRecentStats = recentStats.trim();
        const populatedMetrics = metricFields
            .map((metric) => {
                const parsedValue = Number.parseFloat(metricValues[metric.key]);
                return {
                    key: metric.key,
                    unit: metric.unit || '',
                    value: Number.isFinite(parsedValue) ? parsedValue : null
                };
            })
            .filter((entry) => entry.value !== null);
        const hasRecentStats = trimmedRecentStats.length > 0;

        if (populatedMetrics.length === 0 && !hasRecentStats) {
            setError('Add at least one stat before saving.');
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const writes = populatedMetrics.map((entry) => upsertMeasurableRow({
                athleteId: targetAthleteId,
                sport: targetSport,
                metric: entry.key,
                value: entry.value,
                unit: entry.unit
            }));

            if (hasRecentStats) {
                const numericFromText = Number.parseFloat((trimmedRecentStats.match(/-?\d+(\.\d+)?/) || [])[0] || '0');
                writes.push(upsertMeasurableRow({
                    athleteId: targetAthleteId,
                    sport: targetSport,
                    metric: 'recent_stats',
                    value: Number.isFinite(numericFromText) ? numericFromText : 0,
                    unit: 'text'
                }));
            }

            await Promise.all(writes);

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
                setError(getFeatureRebuildMessage('Stats logging'));
            } else {
                setError(saveError?.message || 'Unable to save stats right now.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <Link to={weeklyPlanHref} className="text-sm font-semibold text-[#6C2EB9] hover:underline">
                        Back to Plan
                    </Link>
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6C2EB9]">
                        Action {actionNumber} of 3
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={`${CARD_CLASS} space-y-6 bg-[#F9FAFB]`}>
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Update Athlete Stats</h1>
                        <p className="text-sm text-gray-600">
                            Capture fresh {targetSport} measurables and notes, then mark this weekly action complete.
                        </p>
                    </header>

                    <div className="grid gap-5 md:grid-cols-2">
                        {metricFields.map((metric) => (
                            <label key={metric.key} className="space-y-2">
                                <span className="block text-sm font-medium text-gray-700">
                                    {metric.label} ({resolveUnitLabel(metric.unit)})
                                </span>
                                <input
                                    type="number"
                                    step={metric.input?.step ?? 0.01}
                                    min={metric.input?.min ?? 0}
                                    max={metric.input?.max}
                                    value={metricValues[metric.key] ?? ''}
                                    onChange={(event) => {
                                        const nextValue = event.target.value;
                                        setMetricValues((previous) => ({
                                            ...previous,
                                            [metric.key]: nextValue
                                        }));
                                    }}
                                    className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                    placeholder={resolveMetricPlaceholder(metric)}
                                    aria-label={`${metric.label} in ${resolveUnitLabel(metric.unit)}`}
                                />
                            </label>
                        ))}
                    </div>

                    <label className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700">Recent stats (optional)</span>
                        <textarea
                            rows={5}
                            value={recentStats}
                            onChange={(event) => setRecentStats(event.target.value)}
                            className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                            placeholder="Add context from recent games, showcases, or workouts."
                            aria-label="Recent stats notes"
                        />
                    </label>

                    {error && (
                        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-[12px] border-2 border-[#D1D5DB] bg-white px-5 text-sm font-semibold text-gray-700"
                            onClick={handleSkip}
                            disabled={isSaving || isSkipping}
                        >
                            {isSkipping ? 'Skipping...' : 'Skip This'}
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 rounded-[12px] bg-[#6C2EB9] px-5 text-sm font-semibold text-white hover:bg-[#5B25A0]"
                            disabled={isSaving || isSkipping || !targetAthleteId}
                        >
                            {isSaving ? 'Saving...' : 'Save & Mark Complete'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
