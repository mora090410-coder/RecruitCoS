import { saveWeeklyPlan, insertWeeklyPlanItems } from './recruitingData'
import { getCurrentWeekStartDate } from '../services/weeklyPlanService'

const PHASE_ACTIONS = {
    foundation: {
        gap: {
            title: 'Focus: Build Athletic Baseline',
            description: (sport, position) => `Run 2 position-specific work sessions for ${sport} and log one measurable for ${position.toLowerCase()}.`
        },
        strength: {
            title: 'Start: School Research',
            description: (divisionText) => `Research 5 programs in ${divisionText} any location and save your top matches.`
        },
        phase: {
            title: 'Create: Skills Highlight',
            description: (position) => `Record a 30-second clip this week showing game-speed reps at ${position.toLowerCase()}.`
        }
    },
    awareness: {
        gap: {
            title: 'Focus: Develop Position Skills',
            description: (sport, position) => `Complete 2 focused ${sport} sessions this week and log one performance note for ${position.toLowerCase()}.`
        },
        strength: {
            title: 'Start: School Research',
            description: (divisionText) => `Build a shortlist of 5 schools across ${divisionText} that fit your current goals.`
        },
        phase: {
            title: 'Create: Skills Highlight',
            description: (position) => `Share one updated ${position.toLowerCase()} clip with your family recruiting workflow.`
        }
    },
    engagement: {
        gap: {
            title: 'Focus: Showcase Your Best',
            description: (sport, position) => `Schedule 2 game-speed reps for ${sport} and track one measurable tied to ${position.toLowerCase()}.`
        },
        strength: {
            title: 'Start: Target Outreach',
            description: (divisionText) => `Prioritize 5 programs in ${divisionText} and map your next coach outreach touchpoint.`
        },
        phase: {
            title: 'Create: Coach-Ready Highlight',
            description: (position) => `Record a concise ${position.toLowerCase()} highlight that can be shared with coaches this week.`
        }
    },
    commitment: {
        gap: {
            title: 'Focus: Close Strong Fits',
            description: (sport, position) => `Run 2 final quality sessions for ${sport} and confirm current baseline at ${position.toLowerCase()}.`
        },
        strength: {
            title: 'Start: Final Program Comparison',
            description: (divisionText) => `Compare your best-fit programs across ${divisionText} and shortlist top priorities.`
        },
        phase: {
            title: 'Create: Decision Support Highlight',
            description: (position) => `Capture one final ${position.toLowerCase()} clip to support conversations with programs and family.`
        }
    }
}

function phaseFromGradYear(gradYear) {
    const currentYear = new Date().getFullYear()
    const yearsUntilGrad = Number(gradYear) - currentYear

    if (yearsUntilGrad >= 3) return 'foundation'
    if (yearsUntilGrad === 2) return 'awareness'
    if (yearsUntilGrad === 1) return 'engagement'
    return 'commitment'
}

export function generateSimplePhasePlan(athlete) {
    const sport = athlete?.sport || 'your sport'
    const position = athlete?.position || 'your position'
    const divisionText = Array.isArray(athlete?.target_divisions) && athlete.target_divisions.length > 0
        ? athlete.target_divisions.join(', ')
        : 'D1, D2, D3'

    const phaseKey = phaseFromGradYear(athlete?.grad_year)
    const phase = PHASE_ACTIONS[phaseKey] || PHASE_ACTIONS.foundation

    return {
        phase: phaseKey,
        actions: [
            {
                type: 'gap',
                icon: '⚡',
                title: phase.gap.title,
                description: phase.gap.description(sport, position)
            },
            {
                type: 'strength',
                icon: '🎯',
                title: phase.strength.title,
                description: phase.strength.description(divisionText)
            },
            {
                type: 'phase',
                icon: '📹',
                title: phase.phase.title,
                description: phase.phase.description(position)
            }
        ]
    }
}

export async function generateAndPersistSimplePhasePlan(athleteId, athlete) {
    const weekStartDate = getCurrentWeekStartDate()
    const generated = generateSimplePhasePlan(athlete)

    const planJson = {
        phase: generated.phase,
        priorities: generated.actions.map((item) => ({
            title: item.title,
            why: item.description,
            actions: []
        })),
        sport: athlete?.sport || null,
        position_group: athlete?.position_group || null,
        target_level: athlete?.target_divisions?.[0] || null
    }

    await saveWeeklyPlan(athleteId, weekStartDate, planJson)

    const items = generated.actions.map((item, index) => ({
        athlete_id: athleteId,
        week_start_date: weekStartDate,
        priority_rank: index + 1,
        item_type: item.type,
        title: item.title,
        why: item.description,
        actions: [],
        status: 'open'
    }))

    await insertWeeklyPlanItems(items)

    return { weekStartDate, phase: generated.phase, actions: items }
}
