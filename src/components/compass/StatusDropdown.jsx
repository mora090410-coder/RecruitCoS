import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { SCHOOL_STATUSES, STATUS_CONFIG } from '../../lib/constants'

export default function StatusDropdown({ currentStatus = 'no_contact', onStatusChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleStatusSelect = async (newStatus) => {
        await onStatusChange(newStatus)
        setIsOpen(false)
    }

    const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG[SCHOOL_STATUSES.NO_CONTACT]

    // Color mapping for badge styles
    const getColorStyles = (color) => {
        switch (color) {
            case 'green': return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
            case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            case 'red': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
            case 'orange': return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
            default: return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current Status Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${getColorStyles(currentConfig.color)}`}
            >
                <span>{currentConfig.icon}</span>
                <span>{currentConfig.label}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <button
                                key={status}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusSelect(status)
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${status === currentStatus ? 'bg-gray-50' : ''}`}
                            >
                                <span className="text-xl mt-0.5">{config.icon}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">{config.label}</div>
                                    <div className="text-xs text-gray-500">{config.description}</div>
                                </div>
                                {status === currentStatus && (
                                    <Check className="w-5 h-5 text-brand-primary mt-1" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
