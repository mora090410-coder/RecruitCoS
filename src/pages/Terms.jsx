import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function Terms() {
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
                    <h1 className="text-3xl font-bold text-[var(--gray-900)] sm:text-4xl">Terms of Service</h1>
                    <p className="mt-2 text-sm text-[var(--gray-500)]">Last updated: 2026-02-06</p>
                    <p className="mt-4 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-3 text-sm text-[var(--gray-700)]">
                        This is a plain-language summary for beta. Full legal terms coming soon.
                    </p>

                    <section className="mt-8 space-y-6 text-[var(--gray-700)]">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Service description</h2>
                            <p className="mt-2 text-sm">RecruitCoS provides tools to help athletes organize recruiting tasks, profile data, and progress over time.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Accounts</h2>
                            <p className="mt-2 text-sm">You are responsible for keeping account credentials secure and for activity associated with your account.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Acceptable use</h2>
                            <p className="mt-2 text-sm">Use the product lawfully and respectfully. Do not attempt to misuse, disrupt, or gain unauthorized access to the service.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Disclaimer</h2>
                            <p className="mt-2 text-sm">RecruitCoS provides guidance tools and does not guarantee recruiting outcomes, scholarship offers, or roster placement.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Limitation of liability</h2>
                            <p className="mt-2 text-sm">To the extent permitted by law, RecruitCoS is not liable for indirect or consequential damages arising from your use of the beta service.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Changes</h2>
                            <p className="mt-2 text-sm">We may update these terms as the product evolves. Material updates will be reflected with a revised date.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-900)]">Contact</h2>
                            <p className="mt-2 text-sm">Questions about these terms can be sent to our support team through RecruitCoS contact channels.</p>
                        </div>
                    </section>
                </article>
            </main>
        </div>
    )
}
