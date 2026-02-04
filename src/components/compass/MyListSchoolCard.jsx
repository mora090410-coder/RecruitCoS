import { Eye, Trash2, Check, X, User } from 'lucide-react'
import { Button } from '../ui/button'
import StatusDropdown from './StatusDropdown'
import { formatDistanceToNow } from 'date-fns'
import SignalMeter from '../crm/SignalMeter'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'

export default function MyListSchoolCard({
    school, // This is the saved school record 
    onStatusChange,
    onRemove,
    onView,
    onApprove,
    onDismiss
}) {
    const { user } = useAuth()
    const { isImpersonating } = useProfile()

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

                        {school.approval_status === 'pending' && (
                            <span className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                                <User className="w-3 h-3" />
                                Parent Suggestion
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{school.division}</span>
                        <span>•</span>
                        <span>{school.conference}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {school.approval_status === 'pending' ? 'Suggested ' : 'Updated '}
                        {getLastUpdated()}
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    {school.approval_status === 'pending' ? (
                        <div className="flex items-center gap-2">
                            {!isImpersonating ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onApprove(school.id)}
                                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-9 px-3 gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDismiss(school.id)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0"
                                        title="Dismiss Suggestion"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <span className="text-xs font-medium text-brand-primary bg-brand-primary/5 px-3 py-2 rounded-lg border border-brand-primary/10">
                                    Pending Review
                                </span>
                            )}
                        </div>
                    ) : (
                        <StatusDropdown
                            currentStatus={school.status}
                            onStatusChange={(status) => onStatusChange(school.id, status)}
                        />
                    )}

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
