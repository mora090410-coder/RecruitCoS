import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import PlanItemToggle from './PlanItemToggle';
import ProgressiveDisclosureCard from './ProgressiveDisclosureCard';

const formatAthleteSubtitle = (athlete, phaseLabel) => {
    const gradYear = athlete?.grad_year ? `Class of ${athlete.grad_year}` : null;
    const position = athlete?.position || null;
    const parts = [phaseLabel, gradYear, position].filter(Boolean);
    return parts.join(' · ');
};

export default function SimpleWeeklyView({
    athlete,
    phaseLabel,
    primaryGap,
    actions,
    loading,
    error,
    onStatusChange,
    targetAthleteId,
    showUnlockCard,
    engagement,
    unlockingDashboard,
    unlockError,
    onUnlockDashboard
}) {
    const subtitle = formatAthleteSubtitle(athlete, phaseLabel);
    const hasActions = Array.isArray(actions) && actions.length > 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-serif">
                        This Week&apos;s Focus
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                >
                    See Full Analysis &rarr;
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Primary Gap</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <p className="text-sm text-zinc-500">Loading primary gap...</p>
                    )}
                    {!loading && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-400">Metric</p>
                                <p className="text-lg font-semibold text-zinc-900">
                                    {primaryGap?.metricLabel || 'Primary gap'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-400">Athlete Value</p>
                                <p className="text-lg font-semibold text-zinc-900">
                                    {primaryGap?.athleteValueText || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-400">
                                    Target {primaryGap?.targetDivision ? `(${primaryGap.targetDivision})` : ''}
                                </p>
                                <p className="text-lg font-semibold text-zinc-900">
                                    {primaryGap?.targetValueText || '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">This Week&apos;s Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && (
                        <p className="text-sm text-zinc-500">Loading actions...</p>
                    )}
                    {!loading && error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    {!loading && !error && !hasActions && (
                        <p className="text-sm text-zinc-500">No weekly plan items available.</p>
                    )}
                    {!loading && !error && hasActions && actions.map((item) => (
                        <div key={item.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wide text-zinc-400">{item.item_type}</p>
                                    <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                                    <p className="text-xs text-zinc-500">{item.why}</p>
                                </div>
                                <PlanItemToggle
                                    item={item}
                                    onStatusChange={onStatusChange}
                                    targetAthleteId={targetAthleteId}
                                />
                            </div>
                            {Array.isArray(item.actions) && item.actions.length > 0 && (
                                <ul className="mt-3 list-disc pl-5 text-xs text-zinc-600 space-y-1">
                                    {item.actions.map((action, index) => (
                                        <li key={`${item.id}-action-${index}`}>{action}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
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
