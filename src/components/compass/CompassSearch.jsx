import { Search, Sparkles, User, Target } from 'lucide-react'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'

const POPULAR_SCHOOLS = ['Stanford', 'Ohio State', 'UCLA', 'Florida', 'Alabama', 'Duke']

export default function CompassSearch({
    dreamSchool,
    setDreamSchool,
    onSearch,
    onExploreProfile,
    onViewMyList,
    loading,
    retryStatus,
    athleteProfile,
    error,
    savedSchools = { reach: [], target: [], solid: [] }
}) {
    const navigate = useNavigate()
    const handleQuickPick = (school) => {
        setDreamSchool(school)
    }

    // Check if any category has 5+ schools
    const hasEnoughSchools = Object.values(savedSchools).some(list => list.length >= 5)
    const totalSaved = Object.values(savedSchools).flat().length

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            {/* View My List Shortcut (if they have schools) */}
            {totalSaved > 0 && (
                <button
                    onClick={onViewMyList}
                    className="mb-4 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100 flex items-center gap-2 hover:bg-green-100 transition-colors animate-in fade-in slide-in-from-top-4"
                >
                    📋 {totalSaved} schools in your list. <span className="underline">View My List</span>
                </button>
            )}

            {/* Hero */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                    🎯 YOUR RECRUITING COMPASS
                </h1>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                    Find schools that match your profile—organized by Reach, Target, and Solid options.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-600 max-w-lg w-full animate-in fade-in slide-in-from-top-2">
                    <p className="font-medium">Search Issue</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Strategic Summary Card */}
            {athleteProfile?.goals ? (
                <div className="w-full max-w-lg mb-8 p-6 bg-white rounded-2xl border-2 border-brand-primary/10 shadow-xl shadow-brand-primary/5 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-brand-primary" />
                            STRATEGIC RECRUITMENT SUMMARY
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/strategy')}
                            className="text-[10px] uppercase font-bold text-brand-primary h-6"
                        >
                            Adjust Goals
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Division Priority</p>
                            <p className="text-sm font-bold text-gray-700 capitalize">
                                {athleteProfile.goals.division_priority || 'Universal'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">North Star School</p>
                            <p className="text-sm font-bold text-gray-700">
                                {athleteProfile.goals.north_star || 'Not Specified'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Primary Objective</p>
                            <p className="text-sm font-bold text-gray-700 capitalize">
                                {(athleteProfile.goals.primary_objective || 50) <= 40 ? 'Program Prestige' : (athleteProfile.goals.primary_objective || 50) >= 60 ? 'Early Impact' : 'Balanced Fit'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Academic Interest</p>
                            <p className="text-sm font-bold text-gray-700 truncate">
                                {athleteProfile.goals.academic_interest || 'General Studies'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Fallback Search Input if no profile/goals */
                <div className="w-full max-w-lg mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Start with a school you're interested in:
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={dreamSchool}
                            onChange={(e) => setDreamSchool(e.target.value)}
                            placeholder="University of Texas"
                            className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            )}

            {/* Popular Picks (Only if no North Star) */}
            {(!athleteProfile?.goals?.north_star && !dreamSchool) && (
                <div className="mb-8">
                    <span className="text-sm text-gray-500">Popular: </span>
                    {POPULAR_SCHOOLS.map((school, idx) => (
                        <button
                            key={school}
                            onClick={() => handleQuickPick(school)}
                            className="rc-link mx-1 text-sm"
                        >
                            {school}{idx < POPULAR_SCHOOLS.length - 1 && ' •'}
                        </button>
                    ))}
                </div>
            )}

            {/* Primary CTA */}
            <Button
                onClick={onSearch} // handleSearch will handle the logic
                disabled={loading}
                className={`w-full max-w-sm h-14 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mb-6 bg-brand-primary hover:bg-brand-secondary text-white shadow-brand-primary/20`}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        {retryStatus || 'Building Blueprint...'}
                    </span>
                ) : (
                    'Generate My Recruiting Blueprint'
                )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full max-w-sm mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Secondary CTA */}
            <Button
                variant="outline"
                onClick={onExploreProfile}
                disabled={loading}
                className="w-full max-w-sm h-12 text-gray-700 border-2 border-gray-200 hover:border-gray-300 rounded-xl"
            >
                <User className="w-4 h-4 mr-2" />
                Explore Based on My Profile
            </Button>

            {/* Profile Summary */}
            {athleteProfile && (
                <div className="mt-6 text-xs text-gray-400">
                    Using: {athleteProfile.sport} • {athleteProfile.positionDisplay || athleteProfile.position} • {athleteProfile.location}
                </div>
            )}
        </div>
    )
}
