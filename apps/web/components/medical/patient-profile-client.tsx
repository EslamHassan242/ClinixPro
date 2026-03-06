"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  HeartPulse, 
  Thermometer, 
  Weight, 
  Plus,
  Pill,
  Microscope,
  Camera,
  UserCheck,
  ClipboardCheck,
  ArrowUpCircle,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InvestigationResultModal } from "./investigation-result-modal";

const tabs = [
  { id: "medical-history", label: "Medical History", icon: Calendar },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "vitals", label: "Vital Signs", icon: HeartPulse },
  { id: "labs", label: "Labs", icon: Microscope },
  { id: "radiology", label: "Imaging", icon: Activity },
  { id: "personal", label: "Personal Info", icon: User },
];

export function PatientProfileClient({ patient }: { patient: any }) {
  const [activeTab, setActiveTab] = useState("medical-history");
  const [selectedInvestigation, setSelectedInvestigation] = useState<any>(null);

  const refreshPage = () => window.location.reload();

  const initials = patient.fullName
    ? patient.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  const age = patient.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 31536000000)
    : "N/A";

  const dob = patient.dateOfBirth 
    ? new Date(patient.dateOfBirth).toLocaleDateString()
    : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 pb-6 border-b border-border">
        <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center font-black text-3xl text-slate-400 shadow-inner border border-border">
          {initials}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{patient.fullName}</h2>
            <div className="flex gap-2">
                <Link 
                  href={`/dashboard/appointments/new?patientId=${patient.id}`}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  Book Appointment
                </Link>
               <button className="px-4 py-2 border border-border rounded-md text-sm font-bold hover:bg-muted text-foreground transition-colors">
                 Edit Profile
               </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1">MRN: <span className="font-black text-foreground">{patient.mrn}</span></span>
            <span className="flex items-center gap-1">Gender: <span className="font-black text-foreground">{patient.gender}</span></span>
            <span className="flex items-center gap-1">Age: <span className="font-black text-foreground">{age}</span> <span className="opacity-50 text-[10px]">({dob})</span></span>
            <span className="flex items-center gap-1">Blood Type: <span className="font-black text-foreground uppercase">{patient.bloodType || 'N/A'}</span></span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {activeTab === "medical-history" && <MedicalHistoryTab records={patient.medicalRecords} />}
        {activeTab === "vitals" && <VitalsTab />}
        {activeTab === "prescriptions" && <PrescriptionsTab records={patient.medicalRecords} />}
        {activeTab === "labs" && <LabResultsTab records={patient.medicalRecords} onUploadClick={setSelectedInvestigation} />}
        {activeTab === "radiology" && <RadiologyTab records={patient.medicalRecords} onUploadClick={setSelectedInvestigation} />}
        {activeTab === "personal" && <PersonalInfoTab patient={patient} />}
      </div>

      {selectedInvestigation && (
        <InvestigationResultModal 
          isOpen={!!selectedInvestigation}
          onClose={() => setSelectedInvestigation(null)}
          investigation={selectedInvestigation}
          onSuccess={refreshPage}
        />
      )}
    </div>
  );
}

function MedicalHistoryTab({ records }: { records: any[] }) {
  // Group records by date (ignoring time)
  const groupedRecords = records.reduce((acc: any, record) => {
    const date = new Date(record.visitDate).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  const dates = Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
           <div className="h-1 w-6 bg-primary rounded-full" /> Clinical Timeline
        </h3>
        <Link 
          href={`/dashboard/medical-records/new?patientId=${records.length > 0 ? records[0].patientId : ''}`}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Start Clinical Session
        </Link>
      </div>
      
      {dates.length === 0 ? (
        <div className="text-muted-foreground italic h-32 flex items-center justify-center border-2 border-dashed border-border rounded-2xl">
             No clinical encounters recorded yet.
        </div>
      ) : (
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {dates.map((date) => (
              <div key={date} className="relative space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-background bg-slate-900 flex items-center justify-center text-white z-10 shadow-xl">
                       <Calendar className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-900 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                       Visit Date: {date}
                    </div>
                 </div>

                 <div className="ml-12 grid gap-6">
                    {groupedRecords[date].map((record: any) => (
                       <Card key={record.id} className="border-none shadow-xl ring-1 ring-border bg-card overflow-hidden hover:ring-primary/40 transition-all group">
                          <CardHeader className="bg-muted/30 border-b border-border py-4 px-6 flex flex-row items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <FileText className="h-4 w-4" />
                                </div>
                                <div className="font-black text-foreground uppercase text-xs tracking-tight">
                                   {record.type} Encounter
                                </div>
                             </div>
                             {record.appointmentId && (
                               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                  <UserCheck className="h-3 w-3" /> Linked to Appointment
                               </div>
                             )}
                          </CardHeader>
                          <CardContent className="p-6">
                             <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                   <div className="space-y-2">
                                      <div className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Subjective findings</div>
                                      <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-3 bg-slate-50 p-4 rounded-xl border border-border/50">
                                         "{record.subjective || 'No clinical commentary recorded for this visit.'}"
                                      </p>
                                   </div>
                                   <div className="flex gap-6 pt-4">
                                      <div className="text-center">
                                         <div className="text-xl font-black text-foreground">{record.prescriptions?.length || 0}</div>
                                         <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Meds</div>
                                      </div>
                                      <div className="text-center">
                                         <div className="text-xl font-black text-foreground">{record.labRequests?.length || 0}</div>
                                         <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Tests</div>
                                      </div>
                                   </div>
                                </div>
                                 <div className="flex items-center justify-end gap-3">
                                    <Link 
                                      href={`/dashboard/medical-records/${record.id}/edit`}
                                      className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                    >
                                       <Pencil className="h-3 w-3" /> Edit Note
                                    </Link>
                                    <Link 
                                      href={`/dashboard/medical-records/${record.id}`}
                                      className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg transition-all active:scale-95"
                                    >
                                       View & Print Card
                                    </Link>
                                 </div>
                             </div>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function PersonalInfoTab({ patient }: { patient: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
       <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-slate-400">Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold">{patient.phone || 'N/A'}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-semibold">{patient.email || 'N/A'}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="font-semibold text-right max-w-[200px]">{patient.address || 'N/A'}</span>
             </div>
          </CardContent>
       </Card>
       <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-slate-400">Emergency Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold">{patient.emergencyContactName || 'N/A'}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold">{patient.emergencyContactPhone || 'N/A'}</span>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}

function PrescriptionsTab({ records = [] }: { records: any[] }) {
  const allPrescriptions = (records || []).flatMap(r => (r.prescriptions || []).map((p: any) => ({ ...p, visitDate: r.visitDate })));

  return (
    <Card className="border-none shadow-xl ring-1 ring-border bg-card">
      <CardHeader className="bg-muted/30 border-b border-border py-6">
        <CardTitle className="text-xl font-black flex items-center gap-3">
          <FileText className="h-6 w-6 text-secondary" />
          Medication History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {allPrescriptions.length === 0 ? (
          <div className="p-20 text-center italic text-muted-foreground font-medium">No medications prescribed yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {allPrescriptions.map((px: any) => (
              <div key={px.id} className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Pill className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-black text-foreground text-lg">{px.medicineName}</div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex gap-3 mt-1">
                       <span className="bg-slate-100 px-2 py-0.5 rounded">{px.dosage}</span>
                       <span className="bg-slate-100 px-2 py-0.5 rounded">{px.frequency}</span>
                       <span className="bg-slate-100 px-2 py-0.5 rounded">{px.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-black text-foreground/60">{new Date(px.visitDate).toLocaleDateString()}</div>
                   <div className="text-[10px] text-muted-foreground italic font-medium mt-1">{px.instructions || 'No special instructions'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LabResultsTab({ records = [], onUploadClick }: { records: any[], onUploadClick: (investigation: any) => void }) {
  const allLabs = (records || []).flatMap(r => (r.labRequests || []).filter((l: any) => l.type !== "RADIOLOGY").map((l: any) => ({ ...l, visitDate: r.visitDate })));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {allLabs.length === 0 ? (
        <div className="col-span-full p-20 text-center italic text-slate-400 font-medium border-2 border-dashed rounded-2xl">
          No lab investigations requested yet.
        </div>
      ) : (
        allLabs.map((lab: any) => (
          <Card key={lab.id} className="border-none shadow-xl ring-1 ring-border bg-card overflow-hidden group hover:ring-primary/40 transition-all">
            <CardHeader className="bg-blue-50/30 border-b border-border py-4 px-6 flex-row items-center justify-between">
              <CardTitle className="text-xs font-black flex items-center gap-3 text-blue-700 uppercase tracking-widest">
                <Microscope className="h-5 w-5" />
                {lab.testName}
              </CardTitle>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                lab.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              )}>
                {lab.status}
              </span>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lab.visitDate).toLocaleDateString()}</span>
                  <span className={cn("px-2 py-0.5 rounded", lab.priority === 'stat' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600')}>{lab.priority} priority</span>
               </div>
               
               {lab.notes && (
                 <div className="p-4 bg-muted/30 rounded-xl border border-border text-xs italic text-foreground/70 leading-relaxed shadow-inner">
                    {lab.notes}
                 </div>
               )}

               {lab.resultImageUrls && lab.resultImageUrls.length > 0 && (
                 <div className="flex gap-2 pt-2 overflow-x-auto">
                    {lab.resultImageUrls.map((url: string, i: number) => (
                      <div key={i} className="h-16 w-16 rounded-lg border overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-110">
                        <img src={url} alt="Result" className="h-full w-full object-cover" />
                      </div>
                    ))}
                 </div>
               )}

               {!lab.results && lab.status !== 'completed' ? (
                 <button 
                   onClick={() => onUploadClick(lab)}
                   className="w-full flex items-center gap-2 py-4 border-2 border-dashed border-blue-100 rounded-xl justify-center text-blue-500 hover:bg-blue-50 transition-all font-black uppercase text-[10px]"
                 >
                    <ArrowUpCircle className="h-4 w-4" />
                    Upload Lab Results
                 </button>
               ) : (
                 <button 
                   onClick={() => onUploadClick(lab)}
                   className="w-full flex items-center gap-2 py-2 border-2 border-slate-100 rounded-xl justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all font-black uppercase text-[8px]"
                 >
                    <ClipboardCheck className="h-3 w-3" />
                    Update Results
                 </button>
               )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function RadiologyTab({ records = [], onUploadClick }: { records: any[], onUploadClick: (investigation: any) => void }) {
  const allRadiology = (records || []).flatMap(r => (r.labRequests || []).filter((l: any) => l.type === "RADIOLOGY").map((l: any) => ({ ...l, visitDate: r.visitDate })));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {allRadiology.length === 0 ? (
        <div className="col-span-full p-20 text-center italic text-slate-400 font-medium border-2 border-dashed rounded-2xl">
          No radiology investigations requested yet.
        </div>
      ) : (
        allRadiology.map((rad: any) => (
          <Card key={rad.id} className="border-none shadow-xl ring-1 ring-border bg-card overflow-hidden group hover:ring-primary/40 transition-all">
            <CardHeader className="bg-amber-50/30 border-b border-border py-4 px-6 flex-row items-center justify-between">
              <CardTitle className="text-xs font-black flex items-center gap-3 text-amber-700 uppercase tracking-widest">
                <Activity className="h-5 w-5" />
                {rad.testName}
              </CardTitle>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                rad.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              )}>
                {rad.status}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Requested: {new Date(rad.visitDate).toLocaleDateString()}</span>
               </div>
               
               <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="text-slate-400 font-black uppercase text-[8px]">Organ:</span>
                  <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-800 uppercase tracking-tighter">{rad.targetOrgan || 'General'}</span>
                  <span className="ml-auto flex items-center gap-1">
                     <span className={cn("h-1.5 w-1.5 rounded-full", rad.priority === 'stat' ? 'bg-rose-500' : 'bg-amber-500')} />
                     <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{rad.priority}</span>
                  </span>
               </div>

               {rad.notes && (
                 <div className="p-3 bg-slate-50 rounded-lg border text-xs italic text-slate-600">
                    {rad.notes}
                 </div>
               )}

               <div className="pt-2">
                  <button 
                    onClick={() => onUploadClick(rad)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black uppercase text-[10px]",
                      rad.status !== 'completed' 
                        ? "border-dashed border-amber-200 text-amber-600 hover:bg-amber-50" 
                        : "border-border text-muted-foreground hover:text-primary hover:border-primary/20"
                    )}
                  >
                    {rad.status !== 'completed' ? (
                      <><ArrowUpCircle className="h-4 w-4" /> Upload Imaging Result</>
                    ) : (
                      <><ClipboardCheck className="h-4 w-4" /> Update Result</>
                    )}
                  </button>
               </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function VitalsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <VitalCard label="Blood Pressure" value="--" unit="mmHg" icon={HeartPulse} status="No Data" />
      <VitalCard label="Heart Rate" value="--" unit="bpm" icon={Activity} status="No Data" />
      <VitalCard label="Temperature" value="--" unit="°C" icon={Thermometer} status="No Data" />
      <VitalCard label="Weight" value="--" unit="kg" icon={Weight} status="No Data" />
    </div>
  );
}

function VitalCard({ label, value, unit, icon: Icon, status }: any) {
  return (
    <Card className="p-6 flex items-center gap-6 border-none shadow-xl ring-1 ring-border bg-card overflow-hidden group hover:ring-primary transition-all active:scale-[0.98]">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground tracking-tighter">{value}</span>
          <span className="text-xs text-muted-foreground font-black uppercase">{unit}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
           <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", status === 'No Data' ? 'bg-slate-300' : 'bg-emerald-500')} />
           <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{status}</span>
        </div>
      </div>
    </Card>
  );
}
