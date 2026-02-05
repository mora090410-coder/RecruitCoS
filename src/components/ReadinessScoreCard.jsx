import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Target, TrendingUp, Users, GraduationCap, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReadinessScoreCard({ result, loading }) {
    if (loading) {
        return (
            <Card className="animate-pulse">
                <CardContent className="h-48 flex items-center justify-center">
                    <div className="text-gray-400">Computing Readiness...</div>
                </CardContent>
            </Card>
        );
    }

    if (!result) {
        return (
            <Card className="border-dashed border-2">
                <CardContent className="h-48 flex flex-col items-center justify-center text-center space-y-2">
                    <Target className="w-8 h-8 text-gray-400" />
                    <div className="text-gray-500 font-medium">No Readiness Score Yet</div>
                    <div className="text-xs text-gray-400 max-w-[200px]">
                        Log your latest measurables to compute your readiness.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { readiness_score, pillars_json, narrative_json } = result;

    const pillarIcons = {
        measurables: <Target className="w-4 h-4" />,
        progression: <TrendingUp className="w-4 h-4" />,
        exposure: <Users className="w-4 h-4" />,
        academics: <GraduationCap className="w-4 h-4" />,
        execution: <Zap className="w-4 h-4" />
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-blue-600 bg-blue-50';
        if (score >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider">Recruiting Readiness</h3>
                        <div className="text-5xl font-bold mt-1">{Math.round(readiness_score)}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-xs font-semibold">
                        {readiness_score >= 80 ? 'Elite' : readiness_score >= 60 ? 'Strong' : 'Developing'}
                    </div>
                </div>
            </div>

            <CardContent className="p-6 space-y-6">
                {/* Pillars Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(pillars_json).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 capitalize">
                                {pillarIcons[key]}
                                {key}
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                            <div className="text-xs font-bold text-gray-700">{Math.round(value)}</div>
                        </div>
                    ))}
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            Top Positives
                        </div>
                        <ul className="space-y-2">
                            {narrative_json.topPositives.map((p, i) => (
                                <li key={i} className="text-sm text-gray-700 font-medium flex gap-2">
                                    <span className="text-green-500">•</span> {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                            Strategic Gaps
                        </div>
                        <ul className="space-y-2">
                            {narrative_json.topBlockers.map((b, i) => (
                                <li key={i} className="text-sm text-gray-700 font-medium flex gap-2">
                                    <span className="text-orange-500">•</span> {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Focus Call to Action */}
                {narrative_json.recommendedFocus && narrative_json.recommendedFocus.length > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 rounded-lg p-2 text-white shadow-sm">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-indigo-900/50 uppercase">Recommended Focus</div>
                                <div className="text-sm font-bold text-indigo-900">{narrative_json.recommendedFocus[0]}</div>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline">
                            Action Plan →
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
