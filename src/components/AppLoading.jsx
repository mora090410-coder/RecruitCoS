export default function AppLoading({ message = "Initializing..." }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-medium animate-pulse tracking-wide">{message}</p>
        </div>
    )
}
