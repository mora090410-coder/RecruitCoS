import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { CheckCircle2, Circle, Target, Rocket, Search, Trophy, Calendar, Zap, AlertCircle } from 'lucide-react';
import { PHASE_CONFIG } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { fetchLatestWeeklyPlan } from '../lib/recruitingData';
import { useProfile } from '../hooks/useProfile';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function WeeklyBriefing({ phase }) {
    const { user, activeAthlete, isImpersonating } = useProfile();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = PHASE_CONFIG[phase] || PHASE_CONFIG['Discovery'];

    useEffect(() => {
        async function loadPlan() {
            try {
                const targetId = isImpersonating ? activeAthlete?.id : user?.id;
                if (!targetId) return;

                const data = await fetchLatestWeeklyPlan(targetId);
                // Check if plan is for current week
                if (data) {
                    setPlan(data.plan_json);
                }
            } catch (err) {
                console.error("Failed to load weekly plan:", err);
            } finally {
                setLoading(false);
            }
        }
        loadPlan();
    }, [user, activeAthlete, isImpersonating, phase]);

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
                {plan ? (
                    <div className="space-y-6">
                        {/* Priorities */}
                        <div className="space-y-4">
                            {plan.priorities?.map((p, i) => (
                                <div key={i} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                {p.type === 'Development' ? <Zap className="w-4 h-4 text-amber-500" /> :
                                                    p.type === 'Outreach' ? <Target className="w-4 h-4 text-blue-500" /> :
                                                        <Rocket className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">{p.type}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{p.estimatedMinutes} MIN</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{p.title}</h4>
                                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{p.why}</p>
                                    <div className="space-y-2">
                                        {p.checklist?.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2 group cursor-pointer">
                                                <Circle className="w-4 h-4 text-gray-300 mt-0.5 group-hover:text-brand-primary transition-colors" />
                                                <span className="text-xs text-gray-700 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Focus Schools */}
                        {plan.focusSchools?.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Priority Outreach</div>
                                <div className="space-y-3">
                                    {plan.focusSchools.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                                            <div>
                                                <div className="text-xs font-bold text-gray-900">{s.school}</div>
                                                <div className="text-[10px] text-gray-500">{s.reason}</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                {s.nextAction.split(':')[0]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Watchouts */}
                        {plan.watchouts?.length > 0 && (
                            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Watchouts</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {plan.watchouts.map((w, i) => (
                                        <li key={i} className="text-xs text-rose-700 font-medium flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-300 shrink-0" />
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
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
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <p>{plan ? `Generated on ${format(new Date(plan.computedAt || Date.now()), 'MMM do')}` : 'Standard phase-based guidance'}</p>
                    <div className="flex items-center gap-1 text-brand-primary font-bold cursor-pointer hover:underline">
                        <span>View All Tasks</span>
                        <Rocket className="w-3 h-3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
