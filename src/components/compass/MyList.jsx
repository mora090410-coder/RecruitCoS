import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import { SCHOOL_STATUSES, STATUS_CONFIG } from '../../lib/constants'
import MyListFilterTabs from './MyListFilterTabs'
import MyListSchoolCard from './MyListSchoolCard'
import { CATEGORIES } from './CategoryBadge'

export default function MyList({
    savedSchools, // Passed from parent (legacy prop, we'll reload fresh data)
    onRemove, // Passed from parent
    onViewSchool,
    onAddMore,
    onBack,
    user // Need user ID for RLS
}) {
    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    // Initial load
    useEffect(() => {
        loadMyList()
    }, [])

    const loadMyList = async () => {
        setLoading(true)
        try {
            // Get current user if not passed
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (!currentUser) return // Should be handled by AuthContext but safe guard

            const { data, error } = await supabase
                .from('athlete_saved_schools')
                .select('*')
                .eq('athlete_id', currentUser.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSchools(data || [])
        } catch (error) {
            console.error('Error loading my list:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (schoolId, newStatus) => {
        // Optimistic update
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
            loadMyList() // Revert on error
            alert('Failed to update status')
        }
    }

    const handleRemoveSchool = async (school) => {
        if (!confirm(`Remove ${school.school_name} from your list?`)) return

        // Optimistic remove from local state
        setSchools(prev => prev.filter(s => s.id !== school.id))

        // Call parent handler which does the DB delete
        await onRemove(school)
    }

    // Calculate counts
    const counts = useMemo(() => {
        return {
            all: schools.length,
            active: schools.filter(s => s.status === SCHOOL_STATUSES.ACTIVE).length,
            contacted: schools.filter(s => s.status === SCHOOL_STATUSES.CONTACTED).length,
            archived: schools.filter(s => s.status === SCHOOL_STATUSES.ARCHIVED).length
        }
    }, [schools])

    // Filter schools
    const filteredSchools = useMemo(() => {
        if (activeTab === 'all') return schools
        if (activeTab === 'active') return schools.filter(s => s.status === SCHOOL_STATUSES.ACTIVE)
        if (activeTab === 'contacted') return schools.filter(s => s.status === SCHOOL_STATUSES.CONTACTED)
        if (activeTab === 'archived') return schools.filter(s => s.status === SCHOOL_STATUSES.ARCHIVED)
        return schools
    }, [schools, activeTab])

    // Group by category for display
    const groupedSchools = useMemo(() => {
        return {
            reach: filteredSchools.filter(s => s.category === 'reach'),
            target: filteredSchools.filter(s => s.category === 'target'),
            solid: filteredSchools.filter(s => s.category === 'solid')
        }
    }, [filteredSchools])

    const totalCount = schools.length
    const targetCount = 20
    const progress = Math.min((totalCount / targetCount) * 100, 100)

    const renderCategorySection = (categoryId, categorySchools) => {
        if (categorySchools.length === 0) return null

        const config = CATEGORIES[categoryId]
        const Icon = config.icon

        return (
            <div key={categoryId} className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-1.5 rounded-full ${config.bgClass}`}>
                        <Icon className={`w-4 h-4 ${config.iconClass}`} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{config.label.toUpperCase()}</h2>
                    <span className="text-sm text-gray-400 font-medium">({categorySchools.length})</span>
                </div>

                <div className="grid gap-3">
                    {categorySchools.map(school => (
                        <MyListSchoolCard
                            key={school.id}
                            school={school}
                            onStatusChange={handleStatusChange}
                            onRemove={handleRemoveSchool}
                            onView={onViewSchool}
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
            </div>

            {/* Title & Progress */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                        📋 MY TARGET LIST
                    </h1>
                    <p className="text-gray-500">
                        Manage your recruiting pipeline and track communication.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 min-w-[240px] border border-gray-100">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-gray-600">List Goal</span>
                        <span className="text-gray-900">{totalCount}/{targetCount} schools</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-primary to-green-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <MyListFilterTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
            />

            {/* Empty State */}
            {filteredSchools.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="max-w-xs mx-auto">
                        <p className="text-gray-900 font-medium mb-1">
                            {activeTab === 'all' ? "Your list is empty" : `No schools in '${activeTab}'`}
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            {activeTab === 'all'
                                ? "Start searching to find your perfect fit."
                                : `Update school statuses to see them here.`}
                        </p>
                        {activeTab === 'all' && (
                            <Button onClick={onAddMore}>
                                <Plus className="w-4 h-4 mr-2" />
                                Find Schools
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Schools List - Grouped by Category */}
            {renderCategorySection('reach', groupedSchools.reach)}
            {renderCategorySection('target', groupedSchools.target)}
            {renderCategorySection('solid', groupedSchools.solid)}

            {/* Global Actions */}
            {totalCount > 0 && (
                <div className="flex gap-4 pt-8 border-t">
                    <Button
                        variant="outline"
                        onClick={onAddMore}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Find More Schools
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-gray-500"
                        onClick={() => window.print()}
                    >
                        Export as PDF
                    </Button>
                </div>
            )}
        </div>
    )
}
