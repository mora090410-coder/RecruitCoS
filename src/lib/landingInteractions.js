export function calculateFaqHeights(itemCount, contentNodes) {
    return Array.from({ length: itemCount }, (_, index) => contentNodes[index]?.scrollHeight || 0)
}

function applyStaggerIndexes(root) {
    const revealSections = Array.from(root.querySelectorAll('[data-reveal]'))
    revealSections.forEach((section) => {
        const staggerItems = Array.from(section.querySelectorAll('[data-stagger]'))
        staggerItems.forEach((item, index) => item.style.setProperty('--stagger-index', String(index)))
    })
    return revealSections
}

export function setupSectionReveal(root) {
    const revealSections = applyStaggerIndexes(root)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
        revealSections.forEach((section) => section.classList.add('is-visible'))
        return () => {}
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible')
                    observer.unobserve(entry.target)
                }
            })
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    )

    revealSections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
}
