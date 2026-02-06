export default function AppLoading({ message = "Loading RecruitCoS..." }) {
    return (
        <div className="rc-auth-shell fixed inset-0 z-50 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--rc-border)]"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--rc-cardinal)] border-t-transparent"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-serif font-bold tracking-tight">RecruitCoS</h2>
                <p className="rc-muted text-sm font-medium animate-pulse">{message}</p>
            </div>
        </div>
    )
}
