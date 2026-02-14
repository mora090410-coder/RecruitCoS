export default function CelebrationModal({ actionNumber, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] p-4 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="rc-slide-up w-full max-w-[400px] overflow-hidden rounded-2xl border border-[rgba(139,38,53,0.28)] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="celebration-modal-title"
            >
                <div className="bg-gradient-to-r from-[#8B2635] to-[#8B2635] px-6 py-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">Weekly Momentum</p>
                </div>

                <div className="px-6 pb-6 pt-5 text-center">
                    <div className="mx-auto mb-3 text-6xl leading-none" aria-hidden="true">🎉</div>
                    <h2 id="celebration-modal-title" className="text-2xl font-semibold text-gray-900">
                        Action {actionNumber} Complete!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Great start. You&apos;re building momentum.
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[rgba(212,175,55,0.42)] bg-[#8B2635] px-5 text-sm font-semibold text-white transition hover:bg-[#7D2230]"
                    >
                        Back to This Week&apos;s Plan
                    </button>
                </div>
            </div>
        </div>
    );
}
