import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { signUp } = useAuth()

    // Redirect logic moved to App.jsx MainNavigator

    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const { error } = await signUp({ email, password })
            if (error) throw error
            setMessage('Account created! Redirecting...')
            // Navigation handled by useEffect when user state updates
        } catch (error) {
            setMessage('Error: ' + (error.message || 'Failed to sign up'))
            setLoading(false)
        }
    }

    return (
        <div className="lp-landing min-h-screen">
            <nav className="lp-nav" aria-label="Authentication navigation">
                <div className="lp-nav-container">
                    <Link to="/" className="lp-logo">RecruitCoS</Link>
                    <Link to="/login" className="lp-nav-link">Log in</Link>
                </div>
            </nav>

            <main className="rc-auth-shell flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
                <Card className="rc-auth-card w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">Get Started</CardTitle>
                        <p className="text-sm rc-muted">Create your account and continue to onboarding</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium rc-muted">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rc-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium rc-muted">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="rc-input"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="rc-btn-primary mt-2 w-full"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            {message && (
                                <div className={`rc-alert text-center ${message.includes('Error') ? 'rc-alert-error' : 'rc-alert-success'}`}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-[var(--rc-border)] pt-6">
                        <p className="text-sm rc-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
