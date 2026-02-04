import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { CheckCircle2, Circle, Target, Rocket, Search, Trophy } from 'lucide-react';
import { PHASE_CONFIG } from '../lib/constants';

export default function WeeklyBriefing({ phase }) {
    const config = PHASE_CONFIG[phase] || PHASE_CONFIG['Discovery'];

    const getIcon = () => {
        switch (phase) {
            case 'Discovery': return <Search className="w-5 h-5 text-slate-500" />;
            case 'Foundation': return <Target className="w-5 h-5 text-blue-500" />;
            case 'Exposure': return <Rocket className="w-5 h-5 text-green-500" />;
            case 'Commitment': return <Trophy className="w-5 h-5 text-amber-500" />;
            default: return <Circle className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-white mb-8">
            <div className={`h-1.5 w-full ${config.badgeClass.split(' ')[0].replace('bg-', 'bg-')}`}
                style={{ backgroundColor: phase === 'Commitment' ? '#f59e0b' : undefined }}
            />
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg ${config.badgeClass}`}>
                        {getIcon()}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Phase: {config.title}
                    </span>
                </div>
                <CardTitle className="text-2xl font-serif">Weekly Briefing</CardTitle>
                <p className="text-gray-600 font-medium">
                    Current Focus: <span className="text-gray-900">{config.focus}</span>
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {config.tasks.map((task, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                        >
                            <Circle className="w-5 h-5 text-gray-300 mt-0.5 group-hover:text-brand-primary transition-colors" />
                            <span className="text-sm text-gray-700 leading-relaxed font-medium">
                                {task}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <p>Updated based on your highlight reel performance</p>
                    <div className="flex items-center gap-1 text-brand-primary font-bold">
                        <span>View All Tasks</span>
                        <Rocket className="w-3 h-3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
