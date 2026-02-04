import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import DashboardLayout from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Video, Instagram, MapPin, Sparkles, ExternalLink, Loader2 } from 'lucide-react'
import { getAthletePhase } from '../lib/constants'

export default function Vibes() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { activeAthlete, isImpersonating, profile } = useProfile()

    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(true)
    const [phase, setPhase] = useState('Discovery')

    useEffect(() => {
        async function loadVibes() {
            try {
                // 1. Determine Target Athlete
                const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id
                const targetGradYear = isImpersonating ? activeAthlete?.grad_year : profile?.grad_year

                if (!targetAthleteId) return

                setPhase(getAthletePhase(targetGradYear))

                // 2. Fetch Saved Schools
                const { data, error } = await supabase
                    .from('athlete_saved_schools')
                    .select('*')
                    .eq('athlete_id', targetAthleteId)
                    .order('created_at', { ascending: false })

                if (error) throw error

                setSchools(data || [])
            } catch (error) {
                console.error("Error loading vibes:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user && (profile || (isImpersonating && activeAthlete))) {
            loadVibes()
        }
    }, [user, profile, activeAthlete, isImpersonating])

    const handleVirtualTour = (schoolName) => {
        const query = encodeURIComponent(`${schoolName} campus tour`)
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }

    const handleSocialVibe = (schoolName) => {
        // Remove spaces for hashtag
        const tag = schoolName.replace(/\s+/g, '').toLowerCase()
        window.open(`https://www.instagram.com/explore/tags/${tag}/`, '_blank')
    }

    return (
        <DashboardLayout phase={phase}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-gray-900">Campus Vibes</h1>
                    <p className="text-gray-500 mt-1">
                        Explore the culture, energy, and environment of your target schools.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </div>
                ) : schools.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No schools saved yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start adding schools to your list to unlock vibe checks.
                        </p>
                        <Button onClick={() => navigate('/compass')}>
                            Go to Recruiting Compass
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schools.map((school) => (
                            <Card key={school.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900">
                                                {school.school_name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {school.division} • {school.conference}
                                            </CardDescription>
                                        </div>
                                        <div className={`
                                            px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${school.category === 'reach' ? 'bg-orange-100 text-orange-700' :
                                                school.category === 'target' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'}
                                        `}>
                                            {school.category}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* AI Culture Snippet Placeholder */}
                                    <div className="bg-brand-primary/5 rounded-lg p-3 border border-brand-primary/10">
                                        <div className="flex items-center gap-2 mb-1 text-brand-primary">
                                            <Sparkles className="w-3 h-3" />
                                            <span className="text-xs font-bold uppercase">Compass Insight</span>
                                        </div>
                                        <p className="text-xs text-gray-700 italic">
                                            "{school.insight || 'Big game energy mixed with top-tier academics.'}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs h-9"
                                            onClick={() => handleVirtualTour(school.school_name)}
                                        >
                                            <Video className="w-3 h-3 mr-2 text-red-600" />
                                            Virtual Tour
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs h-9"
                                            onClick={() => handleSocialVibe(school.school_name)}
                                        >
                                            <Instagram className="w-3 h-3 mr-2 text-pink-600" />
                                            Vibe Check
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
