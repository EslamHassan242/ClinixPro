"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Play, 
  CheckCircle2, 
  Bell, 
  UserCheck,
  ChevronRight,
  Loader2,
  Phone,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getActiveQueue, updateAppointmentStatus } from "@/app/actions/appointments";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  status: string;
  patient: {
    id: string;
    fullName: string;
    mrn: string;
    phone: string;
  };
  doctor?: {
    fullName: string;
  };
  type: string;
  updatedAt: Date;
}

export function QueueManager({ role }: { role: "doctor" | "receptionist" | "admin" }) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const data = await getActiveQueue();
      setQueue(data as any);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Poll every 10s for "real-time" feel
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string, patientId?: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      toast.success(`Patient marked as ${newStatus}`);
      
      if (newStatus === "in-progress" && patientId) {
        router.push(`/dashboard/medical-records/new?patientId=${patientId}&appointmentId=${id}`);
      } else {
        fetchQueue();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const scheduledPatients = queue.filter(q => q.status === "scheduled");
  const waitingPatients = queue.filter(q => q.status === "waiting");
  const calledPatients = queue.filter(q => q.status === "called");
  const readyPatients = queue.filter(q => q.status === "ready");
  const inProgressPatients = queue.filter(q => q.status === "in-progress");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Syncing Live Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        {/* Not Arrived / Scheduled Today */}
        <Card className="border-none shadow-xl ring-1 ring-slate-100 bg-slate-50/30">
           <CardHeader className="bg-slate-100/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Not Arrived</CardTitle>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">{scheduledPatients.length}</span>
           </CardHeader>
           <CardContent className="p-0 max-h-[400px] overflow-y-auto no-scrollbar">
              {scheduledPatients.length === 0 ? (
                <div className="p-12 text-center italic text-slate-300 text-xs">No scheduled visits.</div>
              ) : (
                scheduledPatients.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                       <Link 
                         href={`/dashboard/patients/${item.patient.id}`}
                         className="font-bold text-slate-700 hover:text-primary hover:underline transition-all"
                        >
                          {item.patient.fullName}
                       </Link>
                       <time className="text-[10px] font-mono text-slate-300">{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400/60">{item.type}</div>
                       <button 
                         onClick={() => handleStatusChange(item.id, "waiting")}
                         className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                       >
                         Check-in
                       </button>
                    </div>
                  </div>
                ))
              )}
           </CardContent>
        </Card>
        {/* Waiting List */}
        <Card className="border-none shadow-xl ring-1 ring-slate-200">
           <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting Area</CardTitle>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">{waitingPatients.length}</span>
           </CardHeader>
           <CardContent className="p-0 max-h-[500px] overflow-y-auto no-scrollbar">
              {waitingPatients.length === 0 ? (
                <div className="p-12 text-center italic text-slate-300 text-xs">Waiting area is empty.</div>
              ) : (
                waitingPatients.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                       <Link 
                         href={`/dashboard/patients/${item.patient.id}`}
                         className="font-bold text-slate-800 hover:text-primary hover:underline transition-all"
                        >
                          {item.patient.fullName}
                       </Link>
                       <time className="text-[10px] font-mono text-slate-400">{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">{item.type}</div>
                       {role !== "receptionist" && (
                         <button 
                           onClick={() => handleStatusChange(item.id, "called")}
                           className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                         >
                           <Bell className="h-3 w-3" /> Call
                         </button>
                       )}
                    </div>
                  </div>
                ))
              )}
           </CardContent>
        </Card>

        {/* Called - Waiting for Receptionist Confirmation */}
        <Card className="border-none shadow-xl ring-1 ring-amber-100 bg-amber-50/10">
           <CardHeader className="bg-amber-50/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-600">Calling Patient</CardTitle>
              <span className="bg-amber-200 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black">{calledPatients.length}</span>
           </CardHeader>
           <CardContent className="p-0">
              {calledPatients.length === 0 ? (
                <div className="p-12 text-center italic text-amber-300 text-xs">Waiting for doctor call...</div>
              ) : (
                calledPatients.map((item) => (
                  <div key={item.id} className="p-4 border-b border-amber-100 last:border-0 bg-amber-50/30 animate-pulse-slow">
                     <div className="flex items-center justify-between mb-3 text-amber-900">
                        <Link 
                          href={`/dashboard/patients/${item.patient.id}`}
                          className="font-black hover:underline"
                        >
                          {item.patient.fullName}
                        </Link>
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                     </div>
                     <div className="flex items-center justify-between">
                        {role === "receptionist" ? (
                          <button 
                            onClick={() => handleStatusChange(item.id, "ready")}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-emerald-700"
                          >
                            <UserCheck className="h-3 w-3" /> Permission to Enter
                          </button>
                        ) : (
                          <div className="text-[8px] font-black uppercase tracking-widest text-amber-600 animate-pulse">
                             Waiting for Receptionist Confirmation
                          </div>
                        )}
                     </div>
                  </div>
                ))
              )}
           </CardContent>
        </Card>

        {/* Ready to Enter - Waiting for Doctor Start */}
        <Card className="border-none shadow-xl ring-1 ring-emerald-100 bg-emerald-50/10">
           <CardHeader className="bg-emerald-50/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Ready to Enter</CardTitle>
              <span className="bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black">{readyPatients.length}</span>
           </CardHeader>
           <CardContent className="p-0">
              {readyPatients.length === 0 ? (
                <div className="p-12 text-center italic text-emerald-300 text-xs">No patients ready to enter.</div>
              ) : (
                readyPatients.map((item) => (
                  <div key={item.id} className="p-4 border-b border-emerald-100 last:border-0 bg-emerald-50/30">
                     <div className="flex items-center justify-between mb-3">
                        <Link 
                          href={`/dashboard/patients/${item.patient.id}`}
                          className="font-black text-emerald-900 hover:underline"
                        >
                          {item.patient.fullName}
                        </Link>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                     </div>
                     <div className="flex items-center justify-between">
                        {role === "doctor" ? (
                          <button 
                            onClick={() => handleStatusChange(item.id, "in-progress", item.patient.id)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                          >
                            <Play className="h-3 w-3" /> Start Session
                          </button>
                        ) : (
                          <div className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                             Patient is Allowed to Enter
                          </div>
                        )}
                     </div>
                  </div>
                ))
              )}
           </CardContent>
        </Card>

        {/* Completed / Recently Seen */}
        <Card className="border-none shadow-xl ring-1 ring-slate-200">
           <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</CardTitle>
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black">{inProgressPatients.length}</span>
           </CardHeader>
           <CardContent className="p-0">
              {inProgressPatients.length === 0 ? (
                <div className="p-12 text-center italic text-slate-300 text-xs">No active sessions.</div>
              ) : (
                inProgressPatients.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-0 flex items-center justify-between">
                     <div>
                        <Link 
                          href={`/dashboard/patients/${item.patient.id}`}
                          className="font-bold text-slate-700 hover:text-primary hover:underline"
                        >
                          {item.patient.fullName}
                        </Link>
                        <div className="text-[10px] font-medium text-slate-400 italic">Seeing {item.doctor?.fullName || 'Physician'}</div>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center animate-spin-slow">
                        <Loader2 className="h-4 w-4" />
                     </div>
                  </div>
                ))
              )}
           </CardContent>
        </Card>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
         <div className="relative z-10 flex items-center justify-between">
            <div>
               <h4 className="text-xl font-black uppercase italic tracking-tighter">Live Queue Summary</h4>
               <p className="text-slate-400 text-xs font-medium">Monitoring patient flow in real-time across all departments.</p>
            </div>
            <div className="flex gap-8">
               <div className="text-right">
                  <div className="text-3xl font-black italic">{queue.length}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total Today</div>
               </div>
               <div className="text-right">
                   <div className="text-3xl font-black italic text-primary">{waitingPatients.length + calledPatients.length + readyPatients.length}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Currently Waiting</div>
               </div>
            </div>
         </div>
         <Activity className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5" />
      </div>
    </div>
  );
}
