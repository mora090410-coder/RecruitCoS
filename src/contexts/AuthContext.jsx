import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ensureSignupTimestamp, getAttributionProps, track } from '../lib/analytics'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // Initial Session Check
        async function getSession() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (mounted) {
                    setUser(session?.user ?? null)
                }
            } catch (err) {
                console.error("Auth session check error:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        getSession()

        // Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (import.meta.env.DEV) console.log("Auth State Change:", _event)
            if (mounted) {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        signUp: async (data) => {
            const result = await supabase.auth.signUp(data)
            if (result.data?.user && result.data?.session) {
                setUser(result.data.user)
            }
            if (result.data?.user && !result.error) {
                const userCreatedAt = ensureSignupTimestamp(result.data.user.created_at || new Date().toISOString())
                track('signup_completed', {
                    ...getAttributionProps(),
                    signup_path: typeof window !== 'undefined' ? window.location.pathname : null,
                    user_created_at: userCreatedAt
                })
            }
            return result
        },
        signIn: (data) => supabase.auth.signInWithOtp(data),
        signInWithPassword: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
