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
    resolveWeekNumberFromSearch,
    resolveWeeklyPlanHref,
    setWeeklyActionStatus
} from '../../lib/actionRouting';

const CARD_CLASS = 'rounded-[12px] border-2 border-[#E5E7EB] bg-white p-6 md:p-8';

const CATEGORY_OPTIONS = [
    'Showcase',
    'Camp',
    'Travel',
    'Equipment',
    'Training',
    'Other'
];

function createExpenseDraft() {
    return {
        id: typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        category: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        notes: ''
    };
}

export default function LogExpenses() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 3);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 1);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const [expenses, setExpenses] = useState([createExpenseDraft()]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const totalAmount = useMemo(() => (
        expenses.reduce((total, item) => total + (Number.parseFloat(item.amount) || 0), 0)
    ), [expenses]);

    const updateExpense = (expenseId, field, value) => {
        setExpenses((previous) => previous.map((item) => (
            item.id === expenseId ? { ...item, [field]: value } : item
        )));
    };

    const addExpense = () => {
        setExpenses((previous) => [...previous, createExpenseDraft()]);
    };

    const removeExpense = (expenseId) => {
        setExpenses((previous) => {
            const next = previous.filter((item) => item.id !== expenseId);
            return next.length > 0 ? next : [createExpenseDraft()];
        });
    };

    const validExpenses = useMemo(() => (
        expenses
            .map((expense) => ({
                ...expense,
                parsedAmount: Number.parseFloat(expense.amount)
            }))
            .filter((expense) => (
                expense.category
                && Number.isFinite(expense.parsedAmount)
                && expense.parsedAmount > 0
                && expense.date
            ))
    ), [expenses]);

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
            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, skipped: true }));
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

        if (validExpenses.length === 0) {
            setError('Add at least one valid expense before saving.');
            return;
        }

        setError('');
        setIsSaving(true);
        try {
            const rows = validExpenses.map((expense) => ({
                athlete_id: targetAthleteId,
                category: expense.category,
                amount: expense.parsedAmount,
                date: expense.date,
                notes: expense.notes.trim() || null
            }));

            const { error: insertError } = await supabase
                .from('expenses')
                .insert(rows);

            if (insertError) throw insertError;

            await setWeeklyActionStatus({
                athleteId: targetAthleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });

            navigate(resolveWeeklyPlanHref({ actionNumber, weekNumber, completed: true }));
        } catch (saveError) {
            if (isMissingTableError(saveError)) {
                setError(getFeatureRebuildMessage('Expense logging'));
            } else {
                setError(saveError?.message || 'Unable to save expenses right now.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center justify-between">
                    <Link to={weeklyPlanHref} className="text-sm font-semibold text-[#6C2EB9] hover:underline">
                        Back to Plan
                    </Link>
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6C2EB9]">
                        Action {actionNumber} of 3
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={`${CARD_CLASS} space-y-6 bg-[#F9FAFB]`}>
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Log Recruiting Expenses</h1>
                        <p className="text-sm text-gray-600">
                            Track spend for showcases, camps, travel, and training in one place.
                        </p>
                    </header>

                    <section className="rounded-[12px] border-2 border-[#D8B4FE] bg-white px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6C2EB9]">Running Total</p>
                        <p className="mt-1 text-4xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                    </section>

                    <section className="space-y-3">
                        {expenses.map((expense, index) => (
                            <div key={expense.id} className="rounded-[12px] border-2 border-[#E5E7EB] bg-white p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">Expense {index + 1}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-[10px] border-2 border-[#E5E7EB] px-3 text-xs font-semibold text-gray-700"
                                        onClick={() => removeExpense(expense.id)}
                                        aria-label={`Remove expense ${index + 1}`}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="space-y-1">
                                        <span className="text-xs font-semibold uppercase text-gray-500">Category</span>
                                        <select
                                            value={expense.category}
                                            onChange={(event) => updateExpense(expense.id, 'category', event.target.value)}
                                            className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                            aria-label={`Expense ${index + 1} category`}
                                        >
                                            <option value="">Select category</option>
                                            {CATEGORY_OPTIONS.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-1">
                                        <span className="text-xs font-semibold uppercase text-gray-500">Amount</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={expense.amount}
                                            onChange={(event) => updateExpense(expense.id, 'amount', event.target.value)}
                                            placeholder="0.00"
                                            className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                            aria-label={`Expense ${index + 1} amount`}
                                        />
                                    </label>

                                    <label className="space-y-1">
                                        <span className="text-xs font-semibold uppercase text-gray-500">Date</span>
                                        <input
                                            type="date"
                                            value={expense.date}
                                            onChange={(event) => updateExpense(expense.id, 'date', event.target.value)}
                                            className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                            aria-label={`Expense ${index + 1} date`}
                                        />
                                    </label>

                                    <label className="space-y-1 md:col-span-2">
                                        <span className="text-xs font-semibold uppercase text-gray-500">Notes</span>
                                        <textarea
                                            rows={3}
                                            value={expense.notes}
                                            onChange={(event) => updateExpense(expense.id, 'notes', event.target.value)}
                                            placeholder="Optional note about this expense."
                                            className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                            aria-label={`Expense ${index + 1} notes`}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </section>

                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-[12px] border-2 border-[#D8B4FE] bg-white px-5 text-sm font-semibold text-[#6C2EB9]"
                            onClick={addExpense}
                        >
                            Add Another Expense
                        </Button>
                    </div>

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
