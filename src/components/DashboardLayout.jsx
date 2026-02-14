import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Bell, Search, User } from 'lucide-react'
import { PHASE_CONFIG } from '../lib/constants'
import ProfileSwitcher from './layout/ProfileSwitcher'

export default function DashboardLayout({ children, phase }) {
    const { signOut } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', match: (pathname) => pathname.startsWith('/dashboard') },
        { to: '/compass', label: 'Recruiting Compass', match: (pathname) => pathname.startsWith('/compass') },
        { to: '/measurables', label: 'Measurables', match: (pathname) => pathname.startsWith('/measurables') },
        { to: '/weekly-plan', label: 'Weekly Plan', match: (pathname) => pathname.startsWith('/weekly-plan') },
        { to: '/log-event', label: 'Log Event', match: (pathname) => pathname.startsWith('/log-event') }
    ]

    return (
        <div className="lp-landing min-h-screen font-sans text-[var(--gray-900)]">
            {/* Top Navigation Bar */}
            <header className="lp-nav border-b border-[rgba(212,175,55,0.35)] bg-[rgba(139,38,53,0.96)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(139,38,53,0.9)]">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="flex items-center gap-2 font-serif text-xl font-bold text-[#F5F1E8]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(212,175,55,0.45)] bg-[#F5F1E8] text-[#8B2635] font-sans">R</div>
                            RecruitCoS
                        </Link>

                        <ProfileSwitcher />

                        {phase && (
                            <div className={`hidden lg:flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${PHASE_CONFIG[phase]?.badgeClass || ''}`}>
                                {phase}
                            </div>
                        )}

                        {/* Main Nav Links */}
                        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
                            {navLinks.map((link) => {
                                const active = link.match(location.pathname)
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={(link.label === 'Dashboard' || link.label === 'Weekly Plan')
                                            ? (event) => {
                                                event.preventDefault()
                                                navigate(link.label === 'Dashboard' ? '/dashboard' : '/weekly-plan')
                                            }
                                            : undefined}
                                        className={`relative pb-1 transition-colors ${active ? 'text-[#F5F1E8]' : 'text-[#F5F1E8]/75 hover:text-[#F5F1E8]'}`}
                                    >
                                        {link.label}
                                        {active && (
                                            <span className="absolute inset-x-0 -bottom-[2px] h-[2px] rounded-full bg-[#D4AF37]" />
                                        )}
                                    </Link>
                                )
                            })}
                            {/* Placeholder Links */}
                            <span className="cursor-not-allowed text-[#F5F1E8]/55">Saved</span>
                            <span className="cursor-not-allowed text-[#F5F1E8]/55">Analytics</span>
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar (Visual) */}
                        <div className="hidden md:flex items-center w-64 rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(245,241,232,0.18)] px-3 py-1.5">
                            <Search className="mr-2 h-4 w-4 text-[#F5F1E8]/80" />
                            <input
                                type="text"
                                placeholder="Search content..."
                                className="w-full border-none bg-transparent text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/65 focus:outline-none"
                            />
                        </div>

                        {/* Icons */}
                        <Button variant="ghost" size="icon" className="text-[#F5F1E8]/80 hover:text-[#F5F1E8]">
                            <Bell className="w-5 h-5" />
                        </Button>

                        {/* User Profile / Logout */}
                        <div className="ml-2 flex items-center gap-2 border-l border-[rgba(212,175,55,0.35)] pl-2">
                            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-[#F5F1E8]/80 hover:text-[#F5F1E8]">
                                Sign Out
                            </Button>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,175,55,0.45)] bg-[#F5F1E8] text-[#8B2635]">
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
