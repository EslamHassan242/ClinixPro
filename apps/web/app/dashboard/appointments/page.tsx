import { getAppointments } from "@/app/actions/appointments";
import { getDoctors } from "@/app/actions/users";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AppointmentsPage() {
  const [appointments, doctors] = await Promise.all([
    getAppointments(),
    getDoctors(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase flex items-center gap-3 italic">
               <span className="h-2 w-10 bg-primary rounded-full"></span> 
               Appointment Schedule
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">High-Performance Clinical Queue Management</p>
         </div>
         <Link 
           href="/dashboard/appointments/new"
           className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
         >
           <Plus className="h-4 w-4" />
           Book Appointment
         </Link>
      </div>
      <AppointmentTableClient initialAppointments={appointments} doctors={doctors} />
    </div>
  );
}
