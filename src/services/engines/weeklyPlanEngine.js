import { startOfWeek, format } from 'date-fns';
import { getMetricLabel, getMetricUnit } from '../../config/sportSchema.js';
import { getAthletePhase, RECRUITING_PHASES, PHASE_CONFIG } from '../../lib/constants.js';

const DEFAULT_WEEK_START = 1;

const PHASE_ACTION_MAP = {
    foundation: {
        title: 'Build your recruiting foundation',
        why: 'Establish a baseline profile and consistent exposure habits.',
        actions: [
            'Complete your recruiting profile basics.',
            'Log one training session or new measurable.'
        ]
    },
    earlyHS: {
        title: 'Build your school list',
        why: 'A solid list gives you options and early exposure.',
        actions: [
            'Add 5 target schools that match your level.',
            'Tag each school with division and notes.'
        ]
    },
    sophPrep: {
        title: 'Showcase and outreach cadence',
        why: 'Visibility and consistency create early momentum.',
        actions: [
            'Upload or refresh a highlight clip.',
            'Send 2 introductory outreach messages.'
        ]
    },
    juniorWindow: {
        title: 'Outreach and visits',
        why: 'This window rewards targeted communication.',
        actions: [
            'Send 3 targeted outreach emails.',
            'Schedule or confirm a campus visit or camp.'
        ]
    },
    seniorClose: {
        title: 'Finalize your roster spot',
        why: 'Close the loop and secure the best fit.',
        actions: [
            'Follow up with top programs on next steps.',
            'Confirm financial/roster details with your top choice.'
        ]
    }
};

const PHASE_KEY_MAP = new Map([
    [RECRUITING_PHASES.FOUNDATION, 'foundation'],
    [RECRUITING_PHASES.EVALUATION, 'earlyHS'],
    [RECRUITING_PHASES.IDENTIFICATION, 'sophPrep'],
    [RECRUITING_PHASES.COMPARISON, 'juniorWindow'],
    [RECRUITING_PHASES.COMMITMENT, 'seniorClose']
]);

const resolvePhaseKey = (profile) => {
    const rawPhase = profile?.phase || getAthletePhase(profile?.grad_year);
    if (!rawPhase) return 'foundation';
    if (typeof rawPhase === 'string' && PHASE_ACTION_MAP[rawPhase]) return rawPhase;
    return PHASE_KEY_MAP.get(rawPhase) || 'foundation';
};

const resolveWeekOfDate = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: DEFAULT_WEEK_START });
    return format(weekStart, 'yyyy-MM-dd');
};

const METRIC_ACTION_TEMPLATES = {
    home_to_first: [
        'Run 6 x 20-yard acceleration sprints with full recovery.',
        'Add 3 first-step start drills focused on reaction and drive.'
    ],
    sixty_time: [
        'Run 4 x 30-yard sprint mechanics reps with full recovery.',
        'Add 3 resisted sprint starts to build acceleration.'
    ],
    forty_time: [
        'Complete 4 x 20-yard acceleration reps with full recovery.',
        'Add 3 start/stance drills to refine your first 10 yards.'
    ],
    three_cone: [
        'Complete 3 rounds of 3-cone change-of-direction drills.',
        'Add 4 short-shuttle reps emphasizing clean footwork.'
    ],
    shuttle: [
        'Complete 4 pro-agility reps with full recovery.',
        'Add 3 lateral shuffle-to-sprint transition drills.'
    ],
    agility_505: [
        'Run 4 reps of 505 change-of-direction with full recovery.',
        'Add 3 deceleration drills to improve braking control.'
    ],
    vertical: [
        'Add 2 plyometric sessions focused on box jumps.',
        'Complete 3 sets of loaded jumps or trap-bar jumps.'
    ],
    vertical_jump: [
        'Add 2 plyometric sessions focused on box jumps.',
        'Complete 3 sets of loaded jumps or trap-bar jumps.'
    ],
    yo_yo: [
        'Complete 2 interval conditioning sessions (15-20 min).',
        'Add 1 tempo run focusing on sustainable pace.'
    ],
    bench_reps: [
        'Complete 2 upper-body strength sessions with progressive load.',
        'Add 3 sets of pushups or DB press for volume.'
    ],
    overhand_velocity: [
        'Complete 2 long-toss sessions with a structured build-up.',
        'Add 2 medicine-ball throws focused on hip/shoulder separation.'
    ],
    catcher_throw_velocity: [
        'Complete 2 long-toss sessions with a structured build-up.',
        'Add 2 medicine-ball throws focused on hip/shoulder separation.'
    ],
    infield_velocity: [
        'Complete 2 long-toss sessions with a structured build-up.',
        'Add 2 medicine-ball throws focused on hip/shoulder separation.'
    ],
    outfield_velocity: [
        'Complete 2 long-toss sessions with a structured build-up.',
        'Add 2 medicine-ball throws focused on hip/shoulder separation.'
    ],
    throwing_velocity: [
        'Complete 2 throwing sessions focused on mechanics and intent.',
        'Add 2 med-ball rotational throws for power transfer.'
    ],
    pitch_velocity: [
        'Complete 2 bullpen sessions focused on mechanics and intent.',
        'Add 1 lower-body strength session for drive power.'
    ],
    pop_time: [
        'Complete 3 blocking-to-throw footwork reps per session.',
        'Add 20 quick-release throws with a stopwatch.'
    ],
    exit_velo: [
        'Complete 2 bat-speed sessions (tee + front toss).',
        'Add 1 strength session focused on rotational power.'
    ],
    exit_velocity: [
        'Complete 2 bat-speed sessions (tee + front toss).',
        'Add 1 strength session focused on rotational power.'
    ],
    sprint_30m: [
        'Complete 4 x 30m sprint reps with full recovery.',
        'Add 3 acceleration drills focused on drive phase.'
    ],
    three_quarter_sprint: [
        'Complete 4 full-court sprint reps with full recovery.',
        'Add 3 acceleration drills focused on first 10 yards.'
    ],
    lane_agility: [
        'Complete 3 lane agility reps with clean footwork.',
        'Add 3 closeout-to-slide drill reps.'
    ],
    wingspan: [
        'Confirm and log an updated wingspan measurement.',
        'Focus on positioning and timing drills to maximize length.'
    ],
    height: [
        'Confirm and log an updated verified height.',
        'Focus on strength and positioning to maximize impact.'
    ]
};

const buildGapPriority = (sport, primaryGap, phaseKey) => {
    if (primaryGap?.metricKey) {
        const label = getMetricLabel(sport, primaryGap.metricKey);
        const unit = getMetricUnit(sport, primaryGap.metricKey);
        const athleteValue = primaryGap.athleteValue;
        const benchmarkValue = primaryGap.benchmarkValue;
        const valueText = athleteValue !== null && benchmarkValue !== null
            ? `${athleteValue}${unit ? ` ${unit}` : ''} vs ${benchmarkValue}${unit ? ` ${unit}` : ''}`
            : 'your current value vs benchmark';
        const actions = METRIC_ACTION_TEMPLATES[primaryGap.metricKey] || [
            `Add two focused ${label.toLowerCase()} sessions this week.`,
            'Log a new attempt and track progress.'
        ];
        return {
            title: `Close your ${label} gap`,
            why: `Current: ${valueText}.`,
            actions
        };
    }

    const phaseFocus = PHASE_CONFIG?.[profilePhaseFromKey(phaseKey)]?.focus || 'Phase Development';
    return {
        title: `Phase focus: ${phaseFocus}`,
        why: 'No primary measurable gap was detected this week.',
        actions: [
            'Choose one core skill to sharpen this week.',
            'Log one new measurable or training clip.'
        ]
    };
};

const buildExecutionPriority = (signals = {}) => {
    const savedSchoolsCount = Number(signals?.savedSchoolsCount ?? 0);
    const interactionsLast30Days = Number(signals?.interactionsLast30Days ?? 0);

    if (savedSchoolsCount < 10) {
        return {
            title: 'Build your school list',
            why: 'A deeper list gives you more options and leverage.',
            actions: [
                'Add 5 new schools that match your target level.',
                'Tag each school with division and notes.',
                'Identify the head coach contact info.'
            ]
        };
    }

    if (interactionsLast30Days === 0) {
        return {
            title: 'Start outreach momentum',
            why: 'Consistent contact builds recruiting signal.',
            actions: [
                'Send 3 personalized outreach messages.',
                'Follow up with any open conversations.',
                'Log each interaction in your tracker.'
            ]
        };
    }

    return {
        title: 'Update your highlight presence',
        why: 'Regular updates keep coaches engaged and informed.',
        actions: [
            'Post a new highlight or training clip.',
            'Refresh your measurable stats if needed.'
        ]
    };
};

const profilePhaseFromKey = (phaseKey) => {
    switch (phaseKey) {
        case 'foundation':
            return RECRUITING_PHASES.FOUNDATION;
        case 'earlyHS':
            return RECRUITING_PHASES.EVALUATION;
        case 'sophPrep':
            return RECRUITING_PHASES.IDENTIFICATION;
        case 'juniorWindow':
            return RECRUITING_PHASES.COMPARISON;
        case 'seniorClose':
            return RECRUITING_PHASES.COMMITMENT;
        default:
            return RECRUITING_PHASES.FOUNDATION;
    }
};

/**
 * Generates a deterministic weekly plan for an AthleteProfile DTO.
 * Edge cases: defaults missing execution signals to 0 and still returns 3 priorities.
 */
export function generateWeeklyPlan(profile, gapResult) {
    const phaseKey = resolvePhaseKey(profile);
    const sport = profile?.sport || profile?.athlete?.sport || null;
    const weekOfDate = resolveWeekOfDate();

    const priorities = [
        buildGapPriority(sport, gapResult?.primaryGap, phaseKey),
        PHASE_ACTION_MAP[phaseKey] || PHASE_ACTION_MAP.foundation,
        buildExecutionPriority(profile?.executionSignals)
    ];

    return {
        weekOfDate,
        phase: phaseKey,
        priorities
    };
}
