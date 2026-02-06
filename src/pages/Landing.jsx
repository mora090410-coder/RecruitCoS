import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { CheckCircle2, Compass, Flag, Target } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/" className="text-xl font-bold tracking-tight">RecruitCoS</Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="text-zinc-700">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
                        <div className="space-y-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Athlete Recruiting OS</p>
                            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                                Everyone deserves the chance to be recruited
                            </h1>
                            <p className="max-w-xl text-base text-zinc-600 sm:text-lg">
                                RecruitCoS gives athletes a clear weekly system to build exposure, close performance gaps, and stay on track through every phase of recruiting.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/signup">
                                    <Button size="lg" className="w-full sm:w-auto">Start Your Free Plan →</Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto">Login</Button>
                                </Link>
                            </div>
                            <p className="text-sm text-zinc-500">No credit card • Free forever • 3-minute setup</p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">This Week&apos;s Priorities</p>
                                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-600">Week Plan</span>
                            </div>
                            <div className="space-y-3">
                                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-xs uppercase text-zinc-500">Primary Gap</p>
                                    <p className="mt-1 text-sm font-semibold">Close your sprint speed gap</p>
                                    <p className="mt-1 text-xs text-zinc-600">2 speed sessions + log your latest 40 time.</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-xs uppercase text-zinc-500">Strength</p>
                                    <p className="mt-1 text-sm font-semibold">Lean into your first-step quickness</p>
                                    <p className="mt-1 text-xs text-zinc-600">Build film clips that show burst and change of direction.</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-xs uppercase text-zinc-500">Recruiting Action</p>
                                    <p className="mt-1 text-sm font-semibold">Reach out to 3 target schools</p>
                                    <p className="mt-1 text-xs text-zinc-600">Send your update with verified metrics and schedule.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">The problem athletes face today</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <article className="rounded-xl border border-zinc-200 bg-white p-5">
                            <h3 className="text-lg font-semibold">No System</h3>
                            <p className="mt-2 text-sm text-zinc-600">Most athletes don’t have a week-to-week recruiting plan with clear priorities.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-5">
                            <h3 className="text-lg font-semibold">Wasting Money</h3>
                            <p className="mt-2 text-sm text-zinc-600">Families spend on random camps and services without a focused strategy.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-5">
                            <h3 className="text-lg font-semibold">Flying Blind</h3>
                            <p className="mt-2 text-sm text-zinc-600">Athletes don’t know what to improve first or what coaches need to see.</p>
                        </article>
                    </div>
                </section>

                <section className="border-y border-zinc-200 bg-white">
                    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
                        <h2 className="text-2xl font-bold sm:text-3xl">How RecruitCoS works</h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <article className="rounded-xl border border-zinc-200 p-5">
                                <Compass className="h-5 w-5 text-brand-primary" />
                                <h3 className="mt-3 text-lg font-semibold">1. Build Your Profile</h3>
                                <p className="mt-2 text-sm text-zinc-600">Set your sport, position, graduation year, and target level once.</p>
                            </article>
                            <article className="rounded-xl border border-zinc-200 p-5">
                                <Target className="h-5 w-5 text-brand-primary" />
                                <h3 className="mt-3 text-lg font-semibold">2. Get Weekly Priorities</h3>
                                <p className="mt-2 text-sm text-zinc-600">See the exact actions that move your recruiting profile forward.</p>
                            </article>
                            <article className="rounded-xl border border-zinc-200 p-5">
                                <Flag className="h-5 w-5 text-brand-primary" />
                                <h3 className="mt-3 text-lg font-semibold">3. Track Progress</h3>
                                <p className="mt-2 text-sm text-zinc-600">Log measurables and actions to unlock deeper dashboard insights.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Phase-by-phase recruiting guide</h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <article className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold">8th-9th</h3>
                            <p className="mt-2 text-sm text-zinc-600">Build fundamentals, document baseline measurables, and create early habits.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold">10th</h3>
                            <p className="mt-2 text-sm text-zinc-600">Expand school list, improve profile quality, and increase verified data points.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold">11th</h3>
                            <p className="mt-2 text-sm text-zinc-600">Peak outreach season. Prioritize coach communication and consistent updates.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="font-semibold">12th</h3>
                            <p className="mt-2 text-sm text-zinc-600">Finalize fit, evaluate offers, and stay execution-focused through decision windows.</p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
                            <h3 className="font-semibold">Post-Commitment</h3>
                            <p className="mt-2 text-sm text-zinc-600">Maintain readiness and transition your system into college-level performance.</p>
                        </article>
                    </div>
                </section>

                <section className="border-y border-zinc-200 bg-white">
                    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
                        <h2 className="text-2xl font-bold sm:text-3xl">Built for Softball • Baseball • Soccer • Basketball • Football</h2>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {['SB', 'BB', 'SC', 'BK', 'FB'].map((sport) => (
                                <span key={sport} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-xs font-bold text-zinc-700">
                                    {sport}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-zinc-600">Starting with softball. More sports coming soon.</p>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Simple pricing</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-zinc-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Free</p>
                            <p className="mt-2 text-3xl font-bold">$0</p>
                            <ul className="mt-5 space-y-2 text-sm text-zinc-700">
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primary" />Weekly plan generation</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primary" />Action tracking</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primary" />Profile and baseline setup</li>
                            </ul>
                            <Link to="/signup" className="mt-6 block">
                                <Button className="w-full">Start Free</Button>
                            </Link>
                        </article>
                        <article className="rounded-xl border border-zinc-300 bg-zinc-900 p-6 text-white">
                            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Pro</p>
                            <p className="mt-2 text-3xl font-bold">Coming Soon</p>
                            <ul className="mt-5 space-y-2 text-sm text-zinc-200">
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-white" />Full dashboard unlock</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-white" />Advanced progression insights</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-white" />Expanded recruiting workflows</li>
                            </ul>
                            <Link to="/upgrade" className="mt-6 block">
                                <Button variant="secondary" className="w-full">See Pro</Button>
                            </Link>
                        </article>
                    </div>
                    <p className="mt-4 text-sm text-zinc-600">No credit card required • Cancel anytime</p>
                </section>

                <section className="border-y border-zinc-200 bg-white">
                    <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
                        <h2 className="text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
                            Build your recruiting system in minutes and follow the exact priorities that matter this week.
                        </p>
                        <Link to="/signup" className="mt-8 inline-block">
                            <Button size="lg">Start Your Free Plan →</Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200 bg-zinc-50">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:px-6">
                    <p>© {new Date().getFullYear()} RecruitCoS</p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-zinc-900">Privacy</Link>
                        <Link to="/terms" className="hover:text-zinc-900">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
