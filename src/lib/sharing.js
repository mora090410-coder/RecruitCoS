import { supabase } from './supabase'

/**
 * sharing.js
 * Utilities for sharing athlete profiles with managers and parents.
 */

/**
 * inviteManager
 * Shares the athlete's profile with a manager by email.
 * For now, this assumes the manager already has an account in the system.
 * 
 * @param {string} athleteId - The UUID of the athlete
 * @param {string} email - The email of the manager to invite
 * @param {string} role - The role to assign ('manager' or 'viewer')
 */
export async function inviteManager(athleteId, email, role = 'manager') {
    // 1. Find the user by email
    // Since we can't easily query auth.users by email from the client,
    // we assume there's a profiles or athletes table we can check if they registered as an athlete,
    // or we might need an edge function. 
    // FOR MVP: We will attempt to find a record in the 'athletes' table (as coaches/parents might sign up similarly for now)
    // or we'll allow the UI to handle the case where the user doesn't exist yet.

    // Attempting to find user_id via the athletes table for simplicity in this MVP flow
    const { data: userData, error: userError } = await supabase
        .from('athletes')
        .select('id')
        .eq('email', email) // Assuming email is stored in athletes table based on previous steps
        .single();

    if (userError || !userData) {
        throw new Error("Manager must have an active RecruitCoS account with this email.");
    }

    const managerId = userData.id;

    // 2. Insert into profile_access
    const { data, error } = await supabase
        .from('profile_access')
        .insert({
            athlete_id: athleteId,
            manager_id: managerId,
            role: role
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error("This user already has access to this profile.");
        }
        throw error;
    }

    return data;
}

/**
 * getAccessibleAthletes
 * Returns a list of athlete profiles the current user has access to.
 */
export async function getAccessibleAthletes() {
    const { data, error } = await supabase
        .from('profile_access')
        .select(`
            role,
            athlete:athletes (
                id,
                full_name,
                sport,
                grad_year,
                profile_image_url
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
