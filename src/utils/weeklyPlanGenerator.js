import { addWeeks, format, startOfWeek } from 'date-fns';
import { supabase as defaultSupabase } from '../lib/supabase';

/**
 * Canonical weekly action templates used for week plan generation.
 */
export const WEEKLY_ACTIONS = {
    week1: [
        {
            action_number: 1,
            title: "Update your athlete's current stats",
            description: 'Add their latest speed/strength/performance numbers so we can track progress.',
            action_type: 'update_stats',
            item_type: 'gap',
            route: '/actions/update-stats',
            estimated_minutes: 5
        },
        {
            action_number: 2,
            title: 'Build your school list',
            description: 'Add any schools you are interested in. Tag them as Dream, Target, or Safety.',
            action_type: 'research_schools',
            item_type: 'strength',
            route: '/actions/research-schools',
            estimated_minutes: 15
        },
        {
            action_number: 3,
            title: "Log this month's recruiting expenses",
            description: 'Track showcase fees, camp costs, and travel to see where your money is going.',
            action_type: 'log_expenses',
            item_type: 'phase',
            route: '/actions/log-expenses',
            estimated_minutes: 10
        }
    ],
    week2: [
        {
            action_number: 1,
            title: 'Learn your recruiting timeline',
            description: 'Understand key NCAA dates and deadlines for your graduation year.',
            action_type: 'recruiting_timeline',
            item_type: 'timeline',
            route: '/actions/recruiting-timeline',
            estimated_minutes: 10
        },
        {
            action_number: 2,
            title: 'Log your first coach interaction',
            description: 'Track any contact with college coaches including email, showcases, or camps.',
            action_type: 'coach_interaction',
            item_type: 'interaction',
            route: '/actions/coach-interaction',
            estimated_minutes: 5
        },
        {
            action_number: 3,
            title: 'Update your recruiting budget',
            description: 'Log any new expenses from camps, showcases, travel, or training.',
            action_type: 'log_expenses',
            item_type: 'budget',
            route: '/actions/log-expenses',
            estimated_minutes: 10
        }
    ]
};

/**
 * Returns action templates for a given week number.
 */
export function getWeeklyActionsForWeek(weekNumber) {
    return WEEKLY_ACTIONS[`week${weekNumber}`] || null;
}

/**
 * Computes a deterministic week start date by relative week number.
 */
export function resolveWeekStartDateForWeek(weekNumber) {
    const weekIndex = Math.max(0, Number(weekNumber || 1) - 1);
    const baseWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(addWeeks(baseWeekStart, weekIndex), 'yyyy-MM-dd');
}

/**
 * Generates (or refreshes) a week plan and action rows for one athlete.
 * Preserves completed/skipped status for existing action rows.
 */
export async function generateWeeklyPlan(athleteId, weekNumber, supabaseClient = defaultSupabase) {
    if (!athleteId) {
        throw new Error('Missing athlete id for weekly plan generation.');
    }

    const numericWeek = Number.parseInt(weekNumber, 10);
    if (!Number.isInteger(numericWeek) || numericWeek < 1) {
        throw new Error(`Invalid week number: ${weekNumber}`);
    }

    const actions = getWeeklyActionsForWeek(numericWeek);
    if (!actions) {
        throw new Error(`No actions defined for week ${numericWeek}`);
    }

    const { data: athlete, error: athleteError } = await supabaseClient
        .from('athletes')
        .select('id, sport, grade_level, grad_year, recruiting_phase')
        .eq('id', athleteId)
        .maybeSingle();

    if (athleteError) throw athleteError;
    if (!athlete?.id) {
        throw new Error('Athlete profile not found.');
    }

    const weekStartDate = resolveWeekStartDateForWeek(numericWeek);

    const weeklyPlanPayload = {
        athlete_id: athleteId,
        week_number: numericWeek,
        sport: athlete.sport || 'unknown',
        grade_level: Number.isInteger(athlete.grade_level) ? athlete.grade_level : 9,
        recruiting_phase: athlete.recruiting_phase || 'evaluation'
    };

    const { data: weeklyPlanRows, error: weeklyPlanError } = await supabaseClient
        .from('weekly_plans')
        .upsert([weeklyPlanPayload], { onConflict: 'athlete_id,week_number' })
        .select('id, athlete_id, week_number');

    if (weeklyPlanError) throw weeklyPlanError;

    const weeklyPlanId = weeklyPlanRows?.[0]?.id || null;

    const { data: existingWeekRows, error: existingWeekRowsError } = await supabaseClient
        .from('athlete_weekly_plan_items')
        .select('id, action_number, priority_rank, status, completed_at')
        .eq('athlete_id', athleteId)
        .eq('week_number', numericWeek);

    if (existingWeekRowsError) throw existingWeekRowsError;

    const { data: existingScopeRows, error: existingScopeRowsError } = await supabaseClient
        .from('athlete_weekly_plan_items')
        .select('id, action_number, priority_rank, status, completed_at')
        .eq('athlete_id', athleteId)
        .eq('week_start_date', weekStartDate);

    if (existingScopeRowsError) throw existingScopeRowsError;

    const existingActionRows = [...(existingWeekRows || []), ...(existingScopeRows || [])];

    const existingStatusByAction = new Map(
        (existingActionRows || []).map((row) => [Number(row.action_number || row.priority_rank), row])
    );

    const rowsToUpsert = actions.map((action) => {
        const existing = existingStatusByAction.get(action.action_number);
        const existingStatus = String(existing?.status || 'open').toLowerCase();
        const preserveCompletion = existingStatus === 'done' || existingStatus === 'skipped';

        return {
            athlete_id: athleteId,
            weekly_plan_id: weeklyPlanId,
            week_start_date: weekStartDate,
            week_number: numericWeek,
            priority_rank: action.action_number,
            action_number: action.action_number,
            item_type: action.item_type || action.action_type,
            action_type: action.action_type,
            title: action.title,
            action_title: action.title,
            why: action.description,
            action_description: action.description,
            estimated_minutes: action.estimated_minutes,
            status: preserveCompletion ? existing.status : 'open',
            completed_at: preserveCompletion ? existing.completed_at : null
        };
    });

    const { data: actionRows, error: actionRowsError } = await supabaseClient
        .from('athlete_weekly_plan_items')
        .upsert(rowsToUpsert, { onConflict: 'athlete_id,week_start_date,priority_rank' })
        .select('*');

    if (actionRowsError) throw actionRowsError;

    return {
        id: weeklyPlanId,
        athlete_id: athleteId,
        week_number: numericWeek,
        week_start_date: weekStartDate,
        actions: actionRows || []
    };
}
