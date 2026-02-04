/**
 * Relationship Heat Algorithm (Signal Heat)
 * Translates qualitative interactions into quantitative signals.
 */

export const SIGNAL_WEIGHTS = {
    'Email Sent': 1,
    'Camp Attended': 5,
    'Letter Received': 10,
    'Phone Call': 15,
    'Social DM': 15
};

export const SIGNAL_LEVELS = [
    { min: 0, max: 5, label: 'COLD', bars: 1, color: 'text-zinc-300' },
    { min: 6, max: 15, label: 'WARM', bars: 2, color: 'text-orange-400' },
    { min: 16, max: 30, label: 'STEADY', bars: 3, color: 'text-orange-600' },
    { min: 31, max: 50, label: 'HIGH', bars: 4, color: 'text-red-500' },
    { min: 51, max: Infinity, label: 'ACTIVE', bars: 5, color: 'text-red-700' }
];

/**
 * Calculates the total signal strength for a specific school
 * @param {Array} interactions - Array of interaction objects for this school
 * @returns {number} The total signal score
 */
export function calculateSchoolSignal(interactions = []) {
    if (!interactions || !Array.isArray(interactions)) return 0;

    return interactions.reduce((total, interaction) => {
        const weight = SIGNAL_WEIGHTS[interaction.type] || 0;
        return total + weight;
    }, 0);
}

/**
 * Returns the signal level metadata for a given score
 * @param {number} score - The total signal score
 * @returns {Object} Level metadata (label, bars, color)
 */
export function getSignalLevel(score) {
    return SIGNAL_LEVELS.find(level => score >= level.min && score <= level.max) || SIGNAL_LEVELS[0];
}

/**
 * Convenience function to get full signal context for a school's interactions
 * @param {Array} interactions 
 */
export function getSchoolHeat(interactions) {
    const score = calculateSchoolSignal(interactions);
    const level = getSignalLevel(score);

    return {
        score,
        count: interactions.length,
        ...level
    };
}
