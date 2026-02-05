export const SCHOOL_STATUSES = {
    NO_CONTACT: 'no_contact',
    CONTACTED: 'contacted',
    ACTIVE: 'active',
    NOT_INTERESTED: 'not_interested',
    ARCHIVED: 'archived'
}

export const STATUS_CONFIG = {
    [SCHOOL_STATUSES.NO_CONTACT]: {
        label: 'No Contact',
        icon: '⚫',
        color: 'gray',
        description: "Haven't reached out yet"
    },
    [SCHOOL_STATUSES.CONTACTED]: {
        label: 'Contacted',
        icon: '📧',
        color: 'blue',
        description: 'Reached out, waiting for response'
    },
    [SCHOOL_STATUSES.ACTIVE]: {
        label: 'Active',
        icon: '🟢',
        color: 'green',
        description: 'Currently engaging with this school'
    },
    [SCHOOL_STATUSES.NOT_INTERESTED]: {
        label: 'Not Interested',
        icon: '❌',
        color: 'red',
        description: 'School said no or not pursuing'
    },
    [SCHOOL_STATUSES.ARCHIVED]: {
        label: 'Archived',
        icon: '📦',
        color: 'orange',
        description: 'Saved for reference'
    }
}
export const INTERACTION_TYPES = [
    'Email Sent',
    'Camp Attended',
    'Letter Received',
    'Phone Call',
    'Social DM'
];

export const RECRUITING_PHASES = {
    FOUNDATION: 'Foundation (12U)',
    EVALUATION: 'Evaluation (8th-9th)',
    IDENTIFICATION: 'Identification (10th)',
    COMPARISON: 'Comparison (11th)',
    COMMITMENT: 'Commitment (12th)'
}

export const PHASE_CONFIG = {
    [RECRUITING_PHASES.FOUNDATION]: {
        title: 'Foundation',
        focus: 'Visibility and Safety',
        tasks: [
            'Audit highlight vault for basic mechanics',
            'Create safety-first social profile',
            'Establish training routine focus'
        ],
        color: 'slate',
        badgeClass: 'bg-slate-100 text-slate-700'
    },
    [RECRUITING_PHASES.EVALUATION]: {
        title: 'Evaluation',
        focus: 'Resume Building',
        tasks: [
            'Build digital resume/profile',
            'Start tracking target schools',
            'Record full-game footage for analysis'
        ],
        color: 'blue',
        badgeClass: 'bg-blue-100 text-blue-700'
    },
    [RECRUITING_PHASES.IDENTIFICATION]: {
        title: 'Identification',
        focus: 'High-Discipline Clips',
        tasks: [
            'Create 30-second highlight bursts',
            'Add uncommitted status to all profiles',
            'Identify top 20 target programs'
        ],
        color: 'green',
        badgeClass: 'bg-green-100 text-green-700'
    },
    [RECRUITING_PHASES.COMPARISON]: {
        title: 'Comparison',
        focus: 'September 1st Protocol',
        tasks: [
            'Prepare direct coach outreach templates',
            'Finalize official/unofficial visit list',
            'Compare roster depth at target schools'
        ],
        color: 'indigo',
        badgeClass: 'bg-indigo-100 text-indigo-700'
    },
    [RECRUITING_PHASES.COMMITMENT]: {
        title: 'Commitment',
        focus: 'Fit and Signing',
        tasks: [
            'Schedule final official visits',
            'Review scholarship/financial offers',
            'Prepare and execute Commitment Post'
        ],
        color: 'gold',
        badgeClass: 'bg-amber-100 text-amber-700'
    }
}

export function getAthletePhase(gradYear) {
    if (!gradYear) return RECRUITING_PHASES.FOUNDATION;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    // Academic year usually ends in May/June (month 4-5)
    // If it's after June, we consider the "next" academic year starting.
    const academicYearAdjust = currentMonth > 5 ? 1 : 0;
    const yearsToGrad = gradYear - (currentYear + academicYearAdjust);

    if (yearsToGrad > 4) return RECRUITING_PHASES.FOUNDATION;
    if (yearsToGrad === 4) return RECRUITING_PHASES.EVALUATION;
    if (yearsToGrad === 3) return RECRUITING_PHASES.IDENTIFICATION;
    if (yearsToGrad === 2) return RECRUITING_PHASES.COMPARISON;
    return RECRUITING_PHASES.COMMITMENT;
}
