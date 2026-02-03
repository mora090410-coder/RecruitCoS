import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'

export default function RecommendedCoaches({ athlete, selectedCoaches, onSelect }) {
    const [recommended, setRecommended] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (athlete?.id) {
            loadRecommendations()
        }
    }, [athlete, selectedCoaches])

    const loadRecommendations = async () => {
        setLoading(true)
        try {
            // Get coaches matching athlete's profile
            // Note: target_divisions and preferred_regions are arrays
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

            // Limit results
            const { data, error } = await query.limit(5)

            if (error) throw error

            // Filter out already selected locally
            const filtered = data?.filter(
                coach => !selectedCoaches.find(c => c.id === coach.id)
            ) || []

            setRecommended(filtered)
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
            </div>
        </div>
    )
}
