export default function MyListFilterTabs({ activeTab, onTabChange, counts }) {
    const tabs = [
        { id: 'all', label: 'All Schools', count: counts.all },
        { id: 'active', label: 'Active', count: counts.active },
        { id: 'contacted', label: 'Contacted', count: counts.contacted },
        { id: 'archived', label: 'Archived', count: counts.archived }
    ]

    return (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold leading-none ${activeTab === tab.id
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>
    )
}
