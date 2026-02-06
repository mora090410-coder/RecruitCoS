import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { CheckCircle2, Compass, Flag, Target } from 'lucide-react'

export default function Landing() {
    return (
        <div className="rc-landing min-h-screen">
            <header className="rc-header">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/" className="text-xl font-bold tracking-tight">RecruitCoS</Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="rc-btn-secondary">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="rc-btn-primary">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="rc-section rc-section-hero">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-5">
                            <p className="rc-pill-label">Athlete Recruiting OS</p>
                            <h1 className="rc-hero-title">
                                Everyone deserves the chance to be recruited
                            </h1>
                            <div className="rc-gold-rule" aria-hidden="true" />
                            <p className="max-w-xl text-base text-zinc-600 sm:text-lg rc-muted">
                                RecruitCoS gives athletes a clear weekly system to build exposure, close performance gaps, and stay on track through every phase of recruiting.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/signup">
                                    <Button size="lg" className="rc-btn-primary w-full sm:w-auto">Start Your Free Plan →</Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="lg" variant="outline" className="rc-btn-secondary w-full sm:w-auto">Login</Button>
                                </Link>
                            </div>
                            <p className="text-sm rc-muted">No credit card • Free forever • 3-minute setup</p>
                        </div>

                        <div className="relative">
                            <span className="rc-icon-tile rc-icon-tile-one" aria-hidden="true" />
                            <span className="rc-icon-tile rc-icon-tile-two" aria-hidden="true" />
                            <span className="rc-icon-tile rc-icon-tile-three" aria-hidden="true" />
                        <div className="rc-hero-mock-card p-5 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider rc-muted">This Week&apos;s Priorities</p>
                                <span className="rc-pill-label">Week Plan</span>
                            </div>
                            <div className="space-y-3">
                                <div className="rc-inner-card p-3">
                                    <p className="text-xs uppercase rc-muted">Primary Gap</p>
                                    <p className="mt-1 text-sm font-semibold">Close your sprint speed gap</p>
                                    <p className="mt-1 text-xs rc-muted">2 speed sessions + log your latest 40 time.</p>
                                </div>
                                <div className="rc-inner-card p-3">
                                    <p className="text-xs uppercase rc-muted">Strength</p>
                                    <p className="mt-1 text-sm font-semibold">Lean into your first-step quickness</p>
                                    <p className="mt-1 text-xs rc-muted">Build film clips that show burst and change of direction.</p>
                                </div>
                                <div className="rc-inner-card p-3">
                                    <p className="text-xs uppercase rc-muted">Recruiting Action</p>
                                    <p className="mt-1 text-sm font-semibold">Reach out to 3 target schools</p>
                                    <p className="mt-1 text-xs rc-muted">Send your update with verified metrics and schedule.</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                <section className="rc-section">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">The problem athletes face today</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <article className="rc-surface-card p-5">
                            <h3 className="text-lg font-semibold">No System</h3>
                            <p className="mt-2 text-sm rc-muted">Most athletes don’t have a week-to-week recruiting plan with clear priorities.</p>
                        </article>
                        <article className="rc-surface-card p-5">
                            <h3 className="text-lg font-semibold">Wasting Money</h3>
                            <p className="mt-2 text-sm rc-muted">Families spend on random camps and services without a focused strategy.</p>
                        </article>
                        <article className="rc-surface-card p-5">
                            <h3 className="text-lg font-semibold">Flying Blind</h3>
                            <p className="mt-2 text-sm rc-muted">Athletes don’t know what to improve first or what coaches need to see.</p>
                        </article>
                    </div>
                    </div>
                </section>

                <section className="rc-section rc-section-divider">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <h2 className="text-2xl font-bold sm:text-3xl">How RecruitCoS works</h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <article className="rc-surface-card p-5">
                                <span className="rc-icon-highlight"><Compass className="h-5 w-5 text-[var(--rc-cardinal)]" /></span>
                                <h3 className="mt-3 text-lg font-semibold">1. Build Your Profile</h3>
                                <p className="mt-2 text-sm rc-muted">Set your sport, position, graduation year, and target level once.</p>
                            </article>
                            <article className="rc-surface-card p-5">
                                <span className="rc-icon-highlight"><Target className="h-5 w-5 text-[var(--rc-cardinal)]" /></span>
                                <h3 className="mt-3 text-lg font-semibold">2. Get Weekly Priorities</h3>
                                <p className="mt-2 text-sm rc-muted">See the exact actions that move your recruiting profile forward.</p>
                            </article>
                            <article className="rc-surface-card p-5">
                                <span className="rc-icon-highlight"><Flag className="h-5 w-5 text-[var(--rc-cardinal)]" /></span>
                                <h3 className="mt-3 text-lg font-semibold">3. Track Progress</h3>
                                <p className="mt-2 text-sm rc-muted">Log measurables and actions to unlock deeper dashboard insights.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="rc-section">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Phase-by-phase recruiting guide</h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <article className="rc-surface-card p-4">
                            <h3 className="font-semibold">8th-9th</h3>
                            <p className="mt-2 text-sm rc-muted">Build fundamentals, document baseline measurables, and create early habits.</p>
                        </article>
                        <article className="rc-surface-card p-4">
                            <h3 className="font-semibold">10th</h3>
                            <p className="mt-2 text-sm rc-muted">Expand school list, improve profile quality, and increase verified data points.</p>
                        </article>
                        <article className="rc-surface-card p-4">
                            <h3 className="font-semibold">11th</h3>
                            <p className="mt-2 text-sm rc-muted">Peak outreach season. Prioritize coach communication and consistent updates.</p>
                        </article>
                        <article className="rc-surface-card p-4">
                            <h3 className="font-semibold">12th</h3>
                            <p className="mt-2 text-sm rc-muted">Finalize fit, evaluate offers, and stay execution-focused through decision windows.</p>
                        </article>
                        <article className="rc-surface-card p-4 sm:col-span-2 lg:col-span-1">
                            <h3 className="font-semibold">Post-Commitment</h3>
                            <p className="mt-2 text-sm rc-muted">Maintain readiness and transition your system into college-level performance.</p>
                        </article>
                    </div>
                    </div>
                </section>

                <section className="rc-section rc-section-divider">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <h2 className="text-2xl font-bold sm:text-3xl">Built for Softball • Baseball • Soccer • Basketball • Football</h2>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {['SB', 'BB', 'SC', 'BK', 'FB'].map((sport) => (
                                <span key={sport} className="rc-sport-tile inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                                    {sport}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-sm rc-muted">Starting with softball. More sports coming soon.</p>
                    </div>
                </section>

                <section className="rc-section">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Simple pricing</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <article className="rc-surface-card p-6">
                            <p className="rc-pill-label text-sm font-semibold uppercase tracking-wider">Free</p>
                            <p className="mt-2 text-3xl font-bold">$0</p>
                            <ul className="mt-5 space-y-2 text-sm">
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Weekly plan generation</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Action tracking</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Profile and baseline setup</li>
                            </ul>
                            <Link to="/signup" className="mt-6 block">
                                <Button className="rc-btn-primary w-full">Start Free</Button>
                            </Link>
                        </article>
                        <article className="rc-surface-card p-6">
                            <p className="rc-pill-label text-sm font-semibold uppercase tracking-wider">Pro</p>
                            <p className="mt-2 text-3xl font-bold">Coming Soon</p>
                            <ul className="mt-5 space-y-2 text-sm">
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Full dashboard unlock</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Advanced progression insights</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--rc-cardinal)]" />Expanded recruiting workflows</li>
                            </ul>
                            <Link to="/upgrade" className="mt-6 block">
                                <Button variant="secondary" className="rc-btn-secondary w-full">See Pro</Button>
                            </Link>
                        </article>
                    </div>
                    <p className="mt-4 text-sm rc-muted">No credit card required • Cancel anytime</p>
                    </div>
                </section>

                <section className="rc-section rc-section-divider">
                    <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
                        <h2 className="text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
                        <p className="mx-auto mt-3 max-w-2xl rc-muted">
                            Build your recruiting system in minutes and follow the exact priorities that matter this week.
                        </p>
                        <Link to="/signup" className="mt-8 inline-block">
                            <Button size="lg" className="rc-btn-primary">Start Your Free Plan →</Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="rc-footer">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm rc-muted sm:flex-row sm:items-center sm:px-6">
                    <p>© {new Date().getFullYear()} RecruitCoS</p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-[var(--rc-cardinal)]">Privacy</Link>
                        <Link to="/terms" className="hover:text-[var(--rc-cardinal)]">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
