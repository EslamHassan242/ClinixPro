"use client";

import { useEffect, useState, use } from "react";
import { getMedicalRecordById } from "@/app/actions/medical-records";
import { Pill, Microscope, User, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrintMedicalRecordPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMedicalRecordById(id).then(data => {
      setRecord(data);
      setLoading(false);
      // Automatically trigger print when loaded
      if (data) {
        setTimeout(() => {
             window.print();
        }, 1000);
      }
    });
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-xs uppercase tracking-widest text-slate-400">Loading Clinical Report...</div>;
  if (!record) return <div className="p-20 text-center font-black text-slate-400 uppercase">Report not found.</div>;

  const patient = record.patient;

  return (
    <div className="min-h-screen bg-white p-0 m-0 text-slate-900 font-sans antialiased">
      <style jsx global>{`
        @media print {
            @page { size: A4; margin: 0; }
            body { margin: 1cm; padding: 0; background: white; -webkit-print-color-adjust: exact; }
            header, footer, nav, .print-hidden { display: none !important; }
        }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Corporate Letterhead Header */}
      <div className="border-b-8 border-slate-900 pb-10 mb-12 flex justify-between items-end">
        <div className="space-y-4">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase decoration-primary underline decoration-8 underline-offset-8">ClinixPro</h1>
            <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Integrated Medical System</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">License: {record.doctor?.licenseNumber || 'PRO-M-9912'}</p>
            </div>
        </div>
        <div className="text-right space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Official Clinical Report</div>
            <div className="text-4xl font-mono font-black text-slate-900">#{record.id.slice(0, 8).toUpperCase()}</div>
        </div>
      </div>

      {/* Patient & Visit Information */}
      <div className="grid grid-cols-4 gap-10 bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-12">
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Patient Full Name</div>
            <div className="text-base font-black uppercase tracking-tight">{patient.fullName}</div>
        </div>
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">MRN / ID</div>
            <div className="text-base font-bold font-mono">{patient.mrn}</div>
        </div>
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visit Date</div>
            <div className="text-base font-bold">{new Date(record.visitDate).toLocaleDateString()}</div>
        </div>
        <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Consultation Type</div>
            <div className="text-base font-black uppercase italic text-primary">{record.type}</div>
        </div>
      </div>

      <div className="space-y-16">
        {/* SOAP: Subjective Section */}
        <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <User className="h-4 w-4 text-primary" /> Clinical Findings & Subjective Data
            </h2>
            <div className="text-lg leading-relaxed font-medium whitespace-pre-wrap pl-6 border-l-4 border-slate-900 italic py-2">
                {record.subjective || 'Routine follow-up. No acute complaints recorded.'}
            </div>
        </section>

        {/* Vital Signs Section (New) */}
        {record.objective?.vitals && Object.keys(record.objective.vitals).some(k => record.objective.vitals[k]) && (
           <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                  <Activity className="h-4 w-4 text-emerald-600" /> Physiological Parameters (Vital Signs)
              </h2>
              <div className="grid grid-cols-3 gap-6 bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100">
                  {record.objective.vitals.bloodPressure && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Blood Pressure</div>
                        <div className="text-lg font-black">{record.objective.vitals.bloodPressure} <span className="text-[10px] text-slate-400">mmHg</span></div>
                    </div>
                  )}
                  {record.objective.vitals.pulse && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Pulse Rate</div>
                        <div className="text-lg font-black">{record.objective.vitals.pulse} <span className="text-[10px] text-slate-400">bpm</span></div>
                    </div>
                  )}
                  {record.objective.vitals.temperature && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Body Temp</div>
                        <div className="text-lg font-black">{record.objective.vitals.temperature} <span className="text-[10px] text-slate-400">°C</span></div>
                    </div>
                  )}
                  {record.objective.vitals.spo2 && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Oxygen Sat (SpO2)</div>
                        <div className="text-lg font-black">{record.objective.vitals.spo2} <span className="text-[10px] text-slate-400">%</span></div>
                    </div>
                  )}
                  {record.objective.vitals.weight && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Weight</div>
                        <div className="text-lg font-black">{record.objective.vitals.weight} <span className="text-[10px] text-slate-400">kg</span></div>
                    </div>
                  )}
                  {record.objective.vitals.respiratoryRate && (
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Resp. Rate</div>
                        <div className="text-lg font-black">{record.objective.vitals.respiratoryRate} <span className="text-[10px] text-slate-400">/min</span></div>
                    </div>
                  )}
              </div>
           </section>
        )}

        {/* Objective Findings (Notes) */}
        {record.objective?.findings && (
           <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                  <Microscope className="h-4 w-4 text-slate-600" /> Physical Examination Findings
              </h2>
              <div className="text-base leading-relaxed font-bold text-slate-700 bg-white p-6 rounded-2xl border-2 border-slate-100 italic">
                  {record.objective.findings}
              </div>
           </section>
        )}

        {/* Clinical Assessment (Diagnosis) */}
        {record.assessment && (
           <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                  <Activity className="h-4 w-4 text-blue-600" /> Assessment & Diagnosis
              </h2>
              <div className="text-base font-bold text-slate-800 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  {typeof record.assessment === 'string' ? record.assessment : JSON.stringify(record.assessment)}
              </div>
           </section>
        )}

        {/* Medications */}
        {record.prescriptions.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <Pill className="h-4 w-4 text-secondary" /> Prescribed Medication Plan
            </h3>
            <div className="grid gap-4">
                {record.prescriptions.map((px: any) => (
                    <div key={px.id} className="p-8 rounded-3xl border-2 border-slate-900 flex justify-between items-center group bg-white shadow-sm">
                        <div className="space-y-2">
                            <div className="text-2xl font-black text-slate-900 tracking-tight uppercase">{px.medicineName}</div>
                            <div className="flex gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                                <span className="text-secondary">{px.dosage}</span>
                                <span>•</span>
                                <span>{px.frequency}</span>
                                <span>•</span>
                                <span>{px.duration}</span>
                            </div>
                        </div>
                        <div className="max-w-[250px] text-right">
                            <div className="text-sm font-bold text-slate-600 italic leading-relaxed">"{px.instructions || 'Take as directed by your physician'}"</div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* Lab & Imaging Requests */}
        {(record.labRequests.some((l: any) => l.type === 'LAB') || record.labRequests.some((l: any) => l.type === 'RADIOLOGY')) && (
            <div className="grid grid-cols-2 gap-10">
                {record.labRequests.some((l: any) => l.type === 'LAB') && (
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <Microscope className="h-4 w-4 text-blue-600" /> Laboratory Tests
                        </h3>
                        <div className="space-y-3">
                            {record.labRequests.filter((l: any) => l.type === 'LAB').map((lab: any) => (
                                <div key={lab.id} className="p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/10">
                                    <div className="text-sm font-black text-slate-900 uppercase">{lab.testName}</div>
                                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{lab.priority} priority</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {record.labRequests.some((l: any) => l.type === 'RADIOLOGY') && (
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <Activity className="h-4 w-4 text-amber-600" /> Imaging Scans
                        </h3>
                        <div className="space-y-3">
                            {record.labRequests.filter((l: any) => l.type === 'RADIOLOGY').map((rad: any) => (
                                <div key={rad.id} className="p-4 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/10">
                                    <div className="text-sm font-black text-slate-900 uppercase">{rad.testName}</div>
                                    <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">{rad.targetOrgan || 'General'} • {rad.priority}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        )}
      </div>

      {/* Certification Footer */}
      <div className="mt-32 pt-20 border-t-2 border-slate-100 grid grid-cols-2 gap-20">
        <div className="space-y-8">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clinic Information</div>
            <div className="space-y-1 text-[10px] font-bold text-slate-500 uppercase lowercase-none">
                <p>Digital Report ID: {record.id}</p>
                <p>Platform: ClinixPro Integrated Health System</p>
                <p>Support: support@clinixpro.med</p>
            </div>
        </div>
        <div className="text-right space-y-10">
            <div className="h-24 w-64 ml-auto border-b-4 border-slate-900 flex items-end justify-center pb-4">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-200">Digital Seal / Signature</span>
            </div>
            <div className="space-y-1">
                <div className="text-xl font-black text-slate-900 uppercase tracking-widest">{record.doctor?.fullName || 'Chief Physician'}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Specialist</div>
            </div>
        </div>
      </div>
    </div>
  );
}
