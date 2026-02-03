import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Login() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { signIn, user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/')
        }
    }, [user, authLoading, navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        // For MVP/Demo, simple magic link
        const { error } = await signIn({ email })

        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('Check your email for the login link!')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-brand-primary">Welcome Back</CardTitle>
                    <p className="text-sm text-gray-500">Enter your email to sign in</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending Link...' : 'Send Magic Link'}
                        </Button>
                        {message && (
                            <div className="space-y-2">
                                <p className={`text-sm text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                    {message}
                                </p>
                                {!message.includes('Error') && (
                                    <p className="text-xs text-center text-gray-500">
                                        (Local Dev: Emails are trapped at <a href="http://127.0.0.1:54324" target="_blank" rel="noreferrer" className="underline text-brand-primary">localhost:54324</a>)
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
