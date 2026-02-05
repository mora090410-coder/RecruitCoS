import { startOfWeek, format } from 'date-fns';
import { getMetricLabel, getMetricUnit } from '../../config/sportSchema.js';
import { getAthletePhase, RECRUITING_PHASES, PHASE_CONFIG } from '../../lib/constants.js';

const DEFAULT_WEEK_START = 1;

const PHASE_ACTION_MAP = {
    [RECRUITING_PHASES.FOUNDATION]: {
        title: 'Build your recruiting foundation',
        why: 'Establish a baseline profile and consistent exposure habits.',
        actions: [
            'Complete or update your recruiting profile basics.',
            'Set a weekly training schedule and log one session.',
            'Collect one new measurable or training clip.'
        ]
    },
    [RECRUITING_PHASES.EVALUATION]: {
        title: 'Create evaluation-ready assets',
        why: 'Coaches need clear proof points early in the evaluation phase.',
        actions: [
            'Upload a full-game or skills clip.',
            'Add 5 new target schools to your list.',
            'Request feedback from a coach or trainer.'
        ]
    },
    [RECRUITING_PHASES.IDENTIFICATION]: {
        title: 'Run disciplined outreach',
        why: 'This phase rewards consistent, targeted communication.',
        actions: [
            'Send 3 personalized emails to target programs.',
            'Update your resume metrics and GPA.',
            'Track responses and next steps.'
        ]
    },
    [RECRUITING_PHASES.COMPARISON]: {
        title: 'Compare and validate top options',
        why: 'This phase is about narrowing the list with evidence.',
        actions: [
            'Schedule or confirm a visit or camp.',
            'Review roster depth for your top 3 schools.',
            'Draft 3 targeted follow-up messages.'
        ]
    },
    [RECRUITING_PHASES.COMMITMENT]: {
        title: 'Execute commitment readiness',
        why: 'Finalize fit and ensure you are ready to commit.',
        actions: [
            'Review scholarship or offer details.',
            'Confirm next steps with your top choice.',
            'Prepare your commitment announcement assets.'
        ]
    }
};

const resolvePhase = (profile) => (
    profile?.phase
    || getAthletePhase(profile?.grad_year)
    || RECRUITING_PHASES.FOUNDATION
);

const resolveWeekOfDate = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: DEFAULT_WEEK_START });
    return format(weekStart, 'yyyy-MM-dd');
};

const buildGapPriority = (sport, primaryGap, phase) => {
    if (primaryGap?.metricKey) {
        const label = getMetricLabel(sport, primaryGap.metricKey);
        return {
            title: `Close your ${label} gap`,
            why: 'This metric is the biggest limiter versus your target level.',
            actions: [
                `Add two focused ${label.toLowerCase()} sessions this week.`,
                'Log a new attempt and track progress.',
                'Review technique with a coach or trainer.'
            ],
            metricContext: {
                metricKey: primaryGap.metricKey,
                label,
                unit: primaryGap.unit || getMetricUnit(sport, primaryGap.metricKey),
                athleteValue: primaryGap.athleteValue,
                benchmarkP50: primaryGap.benchmarkP50
            }
        };
    }

    const phaseFocus = PHASE_CONFIG?.[phase]?.focus || 'Phase Development';
    return {
        title: `Phase focus: ${phaseFocus}`,
        why: 'No primary measurable gap was detected this week.',
        actions: [
            'Choose one core skill to sharpen this week.',
            'Log one new measurable or training clip.',
            'Ask for feedback on your current routine.'
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
            'Refresh your measurable stats if needed.',
            'Share your updated profile with active schools.'
        ]
    };
};

/**
 * Generates a deterministic weekly plan for an AthleteProfile DTO.
 * Edge cases: defaults missing execution signals to 0 and still returns 3 priorities.
 */
export function generateWeeklyPlan(profile, gapResult) {
    const phase = resolvePhase(profile);
    const sport = profile?.sport || profile?.athlete?.sport || null;
    const weekOfDate = resolveWeekOfDate();

    const priorities = [
        buildGapPriority(sport, gapResult?.primaryGap, phase),
        PHASE_ACTION_MAP[phase] || PHASE_ACTION_MAP[RECRUITING_PHASES.FOUNDATION],
        buildExecutionPriority(profile?.executionSignals)
    ];

    return {
        weekOfDate,
        phase,
        priorities
    };
}
