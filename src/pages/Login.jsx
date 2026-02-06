import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

export default function Login() {
    const [method, setMethod] = useState('password') // 'password' | 'magic'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { signIn, signInWithPassword, user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Redirect logic moved to App.jsx MainNavigator

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            if (method === 'password') {
                const { error } = await signInWithPassword({ email, password })
                if (error) throw error
                // Redirect handled by useEffect
            } else {
                const { error } = await signIn({ email })
                if (error) throw error
                setMessage('Check your email for the login link!')
            }
        } catch (error) {
            setMessage('Error: ' + (error.message || 'Failed to login'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rc-auth-shell flex min-h-screen items-center justify-center px-4">
            <Card className="rc-auth-card w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <p className="text-sm rc-muted">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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

                        {method === 'password' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium rc-muted">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rc-input"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="rc-btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (method === 'password' ? 'Sign In' : 'Send Magic Link')}
                        </Button>

                        {message && (
                            <div className={`rc-alert text-center ${message.includes('Error') ? 'rc-alert-error' : 'rc-alert-success'}`}>
                                {message}
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setMethod(method === 'password' ? 'magic' : 'password')
                                setMessage('')
                            }}
                            className="text-sm rc-muted transition-colors hover:text-[var(--rc-cardinal)]"
                        >
                            {method === 'password' ? 'Use a Magic Link instead' : 'Sign in with Password'}
                        </button>
                    </div>
                </CardContent>
                <CardFooter className="justify-center border-t border-[var(--rc-border)] pt-6">
                    <p className="text-sm rc-muted">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium hover:underline">
                            Get Started
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
