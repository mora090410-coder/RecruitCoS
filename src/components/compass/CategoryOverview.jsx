import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { CATEGORIES } from './CategoryBadge'
import CompassFilters from './CompassFilters'

export default function CategoryOverview({
    results,
    dreamSchool,
    onSelectCategory,
    onBack,
    onViewMyList,
    filters,
    onFiltersChange,
    onResetFilters
}) {
    // Flatten all schools to calculate totals
    const allSchools = useMemo(() => {
        return [
            ...(results.reach || []),
            ...(results.target || []),
            ...(results.solid || [])
        ]
    }, [results])

    const totalFiltered = allSchools.length

    const renderCategoryCard = (categoryId) => {
        const config = CATEGORIES[categoryId]
        const schools = results[categoryId] || []

        const previewSchools = schools.slice(0, 3)
        const Icon = config.icon

        return (
            <div
                key={categoryId}
                className={`p-6 rounded-2xl border-2 ${config.bgClass} ${config.borderClass} transition-all hover:shadow-lg cursor-pointer ${schools.length === 0 ? 'opacity-60 grayscale' : ''}`}
                onClick={() => schools.length > 0 && onSelectCategory(categoryId)}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.badgeClass}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{config.label.toUpperCase()}</h3>
                        <p className="text-sm text-gray-500">{config.description}</p>
                    </div>
                </div>

                {/* Preview Schools */}
                <div className="mb-4">
                    {schools.length > 0 ? (
                        <>
                            <p className="text-gray-700">
                                {previewSchools.map(s => s.school_name).join(' • ')}
                            </p>
                            {schools.length > 3 && (
                                <p className="text-sm text-gray-400 mt-1">+ {schools.length - 3} more schools</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400 italic">No matches with current filters</p>
                    )}
                </div>

                {/* CTA */}
                <Button
                    className={`w-full ${config.buttonClass}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelectCategory(categoryId)
                    }}
                    disabled={schools.length === 0}
                >
                    View {schools.length} {config.label}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Search
                </button>
                <Button variant="outline" size="sm" onClick={onViewMyList}>
                    📋 My List
                </Button>
            </div>

            {/* Title */}
            <div className="text-center py-4">
                <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    🎯 Based on {dreamSchool}
                </h1>
                <p className="text-gray-500">
                    We found <span className="font-semibold text-gray-900">{totalFiltered} schools</span> similar to {dreamSchool}.
                </p>
            </div>

            {/* Filters component */}
            <CompassFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                totalSchools={totalFiltered}
                onReset={onResetFilters}
            />

            {/* No Results Message */}
            {totalFiltered === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center animate-in fade-in">
                    <p className="text-yellow-900 font-medium mb-2">
                        No schools match your current filters
                    </p>
                    <p className="text-yellow-700 text-sm mb-4">
                        Try adjusting your filters or click Reset to see all results.
                    </p>
                    <Button
                        onClick={onResetFilters}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        Reset Filters
                    </Button>
                </div>
            )}

            {/* Category Cards */}
            <div className="grid gap-6">
                {renderCategoryCard('reach')}
                {renderCategoryCard('target')}
                {renderCategoryCard('solid')}
            </div>

            {/* Search Again */}
            <div className="text-center pt-4">
                <button
                    onClick={onBack}
                    className="text-brand-primary hover:underline text-sm"
                >
                    Search Again
                </button>
            </div>
        </div>
    )
}
