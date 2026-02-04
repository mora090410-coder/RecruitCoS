import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { signUp, user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

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
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Get Started</CardTitle>
                    <p className="text-sm text-zinc-400">Create your account to start building your brand</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <Input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-600 focus:ring-blue-600/20"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#007AFF] hover:bg-[#0056b3] text-white mt-2"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        {message && (
                            <div className={`text-sm text-center p-2 rounded ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-zinc-800 pt-6">
                    <p className="text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#007AFF] hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
