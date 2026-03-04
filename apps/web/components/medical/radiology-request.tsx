"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Activity, FileText, CheckCircle2, AlertCircle, Save, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LabPriority = "routine" | "urgent" | "stat";

interface RadiologyTest {
  id: string;
  name: string;
  type: "RADIOLOGY";
  priority: LabPriority;
  targetOrgan: string;
  notes: string;
}

export function RadiologyRequest({ onUpdate, lookups = [], patientName }: { onUpdate?: (tests: RadiologyTest[]) => void, lookups?: any[], patientName?: string }) {
  const [tests, setTests] = useState<RadiologyTest[]>([
    { id: "1", name: "", type: "RADIOLOGY", priority: "routine" as LabPriority, targetOrgan: "", notes: "" }
  ]);

  useEffect(() => {
    onUpdate?.(tests);
  }, []);

  const notifyUpdate = (newTests: RadiologyTest[]) => {
    onUpdate?.(newTests);
  };

  const addTest = () => {
    const newTests = [...tests, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: "", 
      type: "RADIOLOGY" as const,
      priority: "routine" as LabPriority, 
      targetOrgan: "",
      notes: "" 
    }];
    setTests(newTests);
    notifyUpdate(newTests);
  };

  const removeTest = (id: string) => {
    if (tests.length > 1) {
      const newTests = tests.filter(t => t.id !== id);
      setTests(newTests);
      notifyUpdate(newTests);
    }
  };

  const updateTest = (id: string, field: keyof RadiologyTest, value: any) => {
    const newTests = tests.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTests(newTests);
    notifyUpdate(newTests);
  };

  const radiologyCatalog = lookups.filter(l => l.type === "RADIOLOGY");
  const organCatalog = lookups.filter(l => l.type === "ORGAN");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
          <Activity className="h-5 w-5" />
          Radiology & Imaging Request
        </h3>
        <div className="flex gap-2 text-right">
           <button 
             type="button"
             onClick={() => window.print()}
             className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-md hover:bg-accent uppercase tracking-widest transition-all text-slate-600"
           >
             <Activity className="h-4 w-4" /> Print Request
           </button>
           <button 
             type="button"
             onClick={addTest} 
             className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-md hover:brightness-110 uppercase tracking-widest shadow-lg shadow-amber-600/10 transition-all"
           >
             <Plus className="h-4 w-4" /> Add Scan
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={test.id} className="relative overflow-hidden border-none shadow-xl ring-1 ring-amber-100 bg-amber-50/10">
            <CardContent className="pt-8">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imaging Type</label>
                  <div className="relative group">
                    <input 
                      list={`rads-${test.id}`}
                      value={test.name} 
                      onChange={(e) => updateTest(test.id, "name", e.target.value)}
                      className="w-full rounded-xl border-amber-100 bg-white p-3 text-sm font-bold focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all" 
                      placeholder="e.g. X-Ray, MRI..." 
                    />
                    <datalist id={`rads-${test.id}`}>
                       {radiologyCatalog.map(l => (
                         <option key={l.id} value={l.name}>{l.name}</option>
                       ))}
                    </datalist>
                  </div>
                </div>

                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                     <Heart className="h-3 w-3" /> Target Organ
                  </label>
                  <select 
                    value={test.targetOrgan}
                    onChange={(e) => updateTest(test.id, "targetOrgan", e.target.value)}
                    className="w-full rounded-xl border-amber-100 bg-white p-3 text-sm font-bold focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select Organ...</option>
                    {organCatalog.map(o => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                    <option value="General">General / Not Specified</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <div className="flex gap-1">
                     {["routine", "urgent", "stat"].map((p) => (
                       <button
                        key={p}
                        type="button"
                        onClick={() => updateTest(test.id, "priority", p as any)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all",
                          test.priority === p 
                            ? (p === "stat" ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200" : p === "urgent" ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200" : "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-200")
                            : "bg-white text-slate-400 hover:border-slate-300"
                        )}
                       >
                         {p}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                   <button 
                    type="button"
                    onClick={() => removeTest(test.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Notes / Indication</label>
                  <input 
                    value={test.notes} 
                    onChange={(e) => updateTest(test.id, "notes", e.target.value)}
                    className="w-full rounded-xl border-amber-100 bg-white p-3 text-sm font-medium focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all" 
                    placeholder="Clinical suspicion or specific findings..." 
                  />
                </div>
              </div>
              <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-amber-200 uppercase tracking-widest">
                Imaging #{index + 1}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-rad-report, #print-rad-report * {
            visibility: visible;
          }
          #print-rad-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background: white !important;
          }
        }
      `}</style>

      {/* Hidden printable report */}
      <div id="print-rad-report" className="hidden print:block text-slate-900 font-serif">
         <div className="flex justify-between border-b-4 border-amber-600 pb-6 mb-8">
            <div>
               <h1 className="text-4xl font-black text-amber-600 tracking-tighter">CLINIX PRO</h1>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Radiology & Imaging Services</p>
            </div>
            <div className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <p>123 Medical Plaza, Cairo</p>
               <p>Tel: +20 100 5515 962</p>
               <p>Ref: RAD-{Math.floor(Math.random() * 10000)}</p>
            </div>
         </div>

         <div className="mb-10 flex border-b pb-6">
            <div className="flex-1">
               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Patient Name</div>
               <div className="text-xl font-bold uppercase tracking-tight text-amber-900">{patientName || 'Patient Record'}</div>
            </div>
            <div className="text-right flex-1">
               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Request Date</div>
               <div className="text-xl font-bold">{new Date().toLocaleDateString()}</div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 border-b pb-2">Requested Imaging Scans</h3>
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 border-b">
                     <th className="py-2">#</th>
                     <th className="py-2">Scan Type</th>
                     <th className="py-2">Target Organ</th>
                     <th className="py-2">Priority</th>
                     <th className="py-2 text-right">Indication</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {tests.filter(t => t.name).map((test, i) => (
                     <tr key={test.id}>
                        <td className="py-4 text-sm font-bold text-slate-400">{i+1}</td>
                        <td className="py-4 font-bold text-amber-900">{test.name}</td>
                        <td className="py-4 font-bold text-slate-700">{test.targetOrgan || 'General'}</td>
                        <td className="py-4 font-black uppercase text-[10px]"><span className={cn("px-2 py-1 rounded", test.priority === 'routine' ? 'bg-slate-100' : 'bg-red-100 text-red-600')}>{test.priority}</span></td>
                        <td className="py-4 text-sm text-slate-500 italic text-right">{test.notes || '-'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="mt-40 flex justify-between items-end border-t pt-10">
            <div className="text-[10px] font-black uppercase text-slate-300">
               ClinixPro Radiology Request Service • Page 1 of 1
            </div>
            <div className="text-center">
               <div className="h-20 w-40 border-b-2 border-slate-200 mb-2"></div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Radiologist / Ordering Physician</div>
            </div>
         </div>
      </div>
    </div>
  );
}
