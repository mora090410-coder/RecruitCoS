import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function Privacy() {
    return (
        <div className="lp-landing min-h-screen">
            <header className="lp-nav">
                <div className="lp-nav-container">
                    <Link to="/" className="lp-logo">RecruitCoS</Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="text-[var(--gray-700)]">Login</Button>
                        </Link>
                        <Link to="/profile-setup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                <article className="rounded-xl border border-[var(--gray-200)] bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-3xl font-bold text-[var(--gray-900)] sm:text-4xl">Privacy Policy</h1>
                    <p className="mt-2 text-sm text-[var(--gray-500)]">Last updated: 2026-02-06</p>
                    <p className="mt-4 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-3 text-sm text-[var(--gray-700)]">
                        This is a plain-language summary for beta. Full legal terms coming soon.
                    </p>

                    <section className="mt-8 space-y-6 text-[var(--gray-700)]">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Information we collect</h2>
                            <p className="mt-2 text-sm">We collect the information you provide in your profile, activity logs, and settings, along with basic technical data needed to run the app.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">How we use information</h2>
                            <p className="mt-2 text-sm">We use your information to personalize recruiting guidance, improve your weekly plan, and support product reliability.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Data storage and security</h2>
                            <p className="mt-2 text-sm">We use modern cloud services and access controls to protect account data. No online service is perfect, but security is a priority in our beta operations.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Analytics</h2>
                            <p className="mt-2 text-sm">We may collect product usage analytics to understand feature adoption and improve the platform experience.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Children&apos;s privacy</h2>
                            <p className="mt-2 text-sm">If you believe a child has provided information inappropriately, contact us and we will review and take appropriate action.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Contact</h2>
                            <p className="mt-2 text-sm">Questions about this summary can be sent to our support team through the RecruitCoS contact channels.</p>
                        </div>
                    </section>
                </article>
            </main>
        </div>
    )
}
