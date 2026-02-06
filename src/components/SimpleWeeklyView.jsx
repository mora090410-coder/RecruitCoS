import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import PlanItemToggle from './PlanItemToggle';
import ProgressiveDisclosureCard from './ProgressiveDisclosureCard';
import { Button } from './ui/button';
import { track } from '../lib/analytics';

const formatAthleteMeta = (athlete) => {
    const gradYear = athlete?.grad_year ? `Class of ${athlete.grad_year}` : null;
    const position = athlete?.position || null;
    const parts = [gradYear, position].filter(Boolean);
    return parts.join(' · ');
};

const ITEM_TYPE_STYLES = {
    gap: 'bg-rose-100 text-rose-700 border-rose-200',
    strength: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    phase: 'bg-blue-100 text-blue-700 border-blue-200'
};

export default function SimpleWeeklyView({
    athlete,
    phaseLabel,
    primaryGap,
    primaryGapState,
    actions,
    loading,
    error,
    onStatusChange,
    targetAthleteId,
    showUnlockCard,
    engagement,
    unlockingDashboard,
    unlockError,
    onUnlockDashboard,
    onRetry
}) {
    const subtitle = formatAthleteMeta(athlete);
    const hasActions = Array.isArray(actions) && actions.length > 0;
    const metricFields = [
        {
            key: 'metric',
            label: 'Metric',
            value: primaryGap?.metricLabel
        },
        {
            key: 'athlete-value',
            label: 'Athlete Value',
            value: primaryGap?.athleteValueText
        },
        {
            key: 'target-value',
            label: `Target ${primaryGap?.targetDivision ? `(${primaryGap.targetDivision})` : ''}`.trim(),
            value: primaryGap?.targetValueText
        }
    ].filter((field) => field.value);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                        {phaseLabel || 'Weekly Plan'}
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-serif">
                        This Week&apos;s Focus
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-zinc-500">{subtitle}</p>
                    )}
                </div>
                <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
                >
                    See Full Analysis &rarr;
                </Link>
            </div>

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                        {primaryGapState === 'missing_baseline' ? 'Primary Focus' : 'Primary Gap'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading && (
                        <div className="space-y-3 animate-pulse" aria-label="Loading primary focus">
                            <div className="h-4 w-48 rounded bg-zinc-200" />
                            <div className="h-16 w-full rounded-xl bg-zinc-100" />
                        </div>
                    )}
                    {!loading && primaryGapState === 'missing_baseline' && (
                        <div className="space-y-3">
                            <p className="text-sm text-zinc-600">
                                Add your first measurable to unlock your personalized primary gap.
                            </p>
                            <Button asChild type="button" size="default" className="w-full sm:w-auto">
                                <Link
                                    to="/measurables"
                                    onClick={() => track('add_measurables_clicked', { source: 'weekly_plan_primary_gap_card' })}
                                >
                                    Add Measurables &rarr;
                                </Link>
                            </Button>
                            <p className="text-xs text-zinc-500">
                                Takes ~60 seconds. You can skip anything you don&apos;t know.
                            </p>
                        </div>
                    )}
                    {!loading && primaryGapState !== 'missing_baseline' && (
                        metricFields.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-3">
                                {metricFields.map((field) => (
                                    <div key={field.key}>
                                        <p className="text-xs uppercase tracking-wide text-zinc-400">{field.label}</p>
                                        <p className="text-lg font-semibold text-zinc-900">{field.value}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">Primary gap data will appear here after your next update.</p>
                        )
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">This Week&apos;s Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && (
                        <div className="space-y-3" aria-label="Loading actions">
                            {[1, 2, 3].map((row) => (
                                <div key={row} className="animate-pulse rounded-xl border border-zinc-200 p-4">
                                    <div className="h-4 w-20 rounded bg-zinc-200" />
                                    <div className="mt-3 h-5 w-3/4 rounded bg-zinc-200" />
                                    <div className="mt-3 h-3 w-full rounded bg-zinc-100" />
                                    <div className="mt-2 h-3 w-2/3 rounded bg-zinc-100" />
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-700">{error}</p>
                            {typeof onRetry === 'function' && (
                                <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-2">
                                    Retry
                                </Button>
                            )}
                        </div>
                    )}
                    {!loading && !error && !hasActions && (
                        <p className="text-sm text-zinc-500">No weekly plan items available.</p>
                    )}
                    {!loading && !error && hasActions && actions.map((item) => {
                        const typeKey = (item.item_type || '').toLowerCase();
                        const typeClassName = ITEM_TYPE_STYLES[typeKey] || 'bg-zinc-100 text-zinc-700 border-zinc-200';
                        return (
                            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-wide ${typeClassName}`}>
                                                {item.item_type}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
                                        <p className="text-xs leading-5 text-zinc-500">{item.why}</p>
                                    </div>
                                    <PlanItemToggle
                                        item={item}
                                        onStatusChange={onStatusChange}
                                        targetAthleteId={targetAthleteId}
                                    />
                                </div>
                                {Array.isArray(item.actions) && item.actions.length > 0 && (
                                    <ul className="mt-3 space-y-1 pl-5 text-xs text-zinc-600 list-disc">
                                        {item.actions.map((action, index) => (
                                            <li key={`${item.id}-action-${index}`}>{action}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {showUnlockCard && (
                <ProgressiveDisclosureCard
                    weeksActive={engagement?.weeksActive || 0}
                    actionsCompleted={engagement?.actionsCompleted || 0}
                    onUnlock={onUnlockDashboard}
                    saving={unlockingDashboard}
                    error={unlockError}
                />
            )}
        </div>
    );
}
