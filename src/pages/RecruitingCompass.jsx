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

    // Load athlete profile and saved schools on mount
    useEffect(() => {
        async function loadData() {
            if (import.meta.env.DEV) console.log('Loading profile for user:', user?.id)
            setProfileLoading(true)

            // Load profile
            const { data: athlete, error: athleteError } = await supabase
                .from('athletes')
                .select('id, name, position, sport, grad_year, gpa, city, state, dream_school, academic_tier, search_preference, latitude, longitude')
                .eq('user_id', user.id)
                .single()

            if (import.meta.env.DEV && (athlete || athleteError)) {
                console.log('Athlete query result:', { athlete, athleteError })
                if (athleteError) console.error('❌ Athlete query FAILED:', athleteError.message, athleteError.code)
            }

            if (athlete) {
                if (import.meta.env.DEV) console.log('🎯 Loaded dream_school from DB:', athlete.dream_school)
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
                    dreamSchool: athlete.dream_school || '', // Store persistent DB value
                    lat: athlete.latitude,
                    lng: athlete.longitude
                })
                if (athlete.dream_school) {
                    if (import.meta.env.DEV) console.log('🎯 Setting dreamSchool state to:', athlete.dream_school)
                    setDreamSchool(athlete.dream_school)
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
    const handleSearch = async (schoolOverride = null) => {
        const rawSchool = schoolOverride || dreamSchool
        if (!rawSchool || !rawSchool.trim()) return

        const searchSchool = sanitizeInput(rawSchool)

        // Debounce check (5 seconds)
        const now = Date.now()
        if (now - lastSearchTime < 5000) {
            console.warn("Search throttled: Please wait before searching again.")
            return
        }
        setLastSearchTime(now)

        setLoading(true)
        setSearchError(null)
        // setResults({ reach: [], target: [], solid: [] }) // REMOVED TO PERSIST RESULTS

        try {
            // CACHE CHECK
            // Generate a simple key based on school and user's primary characteristics
            // Ideally we'd hash the whole profile, but user requested dream_school + athlete_id
            const queryKey = `${searchSchool}_${JSON.stringify({
                sport: athleteProfile?.sport,
                gpa: athleteProfile?.gpa,
                tier: athleteProfile?.academicTier
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
            const systemInstruction = `You are an elite Collegiate Recruiting Advisor with expert knowledge of NCAA athletics, academic requirements, and geographic regions.

OUTPUT FORMAT:
Return ONLY a valid JSON array matching this schema:
${JSON.stringify(SCHOOL_SCHEMA, null, 2)}

CATEGORIZATION RULES:
1. REACH (10-12 schools): More competitive than athlete's profile. Higher academic standards or elite athletics.
2. TARGET (12-15 schools): Good fit for current profile. Similar academic/athletic level. Realistic admissions.
3. SOLID (10-12 schools): Less competitive options. Strong programs with likely serious interest.

REQUIREMENTS:
- Include schools from DIFFERENT REGIONS to broaden horizons
- Each insight should be one compelling sentence explaining the match
- Use accurate conference and division information
- Distance estimates should be reasonable based on athlete location`

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
            const prompt = `CONTEXT (Athlete Profile):
- Reference School: ${searchSchool}
- Position: ${sanitizeInput(athleteProfile?.position) || 'Unknown'}
- Sport: ${sanitizeInput(athleteProfile?.sport) || 'Unknown'}
- GPA: ${sanitizeInput(athleteProfile?.gpa) || 'Not provided'}
- Academic Tier: ${sanitizeInput(athleteProfile?.academicTier) || 'selective'}
- Home Location: ${sanitizeInput(athleteProfile?.location) || 'Unknown'}
- Search Preference: ${sanitizeInput(athleteProfile?.searchPreference) || 'regional'}
- Graduation Year: ${sanitizeInput(athleteProfile?.gradYear) || 'Unknown'}

INSTRUCTION:
Find 35 schools similar to "${searchSchool}" and categorize them as reach, target, or solid based on this athlete's profile.`

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

    // Explore based on profile (uses profile data instead of dream school)
    const handleExploreProfile = async () => {
        console.log('handleExploreProfile triggered')

        // 1. PRIORITY: Check for Existing Dream School in DB PROFILE (Source of Truth)
        // We use the DB value if available to ensure "Michigan" bug doesn't happen for users who set a school.
        if (athleteProfile?.dreamSchool && athleteProfile.dreamSchool.trim() !== '') {
            console.log('Using persistent DB dream school:', athleteProfile.dreamSchool)
            setDreamSchool(athleteProfile.dreamSchool) // Sync UI
            await handleSearch(athleteProfile.dreamSchool)
            return
        }

        // 2. Check current UI state (fallback if profile not loaded or empty)
        if (dreamSchool && dreamSchool.trim() !== '') {
            console.log('Using current UI input dream school:', dreamSchool)
            await handleSearch(dreamSchool)
            return
        }

        // 3. Fallback: Use a representative school based on their academic tier
        const representativeSchools = {
            'highly_selective': 'Stanford University',
            'selective': 'University of Michigan',
            'moderately_selective': 'University of Arizona',
            'open_admission': 'Community College'
        }

        const tier = athleteProfile?.academicTier || 'selective'
        const representativeSchool = representativeSchools[tier] || 'University of Michigan'

        console.log('No dream school set in profile or UI. Using fallback:', representativeSchool)
        setDreamSchool(representativeSchool)
        await handleSearch(representativeSchool)
    }

    // Add school to saved list
    // Add school to saved list
    const handleAddToList = async (school) => {
        try {
            // Sanitize numeric fields
            const distanceMiles = parseInt(school.distance_miles, 10)
            const gpaRequirement = parseFloat(school.gpa_requirement)

            // Determine targeting
            const targetAthleteId = isImpersonating ? activeAthlete?.id : user?.id
            if (!targetAthleteId) throw new Error("No target athlete found")

            // Determine approval status
            const approvalStatus = isImpersonating ? 'pending' : 'approved'

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
                    gpa_requirement: isNaN(gpaRequirement) ? null : gpaRequirement,
                    insight: school.insight,
                    added_by: user.id,
                    approval_status: approvalStatus
                })

            if (error) {
                if (error.code === '23505') {
                    alert('This school is already in your list!')
                    return
                }
                throw error
            }

            // Update local state
            const schoolWithStatus = {
                ...school,
                approval_status: approvalStatus,
                added_by: user.id,
                athlete_id: targetAthleteId
            }
            setSavedSchools(prev => ({
                ...prev,
                [school.category]: [...prev[school.category], schoolWithStatus]
            }))

            alert(isImpersonating ? `Suggestion for ${school.school_name} sent to athlete!` : `${school.school_name} added to your list!`)

        } catch (error) {
            console.error("Error saving school:", error)
            alert('Failed to add school: ' + error.message)
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
                        loading={loading}
                        retryStatus={retryStatus}
                        error={searchError}
                        athleteProfile={athleteProfile}
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
                        onBack={() => setView('overview')}
                    />
                )

            case 'detail':
                return (
                    <SchoolDetail
                        school={selectedSchool}
                        onAddToList={handleAddToList}
                        onBack={() => setView('list')}
                        isInList={savedSchoolNames.includes(selectedSchool?.school_name)}
                        athleteId={athleteProfile?.id}
                    />
                )

            case 'mylist':
                return (
                    <MyList
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
            </div>
        </DashboardLayout>
    )
}
