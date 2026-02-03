import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import DashboardLayout from '../components/DashboardLayout'
import { PlusCircle, Copy, Calendar, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const [coaches, setCoaches] = useState([])
    const { user } = useAuth()
    const [stats, setStats] = useState({ eventCount: 0 })
    const [posts, setPosts] = useState([])
    const [activeTab, setActiveTab] = useState('All Sources') // Visual state for tabs

    useEffect(() => {
        async function fetchData() {
            // Fetch coaches preview
            const { data: coachesData } = await supabase.from('coaches').select('*').limit(20)
            setCoaches(coachesData || [])

            // Fetch stats for current user
            // Fetch stats for current user
            const { data: athlete, error } = await supabase.from('athletes').select('id').eq('user_id', user.id).single()

            if (error || !athlete) {
                navigate('/setup')
                return
            }

            if (athlete) {
                // Get Stats
                const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('athlete_id', athlete.id)
                setStats({ eventCount: count || 0 })

                // Get Recent Posts
                const { data: recentPosts } = await supabase
                    .from('posts')
                    .select('*, events(event_name, event_date)')
                    .eq('athlete_id', athlete.id)
                    .order('created_at', { ascending: false })
                    .limit(10)

                setPosts(recentPosts || [])
            }
        }
        if (user) fetchData()
    }, [user])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-serif font-medium text-gray-900">Content Feed</h1>
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
                        {posts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PlusCircle className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No content yet</h3>
                                <p className="text-gray-500 mb-6">Hit the Log Event button to start generating content.</p>
                                <Button variant="outline" onClick={() => navigate('/log-event')}>Start Creating &rarr;</Button>
                            </div>
                        ) : (
                            posts.map(post => (
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
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <span className="sr-only">Options</span>
                                                <span className="text-bold text-gray-400">...</span>
                                            </Button>
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
                                                    alert("Copied to clipboard!")
                                                }}
                                                className="text-xs"
                                            >
                                                <Copy className="w-3 h-3 mr-2" />
                                                Copy Text
                                            </Button>
                                            {/* Placeholder Action */}
                                            <Button variant="ghost" size="sm" className="text-xs text-gray-500">
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
                                    <Button variant="link" className="text-xs px-0 h-auto">View All</Button>
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
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
