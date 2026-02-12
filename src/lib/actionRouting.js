import { format, startOfWeek } from 'date-fns';
import { supabase } from './supabase';
import { updateWeeklyPlanItemStatus } from './recruitingData';

export const ACTION_NUMBER_TO_ROUTE = {
    1: '/actions/update-stats',
    2: '/actions/research-schools',
    3: '/actions/log-expenses'
};

const ACTION_TYPE_TO_NUMBER = {
    gap: 1,
    strength: 2,
    phase: 3
};

export function resolveActionNumberFromItem(item, fallback = 1) {
    const byPriority = Number.parseInt(item?.priority_rank, 10);
    if (Number.isInteger(byPriority) && byPriority >= 1 && byPriority <= 3) {
        return byPriority;
    }

    const byType = ACTION_TYPE_TO_NUMBER[String(item?.item_type || '').toLowerCase()];
    if (byType) return byType;
    return fallback;
}

export function resolveActionNumberFromSearch(searchParams, fallback = 1) {
    const actionFromQuery = Number.parseInt(searchParams.get('action') || '', 10);
    if (Number.isInteger(actionFromQuery) && actionFromQuery >= 1 && actionFromQuery <= 3) {
        return actionFromQuery;
    }
    return fallback;
}

export function resolveItemIdFromSearch(searchParams) {
    const itemId = searchParams.get('itemId');
    return itemId && itemId.trim().length > 0 ? itemId.trim() : null;
}

export function resolveWeekStartFromSearch(searchParams) {
    const weekStart = searchParams.get('weekStart');
    if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
        return null;
    }
    return weekStart;
}

export function resolveActionHref(item, weekStartDate) {
    const actionNumber = resolveActionNumberFromItem(item);
    const baseRoute = ACTION_NUMBER_TO_ROUTE[actionNumber] || ACTION_NUMBER_TO_ROUTE[1];
    const params = new URLSearchParams({
        action: String(actionNumber)
    });

    if (item?.id) params.set('itemId', item.id);
    if (weekStartDate) params.set('weekStart', weekStartDate);

    return `${baseRoute}?${params.toString()}`;
}

function getCurrentWeekStartDate() {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

async function findActionItemId({ athleteId, actionNumber, weekStartDate }) {
    if (!athleteId || !actionNumber) return null;

    const queryWeekStart = weekStartDate || getCurrentWeekStartDate();
    const { data: currentWeekItem, error: currentWeekError } = await supabase
        .from('athlete_weekly_plan_items')
        .select('id')
        .eq('athlete_id', athleteId)
        .eq('priority_rank', actionNumber)
        .eq('week_start_date', queryWeekStart)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (currentWeekError) throw currentWeekError;
    if (currentWeekItem?.id) return currentWeekItem.id;

    const { data: latestItem, error: latestError } = await supabase
        .from('athlete_weekly_plan_items')
        .select('id')
        .eq('athlete_id', athleteId)
        .eq('priority_rank', actionNumber)
        .order('week_start_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestError) throw latestError;
    return latestItem?.id || null;
}

export async function setWeeklyActionStatus({
    athleteId,
    itemId,
    actionNumber,
    weekStartDate,
    status
}) {
    if (!athleteId) {
        throw new Error('Missing athlete context for this action.');
    }
    if (!status) {
        throw new Error('Missing status update for this action.');
    }

    let resolvedItemId = itemId;
    if (!resolvedItemId) {
        resolvedItemId = await findActionItemId({
            athleteId,
            actionNumber,
            weekStartDate
        });
    }

    if (!resolvedItemId) {
        throw new Error('No weekly action item found to update.');
    }

    return updateWeeklyPlanItemStatus(resolvedItemId, status);
}
