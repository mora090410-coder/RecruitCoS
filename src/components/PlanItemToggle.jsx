import { useState } from 'react';

const STATUS_LABELS = {
    open: 'Open',
    done: 'Done',
    skipped: 'Skipped'
};

export default function PlanItemToggle({ item, onStatusChange, targetAthleteId }) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleStatusUpdate = async (nextStatus) => {
        if (!item?.id || !onStatusChange) return;
        const normalizedStatus = nextStatus === 'todo' ? 'open' : nextStatus;
        if (item.status === normalizedStatus) return;
        if (item.athlete_id && targetAthleteId && item.athlete_id !== targetAthleteId) {
            setError('Not authorized to update this item.');
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await onStatusChange(item, normalizedStatus);
        } catch (err) {
            setError(err?.message || 'Unable to update status.');
        } finally {
            setIsSaving(false);
        }
    };

    const isDone = item?.status === 'done';
    const isSkipped = item?.status === 'skipped';

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <input
                        type="checkbox"
                        checked={isDone}
                        onChange={(event) => handleStatusUpdate(event.target.checked ? 'done' : 'open')}
                        disabled={isSaving}
                        aria-label={`Mark ${item?.title || 'plan item'} done`}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Done
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                    <input
                        type="checkbox"
                        checked={isSkipped}
                        onChange={(event) => handleStatusUpdate(event.target.checked ? 'skipped' : 'open')}
                        disabled={isSaving}
                        aria-label={`Skip ${item?.title || 'plan item'}`}
                        className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                    />
                    Skip
                </label>
                <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                    {STATUS_LABELS[item?.status] || 'Open'}
                </span>
            </div>
            {isSaving && (
                <span className="text-[10px] text-zinc-400">Saving...</span>
            )}
            {error && (
                <span className="text-[10px] text-red-500">{error}</span>
            )}
        </div>
    );
}
