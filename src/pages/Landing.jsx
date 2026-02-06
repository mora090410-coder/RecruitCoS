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
        <div className="h-full rounded-[var(--radius)] border border-[rgba(153,0,0,0.14)] bg-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="mb-2 flex items-center justify-between rounded-[var(--radius-internal)] border border-[var(--rc-border)] bg-[rgba(248,244,238,0.75)] px-2 py-1">
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

function ChaosCardIcon({ type }) {
    const iconPathByType = {
        graph: 'M200,152a31.84,31.84,0,0,0-19.53,6.68l-23.11-18A31.65,31.65,0,0,0,160,128c0-.74,0-1.48-.08-2.21l13.23-4.41A32,32,0,1,0,168,104c0,.74,0,1.48.08,2.21l-13.23,4.41A32,32,0,0,0,128,96a32.59,32.59,0,0,0-5.27.44L115.89,81A32,32,0,1,0,96,88a32.59,32.59,0,0,0,5.27-.44l6.84,15.4a31.92,31.92,0,0,0-8.57,39.64L73.83,165.44a32.06,32.06,0,1,0,10.63,12l25.71-22.84a31.91,31.91,0,0,0,37.36-1.24l23.11,18A31.65,31.65,0,0,0,168,184a32,32,0,1,0,32-32Zm0-64a16,16,0,1,1-16,16A16,16,0,0,1,200,88ZM80,56A16,16,0,1,1,96,72,16,16,0,0,1,80,56ZM56,208a16,16,0,1,1,16-16A16,16,0,0,1,56,208Zm56-80a16,16,0,1,1,16,16A16,16,0,0,1,112,128Zm88,72a16,16,0,1,1,16-16A16,16,0,0,1,200,200Z',
        currency: 'M152,120H136V56h8a32,32,0,0,1,32,32,8,8,0,0,0,16,0,48.05,48.05,0,0,0-48-48h-8V24a8,8,0,0,0-16,0V40h-8a48,48,0,0,0,0,96h8v64H104a32,32,0,0,1-32-32,8,8,0,0,0-16,0,48.05,48.05,0,0,0,48,48h16v16a8,8,0,0,0,16,0V216h16a48,48,0,0,0,0-96Zm-40,0a32,32,0,0,1,0-64h8v64Zm40,80H136V136h16a32,32,0,0,1,0,64Z',
        arrows: 'M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48ZM98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32ZM208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152ZM67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z'
    }
    const scaleByType = { graph: 1.1, currency: 1.06, arrows: 1.02 }

    return (
        <span className="flex h-6 w-6 basis-6 shrink-0 grow-0 items-center justify-center">
            <svg
                aria-hidden="true"
                viewBox="0 0 256 256"
                className="h-6 w-6 opacity-100"
                style={{ transform: `translateY(1px) scale(${scaleByType[type] ?? 1})` }}
            >
                <path d={iconPathByType[type]} fill="currentColor" />
            </svg>
        </span>
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
                <div className="mx-auto flex h-20 w-full max-w-[1200px] items-baseline justify-between px-4 sm:px-6 lg:px-8">
                    <div className="text-3xl font-extrabold tracking-tight text-[var(--rc-cardinal)]">RecruitCoS</div>
                    <Link to="/login" className="rc-login-ghost">Log in</Link>
                </div>
            </header>

            <main>
                <section data-reveal className="rc-landing-section px-4 sm:px-6 lg:px-8">
                    <div className="rc-hero-grid mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="rc-hero-copy space-y-8" data-stagger>
                            <h1 className="text-5xl font-extrabold tracking-[-0.04em] sm:text-6xl">Stop Guessing. Start Planning.</h1>
                            <p className="max-w-2xl text-[17px] leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">
                                Get your personalized recruiting execution OS. Close the gap on D1 benchmarks for $0/mo.
                            </p>
                            <div className="flex flex-col gap-8 sm:items-start">
                                <Link to="/signup">
                                    <Button size="lg" className="rc-btn-primary rc-hero-cta w-full font-semibold sm:w-auto">Get My Free Plan</Button>
                                </Link>
                                <div className="flex items-end gap-3">
                                    <div className="flex -space-x-2" aria-hidden="true">
                                        <img src="https://i.pravatar.cc/40?img=12" alt="" className="h-7 w-7 rounded-full border border-white object-cover" />
                                        <img src="https://i.pravatar.cc/40?img=19" alt="" className="h-7 w-7 rounded-full border border-white object-cover" />
                                        <img src="https://i.pravatar.cc/40?img=28" alt="" className="h-7 w-7 rounded-full border border-white object-cover" />
                                    </div>
                                    <p className="text-sm leading-none text-[var(--rc-muted)]">Join 250+ athletes already planning smarter</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 self-start" data-stagger>
                            <div className="rc-hero-mock-card p-6 sm:p-7">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="rc-pill">Weekly Recruiting Plan</p>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--rc-muted)]">This Week</span>
                                </div>
                                <div id="weekly-plan-more" className="rc-hero-plan-list is-compact space-y-3">
                                    {weeklyPlanItems.map((item) => (
                                        <div key={item.title} className="rc-inner-card p-4">
                                            <p className="rc-plan-label">{item.label}</p>
                                            <p className="rc-plan-value">{item.title}</p>
                                            <p className="rc-plan-detail">{item.detail}</p>
                                            {item.label === 'Readiness' && (
                                                <div className="rc-readiness-micro" aria-label="Readiness trend indicator">
                                                    <span className="rc-readiness-chip">Score 78</span>
                                                    <span className="rc-readiness-trend">+8 this week</span>
                                                    <svg viewBox="0 0 72 16" className="rc-readiness-spark" aria-hidden="true">
                                                        <polyline points="2,13 14,11 25,12 37,9 48,10 60,6 70,4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="rc-verified-badge" aria-label="Verified 2026 NCAA Data">Verified 2026 NCAA Data</p>
                        </div>
                    </div>
                </section>

                <section data-reveal className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px] text-center">
                        <h2 data-stagger className="text-[32px] font-bold tracking-tight sm:text-[40px]">Timing matters.</h2>
                        <div className="rc-timing-cards mx-auto mt-6 max-w-[1200px]">
                            <article data-stagger className="rc-timing-card">
                                <span className="rc-timing-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24"><path d="M6 12h12M14 8l4 4-4 4" /></svg>
                                </span>
                                <p className="text-[17px] leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Coaches build lists early. The athletes who execute weekly get seen.</p>
                            </article>
                            <article data-stagger className="rc-timing-card">
                                <span className="rc-timing-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" /></svg>
                                </span>
                                <p className="text-[17px] leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Your first plan takes 3 minutes. <strong className="font-semibold text-[var(--rc-ink)]">Waiting costs seasons, not weeks.</strong></p>
                            </article>
                            <article data-stagger className="rc-timing-card">
                                <span className="rc-timing-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24"><path d="M6 16l4-4 3 3 5-5" /><path d="M14 10h4v4" /></svg>
                                </span>
                                <p className="text-[17px] leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Start now—adjust weekly as camps, showcases, and seasons change.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc-landing-section border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.7)] px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-[32px] font-bold tracking-tight sm:text-[40px]">Recruiting Feels Like Chaos</h2>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            <article data-stagger className="rc-chaos-card flex flex-col">
                                <h3 className="flex items-center gap-3 text-xl font-semibold">
                                    <ChaosCardIcon type="graph" />
                                    <span>Fragmented</span>
                                </h3>
                                <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Emails, spreadsheets, DMs—nothing is organized</p>
                            </article>
                            <article data-stagger className="rc-chaos-card flex flex-col">
                                <h3 className="flex items-center gap-3 text-xl font-semibold">
                                    <ChaosCardIcon type="currency" />
                                    <span>Expensive</span>
                                </h3>
                                <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">$5K–$20K/year with no clear ROI</p>
                            </article>
                            <article data-stagger className="rc-chaos-card flex flex-col">
                                <h3 className="flex items-center gap-3 text-xl font-semibold">
                                    <ChaosCardIcon type="arrows" />
                                    <span>Stressful</span>
                                </h3>
                                <p className="mt-3 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Conflicting advice from coaches, parents, recruiters</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc-landing-section px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-[32px] font-bold tracking-tight sm:text-[40px]">Your Weekly Recruiting Plan</h2>
                        <div className="mt-12 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
                            <div data-stagger className="rc-device-frame mx-auto w-full max-w-[430px] self-start">
                                <div className="rc-device-screen">
                                    <div className="rc-plan-scroll">
                                        {solutionMockItems.concat(solutionMockItems).map((line, idx) => (
                                            <div key={`${line}-${idx}`} className="rc-plan-scroll-row">{line}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 self-start">
                                <article data-stagger className="rc-surface p-6">
                                    <p className="rc-caps-label">PHASE</p>
                                    <h3 className="text-2xl font-bold">Stage-Aware Guidance</h3>
                                    <p className="mt-2 text-[17px] font-normal leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Tailored to your grad year and recruiting phase</p>
                                </article>
                                <article data-stagger className="rc-surface p-6">
                                    <p className="rc-caps-label">BENCHMARKS</p>
                                    <h3 className="text-2xl font-bold">Measurable Gaps</h3>
                                    <p className="mt-2 text-[17px] font-normal leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Compare your metrics to D1/D2/D3 benchmarks</p>
                                    <div
                                        className="rc-gap-viz"
                                        role="group"
                                        aria-label="60-yard time comparison. Lower is faster. You: 4.60 seconds. D1 target: 4.45 seconds. Gap: plus 0.15 seconds."
                                    >
                                        <p className="rc-gap-viz-metric">60-yard time</p>
                                        <div className="rc-gap-viz-values" aria-hidden="true">
                                            <span>You: 4.60s</span>
                                            <span>D1 Target: 4.45s</span>
                                        </div>
                                        <div className="rc-gap-track-wrap" aria-hidden="true">
                                            <span className="rc-gap-track" />
                                            <span className="rc-gap-marker rc-gap-marker-target" style={{ left: '30%' }} />
                                            <span className="rc-gap-marker rc-gap-marker-you" style={{ left: '60%' }} />
                                            <span className="rc-gap-badge" style={{ left: '45%' }}>Gap: +0.15s</span>
                                        </div>
                                    </div>
                                </article>
                                <article data-stagger className="rc-surface p-6">
                                    <p className="rc-caps-label">PRIORITIES</p>
                                    <h3 className="text-2xl font-bold">3-Action Priorities</h3>
                                    <p className="mt-2 text-[17px] font-normal leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">Know exactly what to focus on this week</p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc-landing-section border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.72)] px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-[32px] font-bold tracking-tight sm:text-[40px]">Get Your Plan in 3 Minutes</h2>
                        <div className="relative mt-12">
                            <div className="grid gap-5 md:grid-cols-3">
                                <article data-stagger className="rc-surface flex h-full flex-col p-7">
                                    <p className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(153,0,0,0.24)] bg-white text-base font-bold text-[var(--rc-cardinal)]">①</p>
                                    <div className="mb-3 rounded-[var(--radius)] border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Form">
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Sport ▾</div>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Position ▾</div>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-2 py-1.5 text-[10px] text-[var(--rc-muted)]">Grad year ▾</div>
                                                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                                    <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">40 yd</div>
                                                    <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">Vert</div>
                                                    <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">Shuttle</div>
                                                    <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-1.5 py-1 text-center text-[9px] text-[var(--rc-muted)]">Broad</div>
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
                                    <div className="mb-3 rounded-[var(--radius)] border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Plan">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <p className="text-[10px] font-semibold text-[var(--rc-ink)]">This Week&apos;s Priorities</p>
                                                    <span className="rounded-full border border-[rgba(153,0,0,0.3)] bg-[rgba(255,204,0,0.2)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[var(--rc-cardinal)]">Phase</span>
                                                </div>
                                                <div className="rounded-[var(--radius-internal)] border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1 text-[10px] text-[var(--rc-muted)]">1. Sprint gap session + retest</div>
                                                <div className="rounded-[var(--radius-internal)] border border-[var(--rc-border)] bg-[rgba(255,253,249,0.9)] px-2 py-1 text-[10px] text-[var(--rc-muted)]">2. Send updates to 3 schools</div>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(153,0,0,0.32)] bg-[rgba(255,204,0,0.18)] px-2 py-1 text-[10px] font-semibold text-[var(--rc-cardinal)]">3. Publish one verified clip</div>
                                            </MiniPanelFrame>
                                        </div>
                                        <p className="mt-2 text-center text-sm font-semibold text-[var(--rc-muted)]">Plan</p>
                                    </div>
                                    <h3 className="text-2xl font-bold">Get Your Weekly Plan</h3>
                                    <p className="mt-4 text-[18px] leading-[1.6] text-[var(--rc-muted)]">Instant analysis + prioritized actions</p>
                                </article>

                                <article data-stagger className="rc-surface flex h-full flex-col p-7">
                                    <p className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(153,0,0,0.24)] bg-white text-base font-bold text-[var(--rc-cardinal)]">③</p>
                                    <div className="mb-3 rounded-[var(--radius)] border border-[var(--rc-border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,252,246,0.92))] p-3">
                                        <div className="aspect-square">
                                            <MiniPanelFrame chromeTitle="Track">
                                                <p className="text-[10px] font-semibold text-[var(--rc-ink)]">Progress</p>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] p-2">
                                                    <div className="relative h-8">
                                                        <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[var(--rc-border)]" />
                                                        <span className="absolute bottom-[4px] left-[8%] h-[1px] w-[24%] rotate-[8deg] bg-[var(--rc-muted)]/50" />
                                                        <span className="absolute bottom-[10px] left-[32%] h-[1px] w-[22%] -rotate-[6deg] bg-[var(--rc-muted)]/50" />
                                                        <span className="absolute bottom-[14px] left-[54%] h-[1.5px] w-[34%] rotate-[9deg] bg-[rgba(0,0,0,0.72)]" />
                                                    </div>
                                                </div>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-2 py-1 text-[10px] text-[var(--rc-muted)]">
                                                    Completed 2/3
                                                </div>
                                                <div className="rounded-[var(--radius-internal)] border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.95)] px-2 py-1 text-[10px] font-medium text-[rgba(0,0,0,0.72)]">
                                                    Next plan ready
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

                <section data-reveal className="rc-landing-section px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1200px]">
                        <h2 data-stagger className="text-center text-[32px] font-bold tracking-tight sm:text-[40px]">Athletes Are Already Planning Smarter</h2>
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

                <section id="pricing" data-reveal className="rc-landing-section rc-pricing-manifesto border-y border-[var(--rc-border)] bg-[rgba(255,253,249,0.72)] px-4 sm:px-6 lg:px-8">
                    <div className="rc-pricing-inner">
                        <div className="rc-pricing-panel">
                            <div data-stagger className="rc-pricing-row rc-pricing-row-hero">
                                <div>
                                    <h2 className="text-center text-[32px] font-bold tracking-tight sm:text-left sm:text-[40px]">Built for the 95%</h2>
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

                <section id="faq" data-reveal className="rc-landing-section px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[900px]">
                        <h2 data-stagger className="text-center text-[32px] font-bold tracking-tight sm:text-[40px]">Common Questions</h2>
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

                <section data-reveal className="rc-landing-section border-t border-[var(--rc-border)] px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[900px] text-center">
                        <h2 data-stagger className="text-[32px] font-bold tracking-tight sm:text-[40px]">Ready to Stop Guessing?</h2>
                        <p data-stagger className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.6] text-[var(--rc-muted)] sm:text-[18px]">
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
