"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar as CalendarIcon,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppointmentTableClientProps {
  initialAppointments: any[];
  doctors: any[];
}

export function AppointmentTableClient({ initialAppointments, doctors }: AppointmentTableClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState("today"); // today, week, month, all

  const filteredAppointments = initialAppointments.filter(app => {
    const matchesSearch = app.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (app.patient.phone || "").includes(searchTerm);
    const matchesDoctor = selectedDoctor === "all" || app.doctorId === selectedDoctor;
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    
    // Simplistic date filtering for demo - in a real app this would be a server-side query
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
      case 'cancelled': return 'bg-red-100 text-red-700 ring-red-500/20';
      case 'waiting': return 'bg-amber-100 text-amber-700 ring-amber-500/20';
      case 'called': return 'bg-blue-100 text-blue-700 ring-blue-500/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search patient name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border">
                 <button onClick={() => setDateRange("today")} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", dateRange === "today" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}>Today</button>
                 <button onClick={() => setDateRange("week")} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", dateRange === "week" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}>Week</button>
                 <button onClick={() => setDateRange("month")} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", dateRange === "month" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}>Month</button>
              </div>

              <select 
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              >
                 <option value="all">All Doctors</option>
                 {doctors.map(doc => (
                   <option key={doc.id} value={doc.id}>{doc.fullName}</option>
                 ))}
              </select>

              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              >
                 <option value="all">Any Status</option>
                 <option value="scheduled">Scheduled</option>
                 <option value="waiting">Waiting</option>
                 <option value="called">Called</option>
                 <option value="completed">Completed</option>
                 <option value="cancelled">Cancelled</option>
              </select>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Patient Information</th>
                <th className="px-8 py-5">Appointment Time</th>
                <th className="px-8 py-5">Attending Physician</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center italic text-slate-400 font-medium">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-110 transition-transform">
                             {app.patient.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-800 tracking-tight">{app.patient.fullName}</span>
                             <span className="text-[10px] font-bold text-slate-400">{app.patient.phone}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                             <CalendarIcon className="h-3 w-3 text-slate-400" />
                             {format(new Date(app.appointmentDate), "MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                             <Clock className="h-3 w-3" />
                             {format(new Date(app.startTime), "HH:mm")} - {format(new Date(app.endTime), "HH:mm")}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Stethoscope className="h-4 w-4 text-slate-400" />
                          {app.doctor?.fullName || 'Not assigned'}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn(
                         "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1",
                         getStatusColor(app.status)
                       )}>
                          {app.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end items-center gap-2">
                          <Link 
                            href={`/dashboard/patients/${app.patient.id}`}
                            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-slate-100"
                            title="View Profile"
                          >
                             <Eye className="h-4 w-4" />
                          </Link>
                          {app.status === 'scheduled' && (
                             <button 
                               onClick={async () => {
                                  const { updateAppointmentStatus } = await import("@/app/actions/appointments");
                                  await updateAppointmentStatus(app.id, 'waiting');
                                  window.location.reload();
                               }}
                               className="p-2 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm border border-transparent hover:border-emerald-100"
                               title="Arrived"
                             >
                                <CheckCircle2 className="h-4 w-4" />
                             </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-t">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Showing {filteredAppointments.length} Appointments</p>
           <div className="flex gap-2">
              <button disabled className="p-2 bg-white rounded-lg border text-slate-300 transition-all active:scale-95 disabled:opacity-50">
                 <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-2 bg-white rounded-lg border text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                 <ChevronRight className="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
