import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'

export default function Landing() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard')
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium animate-pulse">Loading experience...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-blue-500 selection:text-white">
            {/* Minimal Nav */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="font-bold text-xl tracking-tight">RecruitCoS</div>
                <Link to="/login">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                        Sign In
                    </Button>
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto pb-20">
                <div className="space-y-8 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent pb-2">
                        Your Recruiting <br className="hidden md:block" />
                        Chief of Staff.
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        AI-powered brand building and recruitment tracking <br className="hidden md:block" />
                        for the modern athlete.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link to="/signup">
                            <Button className="h-12 px-8 text-base bg-[#007AFF] hover:bg-[#0056b3] text-white rounded-full transition-all shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto">
                                Get Started
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="h-12 px-8 text-base border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-full bg-transparent w-full sm:w-auto">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="p-6 text-center text-zinc-600 text-sm">
                &copy; {new Date().getFullYear()} RecruitCOS. All rights reserved.
            </footer>
        </div>
    )
}
