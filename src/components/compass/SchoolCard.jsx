import { Zap, GraduationCap, MapPin, Plus, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { CATEGORIES, CategoryBadge } from './CategoryBadge'
import SignalMeter from '../crm/SignalMeter'

export default function SchoolCard({
    school,
    onViewDetails,
    onAddToList,
    isInList = false
}) {
    const category = school.category || 'target'
    const config = CATEGORIES[category]

    return (
        <div className={`p-5 rounded-xl border-2 ${config.bgClass} ${config.borderClass} transition-all hover:shadow-lg`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <CategoryBadge category={category} className="mb-2" />
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{school.school_name}</h3>
                        <SignalMeter heat={school.heat} />
                    </div>
                    <p className="text-sm text-gray-500">{school.conference} • {school.division}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{school.athletic_level || 'Competitive'} athletics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>{school.academic_selectivity || 'Selective'} ({school.gpa_requirement || '3.0'}+ GPA)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>~{school.distance_miles || '???'} miles from you</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onViewDetails(school)}
                >
                    Learn More
                </Button>
                <Button
                    size="sm"
                    className={`flex-1 ${isInList ? 'bg-green-600 hover:bg-green-600' : config.buttonClass}`}
                    onClick={() => onAddToList(school)}
                    disabled={isInList}
                >
                    {isInList ? (
                        <>
                            <Check className="w-4 h-4 mr-1" />
                            Added
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add to List
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
