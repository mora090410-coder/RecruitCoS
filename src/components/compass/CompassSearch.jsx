import { Search, Sparkles, User } from 'lucide-react'
import { Button } from '../ui/button'

const POPULAR_SCHOOLS = ['Stanford', 'Ohio State', 'UCLA', 'Florida', 'Alabama', 'Duke']

export default function CompassSearch({
    dreamSchool,
    setDreamSchool,
    onSearch,
    onExploreProfile,
    loading,
    retryStatus,
    athleteProfile,
    error
}) {
    const handleQuickPick = (school) => {
        setDreamSchool(school)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
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

            {/* Search Input */}
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

            {/* Popular Picks */}
            <div className="mb-8">
                <span className="text-sm text-gray-500">Popular: </span>
                {POPULAR_SCHOOLS.map((school, idx) => (
                    <button
                        key={school}
                        onClick={() => handleQuickPick(school)}
                        className="text-sm text-brand-primary hover:text-brand-secondary hover:underline mx-1"
                    >
                        {school}{idx < POPULAR_SCHOOLS.length - 1 && ' •'}
                    </button>
                ))}
            </div>

            {/* Primary CTA */}
            <Button
                onClick={onSearch}
                disabled={loading || !dreamSchool.trim()}
                className="w-full max-w-sm h-14 text-lg bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mb-6"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        {retryStatus || 'Finding Schools...'}
                    </span>
                ) : (
                    'Find Similar Schools'
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
                    Using: {athleteProfile.sport} • {athleteProfile.position} • {athleteProfile.location}
                </div>
            )}
        </div>
    )
}
