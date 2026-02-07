import { Link } from 'react-router-dom'

export default function Contact() {
    return (
        <main className="lp-landing min-h-screen px-6 py-20" aria-labelledby="contact-title">
            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--gray-200)] bg-white p-8 shadow-sm">
                <h1 id="contact-title" className="text-3xl font-bold text-[var(--gray-900)]">Contact</h1>
                <p className="mt-4 text-base leading-7 text-[var(--gray-700)]">
                    Need help with your recruiting plan or account access? Email us at
                    {' '}
                    <a className="font-semibold text-[var(--purple-700)]" href="mailto:support@recruitcos.com">support@recruitcos.com</a>
                    {' '}
                    and we will get back to you as soon as possible.
                </p>
                <p className="mt-6 text-sm text-[var(--gray-600)]">Support hours: Monday-Friday, 9:00 AM-5:00 PM Central.</p>
                <Link to="/" className="mt-8 inline-flex text-sm font-semibold text-[var(--purple-700)]">Back to home</Link>
            </div>
        </main>
    )
}
