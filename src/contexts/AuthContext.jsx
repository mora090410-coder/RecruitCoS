import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [accessibleAthletes, setAccessibleAthletes] = useState([])
    const [activeAthlete, setActiveAthlete] = useState(null)

    useEffect(() => {
        async function getSessionAndAccess() {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                await fetchAccess(currentUser.id)
            }

            setLoading(false)
        }

        getSessionAndAccess()

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                await fetchAccess(currentUser.id)
            } else {
                setAccessibleAthletes([])
                setActiveAthlete(null)
            }

            setLoading(false)
        })

        return () => subscription.unsubscribe()
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
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
        accessibleAthletes,
        activeAthlete,
        switchAthlete,
        isImpersonating: !!activeAthlete
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
