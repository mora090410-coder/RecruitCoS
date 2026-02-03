import { useState } from 'react';

export default function CompassFilters({
    filters,
    onFiltersChange,
    totalSchools,
    onReset
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const divisions = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
    const regions = [
        'West Coast',
        'Southwest',
        'Midwest',
        'Southeast',
        'Northeast',
        'Pacific',
        'Ai Match'
    ];

    const handleDivisionToggle = (division) => {
        const newDivisions = filters.divisions.includes(division)
            ? filters.divisions.filter(d => d !== division)
            : [...filters.divisions, division];

        onFiltersChange({ ...filters, divisions: newDivisions });
    };

    const handleDistanceChange = (distance) => {
        onFiltersChange({ ...filters, distance });
    };

    const handleRegionToggle = (region) => {
        const newRegions = filters.regions.includes(region)
            ? filters.regions.filter(r => r !== region)
            : [...filters.regions, region];

        onFiltersChange({ ...filters, regions: newRegions });
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            {/* Header with Expand/Collapse */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">🎛️ Refine Results</span>
                    <span className="text-sm text-gray-600">
                        Showing {totalSchools} schools
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onReset}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        {isExpanded ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
            </div>

            {/* Filter Controls (Collapsible) */}
            {isExpanded && (
                <div className="space-y-4">
                    {/* Division Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Division
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {divisions.map(div => (
                                <button
                                    key={div}
                                    onClick={() => handleDivisionToggle(div)}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${filters.divisions.includes(div)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    {div}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distance Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Distance
                        </label>
                        <div className="flex gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="distance"
                                    value="close"
                                    checked={filters.distance === 'close'}
                                    onChange={(e) => handleDistanceChange(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Close (&lt;200 miles)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="distance"
                                    value="regional"
                                    checked={filters.distance === 'regional'}
                                    onChange={(e) => handleDistanceChange(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Regional (&lt;800 miles)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="distance"
                                    value="national"
                                    checked={filters.distance === 'national'}
                                    onChange={(e) => handleDistanceChange(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">National (anywhere)</span>
                            </label>
                        </div>
                    </div>

                    {/* Region Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Regions (select multiple or leave blank for all)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {regions.map(region => (
                                <button
                                    key={region}
                                    onClick={() => handleRegionToggle(region)}
                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filters.regions.includes(region)
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                        }`}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
