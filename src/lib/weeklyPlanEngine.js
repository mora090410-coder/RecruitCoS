/**
 * Weekly Plan Engine
 * Generates a structured, data-driven weekly plan for athletes.
 */
import { startOfWeek, format } from 'date-fns';
import { PHASE_CONFIG } from './constants.js';

export function generateWeeklyPlan({
    phase,
    gapResult = {},
    readinessResult = {},
    savedSchools = [], // includes interactions and interest
    upcomingEvents = [],
    recentPostsCount = 0
}) {
    const today = new Date();
    const weekOf = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const topGaps = gapResult.topGaps || [];
    const recommendedFocus = readinessResult.recommendedFocus || "Continue developing your recruiting profile.";
    const topBlockers = readinessResult.topBlockers || [];

    // 1. Priorities
    const priorities = [];

    // Development Priority (Gaps & Readiness)
    const devTasks = [...(PHASE_CONFIG[phase]?.tasks || [])];
    if (topGaps.length > 0) {
        devTasks.unshift(`Work on improving: ${topGaps.slice(0, 2).join(', ')}`);
    }

    priorities.push({
        type: "Development",
        title: "Pillar Progression",
        why: recommendedFocus,
        estimatedMinutes: 90,
        checklist: devTasks.slice(0, 3)
    });

    // Outreach Priority (Interactions & Stale Schools)
    const staleThreshold = 21; // days
    const staleSchools = savedSchools.filter(school => {
        const lastInteraction = school.interactions?.length > 0
            ? new Date(Math.max(...school.interactions.map(i => new Date(i.created_at))))
            : null;

        if (!lastInteraction) return false;
        const diffDays = Math.floor((today - lastInteraction) / (1000 * 60 * 60 * 24));
        return diffDays >= staleThreshold;
    });

    const outreachChecklist = [];
    if (staleSchools.length > 0) {
        outreachChecklist.push(`Re-engage with ${staleSchools[0].school_name} (stale for 21+ days)`);
    } else {
        outreachChecklist.push("Follow up with your 'Active' targeted schools");
    }
    outreachChecklist.push("Personalize intro emails for 2 new schools");

    priorities.push({
        type: "Outreach",
        title: "Communication Strike",
        why: staleSchools.length > 0
            ? `You have ${staleSchools.length} schools that haven't been contacted in 3 weeks.`
            : "Keep your outreach momentum trending upward.",
        estimatedMinutes: 60,
        checklist: outreachChecklist
    });

    // Content Priority
    const contentChecklist = [];
    if (recentPostsCount === 0) {
        contentChecklist.push("Post one training clip or academic update to X");
    } else {
        contentChecklist.push("Engage with 3 college coach posts on social");
    }

    priorities.push({
        type: "Content",
        title: "Brand Awareness",
        why: recentPostsCount < 2 ? "Consistent posting increases your visibility to scouts." : "Keep building your digital footprint.",
        estimatedMinutes: 30,
        checklist: contentChecklist
    });

    // 2. Watchouts
    const watchouts = [...topBlockers];
    if (upcomingEvents.length > 0) {
        watchouts.push(`${upcomingEvents.length} event(s) coming up in the next 14 days.`);
    }
    if (watchouts.length === 0) {
        watchouts.push("No immediate blockers identified. Stay productive!");
    }

    // 3. Focus Schools
    const focusSchools = savedSchools
        .filter(s => s.interest)
        .sort((a, b) => b.interest.interest_score - a.interest.interest_score)
        .slice(0, 3)
        .map(s => ({
            school: s.school_name,
            reason: s.interest.drivers_json?.[0] || "High strategic interest fit",
            nextAction: s.interest.next_action
        }));

    return {
        weekOf,
        priorities,
        watchouts,
        focusSchools,
        computedAt: new Date().toISOString()
    };
}
