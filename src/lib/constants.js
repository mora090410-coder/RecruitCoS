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

export const RECRUITING_PHASES = {
    DISCOVERY: 'Discovery',
    FOUNDATION: 'Foundation',
    EXPOSURE: 'Exposure',
    COMMITMENT: 'Commitment'
}

export const PHASE_CONFIG = {
    [RECRUITING_PHASES.DISCOVERY]: {
        title: 'Discovery',
        focus: 'Athletic Development & Exploration',
        tasks: [
            'Audit your current skill set vs. target schools',
            'Start a "Dream List" of 20+ schools in Recruiting Compass',
            'Record 2-3 training clips for your highlight vault'
        ],
        color: 'slate',
        badgeClass: 'bg-slate-100 text-slate-700'
    },
    [RECRUITING_PHASES.FOUNDATION]: {
        title: 'Foundation',
        focus: 'Academic & Highlight Preparation',
        tasks: [
            'Request unofficial transcript for GPA verification',
            'Create a 60-second "Best of" highlight reel',
            'Research NCAA Eligibility Center requirements'
        ],
        color: 'blue',
        badgeClass: 'bg-blue-100 text-blue-700'
    },
    [RECRUITING_PHASES.EXPOSURE]: {
        title: 'Exposure',
        focus: 'Coach Outreach & Traction',
        tasks: [
            'Send personalized emails to top 10 target coaches',
            'Update your Twitter/X profile with latest stats',
            'Schedule 2-3 unofficial campus visits'
        ],
        color: 'green',
        badgeClass: 'bg-green-100 text-green-700'
    },
    [RECRUITING_PHASES.COMMITMENT]: {
        title: 'Commitment',
        focus: 'Final Selection & Signing',
        tasks: [
            'Finalize your official visit schedule',
            'Complete all college applications for priority schools',
            'Prepare and schedule your Commitment Post'
        ],
        color: 'gold',
        badgeClass: 'bg-amber-100 text-amber-700'
    }
}

export function getAthletePhase(gradYear) {
    if (!gradYear) return RECRUITING_PHASES.DISCOVERY;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    // Academic year usually ends in May/June (month 4-5)
    // If it's after June, we consider the "next" academic year starting.
    const academicYearAdjust = currentMonth > 5 ? 1 : 0;
    const yearsToGrad = gradYear - (currentYear + academicYearAdjust);

    if (yearsToGrad >= 4) return RECRUITING_PHASES.DISCOVERY; // 8th Grade or younger
    if (yearsToGrad === 3) return RECRUITING_PHASES.FOUNDATION; // Freshman
    if (yearsToGrad === 2) return RECRUITING_PHASES.FOUNDATION; // Sophomore
    if (yearsToGrad === 1) return RECRUITING_PHASES.EXPOSURE; // Junior
    return RECRUITING_PHASES.COMMITMENT; // Senior
}
