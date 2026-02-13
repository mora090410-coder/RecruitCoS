import { useCallback, useEffect, useMemo, useState } from 'react';
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
import './week4-actions.css';

const CARD_CLASS = 'w4-card';
const BENCHMARKS_BY_DIVISION = {
    d1: { low: 5000, high: 15000 },
    d2: { low: 3000, high: 8000 },
    d3: { low: 2000, high: 5000 },
    naia: { low: 1500, high: 4000 },
    juco: { low: 1000, high: 3000 }
};

const PROJECTION_CATEGORIES = [
    { key: 'showcase', label: 'Showcases' },
    { key: 'camp', label: 'Camps' },
    { key: 'travel', label: 'Travel' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'training', label: 'Training' },
    { key: 'other', label: 'Other' }
];

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount || 0));
}

function normalizeExpenseCategory(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized.includes('showcase')) return 'showcase';
    if (normalized.includes('camp')) return 'camp';
    if (normalized.includes('travel')) return 'travel';
    if (normalized.includes('equip')) return 'equipment';
    if (normalized.includes('train')) return 'training';
    return 'other';
}

function getExpenseDate(row) {
    return row?.expense_date || row?.date || row?.created_at || null;
}

function getMonthsCovered(expenses) {
    if (!expenses.length) return 1;

    const timestamps = expenses
        .map((expense) => new Date(getExpenseDate(expense)).getTime())
        .filter((timestamp) => Number.isFinite(timestamp));

    if (!timestamps.length) return 1;

    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));

    const months = (latest.getFullYear() - earliest.getFullYear()) * 12
        + (latest.getMonth() - earliest.getMonth())
        + 1;

    return Math.max(1, months);
}

function calculatePosition(value, min, max) {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 50;
    const position = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
}

function resolveDivision(athlete) {
    const direct = String(athlete?.target_division || '').trim().toLowerCase();
    if (direct && BENCHMARKS_BY_DIVISION[direct]) return direct;

    const firstTarget = String(athlete?.target_divisions?.[0] || '').trim().toLowerCase();
    if (firstTarget && BENCHMARKS_BY_DIVISION[firstTarget]) return firstTarget;

    return 'd3';
}

function buildRecommendation(totalProjected, benchmark, divisionLabel) {
    if (totalProjected < benchmark.low) {
        return `You are below the typical ${divisionLabel} recruiting investment range. Consider targeted showcases or camps to increase coach exposure.`;
    }

    if (totalProjected > benchmark.high) {
        return `You are above the typical ${divisionLabel} range. Prioritize events with strong coach conversion to improve ROI.`;
    }

    return `You are currently tracking within the typical ${divisionLabel} recruiting spend range.`;
}

function ProjectionRow({ label, amount }) {
    return (
        <div className="w4-projection-row">
            <span>{label}</span>
            <strong>{formatCurrency(amount)}/year</strong>
        </div>
    );
}

export default function ProjectCosts() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [athlete, setAthlete] = useState(null);
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const annualTotal = useMemo(() => {
        if (!projection) return 0;
        return Number(projection.projected_showcase_annual || 0)
            + Number(projection.projected_camp_annual || 0)
            + Number(projection.projected_travel_annual || 0)
            + Number(projection.projected_equipment_annual || 0)
            + Number(projection.projected_training_annual || 0)
            + Number(projection.projected_other_annual || 0);
    }, [projection]);

    const loadProjection = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const [athleteResult, expensesResult] = await Promise.all([
            supabase
                .from('athletes')
                .select('id, grad_year, graduation_year, target_division, target_divisions')
                .eq('id', athleteId)
                .maybeSingle(),
            supabase
                .from('expenses')
                .select('id, category, amount, date, expense_date, created_at')
                .eq('athlete_id', athleteId)
        ]);

        if (athleteResult.error) {
            setError(athleteResult.error.message || 'Unable to load athlete profile.');
            setLoading(false);
            return;
        }

        if (expensesResult.error) {
            if (isMissingTableError(expensesResult.error)) {
                setError(getFeatureRebuildMessage('Expenses'));
            } else {
                setError(expensesResult.error.message || 'Unable to load expenses.');
            }
            setLoading(false);
            return;
        }

        if (!athleteResult.data?.id) {
            setError('Athlete profile not found.');
            setLoading(false);
            return;
        }

        const athleteRow = athleteResult.data;
        const expenses = expensesResult.data || [];

        const totalSpent = expenses.reduce((sum, expense) => {
            const amount = Number.parseFloat(expense.amount);
            return Number.isFinite(amount) ? sum + amount : sum;
        }, 0);

        const spendByCategory = expenses.reduce((accumulator, expense) => {
            const amount = Number.parseFloat(expense.amount);
            if (!Number.isFinite(amount) || amount <= 0) return accumulator;
            const category = normalizeExpenseCategory(expense.category);
            return {
                ...accumulator,
                [category]: Number(accumulator[category] || 0) + amount
            };
        }, {
            showcase: 0,
            camp: 0,
            travel: 0,
            equipment: 0,
            training: 0,
            other: 0
        });

        const monthsCovered = getMonthsCovered(expenses);
        const annualizedByCategory = Object.entries(spendByCategory).reduce((accumulator, [category, amount]) => ({
            ...accumulator,
            [category]: Number(((Number(amount) / monthsCovered) * 12).toFixed(2))
        }), {});

        const currentYear = new Date().getFullYear();
        const gradYear = Number(athleteRow.grad_year || athleteRow.graduation_year || currentYear + 1);
        const yearsUntilCommitment = Math.max(1, gradYear - currentYear);

        const projectedAnnualTotal = Object.values(annualizedByCategory)
            .reduce((sum, amount) => sum + Number(amount || 0), 0);
        const projectedTotal = Number((totalSpent + (projectedAnnualTotal * yearsUntilCommitment)).toFixed(2));

        const targetDivision = resolveDivision(athleteRow);
        const divisionBenchmark = BENCHMARKS_BY_DIVISION[targetDivision] || BENCHMARKS_BY_DIVISION.d3;
        const onTrack = projectedTotal >= divisionBenchmark.low && projectedTotal <= divisionBenchmark.high;
        const recommendation = buildRecommendation(projectedTotal, divisionBenchmark, targetDivision.toUpperCase());

        const computedProjection = {
            athlete_id: athleteId,
            total_spent_to_date: Number(totalSpent.toFixed(2)),
            projected_showcase_annual: Number(annualizedByCategory.showcase || 0),
            projected_camp_annual: Number(annualizedByCategory.camp || 0),
            projected_travel_annual: Number(annualizedByCategory.travel || 0),
            projected_equipment_annual: Number(annualizedByCategory.equipment || 0),
            projected_training_annual: Number(annualizedByCategory.training || 0),
            projected_other_annual: Number(annualizedByCategory.other || 0),
            total_projected_to_commitment: projectedTotal,
            years_until_commitment: yearsUntilCommitment,
            division_benchmark_low: divisionBenchmark.low,
            division_benchmark_high: divisionBenchmark.high,
            on_track: onTrack,
            recommendation
        };

        const storedProjectionResult = await supabase
            .from('financial_projections')
            .select('*')
            .eq('athlete_id', athleteId)
            .maybeSingle();

        if (storedProjectionResult.error && !isMissingTableError(storedProjectionResult.error)) {
            setError(storedProjectionResult.error.message || 'Unable to load previous projection.');
            setAthlete(athleteRow);
            setProjection(computedProjection);
            setLoading(false);
            return;
        }

        if (storedProjectionResult.error && isMissingTableError(storedProjectionResult.error)) {
            setError(getFeatureRebuildMessage('Financial projections'));
        }

        const storedProjection = storedProjectionResult.data || null;
        const mergedProjection = {
            ...computedProjection,
            ...storedProjection,
            athlete_id: athleteId,
            total_spent_to_date: computedProjection.total_spent_to_date,
            projected_showcase_annual: computedProjection.projected_showcase_annual,
            projected_camp_annual: computedProjection.projected_camp_annual,
            projected_travel_annual: computedProjection.projected_travel_annual,
            projected_equipment_annual: computedProjection.projected_equipment_annual,
            projected_training_annual: computedProjection.projected_training_annual,
            projected_other_annual: computedProjection.projected_other_annual,
            total_projected_to_commitment: computedProjection.total_projected_to_commitment,
            years_until_commitment: computedProjection.years_until_commitment,
            division_benchmark_low: computedProjection.division_benchmark_low,
            division_benchmark_high: computedProjection.division_benchmark_high,
            on_track: computedProjection.on_track,
            recommendation: computedProjection.recommendation
        };

        setAthlete(athleteRow);
        setProjection(mergedProjection);
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadProjection();
    }, [loadProjection]);

    const handleSkip = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;

        setError('');
        setIsSkipping(true);

        try {
            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'skipped'
            });
            navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
            } else {
                setError(skipError?.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || !projection || isCompleting || isSkipping) return;

        setError('');
        setIsCompleting(true);

        try {
            const { error: saveError } = await supabase
                .from('financial_projections')
                .upsert([projection], { onConflict: 'athlete_id' });

            if (saveError) throw saveError;

            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });
            navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
        } catch (completeError) {
            if (isMissingTableError(completeError)) {
                navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
            } else {
                setError(completeError?.message || 'Unable to save projection right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, projection, weekStartDate]);

    const markerPosition = calculatePosition(
        Number(projection?.total_projected_to_commitment || 0),
        Number(projection?.division_benchmark_low || 0),
        Number(projection?.division_benchmark_high || 0)
    );

    return (
        <DashboardLayout>
            <div className="w4-page">
                <div className="w4-top-row">
                    <Link to="/weekly-plan" className="w4-back-link">Back to Plan</Link>
                    <span className="w4-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w4-header`}>
                    <h1>Total Recruiting Cost Projection</h1>
                    <p>Estimate total recruiting investment from now until commitment.</p>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-spend-summary-grid">
                        <article className="w4-spend-summary-card">
                            <p className="w4-spend-summary-label">Spent So Far</p>
                            <p className="w4-spend-summary-value">{formatCurrency(projection?.total_spent_to_date)}</p>
                        </article>
                        <article className="w4-spend-summary-card">
                            <p className="w4-spend-summary-label">Annual Projection</p>
                            <p className="w4-spend-summary-value">{formatCurrency(annualTotal)}</p>
                        </article>
                    </div>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Projected Annual Spend by Category</h2>
                        <p>Built from your tracked expenses and current cadence.</p>
                    </div>
                    <div className="w4-projection-list">
                        {PROJECTION_CATEGORIES.map((category) => (
                            <ProjectionRow
                                key={category.key}
                                label={category.label}
                                amount={projection?.[`projected_${category.key}_annual`] || 0}
                            />
                        ))}
                    </div>
                    <p className="w4-budget-total">Annual total: {formatCurrency(annualTotal)}</p>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Total Projected Cost to Commitment</h2>
                        <p>
                            You are projected to spend <strong>{formatCurrency(projection?.total_projected_to_commitment)}</strong>
                            {' '}over the next {projection?.years_until_commitment || 1} year{projection?.years_until_commitment === 1 ? '' : 's'}.
                        </p>
                    </div>
                    <div className="w4-timeline-cost">
                        <span>Now</span>
                        <div className="w4-progress-track">
                            <div className="w4-progress-fill" style={{ width: '100%' }} />
                        </div>
                        <span>Commitment</span>
                    </div>
                </section>

                <section className={CARD_CLASS}>
                    <div className="w4-section-head">
                        <h2>Benchmark Comparison</h2>
                        <p>Typical {resolveDivision(athlete).toUpperCase()} families spend between {formatCurrency(projection?.division_benchmark_low)} and {formatCurrency(projection?.division_benchmark_high)}.</p>
                    </div>

                    <div className="w4-benchmark-shell" role="img" aria-label="Recruiting spend benchmark comparison">
                        <div className="w4-benchmark-range" />
                        <div className="w4-benchmark-marker" style={{ left: `${markerPosition}%` }}>
                            <span className="w4-benchmark-dot" />
                            <span className="w4-benchmark-label">You</span>
                        </div>
                    </div>

                    <p className={`w4-benchmark-status ${projection?.on_track ? 'w4-benchmark-good' : 'w4-benchmark-warn'}`}>
                        {projection?.on_track ? 'You are on track with benchmark spend.' : projection?.recommendation}
                    </p>
                </section>

                <section className="w4-upgrade-gate" aria-label="Pro budget tools preview">
                    <div className="w4-gate-lock" aria-hidden="true">🔒</div>
                    <h3>Unlock Budget Optimization in Pro</h3>
                    <p>Week 5+ includes financial automation to keep your recruiting spend efficient.</p>
                    <ul>
                        <li>Monthly budget variance alerts</li>
                        <li>Showcase ROI scoring and event ranking</li>
                        <li>Cost-per-coach-contact tracking</li>
                        <li>Scholarship offer comparison tools</li>
                    </ul>
                    <Button type="button" className="w4-upgrade-button" onClick={() => navigate('/upgrade')}>
                        Upgrade to Pro - $25/mo
                    </Button>
                </section>

                {error && <div className="w4-error">{error}</div>}

                <div className="w4-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="w4-skip-button"
                        onClick={handleSkip}
                        disabled={loading || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="w4-primary-button"
                        onClick={handleComplete}
                        disabled={loading || isCompleting || isSkipping || !athleteId || !projection}
                    >
                        {isCompleting ? 'Saving...' : 'Save Projection & Mark Complete'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
