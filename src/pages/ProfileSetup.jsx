import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Lock, Mail, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { Button } from '../components/ui/button'
import { SUPPORTED_SPORTS, getPositionOptionsForSport } from '../config/sportSchema'
import { fetchBenchmarks } from '../lib/recruitingData'
import { generateAndPersistWeeklyPlan } from '../services/weeklyPlanService'
import { mapCanonicalToGroup, mapPositionToCanonical, normalizeText } from '../lib/normalize'
import { toast } from 'sonner'
import { track } from '../lib/analytics'

const TOTAL_STEPS = 6

const MAX_GRAD_YEAR_OFFSET = 6

const PHASE_BY_YEARS_TO_GRAD = {
    foundation: '🏗️ Foundation Phase - Build skills, have fun',
    awareness: '🔍 Awareness Phase - Explore options',
    engagement: '📣 Engagement Phase - Active recruiting',
    commitment: '✅ Commitment Phase - Final decision'
}

const DIVISION_OPTIONS = [
    { id: 'D1', label: 'NCAA Division I', description: 'Highest level, full scholarships' },
    { id: 'D2', label: 'NCAA Division II', description: 'Competitive, partial scholarships' },
    { id: 'D3', label: 'NCAA Division III', description: 'Competitive, no athletic aid' },
    { id: 'NAIA', label: 'NAIA', description: 'Smaller schools, scholarships available' },
    { id: 'JUCO', label: 'Junior College (JUCO)', description: '2-year pathway to 4-year' }
]

const DISTANCE_MARKS = [0, 50, 100, 250, 500]

const GPA_OPTIONS = [
    { value: '3.8-4.0+', label: '3.8 - 4.0+ (Honors/AP level)' },
    { value: '3.5-3.7', label: '3.5 - 3.7 (Strong student)' },
    { value: '3.0-3.4', label: '3.0 - 3.4 (Good student)' },
    { value: '2.5-2.9', label: '2.5 - 2.9 (Solid student)' },
    { value: '<2.5', label: 'Below 2.5' },
    { value: 'n/a', label: 'Prefer not to say' }
]

const PHASE_TOOLTIP = 'Recruiting timelines and coach contact rules vary by phase'

function safeApiPath(path) {
    if (!path) return null
    return path.startsWith('/') ? path : `/${path}`
}

async function safeGetJson(path) {
    try {
        const normalized = safeApiPath(path)
        if (!normalized) return null
        const response = await fetch(normalized)
        if (!response.ok) return null
        return await response.json()
    } catch {
        return null
    }
}

function getGradYearOptions() {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: MAX_GRAD_YEAR_OFFSET + 1 }, (_, index) => {
        const year = currentYear + index
        return {
            value: String(year),
            label: `Class of ${year}`
        }
    })
}

function toDistancePreference(miles) {
    if (miles <= 100) return 'local'
    if (miles <= 250) return 'regional'
    return 'national'
}

function distanceLabel(miles) {
    if (miles >= 500) return '500+ miles'
    return `${miles} miles`
}

function resolvePhaseFromGradYear(gradYear) {
    const currentYear = new Date().getFullYear()
    const gradYearNumber = Number(gradYear)
    if (!Number.isFinite(gradYearNumber)) return PHASE_BY_YEARS_TO_GRAD.foundation

    const yearsUntilGrad = gradYearNumber - currentYear
    if (yearsUntilGrad <= 0) return PHASE_BY_YEARS_TO_GRAD.commitment
    if (yearsUntilGrad === 1) return PHASE_BY_YEARS_TO_GRAD.engagement
    if (yearsUntilGrad === 2) return PHASE_BY_YEARS_TO_GRAD.awareness
    return PHASE_BY_YEARS_TO_GRAD.foundation
}

function planSubtitleFromGradYear(gradYear) {
    const phase = resolvePhaseFromGradYear(gradYear)
    return `${phase.split(' - ')[0].replace(/^[^ ]+\s/, '')} - Week 1`
}

function buildPlanPreview({ gradYear, sport, positionLabel, divisions, distanceMiles }) {
    const sportText = sport || 'your sport'
    const positionText = positionLabel || 'your position'
    const divisionText = divisions.length > 0 ? divisions.join(', ') : 'your target levels'
    const geo = distanceMiles >= 500 ? 'any location' : `within ${distanceLabel(distanceMiles)}`

    return {
        title: "Here's your first week",
        subtitle: planSubtitleFromGradYear(gradYear),
        items: [
            {
                title: '⚡ Focus: Athletic Baseline',
                body: `Run 2 position-specific work sessions for ${sportText} and log one measurable for ${positionText.toLowerCase()}.`
            },
            {
                title: '🎯 Start: School Research',
                body: `Research 5 programs in ${divisionText} ${geo} and save your top matches.`
            },
            {
                title: '📹 Create: Skills Highlight',
                body: `Record a 30-second clip this week showing game-speed reps at ${positionText.toLowerCase()}.`
            }
        ]
    }
}

export default function ProfileSetup() {
    const { signUp, user } = useAuth()
    const { refreshProfile, isProfileLoading, isInitialized, hasProfile } = useProfile()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showLegalModal, setShowLegalModal] = useState(false)
    const [legalContentType, setLegalContentType] = useState('terms')
    const [showSecondaryPositions, setShowSecondaryPositions] = useState(false)

    const [positionOptions, setPositionOptions] = useState([])
    const [benchmarkCount, setBenchmarkCount] = useState(0)
    const [schoolsPrefetched, setSchoolsPrefetched] = useState(0)
    const [planPreview, setPlanPreview] = useState(null)

    const [backgroundStatus, setBackgroundStatus] = useState({
        positions: 'idle',
        benchmarks: 'idle',
        schools: 'idle',
        plan: 'idle'
    })

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gradYear: '',
        sport: '',
        positionCode: '',
        positionLabel: '',
        positionGroup: '',
        secondaryPositions: [],
        targetDivisions: [],
        locationCity: '',
        locationState: '',
        distanceIndex: DISTANCE_MARKS.length - 1,
        gpaRange: '',
        email: '',
        password: '',
        signupRole: 'parent',
        agreedToTerms: false
    })

    const onboardingStartRef = useRef(Date.now())

    const selectedDistance = DISTANCE_MARKS[formData.distanceIndex] || 500

    useEffect(() => {
        if (user?.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.email, agreedToTerms: true }))
        }
    }, [user, formData.email])

    useEffect(() => {
        track('onboarding_viewed', { step, route: '/profile-setup' })
    }, [step])

    useEffect(() => {
        let active = true

        async function prefetchPositions() {
            if (!formData.sport) {
                setPositionOptions([])
                setBackgroundStatus(prev => ({ ...prev, positions: 'idle' }))
                return
            }

            setBackgroundStatus(prev => ({ ...prev, positions: 'loading' }))
            const apiData = await safeGetJson(`/api/positions?sport=${encodeURIComponent(formData.sport)}`)
            const fallback = getPositionOptionsForSport(formData.sport)

            const normalized = Array.isArray(apiData)
                ? apiData.map((item, index) => {
                    if (typeof item === 'string') return { code: item, label: item, group: '' }
                    return {
                        code: item.code || item.value || item.id || `opt-${index}`,
                        label: item.label || item.name || item.code || `Position ${index + 1}`,
                        group: item.group || ''
                    }
                })
                : fallback

            if (!active) return
            setPositionOptions(normalized)
            setBackgroundStatus(prev => ({ ...prev, positions: 'ready' }))
        }

        prefetchPositions()
        return () => {
            active = false
        }
    }, [formData.sport])

    useEffect(() => {
        let active = true

        async function prefetchBenchmarks() {
            if (!formData.sport || !formData.positionLabel || !formData.positionGroup) {
                setBenchmarkCount(0)
                setBackgroundStatus(prev => ({ ...prev, benchmarks: 'idle' }))
                return
            }

            setBackgroundStatus(prev => ({ ...prev, benchmarks: 'loading' }))
            const apiData = await safeGetJson(`/api/benchmarks?sport=${encodeURIComponent(formData.sport)}&position=${encodeURIComponent(formData.positionLabel)}`)

            let benchmarkRows = Array.isArray(apiData) ? apiData : null
            if (!benchmarkRows) {
                benchmarkRows = await fetchBenchmarks(formData.sport, formData.positionGroup, formData.targetDivisions[0] || 'D2')
            }

            if (!active) return
            setBenchmarkCount(Array.isArray(benchmarkRows) ? benchmarkRows.length : 0)
            setBackgroundStatus(prev => ({ ...prev, benchmarks: 'ready' }))
        }

        prefetchBenchmarks()
        return () => {
            active = false
        }
    }, [formData.sport, formData.positionLabel, formData.positionGroup, formData.targetDivisions])

    useEffect(() => {
        let active = true

        async function prefetchSchoolsAndPlan() {
            const ready = formData.targetDivisions.length > 0 && formData.sport && formData.positionLabel
            if (!ready) {
                setPlanPreview(null)
                setBackgroundStatus(prev => ({ ...prev, schools: 'idle', plan: 'idle' }))
                return
            }

            setBackgroundStatus(prev => ({ ...prev, schools: 'loading', plan: 'loading' }))

            const divisions = formData.targetDivisions.join(',')
            const apiData = await safeGetJson(`/v1/schools?divisions=${encodeURIComponent(divisions)}&limit=1`)

            let schoolCount = 0
            if (apiData && typeof apiData?.pagination?.count === 'number') {
                schoolCount = apiData.pagination.count
            } else if (Array.isArray(apiData?.data)) {
                schoolCount = apiData.data.length
            } else if (Array.isArray(apiData)) {
                schoolCount = apiData.length
            } else if (apiData && typeof apiData?.count === 'number') {
                schoolCount = apiData.count
            } else {
                schoolCount = formData.targetDivisions.length * 8
            }

            const preview = buildPlanPreview({
                gradYear: formData.gradYear,
                sport: formData.sport,
                positionLabel: formData.positionLabel,
                divisions: formData.targetDivisions,
                distanceMiles: selectedDistance
            })

            if (!active) return
            setSchoolsPrefetched(schoolCount)
            setPlanPreview(preview)
            setBackgroundStatus(prev => ({ ...prev, schools: 'ready', plan: 'ready' }))
        }

        prefetchSchoolsAndPlan()
        return () => {
            active = false
        }
    }, [formData.targetDivisions, formData.sport, formData.positionLabel, formData.gradYear, selectedDistance])

    const extractMissingColumnName = (message = '') => {
        const match = message.match(/Could not find the '([^']+)' column/)
        return match?.[1] || null
    }

    const upsertAthleteProfileWithSchemaFallback = async (initialProfileData) => {
        const profileData = { ...initialProfileData }

        for (let attempt = 0; attempt <= 10; attempt += 1) {
            const { error: profileError } = await supabase
                .from('athletes')
                .upsert(profileData, { onConflict: 'id' })

            if (!profileError) return null

            const missingColumn = extractMissingColumnName(profileError.message)
            if (!missingColumn || !(missingColumn in profileData)) {
                return profileError
            }
            delete profileData[missingColumn]
        }

        return new Error('Profile storage failed after schema fallback retries.')
    }

    const handleSportChange = (sport) => {
        setFormData(prev => ({
            ...prev,
            sport,
            positionCode: '',
            positionLabel: '',
            positionGroup: '',
            secondaryPositions: []
        }))
        setShowSecondaryPositions(false)
    }

    const handlePositionChange = (positionCode) => {
        const selected = positionOptions.find(option => option.code === positionCode)
        if (!selected) return

        const canonical = mapPositionToCanonical(formData.sport, selected.label || positionCode)
        const group = mapCanonicalToGroup(formData.sport, canonical) || selected.group || ''

        setFormData(prev => ({
            ...prev,
            positionCode,
            positionLabel: selected.label || positionCode,
            positionGroup: group
        }))
    }

    const handleSecondaryPositionToggle = (positionCode) => {
        setFormData(prev => {
            const exists = prev.secondaryPositions.includes(positionCode)
            if (exists) {
                return {
                    ...prev,
                    secondaryPositions: prev.secondaryPositions.filter(code => code !== positionCode)
                }
            }

            if (prev.secondaryPositions.length >= 2) return prev

            return {
                ...prev,
                secondaryPositions: [...prev.secondaryPositions, positionCode]
            }
        })
    }

    const handleDivisionToggle = (divisionId) => {
        setFormData(prev => {
            const exists = prev.targetDivisions.includes(divisionId)
            return {
                ...prev,
                targetDivisions: exists
                    ? prev.targetDivisions.filter(id => id !== divisionId)
                    : [...prev.targetDivisions, divisionId]
            }
        })
    }

    const openLegal = (type) => {
        setLegalContentType(type)
        setShowLegalModal(true)
    }

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return Boolean(formData.firstName.trim() && formData.lastName.trim() && formData.gradYear)
            case 2:
                return Boolean(formData.sport && formData.positionCode)
            case 3:
                return formData.targetDivisions.length > 0
            case 4:
                return Boolean(formData.locationCity.trim() && formData.locationState.trim() && formData.gpaRange)
            case 5:
                return backgroundStatus.plan === 'ready' && Boolean(planPreview)
            case 6:
                if (user) return Boolean(formData.agreedToTerms && formData.signupRole)
                return Boolean(
                    formData.email.trim()
                    && formData.password.length >= 8
                    && formData.agreedToTerms
                    && formData.signupRole
                )
            default:
                return false
        }
    }, [step, formData, backgroundStatus.plan, planPreview, user])

    const handleNext = () => {
        if (!canProceed) return
        track('onboarding_step_completed', { step })
        setStep(prev => Math.min(prev + 1, TOTAL_STEPS))
    }

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleStartTrial = async () => {
        if (!canProceed || loading) return

        setLoading(true)
        setError(null)

        try {
            let userId = user?.id || null

            if (!userId) {
                const { data: authData, error: authError } = await signUp({
                    email: formData.email.trim(),
                    password: formData.password,
                    options: {
                        data: {
                            first_name: formData.firstName.trim(),
                            last_name: formData.lastName.trim(),
                            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                            signup_role: formData.signupRole
                        }
                    }
                })

                if (authError) throw authError
                if (!authData?.user?.id) throw new Error('Unable to create account. Please try again.')
                userId = authData.user.id
            }

            const normalizedDisplay = normalizeText(formData.positionLabel)
            const canonicalPosition = mapPositionToCanonical(formData.sport, normalizedDisplay)
            const normalizedGroup = mapCanonicalToGroup(formData.sport, canonicalPosition) || formData.positionGroup

            if (!canonicalPosition || !normalizedGroup) {
                throw new Error('Please choose a valid sport and position before continuing.')
            }

            const secondaryPositionCanonical = formData.secondaryPositions
                .map(code => {
                    const option = positionOptions.find(item => item.code === code)
                    return mapPositionToCanonical(formData.sport, option?.label || code)
                })
                .filter(Boolean)

            const secondaryPositionGroups = secondaryPositionCanonical
                .map(code => mapCanonicalToGroup(formData.sport, code))
                .filter(Boolean)

            const profileData = {
                id: userId,
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                grad_year: Number(formData.gradYear),
                graduation_year: Number(formData.gradYear),
                sport: formData.sport,
                position: normalizedDisplay,
                primary_position_display: normalizedDisplay,
                primary_position_canonical: canonicalPosition,
                primary_position_group: normalizedGroup,
                position_canonical: canonicalPosition,
                position_group: normalizedGroup,
                secondary_positions_canonical: secondaryPositionCanonical,
                secondary_position_groups: secondaryPositionGroups,
                gpa_range: formData.gpaRange,
                city: formData.locationCity.trim(),
                state: formData.locationState.trim(),
                search_preference: toDistancePreference(selectedDistance),
                distance_preference: toDistancePreference(selectedDistance),
                target_divisions: formData.targetDivisions,
                goals: {
                    north_star: '',
                    division_priority: 'any',
                    geographic_preference: toDistancePreference(selectedDistance),
                    academic_interest: '',
                    primary_objective: 50
                },
                onboarding_completed: true,
                signup_role: formData.signupRole
            }

            const profileError = await upsertAthleteProfileWithSchemaFallback(profileData)
            if (profileError) throw new Error(profileError.message || 'Failed to save profile data.')

            await generateAndPersistWeeklyPlan(userId, { reason: 'onboarding' })

            if (refreshProfile) {
                await refreshProfile()
            }

            track('onboarding_completed', {
                sport: formData.sport,
                grad_year: Number(formData.gradYear),
                position: formData.positionLabel,
                target_level: formData.targetDivisions[0] || null,
                onboarding_duration_ms: Date.now() - onboardingStartRef.current
            })

            toast.success('Your plan is ready.')
            // Hard redirect avoids a transient profile-context race that can bounce users back to onboarding.
            window.location.assign('/weekly-plan')
        } catch (err) {
            const message = err?.message || 'Something went wrong while creating your account.'
            setError(message)
            toast.error(message)
            track('onboarding_failed', {
                step,
                error_code: err?.code || 'onboarding_failed',
                error_message: message
            })
        } finally {
            setLoading(false)
        }
    }

    if (isProfileLoading || !isInitialized || hasProfile) {
        return (
            <div className="rc-onboard-shell fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[var(--rc-cardinal)]"></div>
            </div>
        )
    }

    return (
        <div className="lp-landing min-h-screen px-4 py-6 sm:px-6 sm:py-10">
            {showLegalModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {legalContentType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowLegalModal(false)}
                                className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 text-sm text-gray-600">
                            {legalContentType === 'terms' ? (
                                <>
                                    <p>Welcome to RecruitCoS. By using this platform, you agree to these terms.</p>
                                    <p><strong>1. Services</strong><br />We provide recruiting guidance tools and planning workflows.</p>
                                    <p><strong>2. Accounts</strong><br />You are responsible for safeguarding your account credentials.</p>
                                    <p><strong>3. Use</strong><br />Do not misuse our services or attempt unauthorized access.</p>
                                </>
                            ) : (
                                <>
                                    <p>Your privacy matters to us.</p>
                                    <p><strong>1. Data</strong><br />We collect profile and product usage data to personalize your experience.</p>
                                    <p><strong>2. Usage</strong><br />Data is used to generate plans, recommendations, and workflow insights.</p>
                                    <p><strong>3. Sharing</strong><br />We do not sell personal data.</p>
                                </>
                            )}
                        </div>
                        <div className="mt-4">
                            <Button type="button" className="w-full" onClick={() => setShowLegalModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-[#F5F1E8] px-3 py-1 text-sm font-medium text-[#8B2635]">
                        Step {step} of {TOTAL_STEPS}
                    </span>
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-[#8B2635] transition-all duration-300"
                            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Tell us about your athlete</h1>
                            <p className="mt-2 text-base text-gray-600">Takes 90 seconds. See your personalized recruiting plan instantly.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                    placeholder="First name"
                                    value={formData.firstName}
                                    onChange={(event) => setFormData(prev => ({ ...prev, firstName: event.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                    placeholder="Last name"
                                    value={formData.lastName}
                                    onChange={(event) => setFormData(prev => ({ ...prev, lastName: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">What is their graduation year?</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                value={formData.gradYear}
                                onChange={(event) => setFormData(prev => ({ ...prev, gradYear: event.target.value }))}
                            >
                                <option value="">Select graduation year</option>
                                {getGradYearOptions().map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                            {formData.gradYear && (
                                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                    <p className="text-sm font-medium text-emerald-700">{resolvePhaseFromGradYear(formData.gradYear)}</p>
                                    <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700" title={PHASE_TOOLTIP}>
                                        <Info className="h-3.5 w-3.5" />
                                        {PHASE_TOOLTIP}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Sport & Position</h1>
                            <p className="mt-2 text-base text-gray-600">Choose the athlete's primary fit so we can tailor benchmarks.</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">What sport?</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                value={formData.sport}
                                onChange={(event) => handleSportChange(event.target.value)}
                            >
                                <option value="">Select sport</option>
                                {SUPPORTED_SPORTS.map(sport => (
                                    <option key={sport} value={sport}>{sport}</option>
                                ))}
                            </select>
                            {backgroundStatus.positions === 'loading' && (
                                <p className="mt-2 text-xs text-gray-500">Loading positions and benchmark data...</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Position</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring disabled:bg-gray-100"
                                value={formData.positionCode}
                                disabled={!formData.sport}
                                onChange={(event) => handlePositionChange(event.target.value)}
                            >
                                <option value="">{formData.sport ? 'Select position' : 'Select sport first'}</option>
                                {positionOptions.map(option => (
                                    <option key={option.code} value={option.code}>{option.label}</option>
                                ))}
                            </select>
                            {benchmarkCount > 0 && (
                                <p className="mt-2 text-xs text-gray-500">{benchmarkCount} benchmark metrics prefetched.</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#8B2635]"
                                onClick={() => setShowSecondaryPositions(prev => !prev)}
                            >
                                <Plus className="h-4 w-4" />
                                {showSecondaryPositions ? 'Hide Secondary Positions' : 'Add Secondary Positions (Optional)'}
                            </button>

                            {showSecondaryPositions && (
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {positionOptions.map(option => {
                                        const checked = formData.secondaryPositions.includes(option.code)
                                        const isPrimary = option.code === formData.positionCode
                                        const atLimit = !checked && formData.secondaryPositions.length >= 2
                                        const disabled = isPrimary || atLimit

                                        return (
                                            <label
                                                key={option.code}
                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${disabled ? 'opacity-50' : 'cursor-pointer'} ${checked
                                                    ? 'border-[#8B2635] bg-[#F5F1E8]'
                                                    : 'border-gray-300 bg-white'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    disabled={disabled}
                                                    onChange={() => handleSecondaryPositionToggle(option.code)}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                                />
                                                {option.label}
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">Helps provide broader fit signals</p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Which levels interest you?</h1>
                            <p className="mt-2 text-base text-gray-600">Select all that apply. We&apos;ll show schools that match.</p>
                        </div>

                        <div className="space-y-3">
                            {DIVISION_OPTIONS.map(option => {
                                const checked = formData.targetDivisions.includes(option.id)
                                return (
                                    <label
                                        key={option.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${checked
                                            ? 'border-[#8B2635] bg-[#F5F1E8]'
                                            : 'border-gray-300 bg-white hover:border-[#2C2C2C1A]'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                            checked={checked}
                                            onChange={() => handleDivisionToggle(option.id)}
                                        />
                                        <div>
                                            <p className="text-base font-medium text-gray-900">{option.label}</p>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>

                        {backgroundStatus.schools === 'loading' && (
                            <p className="text-sm text-gray-500">Filtering schools for selected divisions...</p>
                        )}
                        {backgroundStatus.schools === 'ready' && schoolsPrefetched > 0 && (
                            <p className="text-sm text-gray-600">{schoolsPrefetched}+ school matches prefetched.</p>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Location & Academic Fit</h1>
                            <p className="mt-2 text-base text-gray-600">Set search radius and academic range before plan generation.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                    placeholder="Austin"
                                    value={formData.locationCity}
                                    onChange={(event) => setFormData(prev => ({ ...prev, locationCity: event.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                    placeholder="Texas"
                                    value={formData.locationState}
                                    onChange={(event) => setFormData(prev => ({ ...prev, locationState: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">How far from home?</label>
                            <input
                                type="range"
                                min={0}
                                max={DISTANCE_MARKS.length - 1}
                                step={1}
                                value={formData.distanceIndex}
                                onChange={(event) => setFormData(prev => ({ ...prev, distanceIndex: Number(event.target.value) }))}
                                className="w-full accent-[#8B2635]"
                            />
                            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                                <span>0</span>
                                <span className="font-medium text-[#8B2635]">{distanceLabel(selectedDistance)}</span>
                                <span>Anywhere</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Academic range</label>
                            <div className="space-y-2">
                                {GPA_OPTIONS.map(option => (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${formData.gpaRange === option.value
                                            ? 'border-[#8B2635] bg-[#F5F1E8] text-[#8B2635]'
                                            : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gpaRange"
                                            value={option.value}
                                            checked={formData.gpaRange === option.value}
                                            onChange={(event) => setFormData(prev => ({ ...prev, gpaRange: event.target.value }))}
                                            className="h-4 w-4 border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Complete profile & generate plan</h1>
                            <p className="mt-2 text-base text-gray-600">We are finalizing your first weekly plan now.</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                            <p><span className="font-medium">Athlete:</span> {formData.firstName} {formData.lastName}</p>
                            <p className="mt-1"><span className="font-medium">Sport:</span> {formData.sport} - {formData.positionLabel}</p>
                            <p className="mt-1"><span className="font-medium">Divisions:</span> {formData.targetDivisions.join(', ') || 'None selected'}</p>
                            <p className="mt-1"><span className="font-medium">Grad Year:</span> {formData.gradYear || 'Not selected'}</p>
                            <p className="mt-1"><span className="font-medium">Distance:</span> {distanceLabel(selectedDistance)}</p>
                            <p className="mt-1"><span className="font-medium">Phase:</span> {resolvePhaseFromGradYear(formData.gradYear)}</p>
                        </div>

                        <div className="rounded-xl border border-[#2C2C2C1A] bg-[#F5F1E8] p-4 text-sm text-[#8B2635]">
                            {backgroundStatus.plan === 'ready'
                                ? 'Plan is pre-generated and ready to preview instantly.'
                                : 'Generating plan in background...'
                            }
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{planPreview?.title || "Here's your first week"}</h1>
                            <p className="mt-2 text-base text-gray-600">{planPreview?.subtitle || 'Week 1'}</p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            {(planPreview?.items || []).map(item => (
                                <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-4">
                                    <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600">{item.body}</p>
                                </article>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-[#F5F1E8] bg-[#F5F1E8] p-6">
                            <h2 className="text-lg font-medium text-[#8B2635]">Get your personalized plan every Monday—free for 4 weeks</h2>

                            {!user && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Email address</label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(event) => setFormData(prev => ({ ...prev, email: event.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Create password</label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                            <input
                                                type="password"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-base text-gray-900 outline-none ring-[rgba(139,38,53,0.25)] transition focus:border-[#8B2635] focus:ring"
                                                placeholder="At least 8 characters"
                                                value={formData.password}
                                                onChange={(event) => setFormData(prev => ({ ...prev, password: event.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user && (
                                <p className="mt-3 text-sm text-gray-700">Signed in as <span className="font-medium">{user.email}</span></p>
                            )}

                            <fieldset className="mt-4">
                                <legend className="mb-2 text-sm font-medium text-gray-700">I&apos;m signing up as:</legend>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="signupRole"
                                            value="parent"
                                            checked={formData.signupRole === 'parent'}
                                            onChange={(event) => setFormData(prev => ({ ...prev, signupRole: event.target.value }))}
                                            className="h-4 w-4 border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                        />
                                        Parent/Guardian
                                    </label>
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="signupRole"
                                            value="student"
                                            checked={formData.signupRole === 'student'}
                                            onChange={(event) => setFormData(prev => ({ ...prev, signupRole: event.target.value }))}
                                            className="h-4 w-4 border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                        />
                                        Student-Athlete
                                    </label>
                                </div>
                            </fieldset>

                            <p className="mt-4 text-sm text-gray-600">No credit card required. Cancel anytime.</p>

                            <Button
                                type="button"
                                className="mt-4 h-12 w-full bg-[#8B2635] font-semibold text-white hover:bg-[#7D2230]"
                                disabled={!canProceed || loading}
                                onClick={handleStartTrial}
                            >
                                {loading ? 'Creating account...' : 'Start My Free Plan ->'}
                            </Button>

                            <label className="mt-4 inline-flex items-start gap-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#8B2635] focus:ring-[rgba(139,38,53,0.35)]"
                                    checked={formData.agreedToTerms}
                                    onChange={(event) => setFormData(prev => ({ ...prev, agreedToTerms: event.target.checked }))}
                                />
                                <span>
                                    I agree to the{' '}
                                    <button type="button" onClick={() => openLegal('terms')} className="font-medium text-[#8B2635] underline">
                                        Terms of Service
                                    </button>
                                    {' '}and{' '}
                                    <button type="button" onClick={() => openLegal('privacy')} className="font-medium text-[#8B2635] underline">
                                        Privacy Policy
                                    </button>
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                    </div>
                )}

                <div className="mt-8 flex gap-3 border-t border-gray-200 pt-5">
                    {step > 1 && (
                        <Button type="button" variant="outline" className="h-11 px-4" onClick={handleBack} disabled={loading}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}

                    {step < TOTAL_STEPS ? (
                        <Button
                            type="button"
                            className="ml-auto h-11 px-5"
                            disabled={!canProceed}
                            onClick={handleNext}
                        >
                            {step === 5 ? 'See Plan Preview' : 'Continue'}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
