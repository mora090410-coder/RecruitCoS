import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { fetchLatestMeasurables } from '../lib/recruitingData';
import { recomputeGap } from '../services/recomputeScores';
import { recomputeAll } from '../services/recomputeAll';
import { getMetricLabel, getMetricOptionsForSport, getMetricUnit } from '../config/sportSchema';
import { normalizeMetricKey, normalizeUnit } from '../lib/normalize';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Activity, Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Measurables() {
    const { profile } = useProfile();
    const [latestGap, setLatestGap] = useState(null);
    const [measurables, setMeasurables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecomputing, setIsRecomputing] = useState(false);

    useEffect(() => {
        if (profile?.id) {
            loadData();
        }
    }, [profile?.id]);

    async function loadData() {
        setIsLoading(true);
        try {
            // Fetch latest gap result
            const { data: gapData } = await supabase
                .from('athlete_gap_results')
                .select('*')
                .eq('athlete_id', profile.id)
                .order('computed_at', { ascending: false })
                .limit(1)
                .single();

            setLatestGap(gapData);

            // Fetch measurables
            const mData = await fetchLatestMeasurables(profile.id);
            setMeasurables(mData);
        } catch (error) {
            console.error('Error loading measurables:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRecompute() {
        const positionGroup = profile?.primary_position_group || profile?.position_group;
        if (!profile?.sport || !positionGroup || !profile?.goals?.division_priority) {
            toast.error("Profile incomplete. Please ensure sport, primary position, and division goals are set.");
            return;
        }

        setIsRecomputing(true);
        try {
            const result = await recomputeAll(profile);
            if (!result?.success) {
                toast.error(result?.reason?.message || "Scoring is currently unavailable.");
                return;
            }
            toast.success(result.summary);
            loadData();
        } catch (error) {
            toast.error("Failed to recompute scores.");
        } finally {
            setIsRecomputing(false);
        }
    }

    return (
        <DashboardLayout phase={profile?.phase}>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-serif">Measurables & Benchmarks</h1>
                        <p className="text-zinc-500 mt-1 uppercase text-xs tracking-widest font-semibold flex items-center gap-2">
                            <Activity className="w-3 h-3 text-brand-primary" />
                            Performance Gap Analysis
                        </p>
                    </div>
                    <Button
                        onClick={handleRecompute}
                        disabled={isRecomputing || isLoading}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
                    >
                        {isRecomputing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                        Run Gap Analysis
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Score Card & Gaps */}
                    <div className="lg:col-span-1 space-y-6">
                        <GapScoreCard result={latestGap} />
                        <MissingMetricsCard metrics={latestGap?.details_json?.missingMetrics} />
                    </div>

                    {/* Right: Data Entry & History */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-xl">
                                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-xs font-semibold uppercase tracking-wider">Historical Data</TabsTrigger>
                                <TabsTrigger value="entry" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-xs font-semibold uppercase tracking-wider">Log New Data</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="mt-6">
                                <MeasurablesList measurables={measurables} benchmarks={latestGap?.details_json?.metricDetails} />
                            </TabsContent>
                            <TabsContent value="entry" className="mt-6">
                                <MeasurableEntryForm athleteId={profile?.id} sport={profile?.sport} onSave={() => { loadData(); }} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function GapScoreCard({ result }) {
    if (!result) {
        return (
            <Card className="border-zinc-200 overflow-hidden shadow-sm">
                <CardHeader className="bg-zinc-50/50 pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Gap Score</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 text-center">
                    <HelpCircle className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">No analysis run yet.</p>
                    <p className="text-zinc-400 text-xs mt-1 italic">Click 'Run Gap Analysis' to compare your stats.</p>
                </CardContent>
            </Card>
        );
    }

    const { gap_score, details_json } = result;
    const scoreColor = gap_score >= 80 ? 'text-emerald-600' : gap_score >= 60 ? 'text-amber-500' : 'text-rose-500';

    return (
        <Card className="border-zinc-200 overflow-hidden shadow-xl ring-1 ring-zinc-200/50">
            <CardHeader className="bg-zinc-50/50 pb-4 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Overall Gap Score</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">{result.target_level}</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
                <div className="text-center">
                    <span className={`text-6xl font-bold tracking-tighter ${scoreColor}`}>
                        {gap_score}
                    </span>
                    <span className="text-zinc-300 text-2xl font-light">/100</span>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-2">Elite Target Match</p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 flex items-center gap-2">
                        <TrendingDown className="w-3 h-3" />
                        Top Performance Gaps
                    </h4>
                    {details_json.topGaps.length > 0 ? (
                        details_json.topGaps.map((gap, idx) => (
                            <div key={idx} className="bg-rose-50/50 p-3 rounded-lg border border-rose-100/50 group hover:border-rose-200 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-rose-900 capitalize">{gap.metric.replace(/_/g, ' ')}</span>
                                    <span className="text-[10px] font-mono text-rose-500">-{Math.round(gap.deltaToP75 * 10) / 10} {gap.unit} to P75</span>
                                </div>
                                <div className="mt-2 w-full bg-rose-200/30 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${gap.metricScore0to1 * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            No major gaps identified!
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function MissingMetricsCard({ metrics = [] }) {
    if (metrics.length === 0) return null;

    return (
        <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-tight text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Recommended Data Points
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {metrics.map((m, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-[10px]">
                            {m.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                </div>
                <p className="text-[10px] text-amber-600 mt-3 leading-relaxed italic border-t border-amber-200/50 pt-2">
                    Adding these metrics will improve your Gap Score accuracy for {metrics[0]?.sport} scouts.
                </p>
            </CardContent>
        </Card>
    );
}

function MeasurablesList({ measurables, benchmarks = [] }) {
    const benchmarkMap = new Map(benchmarks.map(b => [b.metric, b]));

    if (measurables.length === 0) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                <p className="text-zinc-400 text-sm">No performance data logged yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurables.map((m) => {
                const bm = benchmarkMap.get(m.metric);
                const isVerified = m.verified;

                return (
                    <Card key={m.id} className="border-zinc-200 hover:shadow-md transition-shadow group">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold capitalize text-zinc-900 flex items-center gap-2">
                                        {getMetricLabel(m.sport, m.metric)}
                                        {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                    </h4>
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                                        Last Recorded: {new Date(m.measured_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-brand-primary">
                                        {m.value}
                                        <span className="text-xs font-medium text-zinc-400 ml-1">{m.unit}</span>
                                    </span>
                                </div>
                            </div>

                            {bm && (
                                <div className="space-y-3 pt-3 border-t border-zinc-50 group-hover:border-zinc-100 transition-colors">
                                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                        <span>Target P50: {bm.p50}</span>
                                        <span className="text-brand-primary">Elite P90: {bm.p90}</span>
                                    </div>
                                    <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${bm.metricScore0to1 > 0.8 ? 'bg-emerald-500' : 'bg-brand-primary'}`}
                                            style={{ width: `${bm.metricScore0to1 * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function MeasurableEntryForm({ athleteId, sport, onSave }) {
    const [formData, setFormData] = useState({
        metric: '',
        value: '',
        unit: '',
        verified: false,
        measured_at: new Date().toISOString().split('T')[0]
    });
    const [isSaving, setIsSaving] = useState(false);
    const metricOptions = getMetricOptionsForSport(sport);

    const handleMetricChange = (value) => {
        const expectedUnit = getMetricUnit(sport, value);
        setFormData(prev => ({
            ...prev,
            metric: value,
            unit: expectedUnit
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.metric || !formData.value || !formData.unit) return;

        setIsSaving(true);
        try {
            const metricKey = normalizeMetricKey(formData.metric);
            const unitValue = normalizeUnit(formData.unit);

            const { error } = await supabase
                .from('athlete_measurables')
                .insert([{
                    athlete_id: athleteId,
                    sport: sport,
                    ...formData,
                    metric: metricKey,
                    metric_canonical: metricKey,
                    unit: unitValue,
                    unit_canonical: unitValue,
                    value: Number(formData.value)
                }]);

            if (error) throw error;

            toast.success(`${getMetricLabel(sport, formData.metric)} saved!`);
            setFormData({ ...formData, metric: '', value: '', unit: '' });
            onSave();
        } catch (error) {
            toast.error("Error saving data point.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-zinc-200">
            <CardHeader>
                <CardTitle className="text-lg font-serif">Add New Performance Entry</CardTitle>
                <CardDescription>Log your latest stats to update your gap analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Metric Name</label>
                        <select
                            className="w-full bg-zinc-50 border border-zinc-200 h-11 rounded-md px-3 text-sm focus:ring-brand-primary focus:ring-2 outline-none"
                            value={formData.metric}
                            onChange={e => handleMetricChange(e.target.value)}
                            disabled={!sport || metricOptions.length === 0}
                        >
                            <option value="" disabled>{sport ? 'Select a metric' : 'Select sport first'}</option>
                            {metricOptions.map(option => (
                                <option key={option.canonical_key} value={option.canonical_key}>
                                    {option.display_label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Value</label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                className="bg-zinc-50 border-zinc-200 h-11 pr-16 focus:ring-brand-primary"
                            />
                            <div className="absolute right-3 top-2.5">
                                <Input
                                    placeholder="unit"
                                    value={formData.unit}
                                    readOnly
                                    className="h-6 w-12 text-[10px] bg-white p-1 border-zinc-200"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Date Measured</label>
                        <Input
                            type="date"
                            value={formData.measured_at}
                            onChange={e => setFormData({ ...formData, measured_at: e.target.value })}
                            className="bg-zinc-50 border-zinc-200 h-11"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                        <input
                            type="checkbox"
                            id="verified"
                            checked={formData.verified}
                            onChange={e => setFormData({ ...formData, verified: e.target.checked })}
                            className="w-4 h-4 text-brand-primary rounded border-zinc-300 focus:ring-brand-primary"
                        />
                        <label htmlFor="verified" className="text-xs font-bold text-zinc-600 uppercase">Verified via Official Combine/Camp</label>
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                            Log Data Point
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
