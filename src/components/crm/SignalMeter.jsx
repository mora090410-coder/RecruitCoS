import React from 'react';
import { cn } from '../../lib/utils';

/**
 * SignalMeter Component
 * Visualizes relationship heat as vertical signal bars (iPhone style).
 * 
 * @param {Object} heat - The heat object containing score, label, bars, and color.
 * @param {boolean} showLabel - Whether to show the text label next to bars.
 */
export default function SignalMeter({ heat, showLabel = false, className }) {
    const { score = 0, label = 'COLD', bars = 1, color = 'text-zinc-300' } = heat || {};

    // Define bar heights as percentages
    const barHeights = ['20%', '40%', '60%', '80%', '100%'];

    // Determine if we should use green for higher levels
    const isHighSignal = bars >= 4;
    const activeBarColor = isHighSignal ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';

    return (
        <div className={cn("flex flex-col gap-1 group relative cursor-default", className)}>
            <div className="flex items-end gap-[2px] h-4">
                {[0, 1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        style={{ height: barHeights[index] }}
                        className={cn(
                            "w-[3px] rounded-full transition-all duration-500",
                            index < bars
                                ? activeBarColor
                                : "bg-zinc-800"
                        )}
                    />
                ))}

                {/* Tooltip-like label on hover */}
                <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-zinc-900 border border-zinc-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-xl">
                        <span className="font-bold">{label}</span> • {heat.count || 0} interaction{heat.count !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {showLabel && (
                <span className={cn("text-[10px] font-bold tracking-tight uppercase", color)}>
                    {label}
                </span>
            )}
        </div>
    );
}
