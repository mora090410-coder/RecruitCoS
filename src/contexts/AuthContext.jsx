import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [accessibleAthletes, setAccessibleAthletes] = useState([])
    const [activeAthlete, setActiveAthlete] = useState(null)
    const [athleteProfile, setAthleteProfile] = useState(null)
    const [checkingProfile, setCheckingProfile] = useState(true)

    useEffect(() => {
        let mounted = true

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (mounted && (loading || checkingProfile)) {
                console.warn("Auth check timed out - forcing load completion")
                if (import.meta.env.DEV) console.log("State at timeout:", { user: !!user, loading, checkingProfile })
                setLoading(false)
                setCheckingProfile(false)
            }
        }, 5000)

        async function getSessionAndAccess() {
            try {
                if (import.meta.env.DEV) console.log("Auth: Getting session...")
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) console.error("Auth session error:", error)

                const currentUser = session?.user ?? null
                if (mounted) setUser(currentUser)

                if (currentUser) {
                    if (import.meta.env.DEV) console.log("Auth: User found, fetching profile data...")
                    // Use Promise.race to prevent fetch hangs
                    await Promise.race([
                        Promise.all([
                            fetchAccess(currentUser.id),
                            fetchAthleteProfile(currentUser.id)
                        ]),
                        new Promise(resolve => setTimeout(resolve, 4000)) // Inner timeout slightly shorter
                    ])
                }
            } catch (err) {
                console.error("Auth initialization error:", err)
            } finally {
                if (mounted) {
                    if (import.meta.env.DEV) console.log("Auth: Initialization complete")
                    setLoading(false)
                    setCheckingProfile(false)
                    clearTimeout(safetyTimeout)
                }
            }
        }

        getSessionAndAccess()

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (import.meta.env.DEV) console.log("Auth: State change event:", _event)
            const currentUser = session?.user ?? null
            if (mounted) setUser(currentUser)

            if (currentUser) {
                await Promise.all([
                    fetchAccess(currentUser.id),
                    fetchAthleteProfile(currentUser.id)
                ])
            } else {
                if (mounted) {
                    setAccessibleAthletes([])
                    setActiveAthlete(null)
                    setAthleteProfile(null)
                }
            }

            if (mounted) {
                setLoading(false)
                setCheckingProfile(false)
            }
        })

        return () => {
            mounted = false
            clearTimeout(safetyTimeout)
            subscription.unsubscribe()
        }
    }, [])

    const fetchAccess = async (userId) => {
        try {
            const { data, error } = await supabase
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
                .eq('manager_id', userId)

            if (!error) {
                setAccessibleAthletes(data || [])
            }
        } catch (err) {
            console.error("Error fetching athlete access:", err)
        }
    }

    const fetchAthleteProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('athletes')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()

            if (!error && data) {
                setAthleteProfile(data)
            } else {
                setAthleteProfile(null)
            }
        } catch (err) {
            console.error("Error fetching athlete profile:", err)
            setAthleteProfile(null)
        }
    }

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
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithOtp(data),
        signInWithPassword: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
        checkingProfile,
        accessibleAthletes,
        activeAthlete,
        athleteProfile,
        switchAthlete,
        refreshProfile: () => user && fetchAthleteProfile(user.id),
        isImpersonating: !!activeAthlete
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
