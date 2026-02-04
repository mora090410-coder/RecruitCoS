import { Eye, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import StatusDropdown from './StatusDropdown'
import { formatDistanceToNow } from 'date-fns'
import SignalMeter from '../crm/SignalMeter'

export default function MyListSchoolCard({
    school, // This is the saved school record 
    onStatusChange,
    onRemove,
    onView
}) {
    // Determine last updated text
    const getLastUpdated = () => {
        if (!school.updated_at && !school.created_at) return 'Just now'
        try {
            const date = new Date(school.updated_at || school.created_at)
            return formatDistanceToNow(date, { addSuffix: true })
        } catch (e) {
            return 'Recently'
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* School Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{school.school_name}</h3>
                        <SignalMeter heat={school.heat} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{school.division}</span>
                        <span>•</span>
                        <span>{school.conference}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        Updated {getLastUpdated()}
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <StatusDropdown
                        currentStatus={school.status}
                        onStatusChange={(status) => onStatusChange(school.id, status)}
                    />

                    <div className="flex gap-1 border-l pl-2 ml-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(school)}
                            className="text-gray-500 hover:text-brand-primary hover:bg-blue-50 h-9 w-9 p-0"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(school)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from list"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
