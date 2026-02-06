import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useProfile } from '../hooks/useProfile';
import { generateAndPersistWeeklyPlan, getCurrentWeekStartDate } from '../services/weeklyPlanService';
import {
    fetchLatestWeeklyPlanHeaders,
    fetchWeeklyPlanItems,
    updateWeeklyPlanItemStatus
} from '../lib/recruitingData';

const STATUS_LABELS = {
    open: 'Open',
    done: 'Done',
    skipped: 'Skipped'
};

const STATUS_STYLES = {
    open: 'bg-slate-100 text-slate-600 border-slate-200',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    skipped: 'bg-amber-100 text-amber-700 border-amber-200'
};

export default function WeeklyPlanCards() {
    const { profile, activeAthlete, isImpersonating } = useProfile();
    const [items, setItems] = useState([]);
    const [lastWeekSummary, setLastWeekSummary] = useState({
        status: 'missing',
        completed: 0,
        total: 0
    });
    const [savingById, setSavingById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [manualAthleteId, setManualAthleteId] = useState('');
    const [manualOverrideId, setManualOverrideId] = useState(null);

    const targetAthleteId = useMemo(() => {
        if (isImpersonating) return activeAthlete?.id || null;
        if (profile?.id) return profile.id;
        if (import.meta.env.DEV) return manualOverrideId;
        return null;
    }, [activeAthlete?.id, isImpersonating, manualOverrideId, profile?.id]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!targetAthleteId) {
                    setItems([]);
                    setLastWeekSummary({ doneCount: 0, total: 0 });
                    return;
                }

                const weekStartDate = getCurrentWeekStartDate();

                await generateAndPersistWeeklyPlan(targetAthleteId);

                const [currentItems, weeklyHeaders] = await Promise.all([
                    fetchWeeklyPlanItems(targetAthleteId, weekStartDate),
                    fetchLatestWeeklyPlanHeaders(targetAthleteId, 2)
                ]);

                const currentWeek = weeklyHeaders[0] || null;
                const lastWeek = weeklyHeaders[1] || null;

                if (import.meta.env.DEV) {
                    console.log('[WeeklyPlanCards] weekly headers', {
                        currentWeek: currentWeek?.week_of_date || null,
                        lastWeek: lastWeek?.week_of_date || null
                    });
                }

                let lastWeekItems = [];
                if (lastWeek?.week_of_date) {
                    lastWeekItems = await fetchWeeklyPlanItems(targetAthleteId, lastWeek.week_of_date);
                }

                if (!active) return;

                setItems(currentItems || []);
                if (!lastWeek) {
                    setLastWeekSummary({ status: 'missing', completed: 0, total: 0 });
                } else if (!lastWeekItems || lastWeekItems.length === 0) {
                    setLastWeekSummary({ status: 'empty', completed: 0, total: 0 });
                } else {
                    const doneCount = lastWeekItems.filter((item) => item.status === 'done').length;
                    const skippedCount = lastWeekItems.filter((item) => item.status === 'skipped').length;
                    setLastWeekSummary({
                        status: 'ok',
                        completed: doneCount + skippedCount,
                        total: lastWeekItems.length
                    });
                }
            } catch (err) {
                if (!active) return;
                if (import.meta.env.DEV) {
                    console.error('[WeeklyPlanCards] Failed to load weekly plan:', err);
                }
                setError(err?.message || 'Failed to load weekly plan.');
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [targetAthleteId]);

    const sortedItems = useMemo(() => (
        [...items].sort((a, b) => (a.priority_rank || 0) - (b.priority_rank || 0))
    ), [items]);

    const topItems = useMemo(() => sortedItems.slice(0, 3), [sortedItems]);
    const currentWeekStartDate = useMemo(() => getCurrentWeekStartDate(), []);

    const handleStatusUpdate = async (item, nextStatus) => {
        const itemId = item?.id;
        if (!itemId) return;
        if (savingById[itemId]) return;
        try {
            setSavingById((prev) => ({ ...prev, [itemId]: true }));
            if (import.meta.env.DEV) {
                console.log('[WeeklyPlanCards] status click', {
                    itemId,
                    athleteId: item?.athlete_id || null,
                    weekStartDate: item?.week_start_date || null,
                    oldStatus: item?.status || 'open',
                    newStatus: nextStatus
                });
            }
            const updated = await updateWeeklyPlanItemStatus(itemId, nextStatus);
            if (!updated) return;
            setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            if (import.meta.env.DEV) {
                console.log('[WeeklyPlanCards] status saved', {
                    itemId,
                    athleteId: item?.athlete_id || null,
                    weekStartDate: item?.week_start_date || null,
                    oldStatus: item?.status || 'open',
                    newStatus: nextStatus
                });
            }
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('[WeeklyPlanCards] Failed to update status:', {
                    itemId,
                    athleteId: item?.athlete_id || null,
                    weekStartDate: item?.week_start_date || null,
                    oldStatus: item?.status || 'open',
                    newStatus: nextStatus,
                    error: err
                });
            }
        } finally {
            setSavingById((prev) => {
                if (!prev[itemId]) return prev;
                const next = { ...prev };
                delete next[itemId];
                return next;
            });
        }
    };

    const handleManualSubmit = () => {
        const trimmed = manualAthleteId.trim();
        if (!trimmed) return;
        setManualOverrideId(trimmed);
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Weekly Plan</CardTitle>
                <p className="text-sm text-slate-500">
                    {lastWeekSummary.status === 'missing' && 'Last week: no plan found'}
                    {lastWeekSummary.status === 'empty' && 'Last week: no items found'}
                    {lastWeekSummary.status === 'ok'
                        && `Last week: ${lastWeekSummary.completed} of ${lastWeekSummary.total} completed`}
                </p>
            </CardHeader>
            <CardContent>
                {import.meta.env.DEV && !targetAthleteId && (
                    <div className="mb-4 rounded-lg border border-dashed border-slate-200 p-4 bg-slate-50">
                        <p className="text-xs text-slate-500 mb-2">
                            No athlete selected. Paste an athlete ID to load a weekly plan (dev only).
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                value={manualAthleteId}
                                onChange={(event) => setManualAthleteId(event.target.value)}
                                placeholder="athleteId"
                                aria-label="Athlete ID"
                            />
                            <Button type="button" size="sm" onClick={handleManualSubmit}>
                                Load Plan
                            </Button>
                        </div>
                    </div>
                )}
                {loading && <p className="text-sm text-slate-500">Loading weekly plan...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!loading && !error && topItems.length === 0 && (
                    <p className="text-sm text-slate-500">No weekly plan items yet.</p>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                    {topItems.map((item) => {
                        const statusKey = item.status || 'open';
                        const isSaving = Boolean(savingById[item.id]);
                        const isCurrentWeek = item?.week_start_date
                            ? item.week_start_date === currentWeekStartDate
                            : true;
                        return (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs uppercase tracking-wide text-slate-400">
                                    {item.item_type}
                                </span>
                                <Badge className={STATUS_STYLES[statusKey] || STATUS_STYLES.open}>
                                    {STATUS_LABELS[statusKey] || 'Open'}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{item.why}</p>
                            <ul className="text-xs text-slate-600 space-y-1 mb-4 list-disc pl-4">
                                {(Array.isArray(item.actions) ? item.actions : []).map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                            {isCurrentWeek && (
                                <div className="flex gap-2">
                                    {statusKey === 'open' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => handleStatusUpdate(item, 'done')}
                                                disabled={isSaving}
                                                aria-label={`Mark ${item.title} done`}
                                                data-testid="weekly-btn-done"
                                            >
                                                {isSaving ? 'Saving...' : 'Mark Done'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(item, 'skipped')}
                                                disabled={isSaving}
                                                aria-label={`Skip ${item.title}`}
                                                data-testid="weekly-btn-skip"
                                            >
                                                {isSaving ? 'Saving...' : 'Skip'}
                                            </Button>
                                        </>
                                    )}
                                    {(statusKey === 'done' || statusKey === 'skipped') && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleStatusUpdate(item, 'open')}
                                            disabled={isSaving}
                                            aria-label={`Undo ${item.title}`}
                                            data-testid="weekly-btn-undo"
                                        >
                                            {isSaving ? 'Saving...' : 'Undo'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
