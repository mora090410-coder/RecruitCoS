import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import DashboardLayout from '../components/DashboardLayout'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGenAI, callGeminiWithRetry } from '../lib/gemini'
import { getRetryStatusMessage } from '../lib/aiUtils'
import { calculateDistance } from '../lib/utils'
import { sanitizeInput } from '../lib/security'
import { getSchoolHeat } from '../lib/signalEngine'

// Screen Components
import CompassSearch from '../components/compass/CompassSearch'
import CategoryOverview from '../components/compass/CategoryOverview'
import SchoolList from '../components/compass/SchoolList'
import SchoolDetail from '../components/compass/SchoolDetail'
import MyList from '../components/compass/MyList'
import Toast from '../components/ui/Toast'

// Gemini initialization moved inside component

export default function RecruitingCompass() {
    const { user } = useAuth()
    const { isImpersonating, activeAthlete } = useProfile()

    // Gemini client (lazy init via getGenAI helper)

    // View state
    const [view, setView] = useState('search') // 'search' | 'overview' | 'list' | 'detail' | 'mylist'
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedSchool, setSelectedSchool] = useState(null)

    // Data state
    const [dreamSchool, setDreamSchool] = useState('')
    const [athleteProfile, setAthleteProfile] = useState(null)
    const [results, setResults] = useState({ reach: [], target: [], solid: [] })
    const [savedSchools, setSavedSchools] = useState({ reach: [], target: [], solid: [] })

    // Filter state
    const [filters, setFilters] = useState({
        divisions: ['D1', 'D2', 'D3', 'NAIA', 'JUCO'],
        distance: 'national',
        regions: []
    })

    // Loading state
    const [loading, setLoading] = useState(false)
    const [retryStatus, setRetryStatus] = useState(null) // 'Retrying...' status for UI
    const [profileLoading, setProfileLoading] = useState(true)
    const [searchError, setSearchError] = useState(null)
    const [lastSearchTime, setLastSearchTime] = useState(0)

    // Toast state
    const [showToast, setShowToast] = useState(false)
    const [toastConfig, setToastConfig] = useState(null)

    // Load athlete profile and saved schools on mount
    useEffect(() => {
        async function loadData() {
            if (import.meta.env.DEV) console.log('Loading profile for user:', user?.id)
            setProfileLoading(true)

            // Load profile
            const { data: athlete, error: athleteError } = await supabase
                .from('athletes')
                .select('id, name, position, sport, grad_year, gpa, city, state, goals, academic_tier, search_preference, latitude, longitude')
                .eq('id', user.id)
                .single()

            if (import.meta.env.DEV && (athlete || athleteError)) {
                console.log('Athlete query result:', { athlete, athleteError })
                if (athleteError) console.error('❌ Athlete query FAILED:', athleteError.message, athleteError.code)
            }

            if (athlete) {
                if (import.meta.env.DEV) console.log('🎯 Loaded goals from DB:', athlete.goals)
                setAthleteProfile({
                    id: athlete.id,
                    name: athlete.name || 'Athlete',
                    position: athlete.position || 'Not Set',
                    sport: athlete.sport || 'Not Set',
                    gradYear: athlete.grad_year || new Date().getFullYear() + 4,
                    gpa: athlete.gpa || null,
                    academicTier: athlete.academic_tier || 'selective',
                    searchPreference: athlete.search_preference || 'regional',
                    location: [athlete.city, athlete.state].filter(Boolean).join(', ') || 'Unknown',
                    goals: athlete.goals || {},
                    lat: athlete.latitude,
                    lng: athlete.longitude
                })
                if (athlete.goals?.north_star) {
                    if (import.meta.env.DEV) console.log('🎯 Setting state from goals:', athlete.goals.north_star)
                    setDreamSchool(athlete.goals.north_star)
                }

                // Initialize filters based on athlete profile preference
                setFilters(prev => ({
                    ...prev,
                    divisions: prev.divisions, // Keep default ALL or derive? Defaulting to All for discovery.
                    distance: athlete.search_preference || 'national' // Default to profile preference
                }))
            }

            // Load saved schools
            const { data: saved } = await supabase
                .from('athlete_saved_schools')
                .select('*, interactions:athlete_interactions(*)')
                .eq('athlete_id', user.id)

            if (saved) {
                const schoolsWithHeat = saved.map(school => ({
                    ...school,
                    heat: getSchoolHeat(school.interactions || [])
                }))

                const grouped = {
                    reach: schoolsWithHeat.filter(s => s.category === 'reach'),
                    target: schoolsWithHeat.filter(s => s.category === 'target'),
                    solid: schoolsWithHeat.filter(s => s.category === 'solid')
                }
                setSavedSchools(grouped)
            }

            setProfileLoading(false)
        }

        if (user) loadData()
    }, [user])

    // Apply filters to results
    const filteredResults = useMemo(() => {
        // If no results loaded yet, just return empty structure
        if (!results.reach.length && !results.target.length && !results.solid.length) {
            return { reach: [], target: [], solid: [] }
        }

        const filterSchools = (schools) => {
            return schools.filter(school => {
                // Division filter
                if (filters.divisions.length > 0 && !filters.divisions.includes(school.division)) {
                    return false
                }

                // Distance filter
                let distance = school.distance_miles
                // Fallback calculation
                if ((distance === null || distance === undefined) && school.lat && school.lng && athleteProfile?.lat && athleteProfile?.lng) {
                    distance = calculateDistance(school.lat, school.lng, athleteProfile.lat, athleteProfile.lng)
                }

                if (distance !== null && distance !== undefined) {
                    if (filters.distance === 'close' && distance > 200) return false
                    if (filters.distance === 'regional' && distance > 800) return false
                }

                // Region filter
                if (filters.regions.length > 0 && !filters.regions.includes(school.region)) {
                    return false
                }

                return true
            })
        }

        return {
            reach: filterSchools(results.reach || []),
            target: filterSchools(results.target || []),
            solid: filterSchools(results.solid || [])
        }
    }, [results, filters, athleteProfile])

    // Helpers imported from lib/gemini

    // AI Search
    const handleSearch = async (schoolInput = null) => {
        // 1. Determine actual school name (handle event objects)
        const rawSchool = (typeof schoolInput === 'string') ? schoolInput : dreamSchool

        if (!rawSchool || !rawSchool.trim()) {
            if (import.meta.env.DEV) console.warn("[RecruitingCompass] No search school provided.")
            return
        }

        const searchSchool = sanitizeInput(rawSchool)

        // 2. Immediate Loading State
        setLoading(true)
        setSearchError(null)

        if (import.meta.env.DEV) console.log("[RecruitingCompass] Starting search for:", searchSchool)

        // 3. Debounce check (5 seconds)
        const now = Date.now()
        if (now - lastSearchTime < 5000) {
            if (import.meta.env.DEV) console.warn("[RecruitingCompass] Search throttled: Please wait.")
            setLoading(false)
            return
        }
        setLastSearchTime(now)

        try {
            // CACHE CHECK
            // Generate a simple key based on school and user's primary characteristics
            // Ideally we'd hash the whole profile, but user requested dream_school + athlete_id
            const queryKey = `strategic_${JSON.stringify({
                sport: athleteProfile?.sport,
                gpa: athleteProfile?.gpa,
                goals: athleteProfile?.goals,
                search_school: searchSchool
            })}`.replace(/\s+/g, '_').toLowerCase()

            if (user?.id) {
                const { data: cached } = await supabase
                    .from('search_cache')
                    .select('results, expires_at')
                    .eq('user_id', user.id)
                    .eq('query_key', queryKey)
                    .single()

                if (cached && new Date(cached.expires_at) > new Date()) {
                    if (import.meta.env.DEV) console.log('Using CACHED results for:', searchSchool)
                    setResults(cached.results)
                    setView('overview')
                    setLoading(false)
                    return
                }
            }

            // --- API CALL ---
            if (import.meta.env.DEV) console.log('Cache miss. Calling Gemini API for:', searchSchool)

            // JSON Schema for School Recommendations (2026 Gemini 3 Standards)
            const SCHOOL_SCHEMA = {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        school_name: { type: "string" },
                        category: { type: "string", enum: ["reach", "target", "solid"] },
                        conference: { type: "string" },
                        division: { type: "string", enum: ["D1", "D2", "D3", "NAIA", "JUCO"] },
                        distance_miles: { type: "number" },
                        atomic_region: { type: "string" },
                        athletic_level: { type: "string", enum: ["Elite", "Highly Competitive", "Competitive", "Developing"] },
                        academic_selectivity: { type: "string", enum: ["Highly Selective", "Selective", "Moderately Selective", "Less Selective"] },
                        gpa_requirement: { type: "number" },
                        insight: { type: "string" }
                    },
                    required: ["school_name", "category", "conference", "division", "insight"]
                },
                minItems: 30,
                maxItems: 40
            }

            // 2026 Gemini 3 Standards: systemInstruction with JSON schema
            const systemInstruction = `You are an elite Collegiate Recruiting Advisor.
            
OUTPUT FORMAT:
Return ONLY a valid JSON array matching this schema:
${JSON.stringify(SCHOOL_SCHEMA, null, 2)}

CATEGORIZATION RULES:
1. REACH (10-12 schools): More competitive than athlete's profile.
2. TARGET (12-15 schools): Good fit for current profile.
3. SOLID (10-12 schools): Likely serious interest.

IMPORTANT INSTRUCTION:
Find 35 schools that best satisfy the provided athlete goals. 
If the primary_objective is close to 'Playing Time' (towards 100), prioritize schools where the athlete's stats and GPA would place them in the top 10% of recruits (meaning the school's average requirements are significantly lower than the athlete's profile). 
If it is close to 'Prestige' (towards 0), prioritize elite academic and athletic brands.`

            const genAI = getGenAI()
            if (!genAI) throw new Error("Gemini API Key missing")

            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                systemInstruction,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 1.0
                }
            }, { apiVersion: "v1beta" })

            // Context first, then instruction (2026 long-context optimization)
            const prompt = `STRATEGIC RECRUITMENT PARAMETERS:
Athlete Profile:
- Position: ${sanitizeInput(athleteProfile?.position) || 'Unknown'}
- Sport: ${sanitizeInput(athleteProfile?.sport) || 'Unknown'}
- GPA: ${sanitizeInput(athleteProfile?.gpa) || 'Not provided'}
- Academic Tier: ${sanitizeInput(athleteProfile?.academicTier) || 'selective'}
- Home Location: ${sanitizeInput(athleteProfile?.location) || 'Unknown'}

ATHLETE GOALS:
${JSON.stringify(athleteProfile?.goals || {}, null, 2)}

INSTRUCTION:
Find 35 schools that best satisfy these athlete goals: ${JSON.stringify(athleteProfile?.goals || {})}. 
Focus on the 'primary_objective' slider (0-100) to weigh the results. 
If the objective is close to 'Playing Time' (100), prioritize schools where the athlete's stats and GPA put them in the top 10% of recruits.`

            // Clear retry status before starting
            setRetryStatus(null)

            const result = await callGeminiWithRetry(model, prompt, {
                maxRetries: 3,
                onRetry: (attempt, error, delay) => {
                    const status = getRetryStatusMessage(attempt, 3)
                    setRetryStatus(status)
                    if (import.meta.env.DEV) {
                        console.log(`[RecruitingCompass] ${status} (delay: ${delay}ms)`, error.message)
                    }
                }
            })

            // Clear retry status on success
            setRetryStatus(null)

            const response = await result.response
            const text = response.text()

            if (import.meta.env.DEV) console.log("Gemini Raw Response:", text)

            // Robust JSON extraction
            const jsonStart = text.indexOf('[')
            const jsonEnd = text.lastIndexOf(']') + 1
            if (jsonStart === -1 || jsonEnd === 0) {
                throw new Error("Invalid format received from AI")
            }

            const cleanJson = text.substring(jsonStart, jsonEnd)
            const schools = JSON.parse(cleanJson)

            // Group by category
            const grouped = {
                reach: schools.filter(s => s.category === 'reach'),
                target: schools.filter(s => s.category === 'target'),
                solid: schools.filter(s => s.category === 'solid')
            }

            setResults(grouped)

            // SAVE TO CACHE
            if (user?.id) {
                const { error: cacheError } = await supabase
                    .from('search_cache')
                    .insert({
                        user_id: user.id,
                        query_key: queryKey,
                        results: grouped
                    })
                if (cacheError) {
                    if (import.meta.env.DEV) console.warn("Failed to cache results:", cacheError)
                }
            }

            setView('overview')

        } catch (error) {
            if (import.meta.env.DEV) console.error("Gemini Error:", error)
            const isRateLimit = error.message?.includes('429') || error.status === 429

            if (isRateLimit) {
                setSearchError('Our Chief of Staff is currently busy helping other athletes. Please wait 60 seconds and try again.')
            } else {
                setSearchError(`Search failed: ${error.message || 'Unknown error'}. Check console for details.`)
            }
        } finally {
            setLoading(false)
        }
    }

    // Explore based on strategic goals
    const handleExploreProfile = async () => {
        console.log('handleExploreProfile (Strategic) triggered')

        // Priority 1: Use North Star from Goals
        if (athleteProfile?.goals?.north_star) {
            console.log('Using North Star from goals:', athleteProfile.goals.north_star)
            await handleSearch(athleteProfile.goals.north_star)
            return
        }

        // Priority 2: Use current UI input
        if (dreamSchool && dreamSchool.trim() !== '') {
            await handleSearch(dreamSchool)
            return
        }

        // Priority 3: Strategic default based on Academic Tier
        const representativeSchools = {
            'highly_selective': 'Stanford University',
            'selective': 'University of Michigan',
            'moderately_selective': 'University of Arizona',
            'open_admission': 'Community College'
        }

        const tier = athleteProfile?.academicTier || 'selective'
        const representativeSchool = representativeSchools[tier] || 'University of Michigan'
        await handleSearch(representativeSchool)
    }

    // Add school to saved list
    // Add school to saved list
    const handleAddToList = async (school) => {
        setLoading(true)
        try {
            // Sanitize numeric fields
            const distanceMiles = parseInt(school.distance_miles, 10)
            const gpaValue = parseFloat(school.gpa_requirement)

            // Determine targeting
            const targetAthleteId = isImpersonating ? activeAthlete?.id : user?.id
            if (!targetAthleteId) throw new Error("No target athlete found")

            const { error } = await supabase
                .from('athlete_saved_schools')
                .insert({
                    athlete_id: targetAthleteId,
                    school_name: school.school_name,
                    category: school.category,
                    conference: school.conference,
                    division: school.division,
                    distance_miles: isNaN(distanceMiles) ? null : distanceMiles,
                    athletic_level: school.athletic_level,
                    academic_selectivity: school.academic_selectivity,
                    gpa: isNaN(gpaValue) ? null : gpaValue,
                    insight: school.insight
                })

            if (error) {
                setLoading(false)
                // Handle Duplicate Entry (Schema 23505 Unique Violation)
                if (error.code === '23505') {
                    setToastConfig({
                        message: `${school.school_name} is already in your My List.`,
                        actionLabel: 'View My List',
                        onAction: () => setView('mylist')
                    })
                    setShowToast(true)
                    return
                }
                throw error
            }

            setLoading(false)

            // Update local state
            const schoolWithStatus = {
                ...school,
                athlete_id: targetAthleteId
            }
            setSavedSchools(prev => ({
                ...prev,
                [school.category]: [...prev[school.category], schoolWithStatus]
            }))

            // Show our custom toast (requested by user)
            setToastConfig({
                message: `${school.school_name} added to your ${school.category} list!`,
                actionLabel: 'View My List',
                onAction: () => setView('mylist'),
                secondaryActionLabel: 'Back to Categories',
                onSecondaryAction: () => setView('overview')
            })
            setShowToast(true)

            // Auto-navigation removed to prevent "dead-end" but forced interruption
        } catch (error) {
            setLoading(false)
            console.error("[RecruitingCompass] Error saving school (Code: " + error.code + "):", error)
            setToastConfig({
                message: 'Failed to add school: ' + (error.message || 'Unknown database error'),
                actionLabel: 'Retry',
                onAction: () => handleAddToList(school)
            })
            setShowToast(true)
        }
    }

    // Remove school from saved list
    const handleRemoveFromList = async (school) => {
        try {
            const targetAthleteId = isImpersonating ? activeAthlete?.id : user?.id

            const { error } = await supabase
                .from('athlete_saved_schools')
                .delete()
                .eq('athlete_id', targetAthleteId)
                .eq('school_name', school.school_name)

            if (error) throw error

            // Update local state
            setSavedSchools(prev => ({
                ...prev,
                [school.category]: prev[school.category].filter(s => s.school_name !== school.school_name)
            }))

        } catch (error) {
            console.error("Error removing school:", error)
            alert('Failed to remove school: ' + error.message)
        }
    }

    // Get list of saved school names for checking
    const savedSchoolNames = [
        ...savedSchools.reach.map(s => s.school_name),
        ...savedSchools.target.map(s => s.school_name),
        ...savedSchools.solid.map(s => s.school_name)
    ]

    // Reset filters to athlete preferences
    const handleResetFilters = () => {
        setFilters({
            divisions: ['D1', 'D2', 'D3', 'NAIA', 'JUCO'],
            distance: athleteProfile?.searchPreference || 'national',
            regions: athleteProfile?.preferredRegions || []
        })
    }

    // Render current view
    const renderView = () => {
        switch (view) {
            case 'search':
                return (
                    <CompassSearch
                        dreamSchool={dreamSchool}
                        setDreamSchool={setDreamSchool}
                        onSearch={handleSearch}
                        onExploreProfile={handleExploreProfile}
                        onViewMyList={() => setView('mylist')}
                        loading={loading}
                        retryStatus={retryStatus}
                        error={searchError}
                        athleteProfile={athleteProfile}
                        savedSchools={savedSchools}
                    />
                )

            case 'overview':
                return (
                    <CategoryOverview
                        results={filteredResults}
                        dreamSchool={dreamSchool}
                        athlete={athleteProfile}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onResetFilters={handleResetFilters}
                        onSelectCategory={(cat) => {
                            setSelectedCategory(cat)
                            setView('list')
                        }}
                        onBack={() => setView('search')}
                        onViewMyList={() => setView('mylist')}
                        onFinalize={() => {
                            // Link to Dashboard
                            window.location.href = '/'
                        }}
                    />
                )

            case 'list':
                return (
                    <SchoolList
                        category={selectedCategory}
                        schools={filteredResults[selectedCategory] || []}
                        dreamSchool={dreamSchool}
                        savedSchoolNames={savedSchoolNames}
                        onSelectSchool={(school) => {
                            setSelectedSchool(school)
                            setView('detail')
                        }}
                        onAddToList={handleAddToList}
                        onViewMyList={() => setView('mylist')}
                        onBack={() => setView('overview')}
                    />
                )

            case 'detail':
                return (
                    <SchoolDetail
                        school={selectedSchool}
                        onAddToList={handleAddToList}
                        onViewMyList={() => setView('mylist')}
                        onBack={() => setView('list')}
                        isInList={savedSchoolNames.includes(selectedSchool?.school_name)}
                        athleteId={athleteProfile?.id}
                    />
                )

            case 'mylist':
                return (
                    <MyList
                        user={user}
                        savedSchools={savedSchools}
                        onRemove={handleRemoveFromList}
                        onViewSchool={(school) => {
                            setSelectedSchool(school)
                            setView('detail')
                        }}
                        onAddMore={() => setView('search')}
                        onBack={() => setView('overview')}
                    />
                )

            default:
                return null
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {profileLoading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Loading your compass...</p>
                        </div>
                    </div>
                ) : (
                    renderView()
                )}

                {/* Custom Toast Notification */}
                {showToast && toastConfig && (
                    <Toast
                        message={toastConfig.message}
                        actionLabel={toastConfig.actionLabel}
                        onAction={toastConfig.onAction}
                        secondaryActionLabel={toastConfig.secondaryActionLabel}
                        onSecondaryAction={toastConfig.onSecondaryAction}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
