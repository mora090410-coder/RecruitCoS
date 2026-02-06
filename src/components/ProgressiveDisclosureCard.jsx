import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ProgressiveDisclosureCard({
    weeksActive,
    actionsCompleted,
    onUnlock,
    saving,
    error
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Ready to see the full picture?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-zinc-600">
                    You&apos;ve completed {actionsCompleted} actions over {weeksActive} weeks. Unlock your complete recruiting analysis.
                </p>
                <div>
                    <button
                        type="button"
                        onClick={onUnlock}
                        disabled={saving}
                        className="inline-flex items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Unlocking...' : 'View Full Dashboard →'}
                    </button>
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </CardContent>
        </Card>
    );
}
