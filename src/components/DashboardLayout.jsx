import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Bell, Search, User } from 'lucide-react'
import { PHASE_CONFIG } from '../lib/constants'
import ProfileSwitcher from './layout/ProfileSwitcher'

export default function DashboardLayout({ children, phase }) {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-brand-primary">
                            <div className="w-8 h-8 bg-brand-primary text-white flex items-center justify-center rounded-md font-sans">R</div>
                            RecruitCoS
                        </Link>

                        <ProfileSwitcher />

                        {phase && (
                            <div className={`hidden lg:flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${PHASE_CONFIG[phase]?.badgeClass || ''}`}>
                                {phase}
                            </div>
                        )}

                        {/* Main Nav Links */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link to="/" className="text-gray-900 hover:text-brand-primary transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/compass" className="text-gray-500 hover:text-gray-900 transition-colors">
                                Recruiting Compass
                            </Link>
                            <Link to="/measurables" className="text-gray-500 hover:text-gray-900 transition-colors">
                                Measurables
                            </Link>
                            <Link to="/log-event" className="text-gray-500 hover:text-gray-900 transition-colors">
                                Log Event
                            </Link>
                            {/* Placeholder Links */}
                            <span className="text-gray-400 cursor-not-allowed">Saved</span>
                            <span className="text-gray-400 cursor-not-allowed">Analytics</span>
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar (Visual) */}
                        <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-full w-64">
                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search content..."
                                className="bg-transparent border-none focus:outline-none text-sm w-full"
                            />
                        </div>

                        {/* Icons */}
                        <Button variant="ghost" size="icon" className="text-gray-500">
                            <Bell className="w-5 h-5" />
                        </Button>

                        {/* User Profile / Logout */}
                        <div className="flex items-center gap-2 pl-2 border-l ml-2">
                            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                                Sign Out
                            </Button>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
