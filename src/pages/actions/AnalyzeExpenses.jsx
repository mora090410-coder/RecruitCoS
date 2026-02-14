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
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';
import './week3-actions.css';

const CARD_CLASS = 'w3-card';
const ANALYSIS_WINDOW_DAYS = 60;
const ROI_CATEGORIES = ['showcase', 'camp', 'travel', 'equipment', 'training'];
const CATEGORY_LABELS = {
    showcase: 'Showcase',
    camp: 'Camp',
    travel: 'Travel',
    equipment: 'Equipment',
    training: 'Training'
};

function normalizeExpenseCategory(categoryValue) {
    const normalized = String(categoryValue || '').trim().toLowerCase();
    if (normalized.includes('showcase')) return 'showcase';
    if (normalized.includes('camp')) return 'camp';
    if (normalized.includes('travel')) return 'travel';
    if (normalized.includes('equip')) return 'equipment';
    if (normalized.includes('train')) return 'training';
    return 'other';
}

function parseRowDate(row) {
    return row.date || row.expense_date || row.created_at || null;
}

function isWithinDays(dateText, days) {
    if (!dateText) return false;
    const candidate = new Date(dateText);
    if (Number.isNaN(candidate.getTime())) return false;
    const now = new Date();
    const lowerBound = new Date(now);
    lowerBound.setDate(now.getDate() - days);
    return candidate >= lowerBound && candidate <= now;
}

function toMonthStartIso(dateValue = new Date()) {
    const monthStart = new Date(dateValue.getFullYear(), dateValue.getMonth(), 1);
    return monthStart.toISOString().slice(0, 10);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount || 0));
}

function buildRecommendation({ total, byCategory, contactsByCategory, topCategory, worstCategory }) {
    const showcaseSpend = Number(byCategory.showcase || 0);
    const showcaseContacts = Number(contactsByCategory.showcase || 0);

    if (total <= 0) {
        return 'Start tracking your recruiting expenses this week so we can generate ROI coaching for your family.';
    }
    if (showcaseSpend > 0 && showcaseContacts === 0) {
        return `You spent ${formatCurrency(showcaseSpend)} on showcases but logged 0 coach contacts. Consider shifting budget to camps where direct interaction is more likely.`;
    }
    if (worstCategory && topCategory && worstCategory !== topCategory) {
        return `${CATEGORY_LABELS[topCategory]} has your best ROI while ${CATEGORY_LABELS[worstCategory]} is underperforming. Shift part of next month's budget toward ${CATEGORY_LABELS[topCategory]}.`;
    }
    if (topCategory) {
        return `${CATEGORY_LABELS[topCategory]} currently drives your strongest ROI. Keep investing there and track weekly coach responses.`;
    }
    return 'Track coach interactions consistently to unlock stronger ROI recommendations.';
}

function CategoryBar({ category, amount, total, contacts }) {
    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
    return (
        <article className="w3-category-bar">
            <div className="w3-category-bar-header">
                <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[category]}</span>
                <span className="text-sm font-medium text-gray-700">{formatCurrency(amount)}</span>
            </div>
            <div className="w3-category-bar-track">
                <div className="w3-category-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-600">
                {contacts} coach contact{contacts === 1 ? '' : 's'} attributed
            </p>
        </article>
    );
}

export default function AnalyzeExpenses() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 3);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const athleteId = useMemo(
        () => (isImpersonating ? activeAthlete?.id || null : profile?.id || null),
        [activeAthlete?.id, isImpersonating, profile?.id]
    );

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const loadAnalysis = useCallback(async () => {
        if (!athleteId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const [expensesResult, contactsResult, schoolsResult] = await Promise.all([
            supabase
                .from('expenses')
                .select('id, category, amount, date, expense_date, created_at')
                .eq('athlete_id', athleteId),
            supabase
                .from('coach_interactions')
                .select('id, school_id, contact_method, interaction_date')
                .eq('athlete_id', athleteId),
            supabase
                .from('athlete_saved_schools')
                .select('id', { count: 'exact', head: true })
                .eq('athlete_id', athleteId)
        ]);

        if (expensesResult.error) {
            if (isMissingTableError(expensesResult.error)) {
                setError(getFeatureRebuildMessage('Expense tracking'));
            } else {
                setError(expensesResult.error.message || 'Unable to load expenses.');
            }
            setLoading(false);
            return;
        }
        if (contactsResult.error) {
            if (isMissingTableError(contactsResult.error)) {
                setError(getFeatureRebuildMessage('Coach interaction data'));
            } else {
                setError(contactsResult.error.message || 'Unable to load coach interactions.');
            }
            setLoading(false);
            return;
        }

        const expenseRows = (expensesResult.data || []).filter((row) => (
            isWithinDays(parseRowDate(row), ANALYSIS_WINDOW_DAYS)
        ));
        const contactRows = (contactsResult.data || []).filter((row) => (
            isWithinDays(row.interaction_date, ANALYSIS_WINDOW_DAYS)
        ));

        const byCategory = {
            showcase: 0,
            camp: 0,
            travel: 0,
            equipment: 0,
            training: 0
        };

        expenseRows.forEach((row) => {
            const amount = Number.parseFloat(row.amount);
            if (!Number.isFinite(amount) || amount <= 0) return;
            const normalizedCategory = normalizeExpenseCategory(row.category);
            if (!Object.prototype.hasOwnProperty.call(byCategory, normalizedCategory)) return;
            byCategory[normalizedCategory] += amount;
        });

        const contactsByCategory = {
            showcase: 0,
            camp: 0,
            travel: 0,
            equipment: 0,
            training: 0
        };
        contactRows.forEach((row) => {
            const method = String(row.contact_method || '').toLowerCase();
            if (method === 'showcase') contactsByCategory.showcase += 1;
            if (method === 'camp') contactsByCategory.camp += 1;
            if (method === 'in_person') contactsByCategory.travel += 1;
        });

        const totalSpent = Object.values(byCategory).reduce((sum, amount) => sum + amount, 0);
        const totalContacts = contactRows.length;

        const roiByCategory = ROI_CATEGORIES.reduce((accumulator, category) => {
            const spend = Number(byCategory[category] || 0);
            const contacts = Number(contactsByCategory[category] || 0);
            const score = spend > 0 ? contacts / spend : 0;
            return {
                ...accumulator,
                [category]: score
            };
        }, {});

        const categoriesWithSpend = ROI_CATEGORIES.filter((category) => byCategory[category] > 0);
        let topCategory = null;
        let worstCategory = null;
        if (categoriesWithSpend.length > 0) {
            topCategory = categoriesWithSpend.reduce((best, category) => (
                roiByCategory[category] > roiByCategory[best] ? category : best
            ), categoriesWithSpend[0]);
            worstCategory = categoriesWithSpend.reduce((worst, category) => (
                roiByCategory[category] < roiByCategory[worst] ? category : worst
            ), categoriesWithSpend[0]);
        }

        const contactsPerHundredDollars = totalContacts / Math.max(totalSpent / 100, 1);
        const estimatedRoiScore = Math.max(0, Math.min(100, Math.round(contactsPerHundredDollars * 22)));
        const recommendation = buildRecommendation({
            total: totalSpent,
            byCategory,
            contactsByCategory,
            topCategory,
            worstCategory
        });

        const analysisData = {
            athlete_id: athleteId,
            analysis_month: toMonthStartIso(new Date()),
            total_spent: Number(totalSpent.toFixed(2)),
            showcase_spend: Number((byCategory.showcase || 0).toFixed(2)),
            camp_spend: Number((byCategory.camp || 0).toFixed(2)),
            travel_spend: Number((byCategory.travel || 0).toFixed(2)),
            equipment_spend: Number((byCategory.equipment || 0).toFixed(2)),
            training_spend: Number((byCategory.training || 0).toFixed(2)),
            coach_contacts_gained: totalContacts,
            schools_interested: schoolsResult.count || 0,
            estimated_roi_score: estimatedRoiScore,
            top_roi_category: topCategory,
            recommendation
        };

        const { error: persistError } = await supabase
            .from('expense_roi_analysis')
            .upsert([analysisData], { onConflict: 'athlete_id,analysis_month' });

        if (persistError && isMissingTableError(persistError)) {
            setError(getFeatureRebuildMessage('Expense ROI analysis'));
        } else if (persistError) {
            setError(persistError.message || 'Unable to save ROI analysis right now.');
        }

        setAnalysis({
            ...analysisData,
            contacts_by_category: contactsByCategory,
            roi_by_category: roiByCategory,
            worst_roi_category: worstCategory
        });
        setLoading(false);
    }, [athleteId]);

    useEffect(() => {
        loadAnalysis();
    }, [loadAnalysis]);

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
            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
            } else {
                setError(skipError?.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    }, [actionItemId, actionNumber, athleteId, isCompleting, isSkipping, navigate, weekNumber, weekStartDate]);

    const handleComplete = useCallback(async () => {
        if (!athleteId || isCompleting || isSkipping) return;
        if (!analysis) {
            setError('Generate an analysis before completing this action.');
            return;
        }

        setError('');
        setIsCompleting(true);
        try {
            await setWeeklyActionStatus({
                athleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });
            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
        } catch (completeError) {
            if (isMissingTableError(completeError)) {
                navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
            } else {
                setError(completeError?.message || 'Unable to complete this action right now.');
            }
        } finally {
            setIsCompleting(false);
        }
    }, [actionItemId, actionNumber, analysis, athleteId, isCompleting, isSkipping, navigate, weekNumber, weekStartDate]);

    return (
        <DashboardLayout>
            <div className="w3-page">
                <div className="w3-top-row">
                    <Link to={weeklyPlanHref} className="w3-back-link">Back to Plan</Link>
                    <span className="w3-action-pill">Action {actionNumber} of 3</span>
                </div>

                <section className={`${CARD_CLASS} w3-header`}>
                    <h1>Recruiting Spend ROI Analysis</h1>
                    <p>See where your dollars are working and where your recruiting strategy should pivot.</p>
                </section>

                {loading ? (
                    <section className={CARD_CLASS}>
                        <p className="w3-empty">Building your ROI analysis from the last {ANALYSIS_WINDOW_DAYS} days...</p>
                    </section>
                ) : (
                    <>
                        <section className="w3-card-soft">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#8B2635]">Total Recruiting Spend</p>
                            <p className="mt-1 text-4xl font-bold text-gray-900">{formatCurrency(analysis?.total_spent || 0)}</p>
                            <p className="mt-1 text-sm text-gray-600">Last {ANALYSIS_WINDOW_DAYS} days</p>
                        </section>

                        <section className={CARD_CLASS}>
                            <h2 className="text-xl font-semibold text-gray-900">Spending by Category</h2>
                            <div className="mt-4 grid gap-3">
                                {ROI_CATEGORIES.map((category) => (
                                    <CategoryBar
                                        key={category}
                                        category={category}
                                        amount={analysis?.[`${category}_spend`] || 0}
                                        total={analysis?.total_spent || 0}
                                        contacts={analysis?.contacts_by_category?.[category] || 0}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className={CARD_CLASS}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">ROI Insight</h2>
                                    <p className="mt-2 text-sm text-gray-700">{analysis?.recommendation}</p>
                                </div>
                                <div className="rounded-xl border border-[#2C2C2C1A] bg-[#F5F1E8] px-4 py-3 text-center">
                                    <p className="text-xs font-semibold uppercase text-[#8B2635]">ROI Score</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{analysis?.estimated_roi_score ?? 0}/100</p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-[#2C2C2C1A] bg-white p-3">
                                    <p className="text-xs font-semibold uppercase text-gray-500">Coach Contacts</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{analysis?.coach_contacts_gained || 0}</p>
                                </div>
                                <div className="rounded-xl border border-[#2C2C2C1A] bg-white p-3">
                                    <p className="text-xs font-semibold uppercase text-gray-500">Schools Tracked</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{analysis?.schools_interested || 0}</p>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                <section className="w3-upgrade-teaser">
                    <h3 className="text-lg font-semibold text-gray-900">Unlock Advanced ROI Tracking</h3>
                    <ul>
                        <li>Cost-per-contact benchmarking by division and geography</li>
                        <li>Showcase and camp attendance intelligence</li>
                        <li>12-month recruiting spend forecasts</li>
                        <li>AI playbooks to reallocate budget efficiently</li>
                    </ul>
                    <div className="mt-3">
                        <Button
                            type="button"
                            className="h-10 rounded-[10px] bg-[#8B2635] px-4 text-sm font-semibold text-white hover:bg-[#7D2230]"
                            onClick={() => navigate('/pricing')}
                        >
                            Upgrade to Pro - $25/mo
                        </Button>
                    </div>
                </section>

                {error && <div className="w3-error">{error}</div>}

                <div className="w3-actions">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-[12px] border-2 border-[#2C2C2C1A] bg-white px-5 text-sm font-semibold text-gray-700"
                        onClick={handleSkip}
                        disabled={loading || isCompleting || isSkipping}
                    >
                        {isSkipping ? 'Skipping...' : 'Skip This'}
                    </Button>
                    <Button
                        type="button"
                        className="h-11 rounded-[12px] bg-[#8B2635] px-5 text-sm font-semibold text-white hover:bg-[#7D2230]"
                        onClick={handleComplete}
                        disabled={loading || isCompleting || isSkipping || !athleteId}
                    >
                        {isCompleting ? 'Saving...' : 'Save & Mark Complete'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
