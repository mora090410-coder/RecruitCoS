/**
 * @typedef {Object} Athlete
 * @property {string} id - UUID (Matches Supabase Auth ID)
 * @property {string} name - Full Name
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {number} [grad_year]
 * @property {string} [sport]
 * @property {string} [position]
 * @property {number} [gpa]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [academic_tier]
 * @property {string} [dream_school]
 * @property {string[]} [target_divisions]
 * @property {boolean} [onboarding_completed]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} SavedSchool
 * @property {string} id - UUID
 * @property {string} athlete_id - UUID (References athletes.id)
 * @property {string} school_name
 * @property {string} category - 'reach' | 'target' | 'solid'
 * @property {number} [gpa]
 * @property {string} [insight]
 * @property {string} [status]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Post
 * @property {string} id - UUID
 * @property {string} athlete_id - UUID (References athletes.id)
 * @property {string} [event_id] - UUID (References events.id)
 * @property {string} post_text
 * @property {string} [status] - 'draft' | 'scheduled' | 'posted'
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Event
 * @property {string} id - UUID
 * @property {string} athlete_id - UUID (References athletes.id)
 * @property {string} event_name
 * @property {string} [performance]
 * @property {string} event_date
 * @property {string} [created_at]
 */

export const Types = {};
