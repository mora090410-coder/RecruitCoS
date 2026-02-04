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
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <p className="text-sm text-zinc-400">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-600 focus:ring-blue-600/20"
                            />
                        </div>

                        {method === 'password' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-600 focus:ring-blue-600/20"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-[#007AFF] hover:bg-[#0056b3] text-white"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (method === 'password' ? 'Sign In' : 'Send Magic Link')}
                        </Button>

                        {message && (
                            <div className={`text-sm text-center p-2 rounded ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
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
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            {method === 'password' ? 'Use a Magic Link instead' : 'Sign in with Password'}
                        </button>
                    </div>
                </CardContent>
                <CardFooter className="justify-center border-t border-zinc-800 pt-6">
                    <p className="text-sm text-zinc-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#007AFF] hover:underline font-medium">
                            Get Started
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
