import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { setupSectionReveal } from '../lib/landingInteractions'

const comparisonCards = [
    {
        title: 'NCSA',
        points: [
            'Large directory and profiles',
            'One-time cost can run $1,300-$4,200',
            'Families still manage weekly execution',
            'High-pressure phone sales and difficult cancellation policies'
        ]
    },
    {
        title: 'Going It Alone',
        points: [
            'Googling at midnight, tracking expenses in Notes, texting coaches',
            'Free but chaotic - you are the CEO with no playbook',
            'You are winging it with no way to know if you are on track or wasting time'
        ]
    },
    {
        title: 'RecruitCoS',
        points: [
            'Weekly plan with 3 clear actions',
            'Built for families who do not have recruiting coordinators, $20K budgets, or coaches calling first',
            'Parent dashboard with expense and phase tracking'
        ],
        highlighted: true
    }
]

const steps = [
    {
        label: 'STEP 1',
        time: '2 MIN',
        title: 'Tell us about your athlete',
        description: 'Quick profile setup for sport, level targets, and current benchmarks.',
        image: '/landing/step-1-profile.svg',
        imageAlt: 'RecruitCoS profile setup screenshot'
    },
    {
        label: 'STEP 2',
        time: 'EVERY MONDAY',
        title: "Get this week's plan",
        description: 'Receive 3 priority actions designed for this exact week in your recruiting timeline. New plan every Monday.',
        image: '/landing/step-2-weekly-plan.svg',
        imageAlt: 'RecruitCoS weekly plan screenshot'
    },
    {
        label: 'STEP 3',
        time: 'UNLOCKS WEEK 5',
        title: 'Build your recruiting habit',
        description: 'Complete your weekly plans and track your streak. Unlock the full dashboard with expense tracking and benchmarks when you upgrade.',
        image: '/landing/step-3-dashboard.svg',
        imageAlt: 'RecruitCoS progress tracking screenshot'
    }
]

const features = [
    {
        title: 'No more Sunday night panic',
        description: 'Every Monday starts with 3 clear actions - no guessing what to prioritize.',
        large: true
    },
    {
        title: 'See where your money actually goes',
        description: 'Track every showcase, camp, and subscription in one place. Finally know your recruiting ROI.'
    },
    {
        title: 'Real guidance for your division',
        description: 'Content tailored to Power 5, mid-major D1, D2, D3, NAIA, or JUCO not generic D1 advice that doesn\'t apply.'
    },
    {
        title: 'Know what matters this month',
        description: '9th graders get skill-building priorities. 12th graders get coach outreach. No generic advice for all ages.'
    },
    {
        title: 'A clean command center for tasks',
        description: 'See how much you\'ve spent this year, which coaches responded, and what is due this week in one dashboard.'
    },
    {
        title: 'Compare against realistic ranges',
        description: 'See your spend against realistic family ranges, not agency upsells.'
    }
]

const testimonials = [
    {
        quote: 'Finally a dashboard built for me, not my kid. I can see our spend, which coaches responded, and what is due this week. Every other platform treats parents like spectators.',
        attribution: 'Parent, softball, Texas'
    },
    {
        quote: 'We were spending $800 on showcases without knowing if they mattered. The expense tracker showed us we were overpaying by 40%. We redirected that money to camps that actually had D2 coaches.',
        attribution: 'Parent, baseball, Florida'
    },
    {
        quote: 'My daughter was not getting D1 looks and I was panicking. RecruitCoS helped us target mid-major D1 and D2 programs that actually fit her speed. She committed to a D2 school in November of junior year.',
        attribution: 'Parent, soccer, Ohio'
    }
]

const pricing = [
    {
        badge: 'START HERE',
        cardClass: 'pricing-card-featured',
        tier: 'Free',
        amount: '$0',
        period: '/mo',
        description: '4 weeks, no credit card required',
        features: [
            'Weekly plan with 3 actions',
            'Track completion and streaks',
            'See which recruiting phase you are in'
        ],
        cta: 'Start Free - No Credit Card'
    },
    {
        tier: 'Individual',
        amount: '$25',
        period: '/mo',
        description: 'Most families upgrade here',
        comparison: {
            label: 'vs. NCSA:',
            value: '$1,300-$4,200',
            note: '(52x-168x less)'
        },
        features: [
            'Everything in Free',
            'Division-specific guidance for your target level',
            'Expense tracking with family benchmarks',
            'Coach contact CRM'
        ],
        note: 'Unlocks automatically after free trial'
    },
    {
        tier: 'Family',
        amount: '$40',
        period: '/mo',
        description: 'For 2+ athletes',
        features: [
            'Everything in Individual',
            'Multiple athlete dashboards',
            'Shared household budget view',
            'Cross-sibling deadline calendar'
        ],
        note: 'Upgrade anytime from your dashboard'
    }
]

const faqs = [
    {
        question: 'How is this different from NCSA?',
        answer: 'NCSA charges $1,300-$4,200 to build a profile and send it to coaches. RecruitCoS gives you a weekly action plan and tracks your recruiting expenses for $25/month. You can use both, or just use RecruitCoS to manage the process yourself. Think of it this way: NCSA is the resume. RecruitCoS is the job search plan.'
    },
    {
        question: "Do I need this if I'm using SportsRecruits?",
        answer: 'Yes. RecruitCoS works alongside SportsRecruits, NCSA, or any other profile platform. We are the management layer that sits on top. We help you track what to do each week, where your money is going, and which coaches actually responded. Your SportsRecruits profile is the what. RecruitCoS is the when, how, and how much.'
    },
    {
        question: 'How much does this cost?',
        answer: 'Free for the first 4 weeks with no credit card required. After that, $25/month for one athlete or $40/month for families with multiple athletes. No contracts, cancel anytime.'
    },
    {
        question: 'What sports do you support?',
        answer: "We currently support baseball, softball, football, basketball, and soccer. More sports are coming soon based on parent demand. If your sport is not listed yet, join the waitlist and we'll notify you when it's available."
    },
    {
        question: "What if we're not sure which division to target?",
        answer: "Our phase-aware system helps you figure this out. In 9th-10th grade, we focus on skill development and exposure to build your athlete's profile. By 11th grade, you'll have enough performance data to target realistic division levels. The weekly plans adjust as you learn more about where your athlete fits."
    },
    {
        question: 'When should we start?',
        answer: "The earlier the better. If your athlete is in 8th-9th grade, you'll get the most value by building the weekly habit early. If they are in 11th-12th grade, you'll get immediate help with coach outreach and deadline management. Our guidance adjusts to your athlete's grade level and recruiting phase so it works whenever you start."
    },
    {
        question: 'What results can I expect?',
        answer: "We cannot guarantee your athlete gets recruited. No one can. What we can do is give you a clear weekly plan, show you where your money is going, and help you target the right division level for your athlete's ability. Most families tell us they feel more confident and less overwhelmed after their first month."
    }
]

function triggerRipple(event) {
    const target = event.currentTarget
    if (!target) return

    const rect = target.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'lp-ripple-wave'

    const size = Math.max(rect.width, rect.height)
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`

    target.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
}

function SecondaryCta() {
    return (
        <div className="secondary-cta" data-stagger>
            <a href="#signup" className="cta-link">Start Your Free Plan</a>
        </div>
    )
}

export default function Landing() {
    const landingRef = useRef(null)

    useEffect(() => {
        const root = landingRef.current
        if (!root) return
        return setupSectionReveal(root)
    }, [])

    return (
        <div ref={landingRef} className="lp-landing">
            <a href="#main-content" className="lp-skip-link">Skip to main content</a>

            <nav className="lp-nav" aria-label="Main navigation">
                <div className="lp-nav-container">
                    <Link to="/" className="lp-logo">RecruitCoS</Link>
                    <Link to="/login" className="lp-nav-link">Log in</Link>
                </div>
            </nav>

            <main id="main-content">
                <section className="lp-hero" data-reveal aria-labelledby="lp-hero-title">
                    <div className="lp-hero-container">
                        <div className="lp-hero-content" data-stagger>
                            <h1 id="lp-hero-title" className="lp-text-display">For families without a recruiting coordinator.</h1>
                            <p className="lp-text-body-lg">
                                Know exactly what to do this week whether you are targeting Power 5, mid-major D1, D2, D3, NAIA, or JUCO.
                            </p>
                            <Link to="/profile-setup" className="lp-cta-primary lp-ripple" onClick={triggerRipple} aria-label="Start your free plan">
                                Start Your Free Plan
                            </Link>
                            <p className="lp-hero-trust">Join families who stopped guessing and started planning</p>
                        </div>

                        <div className="lp-hero-visual" data-stagger aria-label="Parent dashboard mockup">
                            <div className="lp-dashboard-mockup">
                                <div className="lp-mockup-header">
                                    <span className="lp-mockup-title">Parent Dashboard</span>
                                    <span className="lp-mockup-badge">Phase: Contact Window</span>
                                </div>

                                <div className="lp-mockup-grid">
                                    <div className="lp-mockup-card">
                                        <div className="lp-mockup-label">Expense Tracker</div>
                                        <div className="lp-mockup-value">$1,245</div>
                                        <div className="lp-mockup-subtitle">&#10003; 18% below benchmark range</div>
                                    </div>
                                    <div className="lp-mockup-card">
                                        <div className="lp-mockup-label">This Week</div>
                                        <div className="lp-mockup-value">3 Actions</div>
                                        <div className="lp-mockup-subtitle">2 complete | 1 due Friday</div>
                                    </div>
                                </div>

                                <div className="lp-mockup-phase">
                                    <div className="lp-mockup-label">Recruiting Phase Indicator</div>
                                    <div className="lp-phase-bar" aria-hidden="true">
                                        <div className="lp-phase-progress" />
                                    </div>
                                    <div className="lp-phase-labels" aria-label="Phase progression">
                                        <span>Evaluation</span>
                                        <span>-&gt; Outreach -&gt;</span>
                                        <span>Commitment</span>
                                    </div>
                                </div>

                                <div className="lp-mockup-division">
                                    <div className="lp-mockup-label">Division Targets</div>
                                    <div className="lp-division-pills">
                                        <span className="lp-division-pill lp-active">Mid-Major D1</span>
                                        <span className="lp-division-pill">D2</span>
                                        <span className="lp-division-pill">D3</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="lp-positioning" data-reveal aria-labelledby="lp-positioning-title">
                    <div className="lp-container">
                        <h2 id="lp-positioning-title" className="lp-section-headline" data-stagger>We are not another recruiting profile platform.</h2>
                        <div className="lp-comparison-grid">
                            {comparisonCards.map((card) => (
                                <article key={card.title} className={`lp-comparison-card ${card.highlighted ? 'lp-highlight' : ''}`} data-stagger>
                                    <h3 className="lp-comparison-title">{card.title}</h3>
                                    <ul className="lp-comparison-list">
                                        {card.points.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                        <SecondaryCta />
                    </div>
                </section>

                <section className="lp-how-it-works" data-reveal aria-labelledby="lp-how-title">
                    <div className="lp-container">
                        <h2 id="lp-how-title" className="lp-section-headline" data-stagger>Your Recruiting System in 3 Steps</h2>
                        <div className="lp-steps-grid">
                            {steps.map((step, index) => (
                                <Fragment key={step.title}>
                                    <article
                                        className="lp-step-card"
                                        data-stagger
                                        role="article"
                                        aria-labelledby={`step-${index + 1}-title`}
                                    >
                                        <div className="lp-step-visual">
                                            <img
                                                src={step.image}
                                                alt={step.imageAlt}
                                                className="lp-step-screenshot"
                                                loading="lazy"
                                                decoding="async"
                                                width="960"
                                                height="640"
                                            />
                                        </div>
                                        <div className="lp-step-content">
                                            <div className="lp-step-header">
                                                <span className="lp-step-label" id={`step-${index + 1}-label`}>{step.label}</span>
                                                <span className="lp-step-time">{step.time}</span>
                                            </div>
                                            <h3 className="lp-step-title" id={`step-${index + 1}-title`}>{step.title}</h3>
                                            <p className="lp-step-description">{step.description}</p>
                                        </div>
                                    </article>
                                    {index < steps.length - 1 && <div className="lp-step-arrow" aria-hidden="true">-&gt;</div>}
                                </Fragment>
                            ))}
                        </div>
                        <div className="secondary-cta" data-stagger>
                            <a href="#signup" className="cta-link">Start Your Free Plan</a>
                        </div>
                    </div>
                </section>

                <section className="lp-features features" data-reveal aria-labelledby="lp-features-title">
                    <div className="lp-container features-container">
                        <h2 id="lp-features-title" className="lp-section-headline section-headline" data-stagger>Weekly Plans + Financial Intelligence</h2>
                        <div className="lp-features-grid features-grid">
                            {features.map((feature) => (
                                <article key={feature.title} className={`lp-feature-card feature-card ${feature.large ? 'lp-feature-large feature-large' : ''}`} data-stagger>
                                    <h3 className="lp-feature-title feature-title">{feature.title}</h3>
                                    <p className="lp-feature-description feature-description">{feature.description}</p>
                                </article>
                            ))}
                        </div>
                        <div className="secondary-cta" data-stagger>
                            <a href="#signup" className="cta-link">Start Your Free Plan</a>
                        </div>
                    </div>
                </section>

                <section className="lp-testimonials" data-reveal aria-labelledby="lp-testimonials-title">
                    <div className="lp-container">
                        <h2 id="lp-testimonials-title" className="lp-section-headline section-headline" data-stagger>From Sunday Night Panic to Monday Morning Confidence</h2>
                        <div className="lp-testimonials-grid testimonials-grid">
                            {testimonials.map((item) => (
                                <article key={item.attribution} className="lp-testimonial-card testimonial-card" data-stagger>
                                    <p className="lp-testimonial-quote testimonial-quote">{item.quote}</p>
                                    <p className="lp-testimonial-attribution testimonial-attribution">- {item.attribution}</p>
                                </article>
                            ))}
                        </div>
                        <SecondaryCta />
                    </div>
                </section>

                <section id="pricing" className="lp-pricing" data-reveal aria-labelledby="lp-pricing-title">
                    <div className="lp-container lp-pricing-container">
                        <h2 id="lp-pricing-title" className="lp-section-headline" data-stagger>Simple Pricing</h2>
                        <p className="lp-pricing-subhead" data-stagger>Transparent pricing. No contracts. No phone sales. Cancel anytime.</p>
                        <div className="lp-pricing-grid pricing-grid">
                            {pricing.map((tier) => (
                                <article key={tier.tier} className={`lp-pricing-card pricing-card ${tier.cardClass || ''}`} data-stagger>
                                    {tier.badge && <div className="lp-pricing-badge pricing-badge">{tier.badge}</div>}
                                    <h3 className="lp-pricing-tier pricing-tier">{tier.tier}</h3>
                                    <div className="lp-pricing-price pricing-price">
                                        <span className="lp-price-amount price-amount">{tier.amount}</span>
                                        <span className="lp-price-period price-period">{tier.period}</span>
                                    </div>
                                    <p className="lp-pricing-subtitle pricing-description">{tier.description}</p>
                                    {tier.comparison && (
                                        <div className="pricing-comparison">
                                            <span className="comparison-label">{tier.comparison.label}</span>
                                            <span className="comparison-value">{tier.comparison.value}</span>
                                            <span className="comparison-note">{tier.comparison.note}</span>
                                        </div>
                                    )}
                                    <ul className="lp-pricing-features pricing-features">
                                        {tier.features.map((entry) => (
                                            <li key={entry}>{entry}</li>
                                        ))}
                                    </ul>
                                    {tier.cta && (
                                        <a href="#signup" className="pricing-cta pricing-cta-primary" aria-label="Start free with no credit card">
                                            {tier.cta}
                                        </a>
                                    )}
                                    {tier.note && <p className="pricing-note">{tier.note}</p>}
                                </article>
                            ))}
                        </div>
                        <div className="pricing-trust" data-stagger>
                            <div className="trust-badge">
                                <span className="trust-icon">&#10003;</span>
                                <span className="trust-text">No contracts</span>
                            </div>
                            <div className="trust-badge">
                                <span className="trust-icon">&#10003;</span>
                                <span className="trust-text">Cancel anytime</span>
                            </div>
                            <div className="trust-badge">
                                <span className="trust-icon">&#10003;</span>
                                <span className="trust-text">No phone sales</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="lp-faq" data-reveal aria-labelledby="lp-faq-title">
                    <div className="lp-faq-container faq-container">
                        <h2 id="lp-faq-title" className="lp-section-headline faq-headline" data-stagger>FAQ</h2>
                        <div className="lp-faq-list faq-list">
                            {faqs.map((faq, index) => (
                                <details key={faq.question} className="lp-faq-item faq-item" open={index === 0} data-stagger>
                                    <summary className="lp-faq-question faq-question">{faq.question}</summary>
                                    <p className="lp-faq-answer faq-answer">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="signup" className="lp-final-cta final-cta" data-reveal aria-labelledby="lp-final-title">
                    <div className="lp-final-cta-container final-cta-container">
                        <h2 id="lp-final-title" className="lp-final-cta-headline final-cta-headline" data-stagger>Ready to stop guessing?</h2>
                        <p className="lp-final-cta-subhead final-cta-subhead" data-stagger>Start your free 4-week plan today. No credit card required.</p>
                        <Link to="/profile-setup" className="cta-button-large" aria-label="Start free with no credit card" data-stagger>
                            Start Free - No Credit Card
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="lp-footer footer">
                <div className="lp-footer-container footer-container">
                    <div className="lp-footer-brand footer-left">
                        <div className="lp-footer-logo footer-logo">RecruitCoS</div>
                        <p className="lp-footer-copyright footer-copyright">&#169; 2026 RecruitCoS</p>
                    </div>

                    <div className="lp-footer-links footer-center" aria-label="Footer links">
                        <a href="/privacy" className="lp-footer-link footer-link">Privacy</a>
                        <a href="/terms" className="lp-footer-link footer-link">Terms</a>
                        <a href="/contact" className="lp-footer-link footer-link">Contact</a>
                        <a href="/blog" className="lp-footer-link footer-link">Blog</a>
                    </div>

                    <div className="lp-footer-social-proof footer-right">
                        <p className="footer-tagline">Join families who stopped guessing</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
