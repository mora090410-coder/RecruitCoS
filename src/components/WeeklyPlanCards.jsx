import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useProfile } from '../hooks/useProfile';
import { generateAndPersistWeeklyPlan, getCurrentWeekStartDate, getPreviousWeekStartDate } from '../services/weeklyPlanService';
import { fetchWeeklyPlanItems, updateWeeklyPlanItemStatus } from '../lib/recruitingData';

const STATUS_LABELS = {
    open: 'Open',
    done: 'Done',
    skipped: 'Skipped'
};

export default function WeeklyPlanCards() {
    const { user, activeAthlete, isImpersonating } = useProfile();
    const [items, setItems] = useState([]);
    const [lastWeekSummary, setLastWeekSummary] = useState({ doneCount: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const targetAthleteId = isImpersonating ? activeAthlete?.id : user?.id;

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!targetAthleteId) {
                    setItems([]);
                    return;
                }

                const currentItems = await generateAndPersistWeeklyPlan(targetAthleteId);
                const weekStartDate = getCurrentWeekStartDate();
                const lastWeekStartDate = getPreviousWeekStartDate(weekStartDate);
                const lastWeekItems = await fetchWeeklyPlanItems(targetAthleteId, lastWeekStartDate);

                if (!active) return;

                setItems(currentItems || []);
                setLastWeekSummary({
                    doneCount: lastWeekItems.filter((item) => item.status === 'done').length,
                    total: lastWeekItems.length
                });
            } catch (err) {
                if (!active) return;
                console.error('[WeeklyPlanCards] Failed to load weekly plan:', err);
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

    const handleStatusUpdate = async (itemId, status) => {
        try {
            const updated = await updateWeeklyPlanItemStatus(itemId, status);
            if (!updated) return;
            setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (err) {
            console.error('[WeeklyPlanCards] Failed to update status:', err);
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Weekly Plan</CardTitle>
                <p className="text-sm text-slate-500">
                    Last week: {lastWeekSummary.doneCount}/{lastWeekSummary.total} completed
                </p>
            </CardHeader>
            <CardContent>
                {loading && <p className="text-sm text-slate-500">Loading weekly plan...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!loading && !error && sortedItems.length === 0 && (
                    <p className="text-sm text-slate-500">No weekly plan items yet.</p>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                    {sortedItems.map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs uppercase tracking-wide text-slate-400">
                                    {item.item_type}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {STATUS_LABELS[item.status] || 'Open'}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{item.why}</p>
                            <ul className="text-xs text-slate-600 space-y-1 mb-4">
                                {(item.actions || []).map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={item.status === 'done' ? 'secondary' : 'default'}
                                    onClick={() => handleStatusUpdate(item.id, 'done')}
                                    disabled={item.status === 'done'}
                                >
                                    Mark Done
                                </Button>
                                <Button
                                    size="sm"
                                    variant={item.status === 'skipped' ? 'secondary' : 'outline'}
                                    onClick={() => handleStatusUpdate(item.id, 'skipped')}
                                    disabled={item.status === 'skipped'}
                                >
                                    Skip
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
