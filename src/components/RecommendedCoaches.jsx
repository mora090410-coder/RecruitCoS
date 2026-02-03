import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'

export default function RecommendedCoaches({ athlete, selectedCoaches, onSelect }) {
    const [recommended, setRecommended] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const PER_PAGE = 5

    useEffect(() => {
        if (athlete?.id) {
            loadRecommendations(1)
        }
    }, [athlete]) // Removed selectedCoaches dependency to avoid reset on selection

    const loadRecommendations = async (pageNumber) => {
        setLoading(true)
        try {
            // Get coaches matching athlete's profile
            let query = supabase
                .from('coaches')
                .select('*')

            // Basic optimization: if no specific preferences, just get some coaches
            if (athlete.sport) {
                query = query.eq('sport', athlete.sport)
            }

            // Filter by division if available
            if (athlete.target_divisions && athlete.target_divisions.length > 0) {
                query = query.in('division', athlete.target_divisions)
            }

            // Pagination using Range
            const from = (pageNumber - 1) * PER_PAGE
            const to = from + PER_PAGE - 1
            const { data, error } = await query.range(from, to)

            if (error) throw error

            // Filter out already selected locally (client side filter might reduce count, but simpler for now)
            const newCoaches = data?.filter(
                coach => !selectedCoaches.find(c => c.id === coach.id)
            ) || []

            if (pageNumber === 1) {
                setRecommended(newCoaches)
            } else {
                setRecommended(prev => [...prev, ...newCoaches])
            }
            setPage(pageNumber)

        } catch (err) {
            console.error("Error loading recommendations:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading || recommended.length === 0) return null

    return (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Suggested for You</h3>
            <p className="text-xs text-gray-500 mb-4">
                Based on your profile ({athlete.target_divisions?.join(', ') || 'recruiting targets'})
            </p>

            <div className="space-y-2">
                {recommended.map(coach => (
                    <div key={coach.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                        <div>
                            <p className="font-medium text-sm text-gray-900">{coach.name}</p>
                            <p className="text-xs text-gray-500">{coach.school} ({coach.division})</p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelect(coach)}
                            className="h-8 text-xs bg-white group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all"
                        >
                            + Add
                        </Button>
                    </div>
                ))}

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-400 hover:text-brand-primary mt-2"
                    onClick={() => loadRecommendations(page + 1)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Load More Coaches'}
                </Button>
            </div>
        </div>
    )
}
