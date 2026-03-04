"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pill, Clock, Info, Save, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Drug {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function PrescriptionForm({ onUpdate, lookups = [] }: { onUpdate?: (drugs: Drug[]) => void, lookups?: any[] }) {
  const [drugs, setDrugs] = useState<Drug[]>([
    { id: "1", name: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ]);

  useEffect(() => {
    // Notify parent of initial state on mount
    onUpdate?.(drugs);
  }, []);

  const notifyUpdate = (newDrugs: Drug[]) => {
    onUpdate?.(newDrugs);
  };

  const addDrug = () => {
    const newDrugs = [...drugs, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: "", 
      dosage: "", 
      frequency: "", 
      duration: "", 
      instructions: "" 
    }];
    setDrugs(newDrugs);
    notifyUpdate(newDrugs);
  };

  const removeDrug = (id: string) => {
    if (drugs.length > 1) {
      const newDrugs = drugs.filter(d => d.id !== id);
      setDrugs(newDrugs);
      notifyUpdate(newDrugs);
    }
  };

  const updateDrug = (id: string, field: keyof Drug, value: string) => {
    const newDrugs = drugs.map(d => d.id === id ? { ...d, [field]: value } : d);
    setDrugs(newDrugs);
    notifyUpdate(newDrugs);
  };

  const medicines = lookups.filter(l => l.type === "MEDICINE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pill className="h-5 w-5 text-secondary" />
          Medication Prescription
        </h3>
        <div className="flex gap-2 text-right">
           <button 
             type="button"
             onClick={() => window.print()}
             className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border rounded-md hover:bg-accent uppercase tracking-widest transition-all"
           >
             <Printer className="h-4 w-4" /> Print RX
           </button>
           <button 
             type="button"
             onClick={addDrug} 
             className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-secondary text-white rounded-md hover:brightness-110 uppercase tracking-widest shadow-lg shadow-secondary/10 transition-all"
           >
             <Plus className="h-4 w-4" /> Add Med
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {drugs.map((drug, index) => (
          <Card key={drug.id} className="relative overflow-hidden border-none shadow-xl ring-1 ring-slate-200">
            <CardContent className="pt-8">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication Name</label>
                  <div className="relative group">
                    <input 
                      list={`medicines-${drug.id}`}
                      value={drug.name} 
                      onChange={(e) => updateDrug(drug.id, "name", e.target.value)}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                      placeholder="Search or type medicine name..." 
                    />
                    <datalist id={`medicines-${drug.id}`}>
                       {medicines.map(m => (
                         <option key={m.id} value={m.name}>{m.category ? `${m.name} (${m.category})` : m.name}</option>
                       ))}
                    </datalist>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage</label>
                  <input 
                    value={drug.dosage} 
                    onChange={(e) => updateDrug(drug.id, "dosage", e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                    placeholder="e.g. 500mg, 1 Tab" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</label>
                  <select 
                    value={drug.frequency} 
                    onChange={(e) => updateDrug(drug.id, "frequency", e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all appearance-none"
                  >
                    <option value="">Frequency...</option>
                    <option value="once-daily">Once Daily (QD)</option>
                    <option value="twice-daily">Twice Daily (BID)</option>
                    <option value="three-times">Three Times (TID)</option>
                    <option value="four-times">Four Times (QID)</option>
                    <option value="as-needed">As Needed (PRN)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                  <input 
                    value={drug.duration} 
                    onChange={(e) => updateDrug(drug.id, "duration", e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                    placeholder="e.g. 5 Days" 
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Info className="h-3 w-3" /> Special Instructions
                  </label>
                  <input 
                    value={drug.instructions} 
                    onChange={(e) => updateDrug(drug.id, "instructions", e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                    placeholder="Take after food etc." 
                  />
                </div>
                <div className="flex items-end justify-end">
                   <button 
                    type="button"
                    onClick={() => removeDrug(drug.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-slate-200 uppercase tracking-widest">
                Medication #{index + 1}
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
          #print-report, #print-report * {
            visibility: visible;
          }
          #print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Hidden printable report */}
      <div id="print-report" className="hidden print:block text-slate-900 font-serif">
         <div className="flex justify-between border-b-4 border-primary pb-6 mb-8">
            <div>
               <h1 className="text-4xl font-black text-primary tracking-tighter">CLINIX PRO</h1>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Medical Center & Polyclinic</p>
            </div>
            <div className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <p>123 Medical Plaza, Cairo</p>
               <p>Tel: +20 100 5515 962</p>
               <p>www.clinixpro.com</p>
            </div>
         </div>

         <div className="mb-10 flex border-b pb-6">
            <div className="flex-1">
               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Prescription For</div>
               <div className="text-xl font-bold uppercase tracking-tight">Patient Record</div>
            </div>
            <div className="text-right flex-1">
               <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Date</div>
               <div className="text-xl font-bold">{new Date().toLocaleDateString()}</div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="text-4xl font-serif italic text-primary opacity-20 absolute -z-10 select-none">Rx</div>
            {drugs.filter(d => d.name).map((drug, i) => (
               <div key={drug.id} className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-baseline">
                     <h4 className="text-lg font-bold text-slate-800">{i+1}. {drug.name}</h4>
                     <span className="text-sm font-bold text-slate-500">{drug.dosage}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600 font-medium italic">
                     <span>{drug.frequency}</span>
                     <span>•</span>
                     <span>{drug.duration}</span>
                  </div>
                  {drug.instructions && (
                     <div className="mt-2 text-xs text-slate-400 font-bold bg-slate-50 p-2 rounded">
                        Info: {drug.instructions}
                     </div>
                  )}
               </div>
            ))}
         </div>

         <div className="mt-32 flex justify-between items-end border-t pt-10">
            <div className="text-[10px] font-black uppercase text-slate-300">
               ClinixPro Digital Prescription Service • Page 1 of 1
            </div>
            <div className="text-center border-t-2 border-slate-200 mt-10 pt-4 px-10">
               <div className="h-16 w-32 flex items-center justify-center italic text-slate-200 text-sm">Doctor Signature</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Clinician</div>
            </div>
         </div>
      </div>
    </div>
  );
}
