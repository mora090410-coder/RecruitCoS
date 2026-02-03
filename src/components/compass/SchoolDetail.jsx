import { ChevronLeft, Zap, GraduationCap, MapPin, Users, Trophy, ExternalLink, Plus, Check, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { CATEGORIES, CategoryBadge } from './CategoryBadge'

export default function SchoolDetail({
    school,
    onAddToList,
    onBack,
    isInList = false
}) {
    const category = school.category || 'target'
    const config = CATEGORIES[category]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <CategoryBadge category={category} />
            </div>

            {/* School Header */}
            <div className={`p-6 rounded-2xl ${config.bgClass} ${config.borderClass} border-2`}>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{school.school_name}</h1>
                <p className="text-gray-600">{school.conference} • {school.division}</p>

                <Button
                    className={`mt-4 ${isInList ? 'bg-green-600 hover:bg-green-600' : config.buttonClass}`}
                    onClick={() => onAddToList(school)}
                    disabled={isInList}
                >
                    {isInList ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Added to My List
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to My List
                        </>
                    )}
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    📊 Quick Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Athletic Level</p>
                            <p className="font-semibold text-gray-900">{school.athletic_level || 'Competitive'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Academic Selectivity</p>
                            <p className="font-semibold text-gray-900">{school.academic_selectivity || 'Selective'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Distance</p>
                            <p className="font-semibold text-gray-900">~{school.distance_miles || '???'} miles</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Typical GPA</p>
                            <p className="font-semibold text-gray-900">{school.gpa_requirement || '3.0'}+</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why It's a Match */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    Why It's a Match
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    {school.insight || 'This school matches your profile based on athletic competitiveness, academic standards, and geographic preferences.'}
                </p>
            </div>

            {/* Useful Links */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    🔗 Useful Links
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="text-gray-600">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Athletic Website
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Roster
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600">
                        Coach Contact
                    </Button>
                </div>
            </div>

            {/* Sticky CTA */}
            <div className="sticky bottom-4 pt-4">
                <Button
                    className={`w-full h-12 ${isInList ? 'bg-green-600 hover:bg-green-600' : config.buttonClass}`}
                    onClick={() => onAddToList(school)}
                    disabled={isInList}
                >
                    {isInList ? (
                        <>
                            <Check className="w-5 h-5 mr-2" />
                            Added to My List
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5 mr-2" />
                            Add to My List
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
