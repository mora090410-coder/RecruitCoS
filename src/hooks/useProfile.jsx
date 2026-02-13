import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { isMissingTableError } from '../lib/dbResilience'

const ProfileContext = createContext({})

export const useProfile = () => useContext(ProfileContext)

export const ProfileProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth()

    // Profile State
    const [athleteProfile, setAthleteProfile] = useState(null)
    const [accessibleAthletes, setAccessibleAthletes] = useState([])
    const [activeAthlete, setActiveAthlete] = useState(null)

    // Loading State
    const [profileLoading, setProfileLoading] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)
    const [error, setError] = useState(null)

    // Reset state when user changes (e.g., logout)
    useEffect(() => {
        if (!user) {
            setAthleteProfile(null)
            setAccessibleAthletes([])
            setActiveAthlete(null)
            // If auth is done loading and we have no user, profile loading is also done (nothing to load)
            if (!authLoading) {
                setProfileLoading(false)
                setIsInitialized(true)
            }
        } else {
            // User exists, so we must load profile
            setProfileLoading(true)
        }
    }, [user, authLoading])

    const fetchProfileData = useCallback(async () => {
        if (!user) return

        setProfileLoading(true)
        setError(null)

        try {
            if (import.meta.env.DEV) console.log("Profile: Fetching data for", user.id)

            // Parallel fetch for efficiency
            const [profileResult, accessResult] = await Promise.all([
                supabase
                    .from('athletes')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle(),
                supabase
                    .from('profile_access')
                    .select(`
                        role,
                        athlete:athletes (
                            id,
                            name,
                            sport,
                            grad_year,
                            position,
                            position_group,
                            primary_position_display,
                            primary_position_group
                        )
                    `)
                    .eq('manager_id', user.id)
            ])

            if (profileResult.error) throw profileResult.error

            const accessRows = accessResult.error
                ? (isMissingTableError(accessResult.error) ? [] : (() => { throw accessResult.error })())
                : (accessResult.data || [])

            if (accessResult.error && isMissingTableError(accessResult.error) && import.meta.env.DEV) {
                console.warn('Profile: profile_access table missing; continuing without delegated athlete access.')
            }

            // Update State
            setAthleteProfile(profileResult.data)
            setAccessibleAthletes(accessRows)

            if (import.meta.env.DEV) console.log("Profile: Load complete", { hasProfile: !!profileResult.data })

        } catch (err) {
            console.error("Profile fetch error:", err)
            setError(err)
        } finally {
            setProfileLoading(false)
            setIsInitialized(true)
        }
    }, [user])

    // Trigger fetch when user is confirmed and auth is ready
    useEffect(() => {
        if (user && !authLoading) {
            fetchProfileData()
        }
    }, [user, authLoading, fetchProfileData])

    // Utility to switch active athlete (impersonation)
    const switchAthlete = (athleteId) => {
        if (!athleteId) {
            setActiveAthlete(null)
            return
        }
        const athlete = accessibleAthletes.find(a => a.athlete.id === athleteId)
        if (athlete) {
            setActiveAthlete(athlete.athlete)
        }
    }

    const value = {
        // Legacy/Internal names
        athleteProfile,
        loading: profileLoading,

        // Standardized Audit Names
        profile: athleteProfile,
        hasProfile: !!athleteProfile || accessibleAthletes.length > 0,
        isProfileLoading: profileLoading,
        isInitialized,

        // Access Control
        accessibleAthletes,
        activeAthlete,
        error,
        refreshProfile: fetchProfileData,
        switchAthlete,
        isImpersonating: !!activeAthlete
    }

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    )
}
