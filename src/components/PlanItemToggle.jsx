import { useState } from 'react';
import { Button } from './ui/button';

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
        <div className="flex min-w-[160px] flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {isDone ? (
                    <>
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                            Done
                        </span>
                        <button
                            type="button"
                            onClick={() => handleStatusUpdate('todo')}
                            disabled={isSaving}
                            className="text-xs font-medium text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Reopen ${item?.title || 'plan item'}`}
                        >
                            Reopen
                        </button>
                    </>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => handleStatusUpdate('done')}
                        disabled={isSaving}
                        className="h-7 rounded-full bg-emerald-600 px-3 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        aria-label={`Mark ${item?.title || 'plan item'} done`}
                    >
                        Done
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    variant={isSkipped ? 'default' : 'outline'}
                    onClick={() => handleStatusUpdate(isSkipped ? 'todo' : 'skipped')}
                    disabled={isSaving}
                    className={isSkipped
                        ? 'h-7 rounded-full bg-amber-500 px-3 text-[11px] font-semibold text-white hover:bg-amber-600'
                        : 'h-7 rounded-full px-3 text-[11px] font-semibold'}
                    aria-label={`${isSkipped ? 'Unskip' : 'Skip'} ${item?.title || 'plan item'}`}
                >
                    {isSkipped ? 'Skipped' : 'Skip'}
                </Button>
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
