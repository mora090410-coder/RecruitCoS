import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'
import { toast } from 'sonner'
import { MapPin, Trophy, Users, GraduationCap, Save } from 'lucide-react'

export default function RecruitingGoals() {
    const { profile, refreshProfile } = useProfile()
    const [loading, setLoading] = useState(false)
    const [goals, setGoals] = useState({
        division_priority: 'any',
        geographic_preference: 'national',
        academic_interest: '',
        primary_objective: 'prestige'
    })

    useEffect(() => {
        if (profile?.goals) {
            setGoals(profile.goals)
        }
    }, [profile])

    const handleUpdateGoals = async () => {
        if (!profile?.id) return
        setLoading(true)
        try {
            const { error } = await supabase
                .from('athletes')
                .update({ goals })
                .eq('id', profile.id)

            if (error) throw error
            toast.success("Strategic goals updated!")
            refreshProfile()
        } catch (err) {
            console.error("Update goals error:", err)
            toast.error("Failed to save goals")
        } finally {
            setLoading(false)
        }
    }

    const zones = [
        { id: 'national', label: 'National', description: 'Anywhere in the US' },
        { id: 'regional', label: 'Regional', description: 'Within 500 miles' },
        { id: 'local', label: 'Local', description: 'Home state only' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-medium text-gray-900">Strategic Recruiting Goals</h2>
                    <p className="text-gray-500 text-sm">Fine-tune your Chief of Staff's weighting algorithm.</p>
                </div>
                <Button
                    onClick={handleUpdateGoals}
                    disabled={loading}
                    className="bg-brand-primary text-white"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Goals'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-brand-primary/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-brand-primary" />
                            Recruiting Priority
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <span className={goals.primary_objective === 'playing_time' ? 'text-brand-primary' : ''}>Maximum Playing Time</span>
                            <span className={goals.primary_objective === 'prestige' ? 'text-brand-primary' : ''}>Maximum Prestige (D1)</span>
                        </div>
                        <Slider
                            value={[goals.primary_objective === 'prestige' ? 100 : 0]}
                            max={100}
                            step={100}
                            onValueChange={(val) => setGoals(prev => ({
                                ...prev,
                                primary_objective: val[0] === 100 ? 'prestige' : 'playing_time'
                            }))}
                        />
                        <p className="text-xs text-gray-500 italic">
                            {goals.primary_objective === 'prestige'
                                ? "Priority: Targeting the biggest brands and top-tier D1 exposure."
                                : "Priority: Targeting programs where you can make an immediate impact on the field."}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-brand-primary/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-primary" />
                            Division Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {['D1', 'D2', 'D3', 'NAIA', 'any'].map((div) => (
                                <Badge
                                    key={div}
                                    variant={goals.division_priority === div ? 'default' : 'outline'}
                                    className={`cursor-pointer px-4 py-1 ${goals.division_priority === div ? 'bg-brand-primary' : ''}`}
                                    onClick={() => setGoals(prev => ({ ...prev, division_priority: div }))}
                                >
                                    {div.toUpperCase()}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Only recommend schools in your preferred division. Set to 'ANY' for widest discovery.
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-brand-primary/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-primary" />
                            Geographic Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {zones.map((zone) => (
                                <div
                                    key={zone.id}
                                    onClick={() => setGoals(prev => ({ ...prev, geographic_preference: zone.id }))}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${goals.geographic_preference === zone.id
                                            ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <p className="font-bold text-gray-900">{zone.label}</p>
                                    <p className="text-xs text-gray-500">{zone.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-brand-primary/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-brand-primary" />
                            Academic & Major Interests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={goals.academic_interest}
                            onChange={(e) => setGoals(prev => ({ ...prev, academic_interest: e.target.value }))}
                            placeholder="e.g. Sports Management, Civil Engineering, Business..."
                            className="w-full h-24 p-3 text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary transition-all resize-none"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
