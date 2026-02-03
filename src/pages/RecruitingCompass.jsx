import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { calculateDistance } from '../lib/utils'

// Screen Components
import CompassSearch from '../components/compass/CompassSearch'
import CategoryOverview from '../components/compass/CategoryOverview'
import SchoolList from '../components/compass/SchoolList'
import SchoolDetail from '../components/compass/SchoolDetail'
import MyList from '../components/compass/MyList'

// Gemini initialization moved inside component

export default function RecruitingCompass() {
    const { user } = useAuth()

    // Gemini client (lazy init)
    const [genAI, setGenAI] = useState(null)
    useEffect(() => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY
            if (apiKey) {
                setGenAI(new GoogleGenerativeAI(apiKey))
            } else {
                console.warn('Gemini API key not found')
            }
        } catch (e) {
            console.error('Failed to initialize Gemini:', e)
        }
    }, [])

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
    const [profileLoading, setProfileLoading] = useState(true)

    // Load athlete profile and saved schools on mount
    useEffect(() => {
        async function loadData() {
            setProfileLoading(true)

            // Load profile
            const { data: athlete } = await supabase
                .from('athletes')
                .select('name, position, sport, grad_year, gpa, city, state, dream_school, academic_tier, search_preference, lat, lng')
                .eq('user_id', user.id)
                .single()

            if (athlete) {
                setAthleteProfile({
                    name: athlete.name || 'Athlete',
                    position: athlete.position || 'Not Set',
                    sport: athlete.sport || 'Not Set',
                    gradYear: athlete.grad_year || new Date().getFullYear() + 4,
                    gpa: athlete.gpa || null,
                    academicTier: athlete.academic_tier || 'selective',
                    searchPreference: athlete.search_preference || 'regional',
                    location: [athlete.city, athlete.state].filter(Boolean).join(', ') || 'Unknown',
                    lat: athlete.lat,
                    lng: athlete.lng
                })
                if (athlete.dream_school) {
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
                .select('*')
                .eq('athlete_id', user.id)

            if (saved) {
                const grouped = {
                    reach: saved.filter(s => s.category === 'reach'),
                    target: saved.filter(s => s.category === 'target'),
                    solid: saved.filter(s => s.category === 'solid')
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

    // AI Search
    const handleSearch = async (schoolOverride = null) => {
        const searchSchool = schoolOverride || dreamSchool
        if (!searchSchool.trim()) return

        setLoading(true)
        setResults({ reach: [], target: [], solid: [] })

        try {
            const prompt = `
Role: You are an elite Collegiate Recruiting Advisor with expert knowledge of NCAA athletics, academic requirements, and geographic regions.

Task: Find 35 schools similar to "${searchSchool}" and categorize them for this athlete.

ATHLETE PROFILE:
- Position: ${athleteProfile?.position || 'Unknown'}
- Sport: ${athleteProfile?.sport || 'Unknown'}
- GPA: ${athleteProfile?.gpa || 'Not provided'}
- Academic Tier Preference: ${athleteProfile?.academicTier || 'selective'}
- Home Location: ${athleteProfile?.location || 'Unknown'}
- Search Preference: ${athleteProfile?.searchPreference || 'regional'}
- Graduation Year: ${athleteProfile?.gradYear || 'Unknown'}

CATEGORIZATION RULES:
1. **REACH (10-12 schools):** More competitive than athlete's profile. Higher academic standards or elite athletics. Worth pursuing with strong performance.

2. **TARGET (12-15 schools):** Good fit for current profile. Similar academic/athletic level to "${searchSchool}". Realistic admissions.

3. **SOLID (10-12 schools):** Less competitive options. Strong programs where athlete will likely get serious interest. Reliable fallback options.

IMPORTANT: Generate schools from DIFFERENT REGIONS than "${searchSchool}" to broaden the athlete's horizons.

For each school provide:
- school_name: Full official name
- category: "reach" | "target" | "solid"
- conference: e.g., "Big Ten", "SEC", "ACC"
- division: "D1", "D2", "D3", "NAIA"
- distance_miles: Approximate distance from ${athleteProfile?.location || 'athlete location'}
- atomic_region: e.g., "West Coast", "Midwest", "Northeast", "Southeast", "Southwest"
- athletic_level: "Elite" | "Highly Competitive" | "Competitive" | "Developing"
- academic_selectivity: "Highly Selective" | "Selective" | "Moderately Selective" | "Less Selective"
- gpa_requirement: Typical minimum GPA (number like 3.5)
- insight: One compelling sentence on why this school is a good match (mention conference similarities, program strength, or unique opportunity)

OUTPUT: Valid JSON array only. No markdown, no extra text.
`

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            console.log("Gemini Raw Response:", text)

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
            setView('overview')

        } catch (error) {
            console.error("Gemini Error:", error)
            alert(`Search failed: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Explore based on profile (uses profile data instead of dream school)
    const handleExploreProfile = async () => {
        if (!athleteProfile) return

        // Use a representative school based on their academic tier
        const representativeSchools = {
            'highly_selective': 'Stanford University',
            'selective': 'University of Michigan',
            'moderately_selective': 'University of Arizona',
            'open_admission': 'Community College'
        }

        const representativeSchool = representativeSchools[athleteProfile.academicTier] || 'University of Michigan'

        setDreamSchool(representativeSchool)

        // Pass the school directly to handleSearch to avoid stale state
        await handleSearch(representativeSchool)
    }

    // Add school to saved list
    const handleAddToList = async (school) => {
        try {
            // Sanitize numeric fields - AI sometimes returns "N/A" or strings
            const distanceMiles = parseInt(school.distance_miles, 10)
            const gpaRequirement = parseFloat(school.gpa_requirement)

            const { error } = await supabase
                .from('athlete_saved_schools')
                .insert({
                    athlete_id: user.id,
                    school_name: school.school_name,
                    category: school.category,
                    conference: school.conference,
                    division: school.division,
                    distance_miles: isNaN(distanceMiles) ? null : distanceMiles,
                    athletic_level: school.athletic_level,
                    academic_selectivity: school.academic_selectivity,
                    gpa_requirement: isNaN(gpaRequirement) ? null : gpaRequirement,
                    insight: school.insight
                    // Default 'status' and 'updated_at' handled by DB defaults/triggers
                })

            if (error) {
                if (error.code === '23505') {
                    alert('This school is already in your list!')
                    return
                }
                throw error
            }

            // Update local state
            setSavedSchools(prev => ({
                ...prev,
                [school.category]: [...prev[school.category], school]
            }))

            alert(`${school.school_name} added to your list!`)

        } catch (error) {
            console.error("Error saving school:", error)
            alert('Failed to add school: ' + error.message)
        }
    }

    // Remove school from saved list
    const handleRemoveFromList = async (school) => {
        try {
            const { error } = await supabase
                .from('athlete_saved_schools')
                .delete()
                .eq('athlete_id', user.id)
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
