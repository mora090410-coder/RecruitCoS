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
    Trash2, Archive, ExternalLink, PlusCircle, Copy, User as UserIcon, Sparkles, ArrowRight, Zap,
    Rocket
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
    const { user } = useAuth()
    const { activeAthlete, isImpersonating, profile } = useProfile()
    const [stats, setStats] = useState({ eventCount: 0, targetCount: 0, recentPostCount: 0 })
    const [posts, setPosts] = useState([])
    const [activeTab, setActiveTab] = useState('All Sources')
    const [phase, setPhase] = useState('Foundation (12U)')
    const [aiInsight, setAiInsight] = useState(null)
    const [loadingInsight, setLoadingInsight] = useState(false)
    const [suggestedCoaches, setSuggestedCoaches] = useState([])
    const [loadingCoaches, setLoadingCoaches] = useState(false)
    const [page, setPage] = useState(0)

    useEffect(() => {
        async function fetchData() {
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

            // 1. Load Coaches
            await loadCoaches(0)

            // 2. Calculate Phase
            const currentPhase = getAthletePhase(targetGradYear)
            setPhase(currentPhase)

            // 3. Get Stats
            const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('athlete_id', targetAthleteId)

            const { count: targetCount } = await supabase
                .from('athlete_saved_schools')
                .select('*', { count: 'exact', head: true })
                .eq('athlete_id', targetAthleteId)
                .eq('category', 'target')

            const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            const { count: recentPostCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('athlete_id', targetAthleteId)
                .gt('created_at', fourteenDaysAgo)

            setStats({
                eventCount: eventCount || 0,
                targetCount: targetCount || 0,
                recentPostCount: recentPostCount || 0
            })

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
                let targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id
                if (!targetAthleteId) return

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

                const divisionCounts = { D1: 0, D2: 0, D3: 0 }
                savedSchools.forEach(school => {
                    const heat = getSchoolHeat(school.interactions || [])
                    if (heat.bars >= 4) {
                        const div = school.division?.substring(0, 2) || 'D3'
                        if (divisionCounts[div] !== undefined) {
                            divisionCounts[div]++
                        }
                    }
                })

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

    const loadCoaches = async (pageNumber) => {
        try {
            setLoadingCoaches(true)
            const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id
            const { data, error } = await supabase.functions.invoke('match-coaches', {
                body: { athlete_id: targetAthleteId, page: pageNumber, limit: 3 }
            })
            if (error) throw error
            const newCoaches = data?.coaches || []
            if (pageNumber === 0) {
                setSuggestedCoaches(newCoaches)
            } else {
                setSuggestedCoaches(prev => [...prev, ...newCoaches])
            }
            setPage(pageNumber)
        } catch (error) {
            console.error('Error loading coaches:', error)
        } finally {
            setLoadingCoaches(false)
        }
    }

    const handleFollowCoach = async (coachId) => {
        const targetAthleteId = isImpersonating ? activeAthlete?.id : profile?.id
        if (!targetAthleteId) return

        try {
            const { error } = await supabase
                .from('athlete_interactions')
                .insert({
                    athlete_id: targetAthleteId,
                    coach_id: coachId,
                    type: 'Coach Follow',
                    interaction_date: new Date().toISOString(),
                    notes: 'Followed coach from dashboard suggestion'
                })

            if (error) throw error
            toast.success("Coach followed successfully!")
            setSuggestedCoaches(prev => prev.map(coach =>
                coach.id === coachId ? { ...coach, is_followed: true } : coach
            ))
        } catch (error) {
            toast.error("Failed to follow coach.")
        }
    }

    const handleEditPost = (postId) => navigate(`/edit-post/${postId}`)

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure?")) return
        try {
            await supabase.from('posts').delete().eq('id', postId)
            setPosts(prev => prev.filter(post => post.id !== postId))
            toast.success("Deleted")
        } catch (e) { toast.error("Failed") }
    }

    const handleSharePost = async (postText) => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`
        window.open(twitterUrl, '_blank')
    }

    const ShowcaseReadinessMeter = () => {
        const targetGoal = 10
        const postGoal = 5
        const targetProgress = Math.min((stats.targetCount / targetGoal) * 100, 100)
        const postProgress = Math.min((stats.recentPostCount / postGoal) * 100, 100)
        const overallProgress = (targetProgress + postProgress) / 2

        return (
            <Card className="border-green-100 bg-green-50/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-green-600" />
                            <CardTitle className="text-sm font-bold text-green-900">Showcase Readiness</CardTitle>
                        </div>
                        <span className="text-xs font-bold text-green-700">{Math.round(overallProgress)}%</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                    <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                            <span>Target Engine ({stats.targetCount}/{targetGoal})</span>
                            <span className={stats.targetCount >= targetGoal ? 'text-green-600' : 'text-orange-600'}>
                                {stats.targetCount >= targetGoal ? 'Primed' : 'Building'}
                            </span>
                        </div>
                        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                            <div className={`h-full ${stats.targetCount >= targetGoal ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${targetProgress}%` }} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                            <span>Exposure Momentum ({stats.recentPostCount}/{postGoal})</span>
                            <span className={stats.recentPostCount >= postGoal ? 'text-green-600' : 'text-orange-600'}>
                                {stats.recentPostCount >= postGoal ? 'Active' : 'Low Sig'}
                            </span>
                        </div>
                        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                            <div className={`h-full ${stats.recentPostCount >= postGoal ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${postProgress}%` }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <DashboardLayout phase={phase}>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-serif font-medium text-gray-900">
                                {phase === RECRUITING_PHASES.COMPARISON ? "Mission: Proactive Outreach." : "Content Feed"}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${PHASE_CONFIG[phase]?.badgeClass || 'bg-gray-100 text-gray-600'}`}>
                                {phase.split(' ')[0]} Phase
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">
                            Manage your generated posts and upcoming events.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/log-event')} className="bg-brand-primary hover:bg-brand-secondary text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Log New Event
                    </Button>
                </div>

                <div className="border-b">
                    <div className="flex gap-8 overflow-x-auto pb-px">
                        {['All Sources', 'Drafts', 'Scheduled', 'Posted', 'Archived'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <WeeklyBriefing phase={phase} />
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                <PlusCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No content yet</h3>
                                <Button variant="outline" className="mt-4" onClick={() => navigate('/log-event')}>Start Creating &rarr;</Button>
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
                                                    <p className="font-medium text-gray-900">{post.events?.event_name || "Event Update"}</p>
                                                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()} • {post.status || 'Draft'}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditPost(post.id)}><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSharePost(post.post_text)}><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                            {post.post_text}
                                        </div>

                                        {phase !== RECRUITING_PHASES.FOUNDATION && (
                                            <div className="mt-4 flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(post.post_text)
                                                        toast.success("Copied!")
                                                    }}
                                                    className="text-xs"
                                                >
                                                    <Copy className="w-3 h-3 mr-2" />
                                                    Copy Text
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => handleEditPost(post.id)}>Edit Post</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* September 1st Countdown Widget - Comparison Phase Only */}
                        {phase === RECRUITING_PHASES.COMPARISON && (
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">September 1st Protocol</h3>
                                        <p className="text-white/80 text-xs">Direct Coach Contact Countdown</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                                        <div className="text-2xl font-black">{Math.max(0, Math.ceil((new Date(`09/01/${new Date().getFullYear() + (new Date().getMonth() > 8 ? 1 : 0)}`) - new Date()) / (1000 * 60 * 60 * 24)))}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Days Left</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                                        <div className="text-2xl font-black">Ready</div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Status</div>
                                    </div>
                                </div>
                                <p className="text-sm italic text-white/90">
                                    "Juniors: We transition from 'Grind' to 'Proactive Outreach' on this date. Use this time to clean up your film."
                                </p>
                            </div>
                        )}

                        {phase === RECRUITING_PHASES.IDENTIFICATION && <ShowcaseReadinessMeter />}

                        <Card className="overflow-hidden border-brand-primary/20 bg-gradient-to-br from-white to-brand-primary/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand-primary" />
                                    <CardTitle className="text-base">Chief of Staff Insight</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loadingInsight ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : aiInsight ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-700 leading-relaxed italic">"{aiInsight.insight}"</p>
                                        {aiInsight.isTractionShift && (
                                            <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-3">
                                                <p className="text-xs text-cyan-800 font-medium flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3" />
                                                    Level Traction Shift Detected
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => navigate('/compass')}
                                            className="w-full bg-brand-primary text-white text-xs h-9"
                                        >
                                            Refine My Compass
                                            <ArrowRight className="w-3 h-3 ml-2" />
                                        </Button>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base">Your Impact</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-sm">Total Events</span>
                                    <span className="font-bold text-gray-900">{stats.eventCount}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-primary" style={{ width: '30%' }}></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">Suggested Coaches</CardTitle>
                                    <Button variant="link" className="text-xs px-0 h-auto" onClick={() => navigate('/vibes')}>Explore Vibes</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {suggestedCoaches.map(c => (
                                    <div key={c.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-xs">
                                            <p className="font-medium text-gray-900 truncate">{c.name}</p>
                                            <p className="text-gray-500 truncate">{c.school}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFollowCoach(c.id)}>
                                            <PlusCircle className="w-4 h-4 text-brand-primary" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full text-xs text-brand-primary h-8 mt-2" onClick={() => loadCoaches(page + 1)}>
                                    Load More
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
