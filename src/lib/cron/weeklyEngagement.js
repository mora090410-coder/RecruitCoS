import { supabase } from '../supabase'

/**
 * Server-side weekly activity rollup job.
 * Intended to run every Monday after the previous week closes.
 *
 * NOTE: This should run with a service-role client in a trusted environment.
 */
export async function incrementWeeklyActivity() {
    const sevenDaysAgoIso = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()

    const { data: completionRows, error: completionError } = await supabase
        .from('action_completions')
        .select('athlete_id')
        .gte('completed_at', sevenDaysAgoIso)

    if (completionError) {
        throw completionError
    }

    const athleteIds = Array.from(new Set((completionRows || []).map((row) => row.athlete_id).filter(Boolean)))

    for (const athleteId of athleteIds) {
        const { data: athlete, error: athleteError } = await supabase
            .from('athletes')
            .select('id, weeks_active')
            .eq('id', athleteId)
            .maybeSingle()

        if (athleteError || !athlete) continue

        const nextWeeksActive = Number(athlete.weeks_active || 0) + 1

        await supabase
            .from('athletes')
            .update({
                weeks_active: nextWeeksActive,
                last_active_at: new Date().toISOString()
            })
            .eq('id', athleteId)
    }

    return {
        processedAthletes: athleteIds.length,
        windowStart: sevenDaysAgoIso
    }
}
