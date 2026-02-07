import { Link } from 'react-router-dom'

export default function Blog() {
    return (
        <main className="lp-landing min-h-screen px-6 py-20" aria-labelledby="blog-title">
            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--gray-200)] bg-white p-8 shadow-sm">
                <h1 id="blog-title" className="text-3xl font-bold text-[var(--gray-900)]">Blog</h1>
                <p className="mt-4 text-base leading-7 text-[var(--gray-700)]">
                    The RecruitCoS blog is launching soon. We will publish weekly guides on recruiting timelines,
                    parent budgeting, and division-fit strategy.
                </p>
                <p className="mt-6 text-sm text-[var(--gray-600)]">Check back soon for new posts.</p>
                <Link to="/" className="mt-8 inline-flex text-sm font-semibold text-[var(--purple-700)]">Back to home</Link>
            </div>
        </main>
    )
}
