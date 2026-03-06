"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicalRecordSchema } from "@clinixpro/shared/validators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, FileText, User, Microscope, Pill, ListChecks, Info, ChevronLeft, Search, Clock, Calendar, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getPatientById } from "@/app/actions/patients";
import { getMedicalRecords, createMedicalRecord } from "@/app/actions/medical-records";
import { getLookups } from "@/app/actions/lookups";
import { toast } from "sonner";

import { PrescriptionForm } from "@/components/medical/prescription-form";
import { LabTestRequest } from "@/components/medical/lab-test-request";
import { RadiologyRequest } from "@/components/medical/radiology-request";
import { AttachmentManager } from "@/components/medical/attachment-manager";
import { VitalsForm } from "@/components/medical/vitals-form";

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const appointmentId = searchParams.get("appointmentId");
  
  const [patient, setPatient] = useState<any>(null);
  const [lookups, setLookups] = useState<any[]>([]);
  const [activeQueue, setActiveQueue] = useState<any[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [activeTab, setActiveTab] = useState("subjective");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: patientId || "",
      subjective: "",
      assessment: "",
      plan: "",
      type: "regular",
      prescriptions: [],
      labRequests: [],
      radiologyRequests: [],
      vitals: {},
      objective: "",
    },
  });

  useEffect(() => {
    if (patientId) {
      getPatientById(patientId).then(p => {
        setPatient(p);
        form.setValue("patientId", patientId);
      });
    } else if (appointmentId) {
       // If we only have appointmentId, fetch patient through it
       import("@/app/actions/appointments").then(({ getActiveQueue }) => {
          getActiveQueue().then(queue => {
             const app = queue.find(a => a.id === appointmentId);
             if (app) {
                setPatient(app.patient);
                form.setValue("patientId", app.patient.id);
                form.setValue("appointmentId" as any, appointmentId);
             }
          });
       });
    }
    
    fetchLookups();
    fetchQueue();
  }, [patientId, appointmentId, form]);

  async function fetchLookups() {
    try {
      const data = await getLookups();
      setLookups(data);
    } catch (error) {
      console.error("Failed to fetch lookups:", error);
    }
  }

  async function fetchQueue() {
     if (patientId) return; // No need if patient already selected
     setIsLoadingQueue(true);
     try {
        const { getActiveQueue } = await import("@/app/actions/appointments");
        const data = await getActiveQueue();
        setActiveQueue(data);
     } catch (e) {
        console.error("Failed to fetch queue:", e);
     } finally {
        setIsLoadingQueue(false);
     }
  }

  const onSubmit = async (data: any) => {
    if (!data.patientId) return toast.error("Please select a patient first.");
    
    // Prevention of empty records
    const isNoteEmpty = !data.subjective?.trim() && !data.assessment?.trim() && !data.plan?.trim() && !data.objective?.trim();
    if (isNoteEmpty && (data.prescriptions?.length === 0) && (data.labRequests?.length === 0)) {
       return toast.error("Clinical note is empty. Please add at least one clinical finding or prescription before finalizing.");
    }

    setIsSubmitting(true);
    try {
      // Merge lab and radiology requests for the action
      const combinedInvestigations = [
        ...(data.labRequests || []),
        ...(data.radiologyRequests || [])
      ];

      await createMedicalRecord({
        ...data,
        labRequests: combinedInvestigations,
        objective: {
           vitals: data.vitals,
           findings: data.objective
        }
      });
      toast.success("Medical record finalized successfully!");
      router.push(`/dashboard/patients/${data.patientId}`);
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(error.message || "Failed to save medical record. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors (Detailed):", JSON.stringify(errors, null, 2));
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
       toast.error(`Please complete the required fields: ${errorKeys.join(', ')}`);
       // Log specific messages for each field
       errorKeys.forEach(key => {
         console.warn(`Field "${key}" error:`, errors[key]?.message || "Invalid value");
       });
    } else {
       toast.error("Form is invalid. Please check all fields.");
    }
  };

  const sections = [
    { id: "subjective", label: "Subjective (S)", icon: User, desc: "Patient's description of symptoms and history." },
    { id: "objective", label: "Objective (O) + Vitals", icon: Activity, desc: "Clinician's findings and vital physiological signs." },
    { id: "assessment", label: "Assessment (A)", icon: Info, desc: "Diagnosis or medical opinion." },
    { id: "plan", label: "Plan (P)", icon: ListChecks, desc: "Proposed treatment and follow-up." },
    { id: "rx", label: "Prescriptions", icon: Pill, desc: "Medications prescribed during this visit." },
    { id: "labs", label: "Laboratory", icon: Microscope, desc: "Laboratory investigations ordered." },
    { id: "radiology", label: "Radiology", icon: Activity, desc: "Radiological imaging and scans." },
  ];

  if (patientId && !patient) {
     return <div className="h-screen flex items-center justify-center animate-pulse font-bold text-primary">Loading Patient Context...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-slate-50 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">New Clinical Note</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
               <span>Recording visit for:</span>
               <span className="font-black text-primary uppercase underline decoration-2 underline-offset-4">{patient?.fullName || 'Select Patient'}</span>
            </div>
          </div>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={form.handleSubmit(onSubmit, onInvalid)}
          className="inline-flex items-center justify-center rounded-lg bg-secondary px-10 py-3 text-xs font-black uppercase tracking-widest text-white hover:brightness-110 shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Finalize Record
            </>
          )}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-3">
          {!patient && activeQueue.length > 0 && (
             <Card className="mb-6 border-none shadow-xl ring-1 ring-amber-200/50 bg-amber-50/10">
                <CardHeader className="py-3 px-4 bg-amber-50/50 border-b border-amber-100">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Waiting Room
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                   {activeQueue.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => {
                           setPatient(item.patient);
                           router.push(`/dashboard/medical-records/new?patientId=${item.patient.id}&appointmentId=${item.id}`);
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-card hover:shadow-sm transition-all group border border-transparent hover:border-amber-200/50"
                      >
                         <div className="text-[10px] font-bold text-foreground group-hover:text-primary">{item.patient.fullName}</div>
                         <div className="text-[8px] font-black text-muted-foreground uppercase">{item.status} • {item.type}</div>
                      </button>
                   ))}
                </CardContent>
             </Card>
          )}

          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id as any)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 shadow-sm",
                activeTab === s.id 
                  ? "bg-card border-primary border-r-8 ring-4 ring-primary/5" 
                  : "bg-muted/30 border-transparent hover:border-border opacity-70 hover:opacity-100"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all",
                activeTab === s.id 
                  ? (s.id === 'rx' ? 'bg-secondary text-white scale-110' : s.id === 'labs' ? 'bg-blue-600 text-white scale-110' : 'bg-primary text-white scale-110')
                  : "bg-muted text-muted-foreground"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                 <div className={cn("text-[10px] font-black uppercase tracking-[0.1em]", activeTab === s.id ? (s.id === 'rx' ? 'text-secondary font-black' : s.id === 'labs' ? 'text-blue-600 font-black' : 'text-primary font-black') : "text-muted-foreground")}>{s.label}</div>
                 <div className="text-[10px] text-muted-foreground font-medium leading-tight line-clamp-2">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full min-h-[600px] flex flex-col border-none shadow-2xl ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-6 px-8">
              <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      {sections.find(s => s.id === activeTab)?.label}
                   </CardTitle>
                   <CardDescription className="text-xs font-medium text-muted-foreground mt-1">{sections.find(s => s.id === activeTab)?.desc}</CardDescription>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Auto-saving</span>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
               {['subjective', 'assessment', 'plan'].includes(activeTab) ? (
                  <div className="relative h-full flex flex-col">
                    <textarea 
                        {...form.register(activeTab as any)}
                        className="w-full h-full text-base font-medium p-8 focus:outline-none resize-none bg-transparent placeholder:text-muted/30 min-h-[500px] text-foreground leading-relaxed"
                        placeholder={`Start documenting the patients ${activeTab} clinical findings...`}
                    />
                    <div className="p-4 border-t bg-amber-50/30">
                       <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                          <Info className="h-3 w-3" /> Tip: Go to "Objective (O) + Vitals" to record BP, Pulse, etc.
                       </p>
                    </div>
                  </div>
               ) : activeTab === 'objective' ? (
                 <div className="flex flex-col h-full">
                    <div className="p-8 border-b bg-slate-50/30">
                       <VitalsForm 
                         vitals={form.watch('vitals')} 
                         onChange={(v) => form.setValue('vitals', v)} 
                       />
                    </div>
                    <textarea 
                       {...form.register('objective')}
                       className="w-full flex-1 text-base font-medium p-8 focus:outline-none resize-none bg-transparent placeholder:text-muted/30 min-h-[300px] text-foreground leading-relaxed"
                       placeholder="Clinical examination findings and notes..."
                    />
                 </div>
               ) : activeTab === 'rx' ? (
                 <div className="p-8">
                    <PrescriptionForm lookups={lookups} onUpdate={(rx: any) => form.setValue('prescriptions', rx)} />
                 </div>
               ) : activeTab === 'labs' ? (
                 <div className="p-8">
                    <LabTestRequest patientName={patient?.fullName} lookups={lookups} onUpdate={(labs: any) => form.setValue('labRequests', labs)} />
                 </div>
               ) : activeTab === 'radiology' ? (
                 <div className="p-8">
                    <RadiologyRequest patientName={patient?.fullName} lookups={lookups} onUpdate={(rads: any) => form.setValue('radiologyRequests', rads)} />
                 </div>
               ) : (
                 <div className="p-8">
                    <AttachmentManager onUpdate={(urls: string[]) => form.setValue('attachments', urls)} />
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
