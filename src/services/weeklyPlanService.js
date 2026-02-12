import { startOfWeek, format, subDays, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { buildAthleteProfile } from './buildAthleteProfile';
import { computeGap } from './engines/gapEngine';
import { generateWeeklyPlan } from './engines/weeklyPlanEngine';
import {
    fetchWeeklyPlanItems,
    insertWeeklyPlanItems,
    deleteWeeklyPlanItemsForWeek
} from '../lib/recruitingData';
import { getMetricKeysForSport, getMetricLabel } from '../config/sportSchema';
import { track } from '../lib/analytics';
import { isMissingTableError } from '../lib/dbResilience';

const DEFAULT_WEEK_START = 1;

const resolveWeekStartDate = (date = new Date()) => (
    format(startOfWeek(date, { weekStartsOn: DEFAULT_WEEK_START }), 'yyyy-MM-dd')
);

const resolvePreviousWeekStartDate = (weekStartDate) => (
    format(subDays(parseISO(weekStartDate), 7), 'yyyy-MM-dd')
);

const normalizeActions = (actions) => (Array.isArray(actions) ? actions.filter(Boolean) : []);

const adjustCarryForwardActions = (actions) => {
    if (Array.isArray(actions) && actions.length > 0) {
        return [`${actions[0]} (repeat with one extra set)`, ...actions.slice(1)];
    }
    return [
        'Repeat last week\'s focus with one extra set.',
        'Log a new measurable or note progress.'
    ];
};

const extractGapLabel = (title = '') => {
    const match = title.match(/^Close your (.+) gap$/i);
    return match ? match[1].trim() : null;
};

const resolveMetricKeyFromLabel = (sport, label) => {
    if (!sport || !label) return null;
    const keys = getMetricKeysForSport(sport);
    const normalizedLabel = label.toLowerCase();
    for (const key of keys) {
        const metricLabel = getMetricLabel(sport, key);
        if (metricLabel && metricLabel.toLowerCase() === normalizedLabel) {
            return key;
        }
    }
    return null;
};

const resolveMetricKeyFromGapTitle = (sport, title) => {
    const label = extractGapLabel(title);
    return resolveMetricKeyFromLabel(sport, label);
};

const pickNextGapCandidate = (gapResult, excludedMetricKey) => {
    const candidates = (gapResult?.perMetric || [])
        .filter((metric) => typeof metric.normalizedGapScore === 'number' && metric.normalizedGapScore > 0)
        .sort((a, b) => b.normalizedGapScore - a.normalizedGapScore);

    const nextCandidate = candidates.find((metric) => metric.metricKey !== excludedMetricKey);
    return nextCandidate || null;
};

const fetchLatestMeasurableDateThisWeek = async (athleteId, weekStartDate) => {
    if (!athleteId) return null;
    const { data, error } = await supabase
        .from('athlete_measurables')
        .select('measured_at')
        .eq('athlete_id', athleteId)
        .gte('measured_at', weekStartDate)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[weeklyPlanService] Error fetching latest measurable date:', error);
        return null;
    }

    return data?.measured_at || null;
};

const shouldRefreshCurrentWeek = (latestMeasurableDate, currentWeekItems) => {
    if (!latestMeasurableDate || !currentWeekItems || currentWeekItems.length === 0) return false;
    const latestMeasurable = new Date(`${latestMeasurableDate}T23:59:59Z`);
    const earliestCreatedAt = currentWeekItems.reduce((earliest, item) => {
        const createdAt = new Date(item.created_at);
        return createdAt < earliest ? createdAt : earliest;
    }, new Date(currentWeekItems[0].created_at));

    return latestMeasurable > earliestCreatedAt;
};

const buildWeeklyPlanItems = async (athleteId, weekStartDate, options = {}) => {
    const { existingItems = [], latestMeasurableDate = null } = options;
    const profile = await buildAthleteProfile(athleteId);
    const gapResult = computeGap(profile);
    const basePlan = generateWeeklyPlan(profile, gapResult);
    const lastWeekStartDate = resolvePreviousWeekStartDate(weekStartDate);
    const lastWeekItems = await fetchWeeklyPlanItems(athleteId, lastWeekStartDate);
    const lastWeekGap = lastWeekItems.find((item) => item.item_type === 'gap') || null;
    const primaryGapBand = gapResult?.primaryGap?.band || null;

    let gapPriority = basePlan.priorities[0];
    let gapDecision = 'new';

    if (lastWeekGap && lastWeekGap.status !== 'done' && primaryGapBand === 'below_p50') {
        gapDecision = 'carry-forward';
        gapPriority = {
            title: lastWeekGap.title,
            why: lastWeekGap.why,
            actions: adjustCarryForwardActions(lastWeekGap.actions)
        };
    } else if (lastWeekGap?.status === 'done') {
        gapDecision = 'rotate';
        const excludedMetricKey = resolveMetricKeyFromGapTitle(profile?.sport, lastWeekGap.title);
        const nextGap = pickNextGapCandidate(gapResult, excludedMetricKey);
        if (nextGap) {
            const rotatedPlan = generateWeeklyPlan(profile, { ...gapResult, primaryGap: nextGap });
            gapPriority = rotatedPlan.priorities[0];
        }
    }

    const existingByType = new Map((existingItems || []).map((item) => [item.item_type, item]));
    const resolveExistingStatus = (itemType) => {
        const existing = existingByType.get(itemType);
        if (!existing) return { status: 'open', completed_at: null };
        return {
            status: existing.status || 'open',
            completed_at: existing.completed_at || null
        };
    };

    const gapStatus = resolveExistingStatus('gap');
    const strengthStatus = resolveExistingStatus('strength');
    const phaseStatus = resolveExistingStatus('phase');

    const items = [
        {
            athlete_id: athleteId,
            week_start_date: weekStartDate,
            priority_rank: 1,
            item_type: 'gap',
            title: gapPriority.title,
            why: gapPriority.why,
            actions: normalizeActions(gapPriority.actions),
            status: gapStatus.status,
            completed_at: gapStatus.completed_at
        },
        {
            athlete_id: athleteId,
            week_start_date: weekStartDate,
            priority_rank: 2,
            item_type: 'strength',
            title: basePlan.priorities[1].title,
            why: basePlan.priorities[1].why,
            actions: normalizeActions(basePlan.priorities[1].actions),
            status: strengthStatus.status,
            completed_at: strengthStatus.completed_at
        },
        {
            athlete_id: athleteId,
            week_start_date: weekStartDate,
            priority_rank: 3,
            item_type: 'phase',
            title: basePlan.priorities[2].title,
            why: basePlan.priorities[2].why,
            actions: normalizeActions(basePlan.priorities[2].actions),
            status: phaseStatus.status,
            completed_at: phaseStatus.completed_at
        }
    ];

    const decisions = {
        weekStartDate,
        lastWeekStartDate,
        gapDecision,
        lastWeekGapStatus: lastWeekGap?.status || null,
        primaryGapBand,
        refreshedForMeasurable: Boolean(latestMeasurableDate),
        latestMeasurableDate: latestMeasurableDate || null
    };

    return { items, decisions, lastWeekItems };
};

export async function generateAndPersistWeeklyPlan(athleteId, options = {}) {
    if (!athleteId) return [];

    try {
        const weekStartDate = resolveWeekStartDate();
        const [currentWeekItems, latestMeasurableDate] = await Promise.all([
            fetchWeeklyPlanItems(athleteId, weekStartDate),
            fetchLatestMeasurableDateThisWeek(athleteId, weekStartDate)
        ]);

        const refreshPlan = shouldRefreshCurrentWeek(latestMeasurableDate, currentWeekItems);

        if (currentWeekItems.length > 0 && !refreshPlan) {
            return currentWeekItems;
        }

        const { items } = await buildWeeklyPlanItems(athleteId, weekStartDate, {
            existingItems: refreshPlan ? currentWeekItems : [],
            latestMeasurableDate
        });

        if (currentWeekItems.length > 0) {
            await deleteWeeklyPlanItemsForWeek(athleteId, weekStartDate);
        }

        const inserted = await insertWeeklyPlanItems(items);
        if (inserted.length > 0) {
            const generatedReason = options.reason || (refreshPlan ? 'regen' : 'bootstrap');
            track('weekly_plan_generated', {
                week_start: weekStartDate,
                generated_reason: generatedReason
            });
        }
        return inserted;
    } catch (error) {
        if (isMissingTableError(error)) {
            console.warn('[weeklyPlanService] Weekly plan tables missing; skipping persistence in rebuild mode.');
            return [];
        }
        throw error;
    }
}

export async function getWeeklyPlanDebugSnapshot(athleteId) {
    if (!athleteId) {
        return {
            weekStartDate: null,
            lastWeekStartDate: null,
            currentWeekItems: [],
            lastWeekItems: [],
            decisions: null
        };
    }

    const weekStartDate = resolveWeekStartDate();
    const lastWeekStartDate = resolvePreviousWeekStartDate(weekStartDate);
    const [currentWeekItems, lastWeekItems, latestMeasurableDate] = await Promise.all([
        fetchWeeklyPlanItems(athleteId, weekStartDate),
        fetchWeeklyPlanItems(athleteId, lastWeekStartDate),
        fetchLatestMeasurableDateThisWeek(athleteId, weekStartDate)
    ]);

    const refreshPlan = shouldRefreshCurrentWeek(latestMeasurableDate, currentWeekItems);
    const lastWeekGap = lastWeekItems.find((item) => item.item_type === 'gap') || null;
    const currentGap = currentWeekItems.find((item) => item.item_type === 'gap') || null;

    let gapDecision = 'new';
    if (lastWeekGap && currentGap) {
        if (lastWeekGap.status === 'done') {
            gapDecision = currentGap.title !== lastWeekGap.title ? 'rotate' : 'rotate';
        } else if (currentGap.title === lastWeekGap.title) {
            gapDecision = 'carry-forward';
        }
    }

    return {
        weekStartDate,
        lastWeekStartDate,
        currentWeekItems,
        lastWeekItems,
        decisions: {
            gapDecision,
            lastWeekGapStatus: lastWeekGap?.status || null,
            refreshRecommended: refreshPlan,
            latestMeasurableDate: latestMeasurableDate || null
        }
    };
}

export function getCurrentWeekStartDate() {
    return resolveWeekStartDate();
}

export function getPreviousWeekStartDate(weekStartDate) {
    return resolvePreviousWeekStartDate(weekStartDate);
}
