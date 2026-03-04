"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { appointmentSchema } from "@clinixpro/shared/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Calendar, Clock, User, UserPlus, Search, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewAppointmentClient({ doctors, services }: { doctors: any[], services: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select patient from URL if present
  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (patientId) {
      const fetchSelected = async () => {
        try {
          const { getPatientById } = await import("@/app/actions/patients");
          const p = await getPatientById(patientId);
          if (p) setSelectedPatient(p);
        } catch (e) {
          console.error("Failed to fetch pre-selected patient:", e);
        }
      };
      fetchSelected();
    }
  }, [searchParams]);

  const form = useForm({
    resolver: zodResolver(
      appointmentSchema.omit({ appointmentDate: true, startTime: true, endTime: true, patientId: true }).extend({
        appointmentDate: z.string().min(1, "Date is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        type: z.string(), // Allowing any string instead of exact enum if we use Services
      })
    ),
    defaultValues: {
      appointmentDate: new Date().toLocaleDateString('en-CA'),
      startTime: "",
      endTime: "",
      status: "scheduled",
      type: "regular",
      isVirtual: false,
      reason: "",
      doctorId: "",
    },
  });

  // Debounced search for patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!searchQuery) {
        setPatients([]);
        return;
      }
      setIsLoadingPatients(true);
      try {
        const { getPatients } = await import("@/app/actions/patients");
        const results = await getPatients(searchQuery);
        setPatients(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onSubmit = async (data: any) => {
    if (!selectedPatient) return;
    setIsSubmitting(true);
    try {
      const { createAppointment } = await import("@/app/actions/appointments");
      const formattedData = {
        ...data,
        patientId: selectedPatient.id,
        appointmentDate: new Date(data.appointmentDate),
        // Combine date and time for startTime/endTime
        startTime: new Date(`${data.appointmentDate}T${data.startTime}`),
        endTime: new Date(`${data.appointmentDate}T${data.endTime}`),
      };

      await createAppointment(formattedData);
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({ fullName: "", phone: "", gender: "Male" });

  const handleQuickAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPatient(true);
    try {
      const { createPatient, checkPatientExists } = await import("@/app/actions/patients");
      
      // Check for duplicates
      const existing = await checkPatientExists(newPatientData.phone, newPatientData.fullName);
      if (existing) {
        const proceed = window.confirm(`A patient named ${existing.fullName} with phone ${existing.phone} already exists. Do you want to select them instead of creating a duplicate?`);
        if (proceed) {
          // fetch full patient to select
          const { getPatientById } = await import("@/app/actions/patients");
          const fullPatient = await getPatientById(existing.id);
          setSelectedPatient(fullPatient);
          setIsNewPatientModalOpen(false);
          setSearchQuery("");
          setNewPatientData({ fullName: "", phone: "", gender: "Male" });
          return;
        }
      }

      const newPatient = await createPatient({
        fullName: newPatientData.fullName,
        phone: newPatientData.phone,
        gender: newPatientData.gender,
        dateOfBirth: null,
        email: "",
        address: "",
        bloodType: "",
        idType: "National ID",
        idNumber: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        allergies: [],
        chronicDiseases: []
      });
      // Auto-select the newly created patient
      setSelectedPatient(newPatient);
      setIsNewPatientModalOpen(false);
      setSearchQuery("");
      setNewPatientData({ fullName: "", phone: "", gender: "Male" });
    } catch (error) {
      console.error("Failed to create patient:", error);
      alert("Failed to create patient rapidly.");
    } finally {
      setIsCreatingPatient(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      {/* Quick Add Patient Modal */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl bg-white border-0 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b space-y-1 bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-slate-800">Quick Add Patient</CardTitle>
                <button type="button" onClick={() => setIsNewPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">Create a basic profile now. You can add medical history later.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleQuickAddPatient} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                  <input required value={newPatientData.fullName} onChange={e => setNewPatientData({...newPatientData, fullName: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter Full Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number *</label>
                  <input required value={newPatientData.phone} onChange={e => setNewPatientData({...newPatientData, phone: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="01..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Gender</label>
                  <select value={newPatientData.gender} onChange={e => setNewPatientData({...newPatientData, gender: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsNewPatientModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button disabled={isCreatingPatient} type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                    {isCreatingPatient ? "Saving..." : "Create & Select"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Book Appointment</h2>
          <p className="text-slate-500 italic text-sm">Schedule a new visit for a patient in your records.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
           <Card className="border-none shadow-xl ring-1 ring-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">1. Select Patient</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search by name or MRN..." 
                          className="w-full rounded-lg border-slate-200 bg-slate-50/50 pl-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <button 
                         type="button"
                         onClick={() => setIsNewPatientModalOpen(true)} 
                         className="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-primary hover:bg-primary/10 transition-all"
                         title="Quick Add Patient"
                       >
                         <UserPlus className="h-5 w-5" />
                       </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 no-scrollbar">
                       {patients.map(p => (
                         <button 
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPatient(p)}
                          className="w-full text-left p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                         >
                            <div className="font-bold text-slate-700 group-hover:text-primary transition-colors">{p.fullName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{p.mrn}</div>
                         </button>
                       ))}
                       {isLoadingPatients && <div className="text-center py-4 text-xs text-slate-400 animate-pulse font-bold">Searching...</div>}
                     {searchQuery && !isLoadingPatients && patients.length === 0 && (
                         <div className="text-center py-6 space-y-3">
                           <p className="text-xs text-slate-400 italic">No patient found matching your search.</p>
                           <button 
                             type="button"
                             onClick={() => setIsNewPatientModalOpen(true)} 
                             className="inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                           >
                             <UserPlus className="h-3 w-3 mr-2" /> Quick Add Patient
                           </button>
                         </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm uppercase shadow-sm">
                        {selectedPatient.fullName.substring(0,2)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-700">{selectedPatient.fullName}</div>
                        <div className="text-[10px] font-mono text-primary font-bold">{selectedPatient.mrn}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedPatient(null)} className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 py-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">2. Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="p-8 space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date
                      </label>
                      <input type="date" {...form.register("appointmentDate")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Start
                        </label>
                        <input type="time" {...form.register("startTime")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Clock className="h-4 w-4" /> End
                        </label>
                        <input type="time" {...form.register("endTime")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <User className="h-4 w-4" /> Doctor
                      </label>
                      <select {...form.register("doctorId")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
                        <option value="">Select Doctor</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>Dr. {doc.fullName} {doc.specialization ? `(${doc.specialization})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Appointment Type / Service
                      </label>
                      <select {...form.register("type")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer">
                        <option value="regular">Regular Checkup</option>
                        {services.map(srv => (
                            <option key={srv.name} value={srv.name}>{srv.name} ({srv.duration} mins - ${srv.price})</option>
                        ))}
                        <option value="consultation">Initial Consultation</option>
                        <option value="follow-up">Follow-up Visit</option>
                        <option value="emergency">Emergency Case</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Reason for Visit</label>
                    <textarea {...form.register("reason")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Brief description of symptoms or reason..." />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                    <input type="checkbox" id="isVirtual" {...form.register("isVirtual")} className="h-5 w-5 rounded border-slate-300 text-secondary focus:ring-secondary cursor-pointer" />
                    <label htmlFor="isVirtual" className="text-sm font-bold text-slate-700 cursor-pointer">Virtual Appointment (High-fidelity Video Call Enabled)</label>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50/50 p-6 border-t border-slate-100">
                  <button type="button" onClick={() => router.back()} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={!selectedPatient || isSubmitting} 
                    className="px-10 py-3 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Finalize Booking
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
