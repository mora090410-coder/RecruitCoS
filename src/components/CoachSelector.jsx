import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import RecommendedCoaches from './RecommendedCoaches'

export default function CoachSelector({ athlete, selectedCoaches, onSelect, onRemove }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        divisions: []
    })

    // Debounce search
    useEffect(() => {
        const timeOutId = setTimeout(async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setSearching(true)
            let queryBuilder = supabase
                .from('coaches')
                .select('*')
                .or(`name.ilike.%${query}%,school.ilike.%${query}%,conference.ilike.%${query}%`)

            // Apply filtering if user toggles them
            if (filters.divisions.length > 0) {
                queryBuilder = queryBuilder.in('division', filters.divisions)
            }

            const { data, error } = await queryBuilder.limit(10)

            if (error) {
                console.error("Search error:", error)
            } else {
                setResults(data || [])
            }
            setSearching(false)
        }, 300)

        return () => clearTimeout(timeOutId)
    }, [query, filters])

    const toggleFilter = (div) => {
        setFilters(prev => ({
            divisions: prev.divisions.includes(div)
                ? prev.divisions.filter(d => d !== div)
                : [...prev.divisions, div]
        }))
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Tag Coaches (Optional)</label>
                <span className="text-xs text-gray-400">{selectedCoaches.length}/5 Selected</span>
            </div>

            {/* Selected Coaches - Chips */}
            {selectedCoaches.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCoaches.map(coach => {
                        const handle = coach.twitter_handle || 'no_handle';
                        const displayHandle = handle.startsWith('@') ? handle : '@' + handle;
                        return (
                            <div key={coach.id} className="bg-white border border-brand-primary text-brand-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
                                <div className="flex flex-col leading-none">
                                    <span className="font-semibold text-xs">{coach.name}</span>
                                    <span className="text-[10px] opacity-75">{coach.school}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(coach.id)}
                                    className="hover:text-red-500 font-bold ml-1 text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Input
                    placeholder="Search name, school (e.g. 'Sarkisian' or 'Texas')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pr-10"
                />
                {searching && <div className="absolute right-3 top-2.5 text-xs text-gray-400 animate-pulse">Searching...</div>}

                {/* Filters */}
                {query.length > 1 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map(div => (
                            <button
                                key={div}
                                type="button"
                                onClick={() => toggleFilter(div)}
                                className={`text-xs px-2 py-1 rounded-md border transition-colors ${filters.divisions.includes(div)
                                        ? 'bg-zinc-800 text-white border-zinc-800'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                                    }`}
                            >
                                {div}
                            </button>
                        ))}
                    </div>
                )}

                {/* Results Dropdown */}
                {results.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                        {results.map(coach => (
                            <div
                                key={coach.id}
                                className="p-3 hover:bg-zinc-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center group transition-colors"
                                onClick={() => {
                                    if (selectedCoaches.length >= 5) {
                                        alert("Max 5 coaches allowed")
                                        return
                                    }
                                    onSelect(coach)
                                    setQuery('')
                                    setResults([])
                                }}
                            >
                                <div>
                                    <p className="font-medium text-gray-900 group-hover:text-brand-primary transition-colors">{coach.name}</p>
                                    <p className="text-xs text-gray-500">{coach.school} • <span className="text-zinc-400">{coach.division}</span></p>
                                </div>
                                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">@{coach.twitter_handle?.replace('@', '')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recommendations - Only show if no search query */}
            {!query && (
                <RecommendedCoaches
                    athlete={athlete}
                    selectedCoaches={selectedCoaches}
                    onSelect={(coach) => {
                        if (selectedCoaches.length >= 5) {
                            alert("Max 5 coaches allowed")
                            return
                        }
                        onSelect(coach)
                    }}
                />
            )}
        </div>
    )
}
