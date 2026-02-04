import React, { useState } from 'react';
import { X, Mail, Phone, Tent, MessageSquare, FileText, Calendar, Save, Loader2 } from 'lucide-react';
import { INTERACTION_TYPES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const INTERACTION_ICONS = {
    'Email Sent': Mail,
    'Camp Attended': Tent,
    'Letter Received': FileText,
    'Phone Call': Phone,
    'Social DM': MessageSquare
};

export default function LogInteractionModal({ isOpen, onClose, athleteId, schoolId, schoolName, onSave }) {
    const [type, setType] = useState(INTERACTION_TYPES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('athlete_interactions')
                .insert({
                    athlete_id: athleteId,
                    school_id: schoolId,
                    type,
                    interaction_date: date,
                    notes,
                    intensity_score: 1
                });

            if (error) throw error;

            if (onSave) onSave();
            setNotes(''); // Clear notes after successful save
            onClose();
        } catch (error) {
            console.error('Error saving interaction:', error);
            alert('Failed to save interaction. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const Icon = INTERACTION_ICONS[type] || MessageSquare;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">Log Interaction</h3>
                        <p className="text-xs text-zinc-500 font-medium">{schoolName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Interaction Type */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                            Type of Contact
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                                <Icon className="w-4 h-4" />
                            </div>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-zinc-100/50"
                            >
                                {INTERACTION_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                            Interaction Date
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all hover:bg-zinc-100/50"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                            Notes & Details
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Met Coach Smith, he liked my exit velocity"
                            rows={4}
                            className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none placeholder:text-zinc-400 hover:bg-zinc-100/50"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button
                            disabled={isSaving}
                            type="submit"
                            className="w-full py-6 rounded-2xl bg-zinc-900 hover:bg-zinc-950 text-white font-bold transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 border-none"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    <span>Save Entry</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
