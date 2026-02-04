import React, { useEffect, useState } from 'react';
import { Mail, Phone, Tent, MessageSquare, FileText, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const INTERACTION_ICONS = {
    'Email Sent': Mail,
    'Camp Attended': Tent,
    'Letter Received': FileText,
    'Phone Call': Phone,
    'Social DM': MessageSquare
};

export default function InteractionTimeline({ schoolId }) {
    const [interactions, setInteractions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInteractions() {
            if (!schoolId) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('athlete_interactions')
                    .select('*')
                    .eq('school_id', schoolId)
                    .order('interaction_date', { ascending: false });

                if (error) throw error;
                setInteractions(data || []);
            } catch (error) {
                console.error('Error fetching interactions:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInteractions();
    }, [schoolId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Loading History...</p>
            </div>
        );
    }

    if (interactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 mb-4">
                    <MessageSquare className="w-6 h-6 text-zinc-300" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">No interactions logged yet.</h4>
                <p className="text-xs text-zinc-500 font-medium">Start the conversation and track your progress here!</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-8 pl-4">
            {/* Vertical Line */}
            <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-zinc-100" />

            {interactions.map((interaction, index) => {
                const Icon = INTERACTION_ICONS[interaction.type] || MessageSquare;
                const formattedDate = format(new Date(interaction.interaction_date), 'MMM d, yyyy');

                return (
                    <div key={interaction.id} className="relative flex gap-6 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Icon Node */}
                        <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center shadow-sm">
                            <Icon className="w-3 h-3 text-zinc-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-grow pb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    {interaction.type}
                                </span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded-full border border-zinc-100">
                                    <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-500">
                                        {formattedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm hover:border-zinc-200 transition-all group">
                                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                                    {interaction.notes || "No additional notes provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="pt-2 flex justify-center">
                <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1.5 group">
                    View Full History
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
