import { useEffect, useMemo, useState } from 'react';
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

const CONTACT_METHOD_OPTIONS = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'in_person', label: 'In Person' },
    { value: 'showcase', label: 'At Showcase' },
    { value: 'camp', label: 'At Camp' }
];

const COACH_TITLE_OPTIONS = ['Head Coach', 'Assistant Coach', 'Recruiting Coordinator'];

function createInitialInteraction() {
    return {
        school_id: '',
        coach_name: '',
        coach_title: 'Head Coach',
        contact_method: 'email',
        initiated_by: 'athlete',
        interaction_date: new Date().toISOString().slice(0, 10),
        notes: '',
        needs_followup: false,
        followup_date: ''
    };
}

export default function CoachInteraction() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);
    const weekNumber = resolveWeekNumberFromSearch(searchParams, 2);
    const weeklyPlanHref = resolveWeeklyPlanHref({ actionNumber, weekNumber });

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const [savedSchools, setSavedSchools] = useState([]);
    const [interaction, setInteraction] = useState(createInitialInteraction());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadSchools() {
            if (!targetAthleteId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            const { data, error: schoolsError } = await supabase
                .from('athlete_saved_schools')
                .select('id, school_name, division')
                .eq('athlete_id', targetAthleteId)
                .order('school_name', { ascending: true });

            if (!active) return;

            if (schoolsError) {
                if (isMissingTableError(schoolsError)) {
                    setError(getFeatureRebuildMessage('Saved schools'));
                } else {
                    setError(schoolsError.message || 'Unable to load saved schools.');
                }
                setSavedSchools([]);
                setLoading(false);
                return;
            }

            setSavedSchools(data || []);
            setLoading(false);
        }

        loadSchools();

        return () => {
            active = false;
        };
    }, [targetAthleteId]);

    const updateInteraction = (field, value) => {
        setInteraction((previous) => ({ ...previous, [field]: value }));
    };

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
            } else {
                setError(skipError?.message || 'Unable to skip this action right now.');
            }
        } finally {
            setIsSkipping(false);
        }
    };

    const validateForm = () => {
        if (!interaction.school_id) {
            return 'Select a school from your list.';
        }
        if (!interaction.contact_method) {
            return 'Select a contact method.';
        }
        if (!interaction.initiated_by) {
            return 'Select who initiated the interaction.';
        }
        if (!interaction.interaction_date) {
            return 'Choose the interaction date.';
        }
        if (interaction.needs_followup && !interaction.followup_date) {
            return 'Choose a follow-up date or disable follow-up reminder.';
        }
        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!targetAthleteId || isSaving || isSkipping) return;

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const payload = {
                athlete_id: targetAthleteId,
                school_id: interaction.school_id,
                coach_name: interaction.coach_name.trim() || null,
                coach_title: interaction.coach_title,
                contact_method: interaction.contact_method,
                interaction_date: interaction.interaction_date,
                initiated_by: interaction.initiated_by,
                notes: interaction.notes.trim() || null,
                needs_followup: interaction.needs_followup,
                followup_date: interaction.needs_followup ? interaction.followup_date : null
            };

            const { error: insertError } = await supabase
                .from('coach_interactions')
                .insert([payload]);

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
                setError(getFeatureRebuildMessage('Coach interaction tracking'));
            } else {
                setError(saveError?.message || 'Unable to save this interaction right now.');
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
                        <h1 className="text-2xl font-semibold text-gray-900">Log Coach Interaction</h1>
                        <p className="text-sm text-gray-600">
                            Track coach conversations early so your family can follow up consistently.
                        </p>
                    </header>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 md:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Which school?</span>
                            <select
                                value={interaction.school_id}
                                onChange={(event) => updateInteraction('school_id', event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                disabled={loading || isSaving}
                                aria-label="Which school did this interaction involve"
                            >
                                <option value="">Select a school from your list</option>
                                {savedSchools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.school_name}{school.division ? ` (${String(school.division).toUpperCase()})` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach Name</span>
                            <input
                                type="text"
                                value={interaction.coach_name}
                                onChange={(event) => updateInteraction('coach_name', event.target.value)}
                                placeholder="Coach Smith"
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Coach name"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach Title</span>
                            <select
                                value={interaction.coach_title}
                                onChange={(event) => updateInteraction('coach_title', event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Coach title"
                            >
                                {COACH_TITLE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">How did you connect?</span>
                            <select
                                value={interaction.contact_method}
                                onChange={(event) => updateInteraction('contact_method', event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Contact method"
                            >
                                {CONTACT_METHOD_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Interaction Date</span>
                            <input
                                type="date"
                                value={interaction.interaction_date}
                                onChange={(event) => updateInteraction('interaction_date', event.target.value)}
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Interaction date"
                            />
                        </label>

                        <fieldset className="space-y-2 md:col-span-2">
                            <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Who reached out first?
                            </legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <label className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900">
                                    <input
                                        type="radio"
                                        name="initiated_by"
                                        value="athlete"
                                        checked={interaction.initiated_by === 'athlete'}
                                        onChange={(event) => updateInteraction('initiated_by', event.target.value)}
                                        className="h-4 w-4 border-gray-300 text-[#6C2EB9] focus:ring-[#6C2EB9]"
                                    />
                                    I contacted them
                                </label>
                                <label className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900">
                                    <input
                                        type="radio"
                                        name="initiated_by"
                                        value="coach"
                                        checked={interaction.initiated_by === 'coach'}
                                        onChange={(event) => updateInteraction('initiated_by', event.target.value)}
                                        className="h-4 w-4 border-gray-300 text-[#6C2EB9] focus:ring-[#6C2EB9]"
                                    />
                                    They contacted me
                                </label>
                            </div>
                        </fieldset>

                        <label className="space-y-1 md:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</span>
                            <textarea
                                rows={4}
                                value={interaction.notes}
                                onChange={(event) => updateInteraction('notes', event.target.value)}
                                placeholder="What did you discuss? What is the next step?"
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Coach interaction notes"
                            />
                        </label>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-gray-900">
                                <input
                                    type="checkbox"
                                    checked={interaction.needs_followup}
                                    onChange={(event) => updateInteraction('needs_followup', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#6C2EB9] focus:ring-[#6C2EB9]"
                                />
                                Set a follow-up reminder
                            </label>

                            {interaction.needs_followup && (
                                <label className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Follow-up Date</span>
                                    <input
                                        type="date"
                                        value={interaction.followup_date}
                                        onChange={(event) => updateInteraction('followup_date', event.target.value)}
                                        className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                        aria-label="Follow up date"
                                    />
                                </label>
                            )}
                        </div>
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
                            disabled={isSaving || isSkipping || loading}
                        >
                            {isSkipping ? 'Skipping...' : 'Skip This'}
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 rounded-[12px] bg-[#6C2EB9] px-5 text-sm font-semibold text-white hover:bg-[#5B25A0]"
                            disabled={isSaving || isSkipping || loading || !targetAthleteId || savedSchools.length === 0}
                        >
                            {isSaving ? 'Saving...' : 'Save & Mark Complete'}
                        </Button>
                    </div>

                    {!loading && savedSchools.length === 0 && (
                        <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Add schools in Action 2 before logging coach interactions.
                        </div>
                    )}
                </form>
            </div>
        </DashboardLayout>
    );
}
