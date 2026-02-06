import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { Button } from '../components/ui/button'
import {
    ChevronRight, ChevronLeft, User, Trophy, MapPin,
    GraduationCap, Check, Sparkles, Target, Mail, Lock, X
} from 'lucide-react'
import RecruitingGoals from '../components/profile/RecruitingGoals'
import { SUPPORTED_SPORTS, getPositionOptionsForSport } from '../config/sportSchema'
import { mapCanonicalToGroup, mapPositionToCanonical, normalizeText, logSamplePositionMappings } from '../lib/normalize'
import { toast } from 'sonner'
import { track } from '../lib/analytics'

// Constants
const TOTAL_STEPS = 7

const GPA_RANGES = [
    { label: '3.8 - 4.0+', description: 'Honors/AP student', value: '3.8-4.0+' },
    { label: '3.5 - 3.7', description: 'Strong student', value: '3.5-3.7' },
    { label: '3.0 - 3.4', description: 'Good student', value: '3.0-3.4' },
    { label: '2.5 - 2.9', description: 'Solid student', value: '2.5-2.9' },
    { label: 'Below 2.5', description: '', value: '<2.5' },
    { label: 'Prefer not to say', description: '', value: 'n/a' }
]

const DIVISIONS = [
    { id: 'D1', label: 'NCAA D1', description: 'Highest level, most competitive, full scholarships' },
    { id: 'D2', label: 'NCAA D2', description: 'High level, partial scholarships, great balance' },
    { id: 'D3', label: 'NCAA D3', description: 'Competitive, no athletic scholarships, strong academics' },
    { id: 'NAIA', label: 'NAIA', description: 'Competitive, scholarships available, smaller schools' },
    { id: 'JUCO', label: 'JUCO', description: '2-year programs, often a pathway to 4-year' }
]

const SEARCH_PREFERENCES = [
    { id: 'local', label: 'Close to Home', icon: '🏠', description: 'Within 150 miles' },
    { id: 'regional', label: 'Regional', icon: '🗺️', description: 'Within 500 miles' },
    { id: 'national', label: 'Anywhere', icon: '🌎', description: 'Coast to coast' }
]

export default function ProfileSetup() {
    const { signUp, user } = useAuth()
    const { athleteProfile, accessibleAthletes, refreshProfile, isProfileLoading, isInitialized, hasProfile } = useProfile()

    // STRICT ROUTE GUARD:
    if (isProfileLoading || !isInitialized || hasProfile) {
        return (
            <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState(null)
    const [showLegalModal, setShowLegalModal] = useState(false)
    const [legalContentType, setLegalContentType] = useState('terms') // 'terms' or 'privacy'

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Basics
        firstName: '',
        lastName: '',
        gradYear: '2027',

        // Step 2: Sport
        sport: '',
        primaryPositionDisplay: '',
        positionGroup: '',
        secondaryPositionsCanonical: [],
        secondaryPositionGroups: [],

        // Step 3: Academic
        gpaRange: '',

        // Step 4: Geographic
        locationCity: '',
        locationState: '',
        searchPreference: 'national',

        // Step 5: Recruiting Level
        targetDivisions: [],

        // Step 6: Strategic Goals
        goals: {
            north_star: '',
            division_priority: 'any',
            geographic_preference: 'regional',
            academic_interest: '',
            primary_objective: 50
        },

        // Step 7: Account
        email: '',
        password: '',
        agreedToTerms: false
    })

    // Track if user has manually modified divisions to prevent overwrite
    const [manualDivisions, setManualDivisions] = useState(false)
    const onboardingStartRef = useRef(Date.now())

    // Smart Defaults for Divisions based on GPA
    useEffect(() => {
        // Only auto-select if user hasn't manually selected/deselected AND target is empty
        if (!manualDivisions && formData.gpaRange && formData.targetDivisions.length === 0) {
            let defaults = []
            if (formData.gpaRange === '3.8-4.0+') {
                defaults = ['D1', 'D3']
            } else if (formData.gpaRange === '3.5-3.7' || formData.gpaRange === '3.0-3.4') {
                defaults = ['D1', 'D2', 'D3']
            } else {
                defaults = ['D2', 'NAIA', 'JUCO']
            }
            // We do NOT set manualDivisions to true here, as this is an auto-action
            setFormData(prev => ({ ...prev, targetDivisions: defaults }))
        }
    }, [formData.gpaRange, manualDivisions])

    // Auto-fill email if user is already authenticated
    useEffect(() => {
        if (user?.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.email, agreedToTerms: true }))
        }
    }, [user])

    useEffect(() => {
        logSamplePositionMappings(formData.sport || 'Softball')
    }, [formData.sport])

    useEffect(() => {
        track('onboarding_viewed', { step, route: '/profile-setup' })
    }, [step])

    const handleNext = () => {
        track('onboarding_step_completed', { step })
        setStep(s => Math.min(s + 1, TOTAL_STEPS))
    }
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    const handleSportChange = (value) => {
        setFormData(prev => ({
            ...prev,
            sport: value,
            primaryPositionDisplay: '',
            positionGroup: '',
            secondaryPositionsCanonical: [],
            secondaryPositionGroups: []
        }))
    }

    const handlePositionChange = (value) => {
        const options = getPositionOptionsForSport(formData.sport)
        const selected = options.find(option => option.code === value)
        const canonical = mapPositionToCanonical(formData.sport, selected?.label || value)
        const group = mapCanonicalToGroup(formData.sport, canonical)
        setFormData(prev => ({
            ...prev,
            primaryPositionDisplay: selected?.label || '',
            positionGroup: group || selected?.group || ''
        }))
    }

    const handleSecondaryToggle = (code) => {
        const canonical = code
        const group = mapCanonicalToGroup(formData.sport, canonical)
        setFormData(prev => {
            const exists = prev.secondaryPositionsCanonical.includes(canonical)
            if (exists) {
                const nextPositions = prev.secondaryPositionsCanonical.filter(p => p !== canonical)
                const nextGroups = prev.secondaryPositionGroups.filter(g => g !== group)
                return { ...prev, secondaryPositionsCanonical: nextPositions, secondaryPositionGroups: nextGroups }
            }

            if (prev.secondaryPositionsCanonical.length >= 2) return prev

            return {
                ...prev,
                secondaryPositionsCanonical: [...prev.secondaryPositionsCanonical, canonical],
                secondaryPositionGroups: group ? [...prev.secondaryPositionGroups, group] : prev.secondaryPositionGroups
            }
        })
    }

    const handleDivisionToggle = (divId) => {
        setManualDivisions(true) // User is taking control
        setFormData(prev => {
            const current = prev.targetDivisions
            const updated = current.includes(divId)
                ? current.filter(d => d !== divId)
                : [...current, divId]
            return { ...prev, targetDivisions: updated }
        })
    }

    const openLegal = (type) => {
        setLegalContentType(type)
        setShowLegalModal(true)
    }

    const extractMissingColumnName = (message = '') => {
        const match = message.match(/Could not find the '([^']+)' column/)
        return match?.[1] || null
    }

    const upsertAthleteProfileWithSchemaFallback = async (initialProfileData) => {
        const profileData = { ...initialProfileData }
        const maxRetries = 8

        for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
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

        return new Error('Profile storage failed: too many unknown column retries.')
    }

    // Step 7: Create Account & Save Profile
    const handleCreateAccount = async () => {
        track('onboarding_step_completed', { step: 7 })
        setLoading(true)
        setError(null)

        try {
            // 1. SANITIZATION & VALIDATION PRE-FLIGHT
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`
            const parsedGradYear = parseInt(formData.gradYear)

            if (isNaN(parsedGradYear)) {
                throw new Error("Invalid graduation year. Please go back and select a year.")
            }

            if (!formData.sport || !formData.positionGroup) {
                throw new Error("Sport and position information is missing.")
            }

            if (formData.targetDivisions.length === 0) {
                throw new Error("Please select at least one division level.")
            }

            let userId = user?.id

            // 2. AUTHENTICATION (If not already logged in)
            if (!userId) {
                console.log('Starting account creation...')
                const { data: authData, error: authError } = await signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            full_name: fullName
                        }
                    }
                })

                if (authError) throw authError
                if (!authData.user) throw new Error("Authentication failed: User account not created.")

                userId = authData.user.id
                console.log('Account created successfully:', userId)
            }

            // 3. PROFILE CREATION
            console.log('Saving profile for user:', userId)

            const normalizedDisplay = normalizeText(formData.primaryPositionDisplay)
            const canonicalPosition = mapPositionToCanonical(formData.sport, normalizedDisplay)
            const normalizedGroup = mapCanonicalToGroup(formData.sport, canonicalPosition) || formData.positionGroup

            if (!canonicalPosition || !normalizedGroup) {
                throw new Error("Please select a supported primary position.")
            }

            const profileData = {
                id: userId,
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                name: fullName,
                grad_year: parsedGradYear,
                sport: formData.sport,
                position: normalizedDisplay,
                primary_position_display: normalizedDisplay,
                primary_position_canonical: canonicalPosition,
                primary_position_group: normalizedGroup,
                position_canonical: canonicalPosition,
                position_group: normalizedGroup,
                secondary_positions_canonical: formData.secondaryPositionsCanonical,
                secondary_position_groups: formData.secondaryPositionGroups,
                gpa_range: formData.gpaRange,
                city: formData.locationCity,
                state: formData.locationState,
                search_preference: formData.searchPreference,
                distance_preference: formData.searchPreference,
                target_divisions: formData.targetDivisions,
                goals: {
                    north_star: formData.goals.north_star.trim(),
                    division_priority: formData.goals.division_priority,
                    geographic_preference: formData.goals.geographic_preference,
                    academic_interest: formData.goals.academic_interest.trim(),
                    primary_objective: formData.goals.primary_objective
                },
                onboarding_completed: true
            }

            const profileError = await upsertAthleteProfileWithSchemaFallback(profileData)
            if (profileError) {
                console.error("Database upsert error:", profileError)
                // Specific messaging for common errors
                if (profileError.code === '23505') {
                    throw new Error("A profile already exists for this account.")
                }
                throw new Error(`Profile storage failed: ${profileError.message}`)
            }

            // 4. SYNC & FINALIZE
            console.log('Profile saved successfully!')

            // Critical: Wait for profile refresh before navigating
            if (refreshProfile) {
                await refreshProfile()
            }

            setCompleted(true)
            toast.success("Profile launched successfully!")
            track('onboarding_completed', {
                sport: formData.sport || null,
                grad_year: Number(formData.gradYear) || null,
                position: formData.primaryPositionDisplay || null,
                target_level: formData.targetDivisions?.[0] || null,
                has_measurables: false,
                onboarding_duration_ms: Date.now() - onboardingStartRef.current
            })

        } catch (err) {
            console.error("Onboarding failed:", err)
            const errorMessage = err.message || "An unexpected error occurred during setup."
            setError(errorMessage)
            toast.error(errorMessage)
            track('onboarding_failed', {
                step,
                error_code: err?.code || 'onboarding_failed',
                error_message: errorMessage
            })
        } finally {
            setLoading(false)
        }
    }

    // Validation
    const canProceed = () => {
        switch (step) {
            case 1: return formData.firstName && formData.lastName && formData.gradYear
            case 2: return formData.sport && formData.positionGroup
            case 3: return !!formData.gpaRange
            case 4: return formData.locationCity && formData.locationState && formData.searchPreference
            case 5: return formData.targetDivisions.length > 0
            case 6: return true // Optional
            case 7:
                // If user is authenticated, just need terms agreement
                if (user) return formData.agreedToTerms
                // Otherwise need email, password, and terms
                return formData.email && formData.password.length >= 8 && formData.agreedToTerms
            default: return false
        }
    }

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">The Basics</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">First Name</label>
                    <input
                        type="text"
                        className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                        placeholder="Alex"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">Last Name</label>
                    <input
                        type="text"
                        className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                        placeholder="Rivera"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Class of...</label>
                <select
                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none cursor-pointer"
                    value={formData.gradYear}
                    onChange={e => setFormData({ ...formData, gradYear: e.target.value })}
                >
                    {Array.from({ length: 8 }, (_, i) => 2025 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Your Sport</span>
            </div>
            <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Sport</label>
                <select
                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none cursor-pointer"
                    value={formData.sport}
                    onChange={e => handleSportChange(e.target.value)}
                >
                    <option value="" disabled>Select your sport</option>
                    {SUPPORTED_SPORTS.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Position</label>
                <select
                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none cursor-pointer"
                    value={getPositionOptionsForSport(formData.sport).find(option => option.label === formData.primaryPositionDisplay)?.code || ''}
                    onChange={e => handlePositionChange(e.target.value)}
                    disabled={!formData.sport}
                >
                    <option value="" disabled>{formData.sport ? 'Select your position' : 'Select a sport first'}</option>
                    {getPositionOptionsForSport(formData.sport).map(option => (
                        <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Secondary Positions (Optional, up to 2)</label>
                <div className="grid grid-cols-2 gap-2">
                    {getPositionOptionsForSport(formData.sport).map(option => {
                        const isPrimary = option.label === formData.primaryPositionDisplay
                        const isChecked = formData.secondaryPositionsCanonical.includes(option.code)
                        const isDisabled = isPrimary || (!isChecked && formData.secondaryPositionsCanonical.length >= 2)
                        return (
                            <label
                                key={option.code}
                                className={`flex items-center gap-2 text-xs px-2 py-2 rounded-lg border ${isDisabled ? 'opacity-50' : 'cursor-pointer'} ${isChecked ? 'border-green-400 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/50'}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => handleSecondaryToggle(option.code)}
                                    className="w-4 h-4 text-green-500 rounded border-zinc-600 bg-zinc-700"
                                />
                                <span>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
                <p className="text-[10px] text-zinc-500">These help provide a broader fit signal but won’t replace your primary position.</p>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Academic Fit</span>
            </div>
            <p className="text-zinc-400 text-sm">What's your current GPA? (Approximate is fine)</p>
            <div className="grid gap-3">
                {GPA_RANGES.map(range => (
                    <button
                        key={range.label}
                        onClick={() => setFormData({ ...formData, gpaRange: range.value })}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${formData.gpaRange === range.value
                            ? 'bg-zinc-800 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <div className={`font-semibold ${formData.gpaRange === range.value ? 'text-green-400' : 'text-white'}`}>
                            {range.label}
                        </div>
                        {range.description && (
                            <div className="text-xs text-zinc-500 mt-1">{range.description}</div>
                        )}
                    </button>
                ))}
            </div>
            <p className="text-xs text-zinc-600 italic">
                This is private and helps us find schools where you'll succeed academically.
            </p>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Geographic Fit</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">City</label>
                    <input
                        type="text"
                        className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                        placeholder="Austin"
                        value={formData.locationCity}
                        onChange={e => setFormData({ ...formData, locationCity: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-zinc-400 text-sm">State</label>
                    <input
                        type="text"
                        className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                        placeholder="Texas"
                        value={formData.locationState}
                        onChange={e => setFormData({ ...formData, locationState: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-3 pt-4">
                <label className="text-zinc-400 text-sm">How far are you willing to go?</label>
                <div className="grid grid-cols-3 gap-3">
                    {SEARCH_PREFERENCES.map(pref => (
                        <button
                            key={pref.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, searchPreference: pref.id })}
                            className={`p-3 rounded-xl text-center transition-all border-2 ${formData.searchPreference === pref.id
                                ? 'bg-zinc-800 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                }`}
                        >
                            <span className="text-xl block mb-1">{pref.icon}</span>
                            <span className={`text-xs font-semibold ${formData.searchPreference === pref.id ? 'text-green-400' : 'text-white'}`}>
                                {pref.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderStep5 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <Target className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Recruiting Level</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                What level are you targeting?
            </h2>
            <p className="text-zinc-400 text-sm">Select all divisions you're interested in:</p>

            <div className="space-y-3">
                {DIVISIONS.map(div => (
                    <label
                        key={div.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.targetDivisions.includes(div.id)
                            ? 'bg-zinc-800 border-green-400'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 rounded border-zinc-600 text-green-500 focus:ring-green-500 bg-zinc-700"
                            checked={formData.targetDivisions.includes(div.id)}
                            onChange={() => handleDivisionToggle(div.id)}
                        />
                        <div>
                            <div className={`font-semibold ${formData.targetDivisions.includes(div.id) ? 'text-green-400' : 'text-white'}`}>
                                {div.label}
                            </div>
                            <div className="text-sm text-zinc-500">{div.description}</div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    )

    const renderStep6 = () => (
        <RecruitingGoals
            goals={formData.goals}
            onChange={(newGoals) => setFormData({ ...formData, goals: newGoals })}
            athleteLocation={{ city: formData.locationCity, state: formData.locationState }}
        />
    )

    const renderStep7 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Profile Complete!</h2>
                <p className="text-zinc-400 mt-2">
                    {user
                        ? "Ready to save your profile and start your recruiting journey."
                        : "Create your account to access your curated recruiting roadmap and saved schools."
                    }
                </p>
            </div>

            <div className="space-y-4">
                {/* Show signed-in message for authenticated users */}
                {user ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-green-400 text-sm font-medium">
                            ✓ Signed in as <span className="text-white font-semibold">{user.email}</span>
                        </p>
                        <p className="text-zinc-400 text-xs mt-1">You are ready to launch your profile!</p>
                    </div>
                ) : (
                    <>
                        {/* Email field for new users */}
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                                <input
                                    type="email"
                                    className="w-full bg-zinc-800 border-none rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Password field for new users */}
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                                <input
                                    type="password"
                                    className="w-full bg-zinc-800 border-none rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-zinc-500">At least 8 characters</p>
                        </div>
                    </>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-zinc-600 text-green-500 focus:ring-green-500 bg-zinc-700"
                        checked={formData.agreedToTerms}
                        onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    />
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        I agree to the{' '}
                        <button onClick={() => openLegal('terms')} className="text-white underline hover:text-green-400">
                            Terms of Service
                        </button>
                        {' '}and{' '}
                        <button onClick={() => openLegal('privacy')} className="text-white underline hover:text-green-400">
                            Privacy Policy
                        </button>
                    </span>
                </label>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        <p className="font-semibold mb-1">⚠️ Error</p>
                        <p>{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 text-xs underline hover:text-red-300"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    // --- Render ---

    // Completion Screen (Step 8 equivalent)
    if (completed) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <span className="text-4xl">🎉</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold font-serif">You're all set, {formData.firstName}!</h1>
                        <p className="text-zinc-400">Your recruiting profile is ready.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">🎯</div>
                            <div className="text-left">
                                <div className="font-bold">Recruiting Compass</div>
                                <div className="text-xs text-zinc-500">Schools matched to your profile</div>
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">✍️</div>
                            <div className="text-left">
                                <div className="font-bold">Chief of Staff</div>
                                <div className="text-xs text-zinc-500">Create posts in seconds</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button
                            onClick={() => navigate('/compass')}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg shadow-lg shadow-green-500/20"
                        >
                            Explore My Compass
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-zinc-500 hover:text-white"
                        >
                            Skip to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
            {/* Legal Modal */}
            {showLegalModal && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 text-white p-6 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {legalContentType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                            </h3>
                            <button onClick={() => setShowLegalModal(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto text-sm text-zinc-300 space-y-4 pr-2">
                            {legalContentType === 'terms' ? (
                                <>
                                    <p>Welcome to RecruitCo. By accessing our platform, you agree to these terms.</p>
                                    <p><strong>1. Services</strong><br />We provide recruiting tools and AI-powered insights for student-athletes.</p>
                                    <p><strong>2. User Accounts</strong><br />You are responsible for maintaining the confidentiality of your account.</p>
                                    <p><strong>3. Acceptable Use</strong><br />Do not misuse our services or scrape data.</p>
                                    <p><strong>4. Termination</strong><br />We reserve the right to suspend accounts for violations.</p>
                                </>
                            ) : (
                                <>
                                    <p>Your privacy is important to us.</p>
                                    <p><strong>1. Data Collection</strong><br />We collect information you provide (name, stats, etc.) to improve your experience.</p>
                                    <p><strong>2. Usage</strong><br />We use your data to match you with colleges and generate recruiting content.</p>
                                    <p><strong>3. Sharing</strong><br />We do not sell your personal data to third parties.</p>
                                    <p><strong>4. Security</strong><br />We use industry-standard encryption to protect your data.</p>
                                </>
                            )}
                        </div>
                        <div className="pt-4 mt-4 border-t border-zinc-800">
                            <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => setShowLegalModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <h1 className="text-2xl font-bold font-serif tracking-tight">
                            <span className="text-green-400">Step {step}</span> of {TOTAL_STEPS}
                        </h1>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-400 transition-all duration-500 ease-out"
                            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl shadow-xl">

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                    {step === 7 && renderStep7()}

                    {/* Navigation */}
                    <div className="flex gap-4 mt-8 pt-4 border-t border-zinc-800/50">
                        {step > 1 && (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        )}

                        {step < TOTAL_STEPS ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="ml-auto bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCreateAccount}
                                disabled={!canProceed() || loading}
                                className="ml-auto bg-green-500 hover:bg-green-600 text-white font-semibold w-full"
                            >
                                {loading
                                    ? (user ? 'Saving Profile...' : 'Creating Account...')
                                    : (user ? 'Save My Profile' : 'Create My Account')
                                }
                            </Button>
                        )}
                    </div>
                </div>

                <p className="text-center text-zinc-600 text-xs mt-4">
                    {step === 7 ? '🔒 Secure SSL Connection' : '⏱️ Takes about 2 minutes'}
                </p>
            </div>
        </div>
    )
}
