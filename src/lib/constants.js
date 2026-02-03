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
