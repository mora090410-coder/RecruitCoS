import { ChevronLeft, Zap, GraduationCap, MapPin, Users, Trophy, ExternalLink, Plus, Check, Sparkles, MessageSquare } from 'lucide-react'
import { Button } from '../ui/button'
import { CATEGORIES, CategoryBadge } from './CategoryBadge'
import InteractionTimeline from '../crm/InteractionTimeline'
import LogInteractionModal from '../crm/LogInteractionModal'
import { useState } from 'react'

export default function SchoolDetail({
    school,
    onAddToList,
    onBack,
    isInList = false,
    athleteId
}) {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false)
    const [timelineKey, setTimelineKey] = useState(0)
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

            {/* Relationship Manager Section */}
            {isInList && (
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-zinc-100 transition-colors duration-500" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 leading-tight">Interaction History</h2>
                            <p className="text-xs text-zinc-400 font-medium">Track your journey with {school.school_name}</p>
                        </div>
                        <Button
                            onClick={() => setIsLogModalOpen(true)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-11 font-bold shadow-lg shadow-zinc-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Log New Contact
                        </Button>
                    </div>

                    <div className="relative min-h-[200px]">
                        <InteractionTimeline key={timelineKey} schoolId={school.id} />
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-50">
                        <p className="text-[10px] text-zinc-400 font-medium italic leading-relaxed text-center">
                            Note: Logged interactions are for your tracking. Ensure all outreach complies with the NCAA Recruiting Calendar for your age.
                        </p>
                    </div>
                </div>
            )}

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

            {/* Modal */}
            {isLogModalOpen && (
                <LogInteractionModal
                    isOpen={isLogModalOpen}
                    onClose={() => setIsLogModalOpen(false)}
                    athleteId={athleteId}
                    schoolId={school.id}
                    schoolName={school.school_name}
                    onSave={() => {
                        setTimelineKey(prev => prev + 1)
                    }}
                />
            )}

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
