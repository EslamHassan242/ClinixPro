"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Eye,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AppointmentCalendarClientProps {
  initialAppointments: any[];
}

export function AppointmentCalendarClient({ initialAppointments }: AppointmentCalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [appointments, setAppointments] = useState(initialAppointments);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h2>
          <p className="text-slate-500 font-medium italic">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg p-1 bg-white shadow-sm">
             <button onClick={() => setView("month")} className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", view === "month" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-100 text-slate-500")}>Month</button>
             <button onClick={() => setView("week")} className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", view === "week" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-100 text-slate-500")}>Week</button>
             <button onClick={() => setView("day")} className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", view === "day" ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-slate-100 text-slate-500")}>Day</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-sm bg-white"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs border border-slate-200 rounded-lg font-bold hover:bg-slate-100 bg-white shadow-sm transition-all active:scale-95">Today</button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-sm bg-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <Link href="/dashboard/appointments/new" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-black uppercase tracking-widest text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-2xl ring-1 ring-slate-200">
        <div className="grid grid-cols-7 border-b text-center py-4 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
           <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-white">
           {calendarDays.map((day, idx) => {
             const isCurrentMonth = isSameMonth(day, monthStart);
             const isToday = isSameDay(day, new Date());
             const dayAppointments = appointments.filter(app => isSameDay(new Date(app.appointmentDate), day));

             return (
               <div key={idx} className={cn(
                 "min-h-[140px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50/50 group relative",
                 !isCurrentMonth && "bg-slate-50/30 text-slate-300"
               )}>
                 <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "text-xs font-black h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                      isToday ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-500 group-hover:text-primary"
                    )}>{format(day, "d")}</span>
                    {isToday && <span className="text-[8px] font-black text-primary uppercase tracking-widest">Today</span>}
                 </div>
                 <div className="space-y-1.5 max-h-[100px] overflow-y-auto no-scrollbar">
                    {dayAppointments.map(app => (
                      <div key={app.id} className={cn(
                        "text-[9px] p-2 rounded-lg border-l-4 font-bold shadow-sm flex flex-col gap-1 group/item transition-all hover:scale-[1.02]",
                        app.status === 'completed' ? "bg-emerald-50 border-emerald-500 text-emerald-700" :
                        app.status === 'cancelled' ? "bg-red-50 border-red-500 text-red-700" :
                        app.status === 'waiting' ? "bg-amber-50 border-amber-500 text-amber-700" :
                        app.status === 'called' ? "bg-blue-50 border-blue-500 text-blue-700" :
                        "bg-primary/5 border-primary text-primary"
                      )}>
                         <div className="flex items-center justify-between">
                            <span className="font-black uppercase tracking-tighter">{format(new Date(app.startTime), "HH:mm")}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                               {app.status === 'scheduled' && (
                                 <button 
                                   onClick={async (e) => {
                                      e.preventDefault();
                                      const { updateAppointmentStatus } = await import("@/app/actions/appointments");
                                      await updateAppointmentStatus(app.id, 'waiting');
                                      window.location.reload(); // Quick refresh to show status
                                   }}
                                   title="Patient Arrived"
                                   className="p-1 hover:bg-amber-500 hover:text-white rounded transition-colors"
                                 >
                                    <Clock className="h-3 w-3" />
                                 </button>
                               )}
                               <Link href={`/dashboard/patients/${app.patientId}`} className="p-1 hover:bg-primary hover:text-white rounded transition-colors">
                                  <Eye className="h-3 w-3" />
                               </Link>
                            </div>
                         </div>
                         <div className="truncate">{app.patient.fullName}</div>
                      </div>
                    ))}
                 </div>
               </div>
             )
           })}
        </div>
      </Card>
    </div>
  );
}
