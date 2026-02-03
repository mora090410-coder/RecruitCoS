import { Target, Check, Shield } from 'lucide-react'

// Category configuration
export const CATEGORIES = {
    reach: {
        id: 'reach',
        label: 'Reach Schools',
        description: 'More competitive programs',
        icon: Target,
        color: 'blue',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        badgeClass: 'bg-blue-100 text-blue-800',
        iconClass: 'text-blue-600',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    target: {
        id: 'target',
        label: 'Target Schools',
        description: 'Good fits for your profile',
        icon: Check,
        color: 'green',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        badgeClass: 'bg-green-100 text-green-800',
        iconClass: 'text-green-600',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    },
    solid: {
        id: 'solid',
        label: 'Solid Schools',
        description: 'Reliable options with strong interest',
        icon: Shield,
        color: 'amber',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-800',
        iconClass: 'text-amber-600',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    }
}

export function CategoryBadge({ category, className = '' }) {
    const config = CATEGORIES[category]
    if (!config) return null

    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeClass} ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    )
}

export default CategoryBadge
