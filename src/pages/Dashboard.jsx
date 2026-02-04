import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import DashboardLayout from '../components/DashboardLayout'
import {
    Calendar, CheckCircle, Clock, Search, SlidersHorizontal,
    Plus, ChevronRight, Share2, MoreHorizontal, Edit2,
    Trash2, Archive, ExternalLink, PlusCircle, Copy, User as UserIcon, Sparkles, ArrowRight, Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAthletePhase, PHASE_CONFIG, RECRUITING_PHASES } from '../lib/constants'
import WeeklyBriefing from '../components/WeeklyBriefing'
import { getGenAI, getRecruitingInsight } from '../lib/gemini'
import { getSchoolHeat } from '../lib/signalEngine'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { toast } from 'sonner'


export default function Dashboard() {
    const navigate = useNavigate()
    const [coaches, setCoaches] = useState([]) // This will be replaced by suggestedCoaches
    const { user } = useAuth()
    const { activeAthlete, isImpersonating, profile } = useProfile()
    const [stats, setStats] = useState({ eventCount: 0 })
    const [posts, setPosts] = useState([])
    const [activeTab, setActiveTab] = useState('All Sources') // Visual state for tabs
    const [phase, setPhase] = useState('Discovery')
    const [page, setPage] = useState(0) // Changed to 0 for edge function
    const [aiInsight, setAiInsight] = useState(null)
    const [loadingInsight, setLoadingInsight] = useState(false)
    const [suggestedCoaches, setSuggestedCoaches] = useState([])
    const [loadingCoaches, setLoadingCoaches] = useState(false)
    // const COACHES_PER_PAGE = 20 // No longer needed with edge function

    useEffect(() => {
        async function fetchData() {
            // 1. Determine which athlete to view
            // If impersonating, use the active athlete from context.
            // Otherwise, use our own profile (which we know exists because of App.jsx guard).
            let targetAthleteId = null
            let targetGradYear = null

            if (isImpersonating && activeAthlete) {
                targetAthleteId = activeAthlete.id
                targetGradYear = activeAthlete.grad_year
            } else if (profile) {
                targetAthleteId = profile.id
                targetGradYear = profile.grad_year
            }

            if (!targetAthleteId) return

            // 2. Fetch Coaches (Initial Load)
            await loadCoaches(0) // Start from page 0 for edge function

            // 3. Calculate Phase
            const currentPhase = getAthletePhase(targetGradYear)
            setPhase(currentPhase)

            // 4. Get Stats & Recent Posts
            const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('athlete_id', targetAthleteId)
            setStats({ eventCount: count || 0 })

            const { data: recentPosts } = await supabase
                .from('posts')
                .select('*, events(event_name, event_date)')
                .eq('athlete_id', targetAthleteId)
                .order('created_at', { ascending: false })
                .limit(10)

            setPosts(recentPosts || [])
        }
        if (user && (profile || (isImpersonating && activeAthlete))) fetchData()
    }, [user, profile, activeAthlete, isImpersonating, navigate])

    // Load AI Insight
    useEffect(() => {
        async function fetchInsight() {
            if (!user || !phase) return
            setLoadingInsight(true)

            try {
                // Get active athlete ID
                let targetAthleteId = null
                if (isImpersonating && activeAthlete) {
                    targetAthleteId = activeAthlete.id
                } else if (profile) {
                    targetAthleteId = profile.id
                }

                if (!targetAthleteId) return

                // 2. Get saved schools with interactions
                const { data: savedSchools } = await supabase
                    .from('athlete_saved_schools')
                    .select('*, interactions:athlete_interactions(*)')
                    .eq('athlete_id', targetAthleteId)

                if (!savedSchools || savedSchools.length === 0) {
                    setAiInsight({
                        insight: "Your list is empty. Add schools to get relationship insights.",
                        isTractionShift: false,
                        recommendation: "Broaden Search"
                    })
                    return
                }

                // 3. Count high signal schools per division
                const divisionCounts = { D1: 0, D2: 0, D3: 0 }
                savedSchools.forEach(school => {
                    const heat = getSchoolHeat(school.interactions || [])
                    if (heat.bars >= 4) {
                        const div = school.division?.substring(0, 2) || 'D3' // fallback
                        if (divisionCounts[div] !== undefined) {
                            divisionCounts[div]++
                        }
                    }
                })

                // 4. Call Gemini
                const insight = await getRecruitingInsight(phase, divisionCounts)
                setAiInsight(insight)
            } catch (error) {
                console.error("Dashboard Insight error:", error)
            } finally {
                setLoadingInsight(false)
            }
        }
        fetchInsight()
    }, [user, phase, activeAthlete, isImpersonating, profile])

    // Feed Filtering
    const filteredPosts = useMemo(() => {
        if (activeTab === 'All Sources') return posts

        return posts.filter(post => {
            const status = post.status ? post.status.toLowerCase() : 'draft'
            const tab = activeTab.toLowerCase()

            if (tab === 'drafts') return status === 'draft'
            if (tab === 'scheduled') return status === 'scheduled'
            if (tab === 'posted') return status === 'posted' || status === 'published'
            if (tab === 'archived') return status === 'archived'

            return true
        })
    }, [posts, activeTab])

    // 4. LOAD COACHES via EDGE FUNCTION
    const loadCoaches = async (pageNumber, sportOverride = null) => {
        try {
            setLoadingCoaches(true)

            // Get correct athlete ID
            const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('match-coaches', {
                body: {
                    athlete_id: targetAthleteId,
                    page: pageNumber,
                    limit: 3
                }
            })

            if (error) throw error

            // Fallback for empty data or if edge function isn't deployed yet
            // If Edge Function returns nothing, we could fallback to local query or just show empty.
            // For now, let's assume it works or returns { coaches: [] }

            const newCoaches = data?.coaches || []

            if (pageNumber === 0) {
                setSuggestedCoaches(newCoaches)
            } else {
                setSuggestedCoaches(prev => [...prev, ...newCoaches])
            }
            setPage(pageNumber) // Update page state
        } catch (error) {
            console.error('Error loading coaches:', error)
            // Optional: Fallback to local query if needed?
            // setCoachError('Failed to load matches')
        } finally {
            setLoadingCoaches(false)
        }
    }

    const handleFollowCoach = async (coachId) => {
        const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id
        if (!targetAthleteId) {
            toast.error("Could not determine athlete ID.")
            return
        }

        try {
            const { data, error } = await supabase
                .from('athlete_interactions')
                .insert({
                    athlete_id: targetAthleteId,
                    coach_id: coachId,
                    type: 'Coach Follow',
                    interaction_date: new Date().toISOString(),
                    notes: 'Followed coach from dashboard suggestion'
                })
                .select()

            if (error) throw error

            toast.success("Coach followed successfully!")
            // Optionally, refresh coaches or update UI to reflect the follow
            setSuggestedCoaches(prev => prev.map(coach =>
                coach.id === coachId ? { ...coach, is_followed: true } : coach
            ))
        } catch (error) {
            console.error("Error following coach:", error)
            toast.error("Failed to follow coach.")
        }
    }

    const handleEditPost = (postId) => {
        navigate(`/edit-post/${postId}`)
    }

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)

            if (error) throw error

            setPosts(prev => prev.filter(post => post.id !== postId))
            toast.success("Post deleted successfully!")
        } catch (error) {
            console.error("Error deleting post:", error)
            toast.error("Failed to delete post.")
        }
    }

    const handleArchivePost = async (postId) => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({ status: 'Archived' })
                .eq('id', postId)

            if (error) throw error

            setPosts(prev => prev.map(post =>
                post.id === postId ? { ...post, status: 'Archived' } : post
            ))
            toast.success("Post archived successfully!")
        } catch (error) {
            console.error("Error archiving post:", error)
            toast.error("Failed to archive post.")
        }
    }

    const handleSharePost = async (postText) => {
        if (!postText) return

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Athlete Update',
                    text: postText,
                })
                toast.success('Shared successfully!')
            } catch (error) {
                console.error('Error sharing:', error)
            }
        } else {
            try {
                await navigator.clipboard.writeText(postText)
                toast.success('Text copied to clipboard!')
            } catch (error) {
                console.error('Error copying to clipboard:', error)
                toast.error('Failed to copy to clipboard.')
            }
        }
    }

    const handleExploreVibes = () => {
        // Navigates to the Campus Vibes hub
        navigate('/vibes')
    }

    return (
        <DashboardLayout phase={phase}>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-serif font-medium text-gray-900">Content Feed</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${PHASE_CONFIG[phase]?.badgeClass || 'bg-gray-100 text-gray-600'}`}>
                                {phase} Phase
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">Manage your generated posts and upcoming events.</p>
                    </div>
                    <Button onClick={() => navigate('/log-event')} className="bg-brand-primary hover:bg-brand-secondary text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Log New Event
                    </Button>
                </div>

                {/* Filter Tabs (Visual Only for now) */}
                <div className="border-b">
                    <div className="flex gap-8 overflow-x-auto pb-px">
                        {['All Sources', 'Drafts', 'Scheduled', 'Posted', 'Archived'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Feed (2 spans) */}
                    <div className="lg:col-span-2 space-y-6">
                        <WeeklyBriefing phase={phase} />
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PlusCircle className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {activeTab === 'All Sources' ? 'No content yet' : `No ${activeTab.toLowerCase()} found`}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === 'All Sources'
                                        ? 'Hit the Log Event button to start generating content.'
                                        : `Create a new post to populate this tab.`}
                                </p>
                                <Button variant="outline" onClick={() => navigate('/log-event')}>Start Creating &rarr;</Button>
                            </div>
                        ) : (
                            filteredPosts.map(post => (
                                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {post.events?.event_name || "Event Update"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(post.created_at).toLocaleDateString()} • {post.status || 'Draft'}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                                        <span className="sr-only">Options</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Post
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSharePost(post.post_text)}>
                                                        <Share2 className="mr-2 h-4 w-4" /> Share
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleArchivePost(post.id)}>
                                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePost(post.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                            {post.post_text}
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(post.post_text)
                                                    toast.success("Copied to clipboard!")
                                                }}
                                                className="text-xs"
                                            >
                                                <Copy className="w-3 h-3 mr-2" />
                                                Copy Text
                                            </Button>
                                            {/* Placeholder Action */}
                                            <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => handleEditPost(post.id)}>
                                                Edit Post
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Right Column: Sidebar (1 span) */}
                    <div className="space-y-6">
                        {/* Chief of Staff Insight Card */}
                        <Card className="overflow-hidden border-brand-primary/20 bg-gradient-to-br from-white to-brand-primary/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                    <CardTitle className="text-base">Chief of Staff Insight</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingInsight ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : aiInsight ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                            "{aiInsight.insight}"
                                        </p>

                                        {aiInsight.isTractionShift ? (
                                            <div className="space-y-3">
                                                <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-3">
                                                    <p className="text-xs text-cyan-800 font-medium flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3" />
                                                        Level Traction Shift Detected
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => navigate('/compass')}
                                                    className="w-full bg-brand-primary text-white text-xs h-9"
                                                >
                                                    Refine My Compass
                                                    <ArrowRight className="w-3 h-3 ml-2" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    Status: {aiInsight.recommendation === 'Stay Course' ? 'Signal Steady' : 'Broaden Search'}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">
                                                    {aiInsight.recommendation === 'Stay Course' ? 'Keep Grinding' : 'Find Your Fit'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">"Your signal is steady. Stay focused on your development goals."</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Your Impact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-sm">Total Events</span>
                                    <span className="font-bold text-gray-900">{stats.eventCount}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-primary w-[30%]"></div> {/* Fake progress bar */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Coach Suggestions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">Suggested Coaches</CardTitle>
                                    <Button variant="link" className="text-xs px-0 h-auto" onClick={handleExploreVibes}>
                                        {(phase === RECRUITING_PHASES.DISCOVERY || phase === RECRUITING_PHASES.FOUNDATION)
                                            ? "Explore Campus Vibes"
                                            : "View All Coaches"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {coaches.map(c => (
                                    <div key={c.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.school} • {c.sport}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <PlusCircle className="w-4 h-4 text-brand-primary" />
                                        </Button>
                                    </div>
                                ))}
                                {/* Load More Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-brand-primary h-8 mt-2"
                                    onClick={() => loadCoaches(page + 1)}
                                >
                                    Load More
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </DashboardLayout >
    )
}
