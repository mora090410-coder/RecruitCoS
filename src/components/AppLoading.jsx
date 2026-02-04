export default function AppLoading({ message = "Loading RecruitCoS..." }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-serif font-bold tracking-tight">RecruitCoS</h2>
                <p className="text-zinc-500 text-sm font-medium animate-pulse">{message}</p>
            </div>
        </div>
    )
}
