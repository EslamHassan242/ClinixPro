import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  Clock,
  UserPlus,
  PlusCircle,
  FileText,
  Activity,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/app/actions/dashboard";
import { getOperationalAnalytics } from "@/app/actions/analytics";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, operational] = await Promise.all([
    getDashboardStats(),
    getOperationalAnalytics()
  ]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Clinic Overview</h2>
          <p className="text-muted-foreground font-medium italic text-xs sm:text-sm">Performance analytics and recent activities for your practice.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/patients/new" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Link>
          <Link href="/dashboard/appointments/new" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground/70 hover:bg-muted shadow-sm transition-all active:scale-95 w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Book Visit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.patientCount.toLocaleString()} icon={Users} footer="+12% this month" color="bg-blue-500" />
        <StatCard title="Avg. Wait Time" value={`${Math.round(operational.avgWaitTime)} min`} icon={Clock} footer="Registration to Call" color="bg-amber-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={CreditCard} footer="Gross collections" color="bg-primary" />
        <StatCard title="Monthly Load" value={operational.totalPatients.toString()} icon={Activity} footer="Patients completed" color="bg-secondary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl ring-1 ring-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-8">
             <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                <Activity className="h-12 w-12 animate-pulse opacity-20" />
                <span className="text-sm font-bold italic">Analytical engine initializing...</span>
             </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 border-none shadow-xl ring-1 ring-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {stats.recentAppointments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground italic text-sm">
                  No recent appointments recorded.
                </div>
              ) : (
                stats.recentAppointments.map((app: any) => (
                  <div key={app.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group border-b border-border/50 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                      {app.patient.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{app.patient.fullName}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {app.type} • {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Link href={`/dashboard/patients/${app.patientId}`} className="h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-sm">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="border-t p-4 bg-slate-50/50">
               <Link href="/dashboard/appointments" className="block text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">
                 View Full Schedule
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, footer, color }: { title: string, value: string, icon: any, footer?: string, color: string }) {
  return (
    <Card className="border-none shadow-xl ring-1 ring-border bg-card overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Realtime</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</div>
          <div className="text-3xl font-black text-foreground tracking-tight">{value}</div>
          {footer && (
            <div className="flex items-center gap-1.5 pt-2">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-muted-foreground italic">{footer}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
