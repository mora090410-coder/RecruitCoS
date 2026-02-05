import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Plus, Zap, Heart, BarChart3, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import { SCHOOL_STATUSES, STATUS_CONFIG } from '../../lib/constants'
import MyListFilterTabs from './MyListFilterTabs'
import MyListSchoolCard from './MyListSchoolCard'
import { CATEGORIES } from './CategoryBadge'
import { getSchoolHeat } from '../../lib/signalEngine'
import { Progress } from '../ui/progress'
import { Card, CardContent } from '../ui/card'

export default function MyList({
    savedSchools,
    onRemove,
    onViewSchool,
    onAddMore,
    onBack,
    user
}) {
    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')
    const { isImpersonating, activeAthlete } = useProfile()

    useEffect(() => {
        if (user) {
            loadMyList()
        }
    }, [user])

    const loadMyList = async () => {
        setLoading(true)
        try {
            const targetId = isImpersonating ? activeAthlete?.id : user.id
            if (!targetId) return

            const { data, error } = await supabase
                .from('athlete_saved_schools')
                .select('*, interactions:athlete_interactions(*)')
                .eq('athlete_id', targetId)
                .neq('approval_status', 'dismissed')
                .order('created_at', { ascending: false })

            if (error) throw error

            const schoolsWithHeat = (data || []).map(school => ({
                ...school,
                heat: getSchoolHeat(school.interactions || [])
            }))

            setSchools(schoolsWithHeat)
        } catch (error) {
            console.error('Error loading my list:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (schoolId, newStatus) => {
        setSchools(prev => prev.map(s =>
            s.id === schoolId
                ? { ...s, status: newStatus, updated_at: new Date().toISOString() }
                : s
        ))

        try {
            const { error } = await supabase
                .from('athlete_saved_schools')
                .update({ status: newStatus })
                .eq('id', schoolId)

            if (error) throw error
        } catch (error) {
            console.error('Error updating status:', error)
            loadMyList()
            alert('Failed to update status')
        }
    }

    const handleRemoveSchool = async (school) => {
        if (!confirm(`Remove ${school.school_name} from your list?`)) return
        setSchools(prev => prev.filter(s => s.id !== school.id))
        await onRemove(school)
    }

    const handleApproveSuggestion = async (schoolId) => {
        setSchools(prev => prev.map(s =>
            s.id === schoolId ? { ...s, approval_status: 'approved' } : s
        ))

        try {
            const { error } = await supabase
                .from('athlete_saved_schools')
                .update({ approval_status: 'approved' })
                .eq('id', schoolId)

            if (error) throw error
        } catch (error) {
            console.error('Error approving school:', error)
            loadMyList()
            alert('Failed to approve school')
        }
    }

    const handleDismissSuggestion = async (schoolId) => {
        setSchools(prev => prev.filter(s => s.id !== schoolId))

        try {
            const { error } = await supabase
                .from('athlete_saved_schools')
                .update({ approval_status: 'dismissed' })
                .eq('id', schoolId)

            if (error) throw error
        } catch (error) {
            console.error('Error dismissing school:', error)
            loadMyList()
            alert('Failed to dismiss school')
        }
    }

    const counts = useMemo(() => {
        return {
            all: schools.length,
            active: schools.filter(s => s.status === SCHOOL_STATUSES.ACTIVE).length,
            contacted: schools.filter(s => s.status === SCHOOL_STATUSES.CONTACTED).length,
            archived: schools.filter(s => s.status === SCHOOL_STATUSES.ARCHIVED).length
        }
    }, [schools])

    const filteredSchools = useMemo(() => {
        if (activeTab === 'all') return schools
        if (activeTab === 'active') return schools.filter(s => s.status === SCHOOL_STATUSES.ACTIVE)
        if (activeTab === 'contacted') return schools.filter(s => s.status === SCHOOL_STATUSES.CONTACTED)
        if (activeTab === 'archived') return schools.filter(s => s.status === SCHOOL_STATUSES.ARCHIVED)
        return schools
    }, [schools, activeTab])

    const groupedSchools = useMemo(() => {
        const highMatch = filteredSchools.filter(s => s.heat && s.heat.bars >= 4)
        const others = filteredSchools.filter(s => !s.heat || s.heat.bars < 4)

        return {
            highSignal: highMatch,
            reach: others.filter(s => s.category === 'reach'),
            target: others.filter(s => s.category === 'target'),
            solid: others.filter(s => s.category === 'solid')
        }
    }, [filteredSchools])

    const totalCount = schools.length
    const targetCount = 20
    const listProgress = Math.min((totalCount / targetCount) * 100, 100)

    const avgBars = schools.length > 0
        ? schools.reduce((acc, s) => acc + (s.heat?.bars || 0), 0) / schools.length
        : 0

    const momentumLevel = avgBars >= 4 ? 'High' : avgBars >= 2 ? 'Medium' : 'Building'
    const momentumColor = avgBars >= 4 ? 'text-green-600' : avgBars >= 2 ? 'text-orange-500' : 'text-gray-400'

    const renderCategorySection = (categoryId, categorySchools, customConfig = null) => {
        if (categorySchools.length === 0) return null

        const config = customConfig || CATEGORIES[categoryId] || { label: categoryId, color: 'text-gray-900', bg: 'bg-gray-100' }

        return (
            <div key={categoryId} className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${config.color}`}>{config.label}</h2>
                    <div className="h-px flex-1 bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {categorySchools.map(school => (
                        <MyListSchoolCard
                            key={school.id}
                            school={school}
                            onStatusChange={handleStatusChange}
                            onRemove={handleRemoveSchool}
                            onView={onViewSchool}
                            onApprove={handleApproveSuggestion}
                            onDismiss={handleDismissSuggestion}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-3xl font-serif font-medium text-gray-900">Your Recruiting List</h1>
                        </div>
                        <p className="text-gray-500 mt-1 ml-8">Manage relationships and track traction with every program.</p>
                    </div>
                    <Button onClick={onAddMore} className="bg-brand-primary text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schools
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-brand-primary/10">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">List Progression</span>
                                </div>
                                <span className="text-sm font-bold text-brand-primary">{totalCount} / {targetCount} Schools</span>
                            </div>
                            <Progress value={listProgress} className="h-2 bg-gray-100" />
                            <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">Target: 20 active leads for high signal probability.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-brand-primary/10">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recruiting Momentum</span>
                                </div>
                                <span className={`text-sm font-bold ${momentumColor}`}>{momentumLevel} Signal</span>
                            </div>

                            <div className="flex gap-1.5 items-end h-6">
                                {[1, 2, 3, 4, 5].map((bar) => (
                                    <div
                                        key={bar}
                                        className={`flex-1 rounded-sm transition-all duration-500 ${bar <= Math.round(avgBars)
                                                ? (avgBars >= 4 ? 'bg-green-500 h-full' : avgBars >= 2 ? 'bg-orange-400 h-3/4' : 'bg-gray-300 h-1/2')
                                                : 'bg-gray-100 h-1/3'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">Weighted average of outbound traction across your list.</p>
                        </CardContent>
                    </Card>
                </div>

                <MyListFilterTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={counts}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            ) : filteredSchools.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="max-w-sm mx-auto">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your list is empty</h3>
                        <p className="text-gray-500 mb-6">Start building your list by searching for schools that match your profile.</p>
                        <Button onClick={onAddMore} className="bg-brand-primary text-white">
                            Search Schools
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {renderCategorySection('highSignal', groupedSchools.highSignal, {
                        label: 'High Signal Connections',
                        color: 'text-brand-primary',
                        bg: 'bg-brand-primary/10'
                    })}

                    {renderCategorySection('reach', groupedSchools.reach)}
                    {renderCategorySection('target', groupedSchools.target)}
                    {renderCategorySection('solid', groupedSchools.solid)}
                </div>
            )}
        </div>
    )
}
