import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { Button } from '../components/ui/button'
import {
    ChevronRight, ChevronLeft, User, Trophy, MapPin,
    GraduationCap, Check, Sparkles, Target, Mail, Lock
} from 'lucide-react'

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
    const { athleteProfile, loading: checkingProfile, accessibleAthletes, refreshProfile } = useProfile()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState(null)

    // Onboarding Guard: Handled by App.jsx Traffic Controller now

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Basics
        firstName: '',
        lastName: '',
        gradYear: '2027',

        // Step 2: Sport
        sport: '',
        position: '',

        // Step 3: Academic
        gpaRange: '',

        // Step 4: Geographic
        locationCity: '',
        locationState: '',
        searchPreference: 'regional',

        // Step 5: Recruiting Level
        targetDivisions: [],

        // Step 6: Dream School
        dreamSchool: '',

        // Step 7: Account
        email: '',
        password: '',
        agreedToTerms: false
    })

    // Smart Defaults for Divisions based on GPA
    useEffect(() => {
        if (formData.gpaRange && formData.targetDivisions.length === 0) {
            let defaults = []
            if (formData.gpaRange === '3.8-4.0+') {
                defaults = ['D1', 'D3']
            } else if (formData.gpaRange === '3.5-3.7' || formData.gpaRange === '3.0-3.4') {
                defaults = ['D1', 'D2', 'D3']
            } else {
                defaults = ['D2', 'NAIA', 'JUCO']
            }
            // Only set if user hasn't interacted yet (length check above helps, but could be better)
            // Ideally we'd want to suggest but not force overwrite if they unchecked all.
            // For now, this matches the requirement "if ... length === 0".
            setFormData(prev => ({ ...prev, targetDivisions: defaults }))
        }
    }, [formData.gpaRange])

    // Auto-fill email if user is already authenticated
    useEffect(() => {
        if (user?.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.email, agreedToTerms: true }))
        }
    }, [user])

    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    const handleDivisionToggle = (divId) => {
        setFormData(prev => {
            const current = prev.targetDivisions
            const updated = current.includes(divId)
                ? current.filter(d => d !== divId)
                : [...current, divId]
            return { ...prev, targetDivisions: updated }
        })
    }

    // Step 7: Create Account & Save Profile
    const handleCreateAccount = async () => {
        setLoading(true)
        setError(null)
        try {
            let userId = user?.id

            if (userId) {
                console.log('User authenticated, skipping registration:', userId)
            } else {
                console.log('Starting account creation...')

                // 1. Sign Up (only for new users)
                const { data: authData, error: authError } = await signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            first_name: formData.firstName,
                            last_name: formData.lastName
                        }
                    }
                })

                if (authError) throw authError
                if (!authData.user) throw new Error("No user created")

                userId = authData.user.id

                // Check session availability
                const { data: sessionData } = await supabase.auth.getSession()
                if (!sessionData?.session) {
                    // Attempt immediate sign-in
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: formData.email,
                        password: formData.password
                    })

                    if (signInError) {
                        setError('Account created! Please check your email to confirm, then log in.')
                        setLoading(false)
                        return
                    }
                }
            }

            console.log('Saving profile for user:', userId)

            // 2. Save Profile (Upsert to prevent duplicates)
            const { error: profileError } = await supabase
                .from('athletes')
                .upsert({
                    user_id: userId,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    name: `${formData.firstName} ${formData.lastName}`, // Ensure mapped name
                    grad_year: parseInt(formData.gradYear),
                    sport: formData.sport,
                    position: formData.position,
                    gpa_range: formData.gpaRange,
                    location_city: formData.locationCity,
                    location_state: formData.locationState,
                    search_preference: formData.searchPreference,
                    distance_preference: formData.searchPreference,
                    target_divisions: formData.targetDivisions,
                    dream_school: formData.dreamSchool || null,
                    onboarding_completed: true
                }, { onConflict: 'user_id' })

            if (profileError) throw profileError

            console.log('Profile saved successfully!')
            // Refresh the profile in context so App.jsx knows we have a profile now
            if (refreshProfile) await refreshProfile()
            setCompleted(true)

        } catch (err) {
            console.error("Account creation failed:", err)
            setError('Failed to save profile: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    // Validation
    const canProceed = () => {
        switch (step) {
            case 1: return formData.firstName && formData.lastName && formData.gradYear
            case 2: return formData.sport && formData.position
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
                <input
                    type="text"
                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                    placeholder="e.g. Basketball"
                    value={formData.sport}
                    onChange={e => setFormData({ ...formData, sport: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="text-zinc-400 text-sm">Position</label>
                <input
                    type="text"
                    className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-green-400 outline-none"
                    placeholder="e.g. Point Guard"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                />
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
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Dream School</span>
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">What's your dream school?</h2>
                <p className="text-zinc-400 text-sm">
                    Think of one school you'd love to attend—we'll use it to find similar options.
                </p>
            </div>

            <div className="space-y-2 pt-4">
                <input
                    type="text"
                    className="w-full bg-zinc-800 border-none rounded-lg p-4 text-white text-lg focus:ring-2 focus:ring-green-400 outline-none"
                    placeholder="e.g. Duke University"
                    value={formData.dreamSchool}
                    onChange={e => setFormData({ ...formData, dreamSchool: e.target.value })}
                />
                <p className="text-xs text-zinc-500">
                    Popular: Stanford • Ohio State • UCLA • Michigan
                </p>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-dashed border-zinc-800">
                <p className="text-zinc-400 text-sm text-center">
                    Don't have one? No problem.
                </p>
                <button
                    onClick={() => {
                        setFormData({ ...formData, dreamSchool: '' })
                        handleNext()
                    }}
                    className="w-full mt-2 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    Skip for Now
                </button>
            </div>
        </div>
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
                        I agree to the <span className="text-white underline">Terms of Service</span> and <span className="text-white underline">Privacy Policy</span>
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

    if (checkingProfile) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 relative mb-8">
                    <div className="absolute inset-0 border-4 border-zinc-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-bold text-white tracking-tight animate-pulse">Setting up your Command Center...</h2>
                    <p className="text-zinc-500 text-sm">Verifying athlete credentials</p>
                </div>
            </div>
        )
    }

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
