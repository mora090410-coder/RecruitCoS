import { useMemo, useState } from 'react';
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
    setWeeklyActionStatus
} from '../../lib/actionRouting';

const CARD_CLASS = 'rounded-[12px] border-2 border-[#E5E7EB] bg-white p-6 md:p-8';

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

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const targetSport = useMemo(() => (
        (isImpersonating ? activeAthlete?.sport : profile?.sport) || 'unknown'
    ), [activeAthlete?.sport, isImpersonating, profile?.sport]);

    const [dashTime, setDashTime] = useState('');
    const [verticalJump, setVerticalJump] = useState('');
    const [recentStats, setRecentStats] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

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
            navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
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
        const numericDash = dashTime === '' ? null : Number.parseFloat(dashTime);
        const numericVertical = verticalJump === '' ? null : Number.parseFloat(verticalJump);

        const hasDash = Number.isFinite(numericDash);
        const hasVertical = Number.isFinite(numericVertical);
        const hasRecentStats = trimmedRecentStats.length > 0;

        if (!hasDash && !hasVertical && !hasRecentStats) {
            setError('Add at least one stat before saving.');
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const writes = [];
            if (hasDash) {
                writes.push(upsertMeasurableRow({
                    athleteId: targetAthleteId,
                    sport: targetSport,
                    metric: 'sixty_yard_dash',
                    value: numericDash,
                    unit: 'seconds'
                }));
            }

            if (hasVertical) {
                writes.push(upsertMeasurableRow({
                    athleteId: targetAthleteId,
                    sport: targetSport,
                    metric: 'vertical_jump',
                    value: numericVertical,
                    unit: 'inches'
                }));
            }

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

            navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
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
                    <Link to="/weekly-plan" className="text-sm font-semibold text-[#6C2EB9] hover:underline">
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
                            Capture fresh measurables and notes, then mark this weekly action complete.
                        </p>
                    </header>

                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">60-yard dash (seconds)</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={dashTime}
                                onChange={(event) => setDashTime(event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                placeholder="e.g. 7.12"
                                aria-label="60-yard dash time in seconds"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Vertical jump (inches)</span>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={verticalJump}
                                onChange={(event) => setVerticalJump(event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                placeholder="e.g. 28.5"
                                aria-label="Vertical jump in inches"
                            />
                        </label>
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
