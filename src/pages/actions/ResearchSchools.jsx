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
    setWeeklyActionStatus
} from '../../lib/actionRouting';

const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];

const SAMPLE_SCHOOLS = [
    { id: 'd1-1', name: 'Stanford University', location: 'California', division: 'D1', conference: 'ACC' },
    { id: 'd1-2', name: 'Duke University', location: 'North Carolina', division: 'D1', conference: 'ACC' },
    { id: 'd1-3', name: 'University of Michigan', location: 'Michigan', division: 'D1', conference: 'Big Ten' },
    { id: 'd1-4', name: 'UCLA', location: 'California', division: 'D1', conference: 'Big Ten' },
    { id: 'd2-1', name: 'Grand Valley State University', location: 'Michigan', division: 'D2', conference: 'GLIAC' },
    { id: 'd2-2', name: 'University of Tampa', location: 'Florida', division: 'D2', conference: 'SSC' },
    { id: 'd2-3', name: 'Bentley University', location: 'Massachusetts', division: 'D2', conference: 'NE10' },
    { id: 'd2-4', name: 'Colorado School of Mines', location: 'Colorado', division: 'D2', conference: 'RMAC' },
    { id: 'd3-1', name: 'Amherst College', location: 'Massachusetts', division: 'D3', conference: 'NESCAC' },
    { id: 'd3-2', name: 'Williams College', location: 'Massachusetts', division: 'D3', conference: 'NESCAC' },
    { id: 'd3-3', name: 'Johns Hopkins University', location: 'Maryland', division: 'D3', conference: 'Centennial' },
    { id: 'naia-1', name: 'Lindsey Wilson College', location: 'Kentucky', division: 'NAIA', conference: 'Mid-South' },
    { id: 'naia-2', name: 'University of the Cumberlands', location: 'Kentucky', division: 'NAIA', conference: 'Mid-South' },
    { id: 'naia-3', name: 'Indiana Wesleyan University', location: 'Indiana', division: 'NAIA', conference: 'Crossroads' },
    { id: 'juco-1', name: 'Iowa Western Community College', location: 'Iowa', division: 'JUCO', conference: 'NJCAA' },
    { id: 'juco-2', name: 'Eastern Florida State College', location: 'Florida', division: 'JUCO', conference: 'NJCAA' },
    { id: 'juco-3', name: 'Salt Lake Community College', location: 'Utah', division: 'JUCO', conference: 'NJCAA' }
];

const CARD_CLASS = 'rounded-[12px] border-2 border-[#E5E7EB] bg-white p-6 md:p-8';

function resolvePreferredDivision(profile, selectedDivisions) {
    if (Array.isArray(selectedDivisions) && selectedDivisions.length > 0) {
        return selectedDivisions[0];
    }

    const profileDivision = profile?.target_divisions?.[0];
    if (typeof profileDivision === 'string' && profileDivision.trim()) {
        return profileDivision.trim().toUpperCase();
    }

    return 'D3';
}

export default function ResearchSchools() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, activeAthlete, isImpersonating } = useProfile();

    const actionNumber = resolveActionNumberFromSearch(searchParams, 2);
    const actionItemId = resolveItemIdFromSearch(searchParams);
    const weekStartDate = resolveWeekStartFromSearch(searchParams);

    const targetAthleteId = useMemo(() => (
        isImpersonating ? activeAthlete?.id || null : profile?.id || null
    ), [activeAthlete?.id, isImpersonating, profile?.id]);

    const [selectedDivisions, setSelectedDivisions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const filteredSchools = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return SAMPLE_SCHOOLS.filter((school) => {
            if (selectedDivisions.length > 0 && !selectedDivisions.includes(school.division)) {
                return false;
            }

            if (!normalizedQuery) return true;
            return (
                school.name.toLowerCase().includes(normalizedQuery)
                || school.location.toLowerCase().includes(normalizedQuery)
                || school.conference.toLowerCase().includes(normalizedQuery)
            );
        }).filter((school) => !selectedSchools.some((selected) => selected.id === school.id));
    }, [searchQuery, selectedDivisions, selectedSchools]);

    const customSchoolOption = useMemo(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return null;
        if (selectedSchools.length >= 3) return null;

        const normalized = trimmed.toLowerCase();
        const existsInSample = SAMPLE_SCHOOLS.some((school) => school.name.toLowerCase() === normalized);
        const existsInSelection = selectedSchools.some((school) => school.name.toLowerCase() === normalized);
        if (existsInSample || existsInSelection) return null;

        return {
            id: `custom-${normalized.replace(/[^a-z0-9]+/g, '-')}`,
            name: trimmed,
            location: 'Custom',
            division: resolvePreferredDivision(profile, selectedDivisions),
            conference: 'TBD'
        };
    }, [profile, searchQuery, selectedDivisions, selectedSchools]);

    const handleToggleDivision = (division) => {
        setSelectedDivisions((previous) => (
            previous.includes(division)
                ? previous.filter((value) => value !== division)
                : [...previous, division]
        ));
    };

    const handleAddSchool = (school) => {
        if (selectedSchools.length >= 3) return;
        if (selectedSchools.some((selected) => selected.id === school.id)) return;
        setSelectedSchools((previous) => [...previous, school]);
        setError('');
    };

    const handleRemoveSchool = (schoolId) => {
        setSelectedSchools((previous) => previous.filter((school) => school.id !== schoolId));
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
            navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
        } catch (skipError) {
            if (isMissingTableError(skipError)) {
                navigate(`/weekly-plan?action=${actionNumber}&skipped=true`);
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

        if (selectedSchools.length === 0) {
            setError('Select at least one school before saving.');
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const rows = selectedSchools.map((school) => ({
                athlete_id: targetAthleteId,
                school_name: school.name,
                school_location: school.location || null,
                category: 'target',
                conference: school.conference,
                division: school.division
            }));

            const { error: insertError } = await supabase
                .from('athlete_saved_schools')
                .upsert(rows, { onConflict: 'athlete_id,school_name' });

            if (insertError) throw insertError;

            await setWeeklyActionStatus({
                athleteId: targetAthleteId,
                itemId: actionItemId,
                actionNumber,
                weekStartDate,
                status: 'done'
            });

            navigate(`/weekly-plan?action=${actionNumber}&completed=true`);
        } catch (saveError) {
            if (isMissingTableError(saveError)) {
                setError(getFeatureRebuildMessage('School list updates'));
            } else {
                setError(saveError?.message || 'Unable to save selected schools right now.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center justify-between">
                    <Link to="/weekly-plan" className="text-sm font-semibold text-[#6C2EB9] hover:underline">
                        Back to Plan
                    </Link>
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6C2EB9]">
                        Action {actionNumber} of 3
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={`${CARD_CLASS} space-y-6 bg-[#F9FAFB]`}>
                    <header className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Research Target Schools</h1>
                        <p className="text-sm text-gray-600">
                            Filter and search a starter list, then add up to 3 schools to your recruiting list.
                        </p>
                    </header>

                    <section className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {DIVISIONS.map((division) => {
                                const checked = selectedDivisions.includes(division);
                                return (
                                    <label
                                        key={division}
                                        className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-xs font-semibold ${checked ? 'border-[#6C2EB9] bg-[#F3ECFF] text-[#6C2EB9]' : 'border-[#E5E7EB] bg-white text-gray-700'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleToggleDivision(division)}
                                            className="h-4 w-4 accent-[#6C2EB9]"
                                            aria-label={`Filter ${division}`}
                                        />
                                        {division}
                                    </label>
                                );
                            })}
                        </div>

                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Search schools</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search by school, location, or conference"
                                className="w-full rounded-[12px] border-2 border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6C2EB9]"
                                aria-label="Search schools"
                            />
                        </label>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900">Search Results</h2>
                            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                {customSchoolOption && (
                                    <div className="rounded-[12px] border-2 border-dashed border-[#D8B4FE] bg-white p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{customSchoolOption.name}</p>
                                                <p className="text-xs text-gray-600">Custom entry</p>
                                                <p className="mt-1 text-[11px] font-semibold uppercase text-[#6C2EB9]">
                                                    {customSchoolOption.division}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8 rounded-[10px] bg-[#6C2EB9] px-3 text-xs font-semibold text-white hover:bg-[#5B25A0]"
                                                disabled={selectedSchools.length >= 3}
                                                onClick={() => handleAddSchool(customSchoolOption)}
                                                aria-label={`Add custom school ${customSchoolOption.name}`}
                                            >
                                                Add Custom
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {filteredSchools.map((school) => (
                                    <div key={school.id} className="rounded-[12px] border-2 border-[#E5E7EB] bg-white p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                                                <p className="text-xs text-gray-600">{school.location} • {school.conference}</p>
                                                <p className="mt-1 text-[11px] font-semibold uppercase text-[#6C2EB9]">{school.division}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8 rounded-[10px] bg-[#6C2EB9] px-3 text-xs font-semibold text-white hover:bg-[#5B25A0]"
                                                disabled={selectedSchools.length >= 3}
                                                onClick={() => handleAddSchool(school)}
                                                aria-label={`Add ${school.name}`}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {filteredSchools.length === 0 && !customSchoolOption && (
                                    <div className="rounded-[12px] border-2 border-dashed border-[#D1D5DB] bg-white p-4 text-sm text-gray-500">
                                        No schools match this search.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Selected Schools ({selectedSchools.length}/3)
                            </h2>
                            <div className="space-y-2">
                                {selectedSchools.map((school) => (
                                    <div key={school.id} className="rounded-[12px] border-2 border-[#D8B4FE] bg-white p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                                                <p className="text-xs text-gray-600">{school.location} • {school.conference}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-[10px] border-2 border-[#E5E7EB] px-3 text-xs font-semibold text-gray-700"
                                                onClick={() => handleRemoveSchool(school.id)}
                                                aria-label={`Remove ${school.name}`}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {selectedSchools.length === 0 && (
                                    <div className="rounded-[12px] border-2 border-dashed border-[#D1D5DB] bg-white p-4 text-sm text-gray-500">
                                        Add at least one school to complete this action.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

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
