import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Slider } from '../ui/slider'
import { Target, Trophy, MapPin, Sparkles } from 'lucide-react'

const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA']
const GEOGRAPHIES = [
    { id: 'homegrown', label: 'Homegrown', sub: 'Within 150 miles' },
    { id: 'regional', label: 'Regional', sub: 'Within 500 miles' },
    { id: 'national', label: 'National', sub: 'Coast to Coast' }
]

export default function RecruitingGoals({ goals, onChange, athleteLocation }) {
    // Local derived state for UI simplicity if needed, but we reflect directly to parent

    const handleDivisionToggle = (div) => {
        onChange({ ...goals, division_priority: div.toLowerCase() })
    }

    const getStrategyPreview = () => {
        const objective = goals.primary_objective <= 30 ? 'Prestige-focused' :
            goals.primary_objective >= 70 ? 'Playing Time-focused' : 'Balanced'

        const geoLabel = GEOGRAPHIES.find(g => g.id === goals.geographic_preference)?.label || 'Regional'
        const region = athleteLocation?.state || 'the country'

        return `You are looking for a ${objective} experience in ${geoLabel === 'Homegrown' ? 'your backyard' : geoLabel === 'Regional' ? 'the ' + region : 'the ' + geoLabel}.`
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Division Priority - Toggle Group Style */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-bold text-zinc-400 flex items-center gap-2 tracking-widest uppercase">
                        <Trophy className="w-3.5 h-3.5 text-green-400" />
                        Card 1: Division Focus
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-2">
                        {DIVISIONS.map(div => (
                            <button
                                key={div}
                                type="button"
                                onClick={() => handleDivisionToggle(div)}
                                className={`py-3 rounded-xl text-sm font-black transition-all border-2 ${goals.division_priority === div.toLowerCase()
                                    ? 'bg-green-400/10 border-green-400 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                    }`}
                            >
                                {div}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Objective Slider */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-bold text-zinc-400 flex items-center gap-2 tracking-widest uppercase">
                        <Target className="w-3.5 h-3.5 text-green-400" />
                        Card 2: Primary Objective
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-4">
                    <div className="px-2">
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={goals.primary_objective ?? 50}
                            onChange={(e) => onChange({ ...goals, primary_objective: parseInt(e.target.value) })}
                        />
                        <div className="flex justify-between mt-4">
                            <div className="text-center">
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${goals.primary_objective <= 40 ? 'text-green-400' : 'text-zinc-600'}`}>Prestige</span>
                            </div>
                            <div className="text-center">
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${goals.primary_objective >= 60 ? 'text-green-400' : 'text-zinc-600'}`}>Playing Time</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Geography Selectable Cards */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-bold text-zinc-400 flex items-center gap-2 tracking-widest uppercase">
                        <MapPin className="w-3.5 h-3.5 text-green-400" />
                        Card 3: Geographic Reach
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-2">
                        {GEOGRAPHIES.map(geo => (
                            <button
                                key={geo.id}
                                type="button"
                                onClick={() => onChange({ ...goals, geographic_preference: geo.id })}
                                className={`p-3 rounded-xl text-left transition-all border-2 ${goals.geographic_preference === geo.id
                                    ? 'bg-green-400/10 border-green-400 text-green-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                    }`}
                            >
                                <div className={`text-[10px] font-black uppercase mb-1 ${goals.geographic_preference === geo.id ? 'text-green-400' : 'text-white'}`}>
                                    {geo.label}
                                </div>
                                <div className="text-[8px] opacity-70 leading-tight">
                                    {geo.sub}
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Supplemental Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Academic Major</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="text"
                            placeholder="e.g. Business, Pre-Med"
                            value={goals.academic_interest || ''}
                            onChange={(e) => onChange({ ...goals, academic_interest: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-green-400 outline-none transition-all"
                        />
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">The "North Star"</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="text"
                            placeholder="e.g. Stanford University"
                            value={goals.north_star || ''}
                            onChange={(e) => onChange({ ...goals, north_star: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-green-400 outline-none transition-all"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dynamic Strategy Preview */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400/20 to-brand-primary/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
                    </div>
                    <p className="text-sm text-zinc-300 font-medium italic">
                        "{getStrategyPreview()}"
                    </p>
                </div>
            </div>
        </div>
    )
}
