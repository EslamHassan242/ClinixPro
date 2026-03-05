import { Loader2, Activity } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Activity className="h-10 w-10 text-primary opacity-20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 animate-pulse">Optimizing Layout</h3>
        <p className="text-xs text-slate-400 font-bold italic">Gathering clinical data for you...</p>
      </div>
      
      {/* Skeleton Placeholders */}
      <div className="w-full max-w-4xl grid gap-6 grid-cols-1 md:grid-cols-3 pt-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl bg-slate-100/50 border border-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
