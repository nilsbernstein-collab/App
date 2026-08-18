export function SplashScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
        N
      </div>
      <p className="text-sm text-slate-400 dark:text-slate-500">NicheTrack wird geladen…</p>
    </div>
  )
}
