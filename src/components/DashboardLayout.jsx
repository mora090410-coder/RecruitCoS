import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Bell, Search, User } from 'lucide-react'
import { PHASE_CONFIG } from '../lib/constants'
import ProfileSwitcher from './layout/ProfileSwitcher'

export default function DashboardLayout({ children, phase }) {
    const { signOut } = useAuth()
    const location = useLocation()

    const navLinks = [
        { to: '/', label: 'Dashboard', match: (pathname) => pathname === '/' || pathname === '/dashboard' },
        { to: '/compass', label: 'Recruiting Compass', match: (pathname) => pathname.startsWith('/compass') },
        { to: '/measurables', label: 'Measurables', match: (pathname) => pathname.startsWith('/measurables') },
        { to: '/weekly-plan', label: 'Weekly Plan', match: (pathname) => pathname.startsWith('/weekly-plan') },
        { to: '/log-event', label: 'Log Event', match: (pathname) => pathname.startsWith('/log-event') }
    ]

    return (
        <div className="rc-landing min-h-screen font-sans text-[var(--rc-ink)]">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--rc-border)] bg-[rgba(255,253,249,0.88)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(255,253,249,0.72)]">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--rc-cardinal)]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(153,0,0,0.22)] bg-[rgba(255,255,255,0.94)] text-[var(--rc-cardinal)] font-sans">R</div>
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
                                        className={`relative pb-1 transition-colors ${active ? 'text-[var(--rc-cardinal)]' : 'text-[var(--rc-muted)] hover:text-[var(--rc-ink)]'}`}
                                    >
                                        {link.label}
                                        {active && (
                                            <span className="absolute inset-x-0 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-[var(--rc-cardinal)] to-[var(--rc-gold)]" />
                                        )}
                                    </Link>
                                )
                            })}
                            {/* Placeholder Links */}
                            <span className="cursor-not-allowed text-[var(--rc-muted)]/70">Saved</span>
                            <span className="cursor-not-allowed text-[var(--rc-muted)]/70">Analytics</span>
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar (Visual) */}
                        <div className="hidden md:flex items-center w-64 rounded-full border border-[var(--rc-border)] bg-[rgba(255,255,255,0.85)] px-3 py-1.5">
                            <Search className="mr-2 h-4 w-4 text-[var(--rc-muted)]" />
                            <input
                                type="text"
                                placeholder="Search content..."
                                className="w-full border-none bg-transparent text-sm focus:outline-none"
                            />
                        </div>

                        {/* Icons */}
                        <Button variant="ghost" size="icon" className="text-[var(--rc-muted)] hover:text-[var(--rc-cardinal)]">
                            <Bell className="w-5 h-5" />
                        </Button>

                        {/* User Profile / Logout */}
                        <div className="ml-2 flex items-center gap-2 border-l border-[var(--rc-border)] pl-2">
                            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-[var(--rc-muted)] hover:text-[var(--rc-cardinal)]">
                                Sign Out
                            </Button>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--rc-border)] bg-white text-[var(--rc-muted)]">
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
