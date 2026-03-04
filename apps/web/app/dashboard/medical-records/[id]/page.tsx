"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, Microscope, User, Calendar, MapPin, Printer, ChevronLeft, Activity, ArrowUpCircle, ClipboardCheck, Camera } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { getMedicalRecordById } from "@/app/actions/medical-records";
import { InvestigationResultModal } from "@/components/medical/investigation-result-modal";
import { cn } from "@/lib/utils";

export default function CheckupCardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvestigation, setSelectedInvestigation] = useState<any>(null);

  const fetchRecord = () => {
    getMedicalRecordById(id).then(data => {
      setRecord(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse font-bold text-primary italic tracking-widest uppercase text-xs">Generating Checkup Card...</div>;
  if (!record) return <div className="p-20 text-center font-bold text-slate-400">Record not found.</div>;

  const patient = record.patient;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Link 
          href={`/dashboard/patients/${patient.id}`}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Profile
        </Link>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
        >
          <Printer className="h-4 w-4" /> Print Checkup Card
        </button>
      </div>

      <Card className="border-none shadow-2xl ring-1 ring-slate-100 overflow-hidden print:shadow-none print:ring-0 print:m-0 print:border-none">
        {/* Printable Header / Clinic Letterhead */}
        <CardHeader className="bg-slate-900 text-white p-10 space-y-6 print:bg-white print:text-slate-900 print:border-b-4 print:border-slate-900 print:px-0">
          <style jsx global>{`
            @media print {
              body { 
                background: white !important; 
                padding: 0 !important;
                margin: 0 !important;
              }
              .print-hidden, button, .flex.items-center.justify-between.print-hidden { 
                display: none !important; 
              }
              header, nav, aside, [role="navigation"] { 
                display: none !important; 
              }
              .max-w-4xl {
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .shadow-2xl, .ring-1, .rounded-2xl {
                box-shadow: none !important;
                ring: 0 !important;
                border-radius: 0 !important;
              }
              .bg-slate-900 {
                background-color: white !important;
                color: black !important;
              }
            }
          `}</style>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight uppercase italic underline decoration-primary decoration-8 underline-offset-8">ClinixPro</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] print:text-slate-500">Premium Medical Care System</p>
            </div>
            <div className="text-right space-y-1">
               <div className="text-xs font-black uppercase tracking-widest">Medical Record Summary</div>
               <div className="text-2xl font-mono text-primary print:text-slate-900">#{record.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10 print:border-slate-100">
             <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patient Name</div>
                <div className="text-sm font-bold">{patient.fullName}</div>
             </div>
             <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visit Date</div>
                <div className="text-sm font-bold">{new Date(record.visitDate).toLocaleDateString()}</div>
             </div>
             <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visit Type</div>
                <div className="inline-block px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-black uppercase tracking-widest print:border print:text-slate-900">
                   {record.type}
                </div>
             </div>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-12">
          {/* Subjective Section */}
          <section className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Subjective Findings
             </h3>
             <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-6 border-l-2 border-slate-100 italic">
                {record.subjective || 'No clinical findings recorded.'}
             </div>
          </section>

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <section className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-secondary" /> Prescribed Medications
               </h3>
               <div className="grid gap-4">
                  {record.prescriptions.map((px: any) => (
                    <div key={px.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group transition-all print:bg-white print:border-slate-200">
                       <div className="space-y-1">
                          <div className="text-lg font-black text-slate-900">{px.medicineName}</div>
                          <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span className="text-secondary">{px.dosage}</span>
                             <span>•</span>
                             <span>{px.frequency}</span>
                             <span>•</span>
                             <span>{px.duration}</span>
                          </div>
                       </div>
                       <div className="max-w-[200px] text-right">
                          <div className="text-[10px] font-bold text-slate-500 italic">"{px.instructions || 'Take as directed'}"</div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Lab Requests */}
          {record.labRequests.some((l: any) => l.type === 'LAB') && (
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                     <Microscope className="h-4 w-4 text-blue-600" /> Laboratory Investigations
                  </h3>
               </div>
               <div className="grid gap-6">
                  {record.labRequests.filter((l: any) => l.type === 'LAB').map((lab: any) => (
                    <div key={lab.id} className="p-8 rounded-3xl border-2 border-slate-100 bg-white shadow-sm space-y-6 print:border-slate-200">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="text-lg font-black text-slate-900 uppercase tracking-tight">{lab.testName}</div>
                             <div className="flex items-center gap-2">
                                <span className={cn(
                                   "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                   lab.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                )}>{lab.status}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {lab.priority} priority</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => setSelectedInvestigation(lab)}
                            className="print:hidden h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Upload/Edit Results"
                          >
                             <ArrowUpCircle className="h-4 w-4" />
                          </button>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Note</div>
                                <div className="text-sm text-slate-600 font-medium italic">{lab.notes || 'Routine checkup requested.'}</div>
                             </div>
                             {lab.results && (
                               <div className="space-y-1">
                                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Final Findings</div>
                                  <div className="text-sm text-slate-800 font-bold bg-blue-50/50 p-4 rounded-2xl">{lab.results}</div>
                               </div>
                             )}
                          </div>
                          <div className="space-y-3">
                             {lab.resultImageUrls && lab.resultImageUrls.length > 0 ? (
                               <>
                                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Imaging</div>
                                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {lab.resultImageUrls.map((url: string, i: number) => (
                                      <div key={i} className="h-24 w-24 rounded-2xl border-2 border-white shadow-lg overflow-hidden shrink-0 group relative">
                                         <img src={url} alt="Result" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                         <a href={url} target="_blank" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <ArrowUpCircle className="h-5 w-5 text-white rotate-45" />
                                         </a>
                                      </div>
                                    ))}
                                 </div>
                               </>
                             ) : lab.status !== 'completed' && (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 p-6 text-center">
                                   <Camera className="h-8 w-8 mb-2 opacity-20" />
                                   <div className="text-[10px] font-black uppercase">Pending Result Images</div>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Radiology Requests */}
          {record.labRequests.some((l: any) => l.type === 'RADIOLOGY') && (
            <section className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-600" /> Radiology & Imaging Requests
               </h3>
               <div className="grid gap-6">
                  {record.labRequests.filter((l: any) => l.type === 'RADIOLOGY').map((rad: any) => (
                    <div key={rad.id} className="p-8 rounded-3xl border-2 border-slate-100 bg-white shadow-sm space-y-6 print:border-slate-200">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="text-lg font-black text-slate-900 uppercase tracking-tight">{rad.testName}</div>
                             <div className="flex items-center gap-2">
                                <span className={cn(
                                   "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                   rad.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                )}>{rad.status}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {rad.targetOrgan || 'General'} • {rad.priority} priority</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => setSelectedInvestigation(rad)}
                            className="print:hidden h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Upload/Edit Results"
                          >
                             <ArrowUpCircle className="h-4 w-4" />
                          </button>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indication</div>
                                <div className="text-sm text-slate-600 font-medium italic">{rad.notes || 'Routine imaging.'}</div>
                             </div>
                             {rad.results && (
                               <div className="space-y-1">
                                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Radiologist Findings</div>
                                  <div className="text-sm text-slate-800 font-bold bg-amber-50/50 p-4 rounded-2xl">{rad.results}</div>
                               </div>
                             )}
                          </div>
                          <div className="space-y-3">
                             {rad.resultImageUrls && rad.resultImageUrls.length > 0 ? (
                               <>
                                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Scans</div>
                                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {rad.resultImageUrls.map((url: string, i: number) => (
                                      <div key={i} className="h-24 w-24 rounded-2xl border-2 border-white shadow-lg overflow-hidden shrink-0 group relative">
                                         <img src={url} alt="Scan" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                         <a href={url} target="_blank" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <ArrowUpCircle className="h-5 w-5 text-white rotate-45" />
                                         </a>
                                      </div>
                                    ))}
                                 </div>
                               </>
                             ) : rad.status !== 'completed' && (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 p-6 text-center">
                                   <Camera className="h-8 w-8 mb-2 opacity-20" />
                                   <div className="text-[10px] font-black uppercase">Pending Imaging Result</div>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Footer / Signature Area */}
          <div className="pt-20 mt-20 border-t border-slate-100 grid grid-cols-2 gap-20">
             <div className="space-y-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Legal Notice:</div>
                <p className="text-[8px] text-slate-300 font-medium leading-loose uppercase tracking-tighter">
                   This document is a formal digital medical record summary. It is intended for the patient and authorized medical personnel only. 
                   ClinixPro Digital Signature ensures the integrity of this clinical data.
                </p>
                <div className="grid grid-cols-2 gap-4 text-[8px] font-black text-slate-400 uppercase tracking-widest pt-4 opacity-50">
                    <div>Clinic: 123 Medical Plaza, Cairo</div>
                    <div>Support: +20 100 5515 962</div>
                </div>
             </div>
             <div className="text-right space-y-10">
                <div className="h-20 w-48 ml-auto border-b-2 border-slate-900 flex items-end justify-center pb-2">
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">Doctor's Signature</div>
                </div>
                <div>
                   <div className="text-sm font-black text-slate-900 uppercase tracking-widest">{record.doctor?.fullName || 'Attending Physician'}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certified ClinixPro Specialist</div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedInvestigation && (
        <InvestigationResultModal 
          isOpen={!!selectedInvestigation}
          onClose={() => setSelectedInvestigation(null)}
          investigation={selectedInvestigation}
          onSuccess={fetchRecord}
        />
      )}
    </div>
  );
}
