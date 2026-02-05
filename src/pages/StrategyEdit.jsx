import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import DashboardLayout from '../components/DashboardLayout'
import RecruitingGoals from '../components/profile/RecruitingGoals'
import { Button } from '../components/ui/button'
import { ChevronLeft, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function StrategyEdit() {
    const { user } = useAuth()
    const { athleteProfile, refreshProfile } = useProfile()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [goals, setGoals] = useState(null)

    useEffect(() => {
        if (athleteProfile?.goals) {
            setGoals(athleteProfile.goals)
        }
    }, [athleteProfile])

    const handleSave = async () => {
        if (!user || !goals) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('athletes')
                .update({ goals })
                .eq('id', user.id)

            if (error) throw error

            await refreshProfile()
            toast.success('Strategy updated successfully')
            navigate('/compass')
        } catch (err) {
            console.error('Error updating strategy:', err)
            toast.error('Failed to update strategy')
        } finally {
            setLoading(false)
        }
    }

    if (!goals) return null

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/compass')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Compass</span>
                    </button>
                    <div className="flex items-center gap-2 text-green-400">
                        <Sparkles className="w-5 h-5" />
                        <h1 className="text-xl font-bold uppercase tracking-widest text-white">Refine Strategy</h1>
                    </div>
                </div>

                <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 md:p-8">
                    <RecruitingGoals
                        goals={goals}
                        onChange={setGoals}
                        athleteLocation={{
                            city: athleteProfile?.city,
                            state: athleteProfile?.state
                        }}
                    />

                    <div className="mt-10 flex gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 h-14 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20"
                        >
                            {loading ? 'Saving...' : 'Save Strategy Blueprint'}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/compass')}
                            className="h-14 px-8 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-2xl"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
