import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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
                    .eq('user_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('profile_access')
                    .select(`
                        role,
                        athlete:athletes (
                            id,
                            full_name,
                            sport,
                            grad_year
                        )
                    `)
                    .eq('manager_id', user.id)
            ])

            if (profileResult.error) throw profileResult.error
            if (accessResult.error) throw accessResult.error

            // Update State
            setAthleteProfile(profileResult.data)
            setAccessibleAthletes(accessResult.data || [])

            if (import.meta.env.DEV) console.log("Profile: Load complete", { hasProfile: !!profileResult.data })

        } catch (err) {
            console.error("Profile fetch error:", err)
            setError(err)
        } finally {
            setProfileLoading(false)
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
        hasProfile: !!athleteProfile,
        isProfileLoading: profileLoading,

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
