import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { CATEGORIES } from './CategoryBadge'
import SchoolCard from './SchoolCard'

export default function SchoolList({
    category,
    schools,
    dreamSchool,
    savedSchoolNames,
    onSelectSchool,
    onAddToList,
    onViewMyList,
    onBack
}) {
    const [showCount, setShowCount] = useState(6)
    const config = CATEGORIES[category]
    const Icon = config.icon

    const visibleSchools = schools.slice(0, showCount)
    const hasMore = schools.length > showCount

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Categories
                </button>
            </div>

            {/* Title */}
            <div className={`p-4 rounded-xl ${config.bgClass} ${config.borderClass} border-2`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.badgeClass}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{config.label.toUpperCase()}</h1>
                        <p className="text-sm text-gray-500">Similar to {dreamSchool} • {schools.length} schools</p>
                    </div>
                </div>
            </div>

            {/* School Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {visibleSchools.map((school) => (
                    <SchoolCard
                        key={school.school_name}
                        school={school}
                        onViewDetails={onSelectSchool}
                        onAddToList={onAddToList}
                        onViewMyList={onViewMyList}
                        isInList={savedSchoolNames.includes(school.school_name)}
                    />
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="text-center pt-4">
                    <button
                        onClick={() => setShowCount(prev => prev + 6)}
                        className="text-brand-primary hover:underline font-medium"
                    >
                        Show {Math.min(6, schools.length - showCount)} more schools...
                    </button>
                </div>
            )}
        </div>
    )
}
