import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ChevronDown } from 'lucide-react'
import { calculateFaqHeights, setupSectionReveal } from '../lib/landingInteractions'

const testimonials = [
    { quote: '"[Insert exact testimonial quote #1]"', attribution: '- [Insert attribution #1]' },
    { quote: '"[Insert exact testimonial quote #2]"', attribution: '- [Insert attribution #2]' },
    { quote: '"[Insert exact testimonial quote #3]"', attribution: '- [Insert attribution #3]' }
]

const faqItems = [
    { question: '[Insert exact question #1]', answer: '[Insert exact answer #1]' },
    { question: '[Insert exact question #2]', answer: '[Insert exact answer #2]' },
    { question: '[Insert exact question #3]', answer: '[Insert exact answer #3]' },
    { question: '[Insert exact question #4]', answer: '[Insert exact answer #4]' },
    { question: '[Insert exact question #5]', answer: '[Insert exact answer #5]' }
]

const weeklyPlanItems = [
    { label: 'Gap Priority', title: 'Close your 40-yard sprint gap', detail: '2 speed sessions + re-test on Friday' },
    { label: 'Outreach', title: 'Send updates to 3 target programs', detail: 'Include latest verified measurables' },
    { label: 'Film', title: 'Publish 1 skill-specific clip', detail: 'Focus on first-step explosion' },
    { label: 'Readiness', title: 'Track weekly completion score', detail: 'Monitor consistency and momentum' }
]

const solutionMockItems = [
    'Primary Gap: Sprint Speed (D2 benchmark +0.17s)',
    'Action 1: Acceleration session + resisted starts',
    'Action 2: Update 3 coaches with latest metrics',
    'Action 3: Publish one verified training clip',
    'Readiness Trend: +8 this week',
    'School Interest: 2 warm, 1 high-priority follow-up',
    'Next Week Focus: Top-end speed + outreach cadence',
    'Milestone: Weekly completion > 80% unlock'
]

function MiniPanelFrame({ chromeTitle, children }) {
    return (
        <div className="h-full rounded-lg border border-[rgba(153,0,0,0.14)] bg-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="mb-2 flex items-center justify-between rounded-md border border-[var(--rc-border)] bg-[rgba(248,244,238,0.75)] px-2 py-1">
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgba(153,0,0,0.28)]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgba(153,0,0,0.2)]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgba(153,0,0,0.14)]" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--rc-muted)]">{chromeTitle}</span>
            </div>
            <div className="space-y-1.5">{children}</div>
        </div>
    )
}

export default function Landing() {
    const landingRef = useRef(null)
    const faqContentRefs = useRef([])
    const [openFaqIndex, setOpenFaqIndex] = useState(0)
    const [faqHeights, setFaqHeights] = useState([])

    useEffect(() => {
        const updateFaqHeights = () => {
            setFaqHeights(calculateFaqHeights(faqItems.length, faqContentRefs.current))
        }

        updateFaqHeights()
        window.addEventListener('resize', updateFaqHeights)
        return () => window.removeEventListener('resize', updateFaqHeights)
    }, [])

    useEffect(() => {
        const root = landingRef.current
        if (!root) return

        return setupSectionReveal(root)
    }, [])

    return (
        <div ref={landingRef} className="rc-landing min-h-screen text-[var(--rc-ink)]">
            <header className="rc-header">
                <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="text-3xl font-bold tracking-tight text-[var(--rc-cardinal)]">RecruitCoS</div>
                    <Link to="/login" className="text-base font-semibold text-[var(--rc-cardinal)] hover:text-[var(--rc-link-hover)]">Log in</Link>
                </div>
            </header>

            <main>
                <section data-reveal className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                        <div className="space-y-8" data-stagger>
                            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Stop Guessing. Start Planning.</h1>
                            <p className="max-w-2xl text-[18px] leading-[1.6] text-[var(--rc-muted)] sm:text-[20px]">
                                Get your personalized weekly recruiting plan in under 3 minutes—based on your sport, position, and measurables.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Link to="/signup">
                                    <Button size="lg" className="rc-btn-primary rc-hero-cta w-full sm:w-auto">Get My Free Plan</Button>
                                </Link>
                                <p className="text-sm text-[var(--rc-muted)]">Join 250+ athletes already planning smarter</p>
                            </div>
                        </div>

                        <div className="rc-hero-mock-card p-6 sm:p-7" data-stagger>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="rc-pill">Weekly Recruiting Plan</p>
                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rc-muted)]">This Week</span>
                            </div>
                            <div className="space-y-3">
                                {weeklyPlanItems.map((item) => (
                                    <div key={item.title} className="rc-inner-card p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rc-muted)]">{item.label}</p>
                                        <p className="mt-1.5 text-base font-semibold">{item.title}</p>
                                        <p className="mt-1 text-sm text-[var(--rc-muted)]">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section data-reveal className="border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.7)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Recruiting Feels Like Chaos</h2>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            <article data-stagger className="rc-surface p-7">
                                <h3 className="text-2xl font-bold">📊 Fragmented</h3>
                                <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Emails, spreadsheets, DMs—nothing is organized</p>
                            </article>
                            <article data-stagger className="rc-surface p-7">
                                <h3 className="text-2xl font-bold">💸 Expensive</h3>
                                <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">$5K–$20K/year with no clear ROI</p>
                            </article>
                            <article data-stagger className="rc-surface p-7">
                                <h3 className="text-2xl font-bold">😰 Stressful</h3>
                                <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Conflicting advice from coaches, parents, recruiters</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section data-reveal className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Your Weekly Recruiting Plan</h2>
                        <div className="mt-12 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
                            <div data-stagger className="rc-device-frame mx-auto w-full max-w-[430px]">
                                <div className="rc-device-screen">
                                    <div className="rc-plan-scroll">
                                        {solutionMockItems.concat(solutionMockItems).map((line, idx) => (
                                            <div key={`${line}-${idx}`} className="rc-plan-scroll-row">{line}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <article data-stagger className="rc-surface p-6">
                                    <h3 className="text-2xl font-bold">✅ Stage-Aware Guidance</h3>
                                    <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Tailored to your grad year and recruiting phase</p>
                                </article>
                                <article data-stagger className="rc-surface p-6">
                                    <h3 className="text-2xl font-bold">✅ Measurable Gaps</h3>
                                    <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Compare your metrics to D1/D2/D3 benchmarks</p>
                                </article>
                                <article data-stagger className="rc-surface p-6">
                                    <h3 className="text-2xl font-bold">✅ 3-Action Priorities</h3>
                                    <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Know exactly what to focus on this week</p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section data-reveal className="border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.72)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Get Your Plan in 3 Minutes</h2>
                        <div className="relative mt-12">
                            <div className="grid gap-5 md:grid-cols-3">
                                <article data-stagger className="rc-surface flex h-full flex-col p-7">
                                    <p className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(153,0,0,0.24)] bg-white text-base font-bold text-[var(--rc-cardinal)]">①</p>
                                    <div className="mb-3 rounded-xl border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Form">
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Sport ▾</div>
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Position ▾</div>
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Grad year ▾</div>
                                                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                                                    <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">40 yd</div>
                                                    <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">Vert</div>
                                                    <div className="rounded border border-[rgba(153,0,0,0.32)] bg-[rgba(255,204,0,0.18)] px-1.5 py-1 text-center text-[9px] font-semibold text-[var(--rc-cardinal)]">Shuttle</div>
                                                </div>
                                            </MiniPanelFrame>
                                        </div>
                                        <p className="mt-2 text-center text-sm font-semibold text-[var(--rc-muted)]">Form</p>
                                    </div>
                                    <h3 className="text-2xl font-bold">Tell Us About Your Athlete</h3>
                                    <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Sport, position, grad year, 3 key metrics</p>
                                </article>

                                <article data-stagger className="rc-surface flex h-full flex-col p-7">
                                    <p className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(153,0,0,0.24)] bg-white text-base font-bold text-[var(--rc-cardinal)]">②</p>
                                    <div className="mb-3 rounded-xl border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Plan">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <p className="text-[10px] font-semibold text-[var(--rc-ink)]">This Week&apos;s Priorities</p>
                                                    <span className="rounded-full border border-[rgba(153,0,0,0.3)] bg-[rgba(255,204,0,0.2)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[var(--rc-cardinal)]">Phase</span>
                                                </div>
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1 text-[10px] text-[var(--rc-muted)]">1. Sprint gap session + retest</div>
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1 text-[10px] text-[var(--rc-muted)]">2. Send updates to 3 schools</div>
                                                <div className="rounded border border-[rgba(153,0,0,0.32)] bg-[rgba(255,204,0,0.18)] px-2 py-1 text-[10px] font-semibold text-[var(--rc-cardinal)]">3. Publish one verified clip</div>
                                            </MiniPanelFrame>
                                        </div>
                                        <p className="mt-2 text-center text-sm font-semibold text-[var(--rc-muted)]">Plan</p>
                                    </div>
                                    <h3 className="text-2xl font-bold">Get Your Weekly Plan</h3>
                                    <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Instant analysis + prioritized actions</p>
                                </article>

                                <article data-stagger className="rc-surface flex h-full flex-col p-7">
                                    <p className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(153,0,0,0.24)] bg-white text-base font-bold text-[var(--rc-cardinal)]">③</p>
                                    <div className="mb-3 rounded-xl border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Track">
                                                <p className="text-[10px] font-semibold text-[var(--rc-ink)]">Progress</p>
                                                <div className="rounded border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] p-2">
                                                    <div className="relative h-8">
                                                        <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[var(--rc-border)]" />
                                                        <span className="absolute bottom-[4px] left-[8%] h-[1px] w-[24%] rotate-[8deg] bg-[var(--rc-muted)]/50" />
                                                        <span className="absolute bottom-[10px] left-[32%] h-[1px] w-[22%] -rotate-[6deg] bg-[var(--rc-muted)]/50" />
                                                        <span className="absolute bottom-[14px] left-[54%] h-[1.5px] w-[34%] rotate-[9deg] bg-[var(--rc-cardinal)]" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-[var(--rc-muted)]">Completed 2/3</span>
                                                    <span className="font-semibold text-[var(--rc-cardinal)]">Next plan ready</span>
                                                </div>
                                            </MiniPanelFrame>
                                        </div>
                                        <p className="mt-2 text-center text-sm font-semibold text-[var(--rc-muted)]">Track</p>
                                    </div>
                                    <h3 className="text-2xl font-bold">Track Your Progress</h3>
                                    <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Update metrics, get next week&apos;s plan</p>
                                </article>
                            </div>
                            <span className="pointer-events-none absolute left-[calc(33.333%-0.7rem)] top-1/2 hidden -translate-y-1/2 text-3xl text-[var(--rc-muted)]/70 md:block">→</span>
                            <span className="pointer-events-none absolute left-[calc(66.666%-0.7rem)] top-1/2 hidden -translate-y-1/2 text-3xl text-[var(--rc-muted)]/70 md:block">→</span>
                        </div>
                        <div className="mt-10 text-center" data-stagger>
                            <Link to="/signup">
                                <Button size="lg" className="rc-btn-primary">Get My Free Plan  →</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <section data-reveal className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Athletes Are Already Planning Smarter</h2>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {testimonials.map((testimonial) => (
                                <article key={testimonial.quote} data-stagger className="rc-surface rc-testimonial-card p-7">
                                    <div className="mb-4 h-12 w-12 rounded-full border border-[var(--rc-border)] bg-[rgba(255,255,255,0.92)]" aria-hidden="true" />
                                    <p className="text-[18px] leading-[1.6] text-[var(--rc-ink)]">{testimonial.quote}</p>
                                    <p className="mt-4 text-sm font-semibold text-[var(--rc-muted)]">{testimonial.attribution}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" data-reveal className="rc-pricing-manifesto border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.72)] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="rc-pricing-inner">
                        <div className="rc-pricing-panel">
                            <div data-stagger className="rc-pricing-row rc-pricing-row-hero">
                                <div>
                                    <h2 className="text-center text-4xl font-bold tracking-tight sm:text-left sm:text-5xl">Built for the 95%</h2>
                                    <p className="mt-5 text-center text-[18px] leading-[1.6] text-[var(--rc-muted)] sm:text-left">
                                        Weekly recruiting guidance for athletes who don’t have $4,200 coordinators.
                                    </p>
                                </div>
                                <div className="rc-pricing-quick-cta">
                                    <Link to="/signup" className="rc-manifesto-cta">Start Your Plan</Link>
                                    <p className="rc-pricing-quick-price">$25/month after 2 weeks</p>
                                    <p className="rc-pricing-quick-note">Or earn permanent free access.</p>
                                </div>
                            </div>

                            <div data-stagger className="rc-pricing-row rc-pricing-row-modules">
                                <div className="rc-pricing-block rc-pricing-module rc-pricing-module-free">
                                    <h3 className="rc-pricing-label">FREE FOREVER</h3>
                                    <p className="rc-pricing-body">Your weekly recruiting plan.</p>
                                    <div className="rc-pricing-lines">
                                        <p>Weekly action priorities</p>
                                        <p>Phase-aware guidance</p>
                                        <p>School tracking CRM</p>
                                        <p>Progress over time</p>
                                    </div>
                                </div>
                                <div className="rc-pricing-block rc-pricing-module rc-pricing-module-unlock">
                                    <h3 className="rc-pricing-label">UNLOCK FULL ANALYSIS</h3>
                                    <p className="rc-pricing-body">$25/month after 2 weeks</p>
                                    <div className="rc-pricing-lines">
                                        <p>Benchmark comparisons</p>
                                        <p>Gap analysis breakdown</p>
                                        <p>Readiness score detail</p>
                                        <p>School interest ranking</p>
                                    </div>
                                </div>
                            </div>

                            <div data-stagger className="rc-pricing-row rc-pricing-row-paths">
                                <p className="rc-pricing-subtitle">TWO WAYS TO UNLOCK</p>
                                <div className="rc-pricing-paths">
                                    <div className="rc-pricing-path">
                                        <p className="rc-pricing-path-label">Pay $25/month</p>
                                        <p className="rc-pricing-path-copy">Get instant access</p>
                                    </div>
                                    <div className="rc-pricing-path">
                                        <p className="rc-pricing-path-label">Complete 6 weekly actions</p>
                                        <p className="rc-pricing-path-copy">Earn permanent free access</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" data-reveal className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto w-full max-w-[900px]">
                        <h2 data-stagger className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Common Questions</h2>
                        <div className="mt-12 space-y-3">
                            {faqItems.map((item, idx) => {
                                const isOpen = openFaqIndex === idx
                                return (
                                    <article key={item.question} data-stagger className="rc-surface overflow-hidden">
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between px-6 py-5 text-left"
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-panel-${idx}`}
                                            id={`faq-trigger-${idx}`}
                                            onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                                        >
                                            <span className="text-lg font-semibold">{item.question}</span>
                                            <ChevronDown className={`h-5 w-5 text-[var(--rc-cardinal)] transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                                        </button>
                                        <div
                                            id={`faq-panel-${idx}`}
                                            role="region"
                                            aria-labelledby={`faq-trigger-${idx}`}
                                            className="rc-faq-panel"
                                            style={{ maxHeight: isOpen ? `${faqHeights[idx] || 0}px` : '0px' }}
                                        >
                                            <div ref={(el) => { faqContentRefs.current[idx] = el }} className="border-t border-[var(--rc-border)] px-6 py-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <section data-reveal className="border-t border-[var(--rc-border)] px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
                    <div className="mx-auto w-full max-w-[900px] text-center">
                        <h2 data-stagger className="text-4xl font-bold tracking-tight sm:text-5xl">Ready to Stop Guessing?</h2>
                        <p data-stagger className="mx-auto mt-5 max-w-2xl text-[18px] leading-[1.6] text-[var(--rc-muted)] sm:text-[20px]">
                            Get your first weekly plan in 3 minutes.
                        </p>
                        <Link data-stagger to="/signup" className="mt-8 inline-block">
                            <Button size="lg" className="rc-btn-primary">Get My Free Plan</Button>
                        </Link>
                        <p data-stagger className="mt-4 text-sm text-[var(--rc-muted)]">No credit card required. Free forever.</p>
                    </div>
                </section>
            </main>

            <footer className="rc-landing-footer">
                <div className="rc-landing-footer-inner">
                    <div className="rc-landing-footer-grid">
                        <div className="rc-landing-footer-brand">
                            <p className="rc-landing-footer-logo">RecruitCoS</p>
                            <p className="rc-landing-footer-tagline">The recruiting execution OS for youth athletes.</p>
                        </div>

                        <div className="rc-landing-footer-col">
                            <p className="rc-landing-footer-heading">Product</p>
                            <a href="#" className="rc-landing-footer-link">Features</a>
                            <a href="#pricing" className="rc-landing-footer-link">Pricing</a>
                            <a href="#faq" className="rc-landing-footer-link">FAQ</a>
                        </div>

                        <div className="rc-landing-footer-col">
                            <p className="rc-landing-footer-heading">Company</p>
                            <a href="#" className="rc-landing-footer-link">About</a>
                            <a href="#" className="rc-landing-footer-link">Careers</a>
                            <a href="#" className="rc-landing-footer-link">Contact</a>
                        </div>

                        <div className="rc-landing-footer-col">
                            <p className="rc-landing-footer-heading">Resources</p>
                            <a href="#" className="rc-landing-footer-link">Blog</a>
                            <a href="#" className="rc-landing-footer-link">Help Center</a>
                            <Link to="/privacy" className="rc-landing-footer-link">Privacy Policy</Link>
                            <Link to="/terms" className="rc-landing-footer-link">Terms of Service</Link>
                        </div>
                    </div>
                    <p className="rc-landing-footer-bottom">© 2026 RecruitCoS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
