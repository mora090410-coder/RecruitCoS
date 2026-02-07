import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { calculateFaqHeights, setupSectionReveal } from '../lib/landingInteractions'

const positioningColumns = [
    {
        title: 'NCSA',
        points: [
            'Large directory and profiles',
            'One-time cost can run $1,300-$4,200',
            'Families still manage weekly execution'
        ]
    },
    {
        title: 'DIY',
        points: [
            'Free tools but fragmented workflow',
            'No built-in phase logic by division',
            'Parents track progress manually'
        ]
    },
    {
        title: 'RecruitCoS',
        points: [
            'Weekly plan with 3 clear actions',
            'Built for D3, NAIA, JUCO, and developing athletes',
            'Parent dashboard with expense and phase tracking'
        ],
        featured: true
    }
]

const howItWorks = [
    {
        title: 'Tell us about your athlete',
        time: '2 min',
        description: 'Quick profile setup for sport, level targets, and current benchmarks.',
        image: '/landing/step-1-profile.svg',
        imageAlt: 'RecruitCoS athlete profile setup screenshot'
    },
    {
        title: "Get this week's plan",
        time: '3 actions',
        description: 'Receive a priority list designed for this exact week in your recruiting timeline.',
        image: '/landing/step-2-weekly-plan.svg',
        imageAlt: 'RecruitCoS weekly plan screenshot'
    },
    {
        title: 'Track progress & expenses',
        time: 'Live',
        description: 'Monitor momentum and recruiting spend with a parent-first dashboard.',
        image: '/landing/step-3-dashboard.svg',
        imageAlt: 'RecruitCoS parent dashboard screenshot'
    }
]

const features = [
    {
        title: 'Weekly plans',
        body: 'Every Monday starts with an actionable plan and clear success criteria.'
    },
    {
        title: 'Financial tracking',
        body: 'Track camps, travel, subscriptions, and recruiting spend in one place.'
    },
    {
        title: 'Division-specific guidance',
        body: 'Content and priorities adapt to D3, NAIA, JUCO, and transfer pathways.'
    },
    {
        title: 'Phase-aware content',
        body: 'Know what matters this month based on grade level and recruiting windows.'
    },
    {
        title: 'Parent dashboard',
        body: 'A clean command center for tasks, spend, milestones, and outreach history.'
    },
    {
        title: 'Expense benchmarks',
        body: 'Compare your spend against realistic family ranges, not agency upsells.'
    }
]

const testimonials = [
    {
        quote: 'RecruitCoS replaced weekly confusion with a clear plan and gave us confidence in every step.',
        attribution: 'Parent, softball, Texas'
    },
    {
        quote: 'We stopped paying for disconnected tools. The dashboard finally shows what matters this week.',
        attribution: 'Parent, baseball, Florida'
    },
    {
        quote: 'My athlete is not chasing D1 and this still fits perfectly. The structure is exactly what we needed.',
        attribution: 'Parent, soccer, Ohio'
    }
]

const pricingTiers = [
    {
        name: 'Free',
        price: '$0',
        period: '/mo',
        detail: 'Best for getting started',
        points: ['Core weekly plan', 'Basic task tracking', 'Phase indicator']
    },
    {
        name: 'Individual',
        price: '$25',
        period: '/mo',
        detail: 'Most families choose this',
        points: ['Everything in Free', 'Division-specific recommendations', 'Advanced expense benchmarks'],
        featured: true
    },
    {
        name: 'Family',
        price: '$40',
        period: '/mo',
        detail: 'For multiple athletes',
        points: ['Everything in Individual', 'Multiple athlete dashboards', 'Shared household finance view']
    }
]

const faqItems = [
    {
        question: 'How is this different from NCSA?',
        answer: 'NCSA is primarily a profile and exposure platform. RecruitCoS is your weekly execution layer, with parent-first planning and spending visibility.'
    },
    {
        question: 'Do I need this if I\'m using SportsRecruits?',
        answer: 'Yes. SportsRecruits can support outreach and visibility, while RecruitCoS organizes what to do each week and how to prioritize your next actions.'
    },
    {
        question: 'My kid isn\'t D1 material. Is this still for us?',
        answer: 'Absolutely. RecruitCoS is built for families targeting D3, NAIA, JUCO, and other realistic pathways where consistency and timing matter most.'
    },
    {
        question: 'Can you guarantee my kid gets recruited?',
        answer: 'No. No ethical platform can guarantee outcomes. RecruitCoS improves clarity, execution, and decision quality so your family can make stronger recruiting moves.'
    }
]

function triggerRipple(event) {
    const target = event.currentTarget
    if (!target) return

    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'rc26-ripple-wave'

    const size = Math.max(rect.width, rect.height)
    const left = event.clientX - rect.left - size / 2
    const top = event.clientY - rect.top - size / 2

    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${left}px`
    ripple.style.top = `${top}px`

    target.appendChild(ripple)
    ripple.addEventListener('animationend', () => {
        ripple.remove()
    })
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
        <div ref={landingRef} className="rc26-landing min-h-screen" aria-label="RecruitCoS Landing Page">
            <header className="rc26-header">
                <div className="rc26-shell rc26-header-inner">
                    <p className="rc26-brand" aria-label="RecruitCoS home">RecruitCoS</p>
                    <nav aria-label="Primary">
                        <Link to="/login" className="rc26-text-link">Log in</Link>
                    </nav>
                </div>
            </header>

            <main>
                <section data-reveal className="rc26-section rc26-hero" aria-labelledby="hero-title">
                    <div className="rc26-shell rc26-hero-grid">
                        <div className="rc26-flow" data-stagger>
                            <h1 id="hero-title" className="rc26-hero-title">For families without a recruiting coordinator.</h1>
                            <p className="rc26-subhead">Get your weekly recruiting plan. Know exactly what to do this week &mdash; whether your athlete is targeting D3, NAIA, JUCO, or just figuring it out.</p>
                            <Link
                                to="/signup"
                                className="rc26-button rc26-ripple"
                                aria-label="Start your free recruiting plan"
                                onClick={triggerRipple}
                            >
                                Start Your Free Plan
                            </Link>
                            <p className="rc26-trust">Join 200+ families who stopped guessing</p>
                        </div>

                        <div className="rc26-hero-mock" data-stagger aria-label="Parent dashboard preview">
                            <div className="rc26-mock-top">
                                <p className="rc26-mock-title">Parent Dashboard</p>
                                <span className="rc26-pill">Phase: Contact Window</span>
                            </div>
                            <div className="rc26-mock-grid">
                                <article className="rc26-mock-card" aria-label="Expense tracker card">
                                    <p>Expense Tracker</p>
                                    <strong>$1,245</strong>
                                    <small>18% below benchmark range</small>
                                </article>
                                <article className="rc26-mock-card" aria-label="Weekly actions card">
                                    <p>This Week</p>
                                    <strong>3 Actions</strong>
                                    <small>2 complete | 1 due Friday</small>
                                </article>
                                <article className="rc26-mock-card rc26-mock-wide" aria-label="Phase indicator progress">
                                    <p>Recruiting Phase Indicator</p>
                                    <div className="rc26-progress" aria-hidden="true">
                                        <span style={{ width: '72%' }} />
                                    </div>
                                    <small>Evaluation -&gt; Outreach -&gt; Commitment</small>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc26-section" aria-labelledby="positioning-title">
                    <div className="rc26-shell">
                        <h2 id="positioning-title" className="rc26-title" data-stagger>We&apos;re not another recruiting profile platform.</h2>
                        <div className="rc26-positioning-grid" role="list" aria-label="Platform comparison" data-stagger>
                            {positioningColumns.map((column) => (
                                <article key={column.title} className={`rc26-glass-card rc26-bento ${column.featured ? 'is-featured' : ''}`} role="listitem">
                                    <h3>{column.title}</h3>
                                    <ul>
                                        {column.points.map((point) => (
                                            <li key={point}>{point}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc26-section rc26-how" aria-labelledby="how-title">
                    <div className="rc26-shell">
                        <h2 id="how-title" className="rc26-title" data-stagger>How It Works</h2>
                        <div className="rc26-how-grid" role="list" aria-label="Three step process">
                            {howItWorks.map((step, index) => (
                                <article key={step.title} className="rc26-glass-card rc26-how-card" data-stagger role="listitem">
                                    <img src={step.image} alt={step.imageAlt} loading="lazy" decoding="async" width="480" height="320" />
                                    <div className="rc26-step-meta">
                                        <span aria-label={`Step ${index + 1}`}>Step {index + 1}</span>
                                        <span>{step.time}</span>
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </article>
                            ))}
                            <span className="rc26-arrow rc26-arrow-1" aria-hidden="true">-&gt;</span>
                            <span className="rc26-arrow rc26-arrow-2" aria-hidden="true">-&gt;</span>
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc26-section" aria-labelledby="features-title">
                    <div className="rc26-shell">
                        <h2 id="features-title" className="rc26-title" data-stagger>Built for Parents First</h2>
                        <div className="rc26-feature-grid" role="list" aria-label="RecruitCoS features">
                            {features.map((feature) => (
                                <article key={feature.title} className="rc26-glass-card rc26-feature-card" data-stagger role="listitem">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.body}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc26-section rc26-social" aria-labelledby="proof-title">
                    <div className="rc26-shell">
                        <h2 id="proof-title" className="rc26-title" data-stagger>What Parents Say</h2>
                        <div className="rc26-testimonial-grid" role="list" aria-label="Parent testimonials">
                            {testimonials.map((item) => (
                                <article key={item.attribution} className="rc26-glass-card rc26-testimonial" role="listitem" data-stagger>
                                    <blockquote>{item.quote}</blockquote>
                                    <p>- {item.attribution}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" data-reveal className="rc26-section" aria-labelledby="pricing-title">
                    <div className="rc26-shell">
                        <h2 id="pricing-title" className="rc26-title" data-stagger>Simple Pricing</h2>
                        <p className="rc26-pricing-note" data-stagger>NCSA packages are often $1,300-$4,200. RecruitCoS is designed for sustainable family budgets.</p>
                        <div className="rc26-pricing-grid" role="list" aria-label="Pricing tiers">
                            {pricingTiers.map((tier) => (
                                <article key={tier.name} className={`rc26-glass-card rc26-price-card ${tier.featured ? 'is-featured' : ''}`} role="listitem" data-stagger>
                                    {tier.featured && <span className="rc26-tag">Most families choose this</span>}
                                    <h3>{tier.name}</h3>
                                    <p className="rc26-price"><strong>{tier.price}</strong>{tier.period}</p>
                                    <p className="rc26-price-detail">{tier.detail}</p>
                                    <ul>
                                        {tier.points.map((point) => (
                                            <li key={point}>{point}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                        <p className="rc26-cancel" data-stagger><strong>No contracts, cancel anytime.</strong></p>
                    </div>
                </section>

                <section id="faq" data-reveal className="rc26-section" aria-labelledby="faq-title">
                    <div className="rc26-shell rc26-faq-shell">
                        <h2 id="faq-title" className="rc26-title" data-stagger>FAQ</h2>
                        <div className="rc26-faq-list">
                            {faqItems.map((item, idx) => {
                                const isOpen = openFaqIndex === idx
                                return (
                                    <article key={item.question} className="rc26-glass-card rc26-faq-card" data-stagger>
                                        <button
                                            type="button"
                                            className="rc26-faq-trigger rc26-ripple"
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-panel-${idx}`}
                                            id={`faq-trigger-${idx}`}
                                            onClick={(event) => {
                                                triggerRipple(event)
                                                setOpenFaqIndex(isOpen ? -1 : idx)
                                            }}
                                        >
                                            <span>{item.question}</span>
                                            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>
                                        <div
                                            id={`faq-panel-${idx}`}
                                            role="region"
                                            aria-labelledby={`faq-trigger-${idx}`}
                                            className="rc26-faq-panel"
                                            style={{ maxHeight: isOpen ? `${faqHeights[idx] || 0}px` : '0px' }}
                                        >
                                            <div ref={(el) => { faqContentRefs.current[idx] = el }}>
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <section data-reveal className="rc26-section rc26-cta" aria-label="Call to action">
                    <div className="rc26-shell rc26-center" data-stagger>
                        <h2 className="rc26-title">Ready to stop guessing?</h2>
                        <p className="rc26-body">Build your recruiting system this week, not next season.</p>
                        <Link
                            to="/signup"
                            className="rc26-button rc26-ripple"
                            onClick={triggerRipple}
                            aria-label="Start your free plan now"
                        >
                            Start Your Free Plan
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="rc26-footer">
                <div className="rc26-shell rc26-footer-inner">
                    <p>(c) 2026 RecruitCoS</p>
                    <div className="rc26-footer-links" aria-label="Footer links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
